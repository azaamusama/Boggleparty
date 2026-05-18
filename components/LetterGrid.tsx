import type { LetterGrid as LetterGridType } from "@/types/game";

type LetterGridProps = {
  grid: LetterGridType;
};

export function LetterGrid({ grid }: LetterGridProps) {
  return (
    <div className="grid grid-cols-4 gap-3 rounded-[2rem] bg-slate-900 p-4 shadow-[0_24px_80px_rgba(15,23,42,0.35)]">
      {grid.flat().map((letter, index) => (
        <div
          key={`${letter}-${index}`}
          className="flex aspect-square items-center justify-center rounded-[1.35rem] bg-[linear-gradient(180deg,#fef3c7_0%,#fdba74_100%)] text-3xl font-black text-slate-900 shadow-inner sm:text-4xl"
        >
          {letter}
        </div>
      ))}
    </div>
  );
}
