"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Leaderboard } from "@/components/Leaderboard";
import { LetterGrid } from "@/components/LetterGrid";
import { PlayerList } from "@/components/PlayerList";
import { RoomCodeCard } from "@/components/RoomCodeCard";
import { SubmittedWords } from "@/components/SubmittedWords";
import { Timer } from "@/components/Timer";
import { WordInput } from "@/components/WordInput";
import { getSocket } from "@/lib/socket/client";
import type { Player, RoomSnapshot } from "@/types/game";

export default function PlayRoomPage() {
  const router = useRouter();
  const params = useParams<{ roomCode: string }>();
  const roomCode = useMemo(() => String(params.roomCode || "").toUpperCase(), [params.roomCode]);
  const [room, setRoom] = useState<RoomSnapshot | null>(null);
  const [playerName] = useState(() =>
    typeof window === "undefined" ? "" : localStorage.getItem(`wrp-player-${roomCode}`) ?? "",
  );
  const [error, setError] = useState("");
  const [remainingSeconds, setRemainingSeconds] = useState(120);

  useEffect(() => {
    if (!playerName) {
      router.replace(`/join?room=${roomCode}`);
      return;
    }

    const socket = getSocket();

    const handleRoomUpdated = ({ room: updatedRoom }: { room: RoomSnapshot }) => {
      setRoom(updatedRoom);
      if (updatedRoom.currentRound) {
        setRemainingSeconds(
          Math.max(0, Math.ceil((updatedRoom.currentRound.endsAt - Date.now()) / 1000)),
        );
      }
    };

    const handleRoundStarted = ({ room: updatedRoom }: { room: RoomSnapshot }) => {
      setRoom(updatedRoom);
      setRemainingSeconds(updatedRoom.currentRound?.durationSeconds ?? 120);
      setError("");
    };

    const handleRoundEnded = ({ room: updatedRoom }: { room: RoomSnapshot }) => {
      setRoom(updatedRoom);
      setRemainingSeconds(0);
    };

    const handleTimer = ({ remainingSeconds: nextRemaining }: { remainingSeconds: number }) => {
      setRemainingSeconds(nextRemaining);
    };

    const handleError = ({ message }: { message: string }) => {
      setError(message);
    };

    socket.on("room_updated", handleRoomUpdated);
    socket.on("round_started", handleRoundStarted);
    socket.on("round_ended", handleRoundEnded);
    socket.on("timer_updated", handleTimer);
    socket.on("error_message", handleError);
    socket.connect();
    socket.emit("join_room", {
      roomCode,
      name: playerName,
      role: "player",
    });

    return () => {
      socket.off("room_updated", handleRoomUpdated);
      socket.off("round_started", handleRoundStarted);
      socket.off("round_ended", handleRoundEnded);
      socket.off("timer_updated", handleTimer);
      socket.off("error_message", handleError);
    };
  }, [playerName, roomCode, router]);

  const currentPlayer: Player | undefined = room?.players.find(
    (player) => player.name.toLowerCase() === playerName.toLowerCase(),
  );
  const currentGrid = room?.currentRound?.grid ?? null;

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fef2f2_0%,#eff6ff_55%,#ecfccb_100%)] px-4 py-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
          <section className="space-y-6">
            <RoomCodeCard roomCode={roomCode} label="Room" />
            <div className="rounded-[2rem] bg-white/85 p-6 shadow-[0_24px_80px_rgba(13,51,86,0.12)]">
              <h1 className="text-3xl font-black text-slate-900">{playerName || "Player"}</h1>
              <p className="mt-3 text-slate-600">
                {room?.status === "playing"
                  ? "Find words fast. Everyone is racing the same grid."
                  : room?.status === "results"
                    ? "Round complete. Waiting for the host to launch the next one."
                    : "Waiting for host to start..."}
              </p>
              {room?.status === "playing" ? (
                <div className="mt-5">
                  <Timer remainingSeconds={remainingSeconds} />
                </div>
              ) : null}
              {error ? (
                <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                  {error}
                </p>
              ) : null}
            </div>
            <PlayerList players={room?.players ?? []} title="Party lineup" />
          </section>

          <section className="space-y-6">
            {currentGrid ? (
              <div className="rounded-[2rem] bg-white/75 p-6 shadow-[0_24px_80px_rgba(13,51,86,0.12)]">
                <LetterGrid grid={currentGrid} />
              </div>
            ) : null}

            {room?.status === "playing" && currentGrid ? (
              <>
                <WordInput
                  disabled={remainingSeconds <= 0}
                  grid={currentGrid}
                  onSubmit={(word) => {
                    getSocket().emit("submit_word", {
                      roomCode,
                      word,
                    });
                  }}
                />
                <SubmittedWords
                  validWords={currentPlayer?.validWords ?? []}
                  rejectedWords={currentPlayer?.rejectedWords ?? []}
                />
              </>
            ) : null}

            {room?.status === "lobby" ? (
              <div className="rounded-[2rem] bg-white/85 p-6 text-center shadow-[0_24px_80px_rgba(13,51,86,0.12)]">
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-sky-700">
                  Ready soon
                </p>
                <p className="mt-3 text-xl font-black text-slate-900">Waiting for host to start...</p>
              </div>
            ) : null}

            {room?.status === "results" ? (
              <>
                <Leaderboard entries={room.leaderboard} />
                <div className="rounded-[2rem] bg-white/85 p-6 text-center shadow-[0_24px_80px_rgba(13,51,86,0.12)]">
                  <p className="text-lg font-bold text-slate-900">Waiting for host</p>
                  <p className="mt-2 text-slate-600">
                    Stay here and the next round will appear automatically.
                  </p>
                </div>
              </>
            ) : null}
          </section>
        </div>
      </div>
    </main>
  );
}
