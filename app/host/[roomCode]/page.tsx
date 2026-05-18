"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Leaderboard } from "@/components/Leaderboard";
import { LetterGrid } from "@/components/LetterGrid";
import { PlayerList } from "@/components/PlayerList";
import { QRJoinCard } from "@/components/QRJoinCard";
import { RoomCodeCard } from "@/components/RoomCodeCard";
import { Timer } from "@/components/Timer";
import { generatePreviewLetterGrid } from "@/lib/game/grid";
import { getSocket } from "@/lib/socket/client";
import type { RoomSnapshot } from "@/types/game";

export default function HostRoomPage() {
  const router = useRouter();
  const params = useParams<{ roomCode: string }>();
  const roomCode = useMemo(() => String(params.roomCode || "").toUpperCase(), [params.roomCode]);
  const [room, setRoom] = useState<RoomSnapshot | null>(null);
  const [error, setError] = useState("");
  const [remainingSeconds, setRemainingSeconds] = useState(120);
  const createdRef = useRef(false);

  useEffect(() => {
    const socket = getSocket();

    const handleRoomCreated = ({ room: createdRoom }: { room: RoomSnapshot }) => {
      localStorage.setItem(`wrp-host-${createdRoom.code}`, "true");
      setRoom(createdRoom);
      router.replace(`/host/${createdRoom.code}`);
    };

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

    socket.on("room_created", handleRoomCreated);
    socket.on("room_updated", handleRoomUpdated);
    socket.on("round_started", handleRoundStarted);
    socket.on("round_ended", handleRoundEnded);
    socket.on("timer_updated", handleTimer);
    socket.on("error_message", handleError);
    socket.connect();

    if (roomCode === "NEW" && !createdRef.current) {
      createdRef.current = true;
      socket.emit("create_room");
    } else if (roomCode !== "NEW" && localStorage.getItem(`wrp-host-${roomCode}`)) {
      socket.emit("join_room", {
        roomCode,
        role: "host",
      });
    }

    return () => {
      socket.off("room_created", handleRoomCreated);
      socket.off("room_updated", handleRoomUpdated);
      socket.off("round_started", handleRoundStarted);
      socket.off("round_ended", handleRoundEnded);
      socket.off("timer_updated", handleTimer);
      socket.off("error_message", handleError);
    };
  }, [roomCode, router]);

  const previewGrid = useMemo(
    () => generatePreviewLetterGrid(`host-preview-${room?.code ?? roomCode}`),
    [room?.code, roomCode],
  );

  const joinUrl =
    typeof window === "undefined" ? "" : `${window.location.origin}/join?room=${room?.code ?? roomCode}`;

  if (!room) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,#fff7ed_0%,#dbeafe_50%,#ccfbf1_100%)] px-4">
        <div className="rounded-[2rem] bg-white/80 px-6 py-5 text-center shadow-xl">
          <p className="text-lg font-bold text-slate-900">Setting up your room...</p>
          {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#fff7ed_0%,#dbeafe_45%,#ccfbf1_100%)] px-4 py-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
          <section className="space-y-6">
            <RoomCodeCard roomCode={room.code} />
            <div className="rounded-[2rem] border border-white/50 bg-white/85 p-6 shadow-[0_24px_80px_rgba(13,51,86,0.12)]">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-sky-700">
                Host controls
              </p>
              <h1 className="mt-3 text-4xl font-black text-slate-900">Word Rush Party</h1>
              <p className="mt-3 text-slate-600">
                {room.status === "lobby"
                  ? "Gather your players, then start the round when everyone is ready."
                  : room.status === "playing"
                    ? "The round is live. Everyone is solving the same grid right now."
                    : "Results are in. Start another round whenever you want."}
              </p>
              {error ? (
                <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                  {error}
                </p>
              ) : null}
              <div className="mt-6 flex flex-wrap gap-3">
                {(room.status === "lobby" || room.status === "results") && (
                  <button
                    type="button"
                    onClick={() => getSocket().emit("start_round", { roomCode: room.code })}
                    className="rounded-2xl bg-slate-900 px-6 py-4 text-sm font-black uppercase tracking-[0.15em] text-white"
                  >
                    {room.status === "results" ? "Start New Round" : "Start Game"}
                  </button>
                )}
                {room.status === "playing" ? <Timer remainingSeconds={remainingSeconds} /> : null}
              </div>
            </div>

            {room.currentRound ? (
              <div className="rounded-[2rem] bg-white/75 p-6 shadow-[0_24px_80px_rgba(13,51,86,0.12)]">
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-sky-700">
                  Shared grid
                </p>
                <div className="mt-4 max-w-md">
                  <LetterGrid grid={room.currentRound.grid} />
                </div>
              </div>
            ) : room.status === "lobby" ? (
              <div className="rounded-[2rem] bg-white/75 p-6 shadow-[0_24px_80px_rgba(13,51,86,0.12)]">
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-sky-700">
                  Preview grid
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  This room now shows a board preview before the round starts.
                </p>
                <div className="mt-4 max-w-md">
                  <LetterGrid grid={previewGrid} />
                </div>
              </div>
            ) : null}

            {room.status === "results" ? <Leaderboard entries={room.leaderboard} /> : null}
          </section>

          <section className="space-y-6">
            {joinUrl ? <QRJoinCard joinUrl={joinUrl} /> : null}
            <PlayerList players={room.players} title="Joined players" />
          </section>
        </div>
      </div>
    </main>
  );
}
