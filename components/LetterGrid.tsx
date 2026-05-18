"use client";

import { useLayoutEffect, useState, type RefObject } from "react";
import type { LetterGrid as LetterGridType } from "@/types/game";

export type GridCell = {
  row: number;
  column: number;
};

type LetterGridProps = {
  grid: LetterGridType;
  disabled?: boolean;
  selectedPath?: GridCell[];
  interactive?: boolean;
  gridRef?: RefObject<HTMLDivElement | null>;
  onPointerDown?: (event: React.PointerEvent<HTMLDivElement>) => void;
  onPointerMove?: (event: React.PointerEvent<HTMLDivElement>) => void;
  onPointerUp?: (event: React.PointerEvent<HTMLDivElement>) => void;
  onPointerCancel?: (event: React.PointerEvent<HTMLDivElement>) => void;
};

type Point = {
  x: number;
  y: number;
};

export function LetterGrid({
  grid,
  disabled = false,
  selectedPath = [],
  interactive = false,
  gridRef,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
}: LetterGridProps) {
  const selectedLookup = new Map(
    selectedPath.map((cell, index) => [`${cell.row}:${cell.column}`, index + 1]),
  );
  const [pathPoints, setPathPoints] = useState<Point[]>([]);

  useLayoutEffect(() => {
    const container = gridRef?.current;

    if (!container || selectedPath.length === 0) {
      setPathPoints([]);
      return;
    }

    const containerRect = container.getBoundingClientRect();
    const nextPoints = selectedPath
      .map((cell) => {
        const tile = container.querySelector<HTMLElement>(
          `[data-grid-cell="true"][data-row="${cell.row}"][data-column="${cell.column}"]`,
        );

        if (!tile) {
          return null;
        }

        const tileRect = tile.getBoundingClientRect();

        return {
          x: tileRect.left - containerRect.left + tileRect.width / 2,
          y: tileRect.top - containerRect.top + tileRect.height / 2,
        };
      })
      .filter((point): point is Point => point !== null);

    setPathPoints(nextPoints);
  }, [gridRef, selectedPath]);

  return (
    <div
      ref={gridRef}
      className={`relative grid grid-cols-4 gap-3 rounded-[2rem] bg-slate-900 p-4 shadow-[0_24px_80px_rgba(15,23,42,0.35)] ${
        interactive ? "touch-none select-none" : ""
      }`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
    >
      {pathPoints.length > 1 ? (
        <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
          <polyline
            points={pathPoints.map((point) => `${point.x},${point.y}`).join(" ")}
            fill="none"
            stroke="rgba(110, 231, 183, 0.95)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="12"
          />
        </svg>
      ) : null}

      {grid.flatMap((row, rowIndex) =>
        row.map((letter, columnIndex) => {
          const key = `${rowIndex}:${columnIndex}`;
          const selectedOrder = selectedLookup.get(key);

          return (
            <div
              key={`${letter}-${key}`}
              data-grid-cell="true"
              data-row={rowIndex}
              data-column={columnIndex}
              className={`relative z-10 flex aspect-square items-center justify-center rounded-[1.35rem] text-3xl font-black shadow-inner transition-[transform,background-color,box-shadow] duration-75 sm:text-4xl ${
                selectedOrder
                  ? "scale-[1.03] bg-[linear-gradient(180deg,#22c55e_0%,#14b8a6_100%)] text-white shadow-[0_0_0_4px_rgba(167,243,208,0.95)]"
                  : "bg-[linear-gradient(180deg,#fef3c7_0%,#fdba74_100%)] text-slate-900"
              } ${disabled && interactive ? "opacity-70" : ""}`}
            >
              {selectedOrder ? (
                <span className="absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-xs font-black text-emerald-700">
                  {selectedOrder}
                </span>
              ) : null}
              {letter}
            </div>
          );
        }),
      )}
    </div>
  );
}
