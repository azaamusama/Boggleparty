export type RoomStatus = "lobby" | "playing" | "results";

export type LetterGrid = string[][];

export type WordRejectionReason =
  | "Enter at least 3 letters."
  | "You already submitted that word."
  | "That word is not in the dictionary."
  | "That word cannot be formed on this grid."
  | "This round has already ended."
  | "Word submissions are closed.";

export type WordValidationResult = {
  accepted: boolean;
  normalizedWord: string;
  reason?: WordRejectionReason;
};

export type RejectedWord = {
  word: string;
  reason: WordRejectionReason;
};

export type Player = {
  id: string;
  socketId: string;
  name: string;
  score: number;
  validWords: string[];
  rejectedWords: RejectedWord[];
  connected: boolean;
};

export type RoundState = {
  id: string;
  grid: LetterGrid;
  startedAt: number;
  endsAt: number;
  durationSeconds: number;
};

export type Room = {
  code: string;
  hostSocketId: string;
  status: RoomStatus;
  players: Player[];
  currentRound: RoundState | null;
  createdAt: number;
};

export type LeaderboardEntry = {
  id: string;
  name: string;
  score: number;
  validWords: string[];
  rejectedWords: RejectedWord[];
};

export type JoinRoomPayload = {
  roomCode: string;
  name?: string;
  role: "host" | "player";
};

export type SubmitWordPayload = {
  roomCode: string;
  word: string;
};

export type RoomSnapshot = {
  code: string;
  status: RoomStatus;
  players: Player[];
  currentRound: RoundState | null;
  createdAt: number;
  leaderboard: LeaderboardEntry[];
};

export type ClientToServerEvents = {
  create_room: () => void;
  join_room: (payload: JoinRoomPayload) => void;
  start_round: (payload: { roomCode: string }) => void;
  submit_word: (payload: SubmitWordPayload) => void;
  end_round: (payload: { roomCode: string }) => void;
  leave_room: (payload: { roomCode: string }) => void;
};

export type ServerToClientEvents = {
  room_created: (payload: { room: RoomSnapshot }) => void;
  room_updated: (payload: { room: RoomSnapshot }) => void;
  player_joined: (payload: { room: RoomSnapshot; player: Player }) => void;
  player_left: (payload: { room: RoomSnapshot; playerId: string }) => void;
  round_started: (payload: { room: RoomSnapshot }) => void;
  word_accepted: (payload: { word: string; score: number; validWords: string[] }) => void;
  word_rejected: (payload: { word: string; reason: WordRejectionReason }) => void;
  timer_updated: (payload: { roomCode: string; remainingSeconds: number }) => void;
  round_ended: (payload: { room: RoomSnapshot }) => void;
  error_message: (payload: { message: string }) => void;
};
