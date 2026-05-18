import { loadDictionary } from "@/lib/game/dictionary";
import { generateLetterGrid } from "@/lib/game/grid";
import { buildLeaderboard } from "@/lib/game/leaderboard";
import { calculatePlayerScore } from "@/lib/game/scoring";
import { normalizeWord, validateSubmittedWord } from "@/lib/game/validation";
import type { Player, Room, RoomSnapshot } from "@/types/game";

const MAX_PLAYERS = 8;
const ROUND_DURATION_SECONDS = 120;

const rooms = new Map<string, Room>();
const dictionary = loadDictionary();

export function generateRoomCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  let roomCode = "";

  while (roomCode.length < 4) {
    roomCode += alphabet[Math.floor(Math.random() * alphabet.length)];
  }

  if (rooms.has(roomCode)) {
    return generateRoomCode();
  }

  return roomCode;
}

export function createRoom(hostSocketId: string): Room {
  const room: Room = {
    code: generateRoomCode(),
    hostSocketId,
    status: "lobby",
    players: [],
    currentRound: null,
    createdAt: Date.now(),
  };

  rooms.set(room.code, room);
  return room;
}

export function getRoom(roomCode: string): Room | undefined {
  return rooms.get(roomCode.toUpperCase());
}

export function serializeRoom(room: Room): RoomSnapshot {
  return {
    code: room.code,
    status: room.status,
    players: room.players.map((player) => ({
      ...player,
      validWords: [...player.validWords].sort(),
      rejectedWords: [...player.rejectedWords],
    })),
    currentRound: room.currentRound
      ? {
          ...room.currentRound,
          grid: room.currentRound.grid.map((row) => [...row]),
        }
      : null,
    createdAt: room.createdAt,
    leaderboard: buildLeaderboard(room.players),
  };
}

export function joinRoom(
  roomCode: string,
  socketId: string,
  role: "host" | "player",
  name?: string,
): { room: Room; player?: Player } {
  const room = getRoom(roomCode);

  if (!room) {
    throw new Error("That room code does not exist.");
  }

  if (role === "host") {
    room.hostSocketId = socketId;
    return { room };
  }

  const trimmedName = name?.trim() ?? "";

  if (!trimmedName) {
    throw new Error("Please enter a display name.");
  }

  const existingPlayer = room.players.find(
    (player) => player.name.toLowerCase() === trimmedName.toLowerCase(),
  );

  if (
    room.status === "playing" &&
    (!existingPlayer || (existingPlayer.connected && existingPlayer.socketId !== socketId))
  ) {
    throw new Error("A round is already in progress. Please wait for the next one.");
  }

  if (
    !existingPlayer &&
    room.players.filter((player) => player.connected).length >= MAX_PLAYERS
  ) {
    throw new Error("That room is full right now.");
  }

  if (existingPlayer && existingPlayer.connected && existingPlayer.socketId !== socketId) {
    throw new Error("That display name is already taken in this room.");
  }

  if (existingPlayer) {
    existingPlayer.socketId = socketId;
    existingPlayer.connected = true;
    existingPlayer.name = trimmedName;
    return { room, player: existingPlayer };
  }

  const player: Player = {
    id: crypto.randomUUID(),
    socketId,
    name: trimmedName,
    score: 0,
    validWords: [],
    rejectedWords: [],
    connected: true,
  };

  room.players.push(player);
  return { room, player };
}

export function startRound(roomCode: string): Room {
  const room = getRoom(roomCode);

  if (!room) {
    throw new Error("That room code does not exist.");
  }

  if (room.players.length === 0) {
    throw new Error("At least one player needs to join before the round can start.");
  }

  room.status = "playing";
  room.players = room.players.map((player) => ({
    ...player,
    score: 0,
    validWords: [],
    rejectedWords: [],
  }));

  const startedAt = Date.now();

  room.currentRound = {
    id: crypto.randomUUID(),
    grid: generateLetterGrid(),
    startedAt,
    endsAt: startedAt + ROUND_DURATION_SECONDS * 1000,
    durationSeconds: ROUND_DURATION_SECONDS,
  };

  return room;
}

export function endRound(roomCode: string): Room {
  const room = getRoom(roomCode);

  if (!room) {
    throw new Error("That room code does not exist.");
  }

  room.status = "results";
  room.players = room.players.map((player) => ({
    ...player,
    score: calculatePlayerScore(player.validWords),
  }));

  return room;
}

export function submitWordForPlayer(roomCode: string, socketId: string, word: string) {
  const room = getRoom(roomCode);

  if (!room) {
    throw new Error("That room code does not exist.");
  }

  if (room.status !== "playing" || !room.currentRound) {
    return {
      accepted: false,
      reason: "Word submissions are closed." as const,
      player: null,
      room,
      normalizedWord: normalizeWord(word),
    };
  }

  if (Date.now() >= room.currentRound.endsAt) {
    return {
      accepted: false,
      reason: "This round has already ended." as const,
      player: null,
      room,
      normalizedWord: normalizeWord(word),
    };
  }

  const player = room.players.find((candidate) => candidate.socketId === socketId);

  if (!player) {
    throw new Error("You are not part of this room.");
  }

  const validation = validateSubmittedWord(
    word,
    room.currentRound.grid,
    dictionary,
    player.validWords,
  );

  if (validation.accepted) {
    player.validWords.push(validation.normalizedWord);
    player.score = calculatePlayerScore(player.validWords);
  } else {
    player.rejectedWords.push({
      word: validation.normalizedWord || normalizeWord(word),
      reason: validation.reason!,
    });
  }

  return {
    ...validation,
    player,
    room,
  };
}

export function leaveRoom(roomCode: string, socketId: string): { room?: Room; playerId?: string } {
  const room = getRoom(roomCode);

  if (!room) {
    return {};
  }

  if (room.hostSocketId === socketId) {
    room.hostSocketId = "";
  }

  const player = room.players.find((candidate) => candidate.socketId === socketId);

  if (player) {
    room.players = room.players.filter((candidate) => candidate.id !== player.id);
  }

  cleanupRoom(room.code);

  return {
    room: getRoom(roomCode),
    playerId: player?.id,
  };
}

export function disconnectSocket(socketId: string): { room: Room; playerId?: string }[] {
  const updates: { room: Room; playerId?: string }[] = [];

  for (const room of rooms.values()) {
    let touched = false;
    let playerId: string | undefined;

    if (room.hostSocketId === socketId) {
      room.hostSocketId = "";
      touched = true;
    }

    const player = room.players.find((candidate) => candidate.socketId === socketId);

    if (player) {
      player.connected = false;
      playerId = player.id;
      touched = true;
    }

    if (touched) {
      cleanupRoom(room.code);
      const updatedRoom = getRoom(room.code);

      if (updatedRoom) {
        updates.push({ room: updatedRoom, playerId });
      }
    }
  }

  return updates;
}

export function getActiveRooms(): Room[] {
  return [...rooms.values()].filter(
    (room) => room.status === "playing" && room.currentRound !== null,
  );
}

function cleanupRoom(roomCode: string) {
  const room = getRoom(roomCode);

  if (!room) {
    return;
  }

  const hasConnectedHost = Boolean(room.hostSocketId);
  const hasPlayers = room.players.length > 0;

  if (!hasConnectedHost && !hasPlayers) {
    rooms.delete(room.code);
  }
}
