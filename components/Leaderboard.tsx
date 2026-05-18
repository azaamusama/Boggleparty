import type { LeaderboardEntry } from "@/types/game";

type LeaderboardProps = {
  entries: LeaderboardEntry[];
};

export function Leaderboard({ entries }: LeaderboardProps) {
  return (
    <div className="rounded-[2rem] border border-white/50 bg-white/90 p-6 shadow-[0_24px_80px_rgba(13,51,86,0.12)]">
      <h2 className="text-2xl font-black text-slate-900">Leaderboard</h2>
      <div className="mt-5 space-y-4">
        {entries.map((entry, index) => (
          <div key={entry.id} className="rounded-[1.5rem] bg-slate-50 p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">
                  #{index + 1}
                </p>
                <p className="text-xl font-black text-slate-900">{entry.name}</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-black text-slate-900">{entry.score}</p>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">points</p>
              </div>
            </div>
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <div>
                <p className="text-sm font-bold text-emerald-700">Valid words</p>
                <p className="mt-2 text-sm text-slate-700">
                  {entry.validWords.length > 0 ? entry.validWords.join(", ") : "None this round"}
                </p>
              </div>
              <div>
                <p className="text-sm font-bold text-rose-700">Rejected words</p>
                <p className="mt-2 text-sm text-slate-700">
                  {entry.rejectedWords.length > 0
                    ? entry.rejectedWords
                        .map((rejected) => `${rejected.word} (${rejected.reason})`)
                        .join(", ")
                    : "No rejected words"}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
