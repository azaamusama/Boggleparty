type TimerProps = {
  remainingSeconds: number;
};

export function Timer({ remainingSeconds }: TimerProps) {
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const display = `${minutes}:${seconds.toString().padStart(2, "0")}`;
  const urgent = remainingSeconds <= 15;

  return (
    <div
      className={`rounded-[1.75rem] px-5 py-4 text-center shadow-[0_18px_40px_rgba(15,23,42,0.16)] ${
        urgent ? "bg-rose-500 text-white" : "bg-white text-slate-900"
      }`}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.3em] opacity-70">Time left</p>
      <p className="mt-1 text-4xl font-black tabular-nums">{display}</p>
    </div>
  );
}
