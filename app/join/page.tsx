"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSocket } from "@/lib/socket/client";
import type { RoomSnapshot } from "@/types/game";

function JoinPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefilledRoom = useMemo(
    () => (searchParams.get("room") || "").toUpperCase(),
    [searchParams],
  );
  const [roomCode, setRoomCode] = useState(() => prefilledRoom);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    const socket = getSocket();

    const handleRoomUpdated = ({ room }: { room: RoomSnapshot }) => {
      if (!isJoining) {
        return;
      }

      const matchingPlayer = room.players.find(
        (player) => player.name.toLowerCase() === name.trim().toLowerCase(),
      );

      if (!matchingPlayer) {
        return;
      }

      localStorage.setItem(`wrp-player-${room.code}`, matchingPlayer.name);
      router.push(`/play/${room.code}`);
    };

    const handleError = ({ message }: { message: string }) => {
      setError(message);
      setIsJoining(false);
    };

    socket.on("room_updated", handleRoomUpdated);
    socket.on("error_message", handleError);
    socket.connect();

    return () => {
      socket.off("room_updated", handleRoomUpdated);
      socket.off("error_message", handleError);
    };
  }, [isJoining, name, router]);

  const joinRoom = () => {
    const normalizedRoomCode = roomCode.trim().toUpperCase();

    if (!normalizedRoomCode || !name.trim()) {
      setError("Please enter both a room code and display name.");
      return;
    }

    setError("");
    setIsJoining(true);
    getSocket().emit("join_room", {
      roomCode: normalizedRoomCode,
      name: name.trim(),
      role: "player",
    });
  };

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fefce8_0%,#e0f2fe_55%,#dcfce7_100%)] px-4 py-8">
      <div className="mx-auto max-w-xl rounded-[2.5rem] bg-white/80 p-6 shadow-[0_25px_90px_rgba(15,23,42,0.15)] backdrop-blur sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-700">Join a room</p>
        <h1 className="mt-3 text-4xl font-black text-slate-900">Jump into the word rush</h1>
        <p className="mt-3 text-slate-600">
          Enter the code from the host screen and pick a display name.
        </p>

        <div className="mt-8 space-y-4">
          <div>
            <label className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-600">
              Room code
            </label>
            <input
              value={roomCode || prefilledRoom}
              onChange={(event) => setRoomCode(event.target.value.toUpperCase())}
              maxLength={4}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-center text-2xl font-black tracking-[0.35em] text-slate-900 outline-none focus:border-sky-400"
              placeholder="K7QF"
            />
          </div>

          <div>
            <label className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-600">
              Display name
            </label>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={20}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-lg font-semibold text-slate-900 outline-none focus:border-sky-400"
              placeholder="Jamie"
            />
          </div>
        </div>

        {error ? (
          <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{error}</p>
        ) : null}

        <button
          type="button"
          onClick={joinRoom}
          disabled={isJoining}
          className="mt-6 w-full rounded-2xl bg-[linear-gradient(135deg,#0ea5e9_0%,#22c55e_100%)] px-6 py-4 text-lg font-black text-white shadow-[0_18px_44px_rgba(14,165,233,0.35)] disabled:opacity-60"
        >
          {isJoining ? "Joining..." : "Join Room"}
        </button>
      </div>
    </main>
  );
}

export default function JoinPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#fefce8_0%,#e0f2fe_55%,#dcfce7_100%)] px-4 py-8">
          <div className="rounded-[2rem] bg-white/80 px-6 py-5 text-center shadow-xl">
            <p className="text-lg font-bold text-slate-900">Loading join screen...</p>
          </div>
        </main>
      }
    >
      <JoinPageContent />
    </Suspense>
  );
}
