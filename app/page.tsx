"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#fff7ed_0%,#dbeafe_45%,#cffafe_100%)] px-4 py-8 text-slate-900">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl flex-col justify-center gap-8">
        <div className="max-w-2xl">
          <p className="inline-flex rounded-full bg-white/70 px-4 py-2 text-sm font-bold uppercase tracking-[0.25em] text-sky-700 shadow-sm">
            Party game night
          </p>
          <h1 className="mt-6 text-5xl font-black tracking-tight sm:text-7xl">
            Word Rush Party
          </h1>
          <p className="mt-5 max-w-xl text-lg text-slate-700 sm:text-xl">
            A fast multiplayer word-grid party game.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Link
            href="/host/new"
            className="rounded-[2rem] bg-slate-900 p-8 text-white shadow-[0_30px_90px_rgba(15,23,42,0.35)] transition hover:-translate-y-1"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-300">Host</p>
            <h2 className="mt-3 text-3xl font-black">Create Room</h2>
            <p className="mt-4 text-slate-300">
              Spin up a room, share the code, and start a round for everyone at once.
            </p>
          </Link>

          <Link
            href="/join"
            className="rounded-[2rem] border border-white/60 bg-white/80 p-8 shadow-[0_30px_90px_rgba(14,116,144,0.18)] transition hover:-translate-y-1"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-700">Join</p>
            <h2 className="mt-3 text-3xl font-black">Join Room</h2>
            <p className="mt-4 text-slate-600">
              Enter a room code on your phone and jump into the same live letter grid.
            </p>
          </Link>
        </div>
      </div>
    </main>
  );
}
