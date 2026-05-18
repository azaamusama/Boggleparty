import { Server as HttpServer } from "node:http";
import { Server } from "socket.io";
import {
  createRoom,
  disconnectSocket,
  endRound,
  getActiveRooms,
  joinRoom,
  leaveRoom,
  serializeRoom,
  startRound,
  submitWordForPlayer,
} from "@/lib/game/rooms";
import type { ClientToServerEvents, ServerToClientEvents } from "@/types/game";

let timerHandle: NodeJS.Timeout | null = null;

export function attachSocketServer(httpServer: HttpServer) {
  const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    socket.on("create_room", () => {
      const room = createRoom(socket.id);
      socket.join(room.code);
      socket.emit("room_created", { room: serializeRoom(room) });
    });

    socket.on("join_room", ({ roomCode, role, name }) => {
      try {
        const { room, player } = joinRoom(roomCode, socket.id, role, name);
        socket.join(room.code);
        const snapshot = serializeRoom(room);

        socket.emit("room_updated", { room: snapshot });

        if (player) {
          io.to(room.code).emit("player_joined", { room: snapshot, player });
          io.to(room.code).emit("room_updated", { room: snapshot });
        }
      } catch (error) {
        socket.emit("error_message", {
          message: error instanceof Error ? error.message : "Unable to join room.",
        });
      }
    });

    socket.on("start_round", ({ roomCode }) => {
      try {
        const room = startRound(roomCode);
        io.to(room.code).emit("round_started", { room: serializeRoom(room) });
      } catch (error) {
        socket.emit("error_message", {
          message: error instanceof Error ? error.message : "Unable to start round.",
        });
      }
    });

    socket.on("submit_word", ({ roomCode, word }) => {
      try {
        const result = submitWordForPlayer(roomCode, socket.id, word);

        if (result.accepted && result.player) {
          socket.emit("word_accepted", {
            word: result.normalizedWord,
            score: result.player.score,
            validWords: [...result.player.validWords].sort(),
          });
        } else {
          socket.emit("word_rejected", {
            word: result.normalizedWord,
            reason: result.reason!,
          });
        }

        io.to(roomCode.toUpperCase()).emit("room_updated", {
          room: serializeRoom(result.room),
        });
      } catch (error) {
        socket.emit("error_message", {
          message: error instanceof Error ? error.message : "Unable to submit word.",
        });
      }
    });

    socket.on("end_round", ({ roomCode }) => {
      try {
        const room = endRound(roomCode);
        io.to(room.code).emit("round_ended", { room: serializeRoom(room) });
      } catch (error) {
        socket.emit("error_message", {
          message: error instanceof Error ? error.message : "Unable to end round.",
        });
      }
    });

    socket.on("leave_room", ({ roomCode }) => {
      const result = leaveRoom(roomCode, socket.id);

      if (result.room) {
        io.to(result.room.code).emit("room_updated", { room: serializeRoom(result.room) });
      }

      if (result.room && result.playerId) {
        io.to(result.room.code).emit("player_left", {
          room: serializeRoom(result.room),
          playerId: result.playerId,
        });
      }
    });

    socket.on("disconnect", () => {
      const updates = disconnectSocket(socket.id);

      updates.forEach(({ room, playerId }) => {
        const snapshot = serializeRoom(room);
        io.to(room.code).emit("room_updated", { room: snapshot });

        if (playerId) {
          io.to(room.code).emit("player_left", { room: snapshot, playerId });
        }
      });
    });
  });

  if (!timerHandle) {
    timerHandle = setInterval(() => {
      for (const room of getActiveRooms()) {
        if (!room.currentRound) {
          continue;
        }

        const remainingSeconds = Math.max(
          0,
          Math.ceil((room.currentRound.endsAt - Date.now()) / 1000),
        );

        io.to(room.code).emit("timer_updated", {
          roomCode: room.code,
          remainingSeconds,
        });

        if (remainingSeconds === 0) {
          const endedRoom = endRound(room.code);
          io.to(room.code).emit("round_ended", { room: serializeRoom(endedRoom) });
        }
      }
    }, 1000);
  }

  return io;
}
