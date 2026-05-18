"use client";

import type { LetterGrid as LetterGridType } from "@/types/game";

type GridCell = {
  row: number;
  column: number;
};

type LetterGridProps = {
  grid: LetterGridType;
  disabled?: boolean;
  selectedPath?: GridCell[];
  interactive?: boolean;
  onCellPointerDown?: (cell: GridCell) => void;
  onCellPointerEnter?: (cell: GridCell) => void;
  onCellPointerUp?: () => void;
};

export function LetterGrid({
  grid,
  disabled = false,
  selectedPath = [],
  interactive = false,
  onCellPointerDown,
  onCellPointerEnter,
  onCellPointerUp,
}: LetterGridProps) {
  const selectedLookup = new Map(
    selectedPath.map((cell, index) => [`${cell.row}:${cell.column}`, index + 1]),
  );

  return (
    <div className="grid grid-cols-4 gap-3 rounded-[2rem] bg-slate-900 p-4 shadow-[0_24px_80px_rgba(15,23,42,0.35)]">
      {grid.flatMap((row, rowIndex) =>
        row.map((letter, columnIndex) => {
          const key = `${rowIndex}:${columnIndex}`;
          const selectedOrder = selectedLookup.get(key);

          return (
            <button
              key={`${letter}-${key}`}
              type="button"
              disabled={disabled || !interactive}
              onPointerDown={() => onCellPointerDown?.({ row: rowIndex, column: columnIndex })}
              onPointerEnter={() => onCellPointerEnter?.({ row: rowIndex, column: columnIndex })}
              onPointerUp={() => onCellPointerUp?.()}
              className={`relative flex aspect-square items-center justify-center rounded-[1.35rem] text-3xl font-black shadow-inner transition select-none sm:text-4xl ${
                selectedOrder
                  ? "bg-[linear-gradient(180deg,#22c55e_0%,#14b8a6_100%)] text-white ring-4 ring-emerald-200"
                  : "bg-[linear-gradient(180deg,#fef3c7_0%,#fdba74_100%)] text-slate-900"
              } ${interactive ? "touch-none active:scale-95" : "cursor-default"}`}
            >
              {selectedOrder ? (
                <span className="absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-xs font-black text-emerald-700">
                  {selectedOrder}
                </span>
              ) : null}
              {letter}
            </button>
          );
        }),
      )}
    </div>
  );
}
