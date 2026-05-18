import type { Player } from "@/types/game";

type PlayerListProps = {
  players: Player[];
  title?: string;
};

export function PlayerList({ players, title = "Players" }: PlayerListProps) {
  return (
    <div className="rounded-[2rem] border border-white/50 bg-white/85 p-6 shadow-[0_24px_64px_rgba(13,51,86,0.12)]">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black text-slate-900">{title}</h2>
        <span className="rounded-full bg-sky-100 px-3 py-1 text-sm font-semibold text-sky-700">
          {players.length}
        </span>
      </div>
      <div className="mt-4 space-y-3">
        {players.length === 0 ? (
          <p className="text-sm text-slate-500">No players yet. Share the code to get the party started.</p>
        ) : null}
        {players.map((player) => (
          <div
            key={player.id}
            className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3"
          >
            <div>
              <p className="font-bold text-slate-900">{player.name}</p>
              <p className="text-sm text-slate-500">
                {player.connected ? "Ready to play" : "Disconnected"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-black text-slate-900">{player.score}</p>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">pts</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
