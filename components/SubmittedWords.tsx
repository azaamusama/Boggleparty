import type { RejectedWord } from "@/types/game";

type SubmittedWordsProps = {
  validWords: string[];
  rejectedWords: RejectedWord[];
};

export function SubmittedWords({ validWords, rejectedWords }: SubmittedWordsProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-[2rem] bg-white/90 p-5 shadow-[0_20px_64px_rgba(13,51,86,0.12)]">
        <h3 className="text-lg font-black text-slate-900">Accepted</h3>
        <div className="mt-4 flex flex-wrap gap-2">
          {validWords.length === 0 ? (
            <p className="text-sm text-slate-500">Your valid words will appear here.</p>
          ) : null}
          {validWords.map((word) => (
            <span
              key={word}
              className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-bold text-emerald-700"
            >
              {word}
            </span>
          ))}
        </div>
      </div>
      <div className="rounded-[2rem] bg-white/90 p-5 shadow-[0_20px_64px_rgba(13,51,86,0.12)]">
        <h3 className="text-lg font-black text-slate-900">Rejected</h3>
        <div className="mt-4 space-y-2">
          {rejectedWords.length === 0 ? (
            <p className="text-sm text-slate-500">Rejected words will show a friendly reason here.</p>
          ) : null}
          {rejectedWords.map((entry, index) => (
            <div key={`${entry.word}-${index}`} className="rounded-2xl bg-rose-50 px-3 py-2">
              <p className="font-bold text-rose-700">{entry.word || "INVALID"}</p>
              <p className="text-sm text-rose-600">{entry.reason}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
