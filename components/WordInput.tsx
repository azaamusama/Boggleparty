"use client";

import { useMemo, useRef, useState } from "react";
import { LetterGrid, type GridCell } from "@/components/LetterGrid";
import type { LetterGrid as LetterGridType } from "@/types/game";

type WordInputProps = {
  disabled: boolean;
  grid: LetterGridType;
  onSubmit: (word: string) => void;
};

function isAdjacent(left: GridCell, right: GridCell) {
  const rowDistance = Math.abs(left.row - right.row);
  const columnDistance = Math.abs(left.column - right.column);

  return rowDistance <= 1 && columnDistance <= 1 && (rowDistance > 0 || columnDistance > 0);
}

export function WordInput({ disabled, grid, onSubmit }: WordInputProps) {
  const [selectedPath, setSelectedPath] = useState<GridCell[]>([]);
  const [hint, setHint] = useState("Tap or swipe across the grid to trace a word.");
  const gridRef = useRef<HTMLDivElement | null>(null);
  const isDraggingRef = useRef(false);

  const selectedWord = useMemo(
    () => selectedPath.map((cell) => grid[cell.row][cell.column]).join(""),
    [grid, selectedPath],
  );

  const clearSelection = () => {
    setSelectedPath([]);
    isDraggingRef.current = false;
  };

  const submitSelection = () => {
    if (!selectedWord || disabled) {
      return;
    }

    onSubmit(selectedWord);
    clearSelection();
  };

  const parseCellFromElement = (element: Element | null): GridCell | null => {
    const tile = element?.closest("[data-grid-cell='true']");

    if (!tile) {
      return null;
    }

    const row = Number(tile.getAttribute("data-row"));
    const column = Number(tile.getAttribute("data-column"));

    if (Number.isNaN(row) || Number.isNaN(column)) {
      return null;
    }

    return { row, column };
  };

  const findCellFromPoint = (clientX: number, clientY: number) => {
    const container = gridRef.current;

    if (!container) {
      return null;
    }

    const target = document.elementFromPoint(clientX, clientY);

    if (!target || !container.contains(target)) {
      return null;
    }

    return parseCellFromElement(target);
  };

  const extendPath = (cell: GridCell) => {
    setSelectedPath((currentPath) => {
      if (currentPath.length === 0) {
        return [cell];
      }

      const lastCell = currentPath[currentPath.length - 1];
      const alreadySelectedIndex = currentPath.findIndex(
        (entry) => entry.row === cell.row && entry.column === cell.column,
      );

      if (alreadySelectedIndex === currentPath.length - 2) {
        return currentPath.slice(0, -1);
      }

      if (alreadySelectedIndex >= 0 || !isAdjacent(lastCell, cell)) {
        return currentPath;
      }

      return [...currentPath, cell];
    });
  };

  return (
    <div className="rounded-[2rem] border border-white/50 bg-white/90 p-4 shadow-[0_20px_64px_rgba(13,51,86,0.12)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <label className="text-sm font-semibold uppercase tracking-[0.25em] text-sky-700">
            Trace a word
          </label>
          <p className="mt-2 text-sm text-slate-500">{disabled ? "Round over." : hint}</p>
        </div>
        <button
          type="button"
          disabled={disabled || selectedPath.length === 0}
          onClick={clearSelection}
          className="rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 disabled:opacity-50"
        >
          Clear
        </button>
      </div>

      <div className="mt-4">
        <LetterGrid
          grid={grid}
          gridRef={gridRef}
          disabled={disabled}
          interactive
          selectedPath={selectedPath}
          onPointerDown={(event) => {
            if (disabled) {
              return;
            }

            const cell = parseCellFromElement(event.target as Element);

            if (!cell) {
              return;
            }

            setHint("Keep sliding through neighboring letters, then lift to finish.");
            isDraggingRef.current = true;
            setSelectedPath([cell]);
            event.currentTarget.setPointerCapture(event.pointerId);
          }}
          onPointerMove={(event) => {
            if (disabled || !isDraggingRef.current) {
              return;
            }

            const cell = findCellFromPoint(event.clientX, event.clientY);

            if (!cell) {
              return;
            }

            extendPath(cell);
          }}
          onPointerUp={(event) => {
            if (event.currentTarget.hasPointerCapture(event.pointerId)) {
              event.currentTarget.releasePointerCapture(event.pointerId);
            }

            isDraggingRef.current = false;
          }}
          onPointerCancel={(event) => {
            if (event.currentTarget.hasPointerCapture(event.pointerId)) {
              event.currentTarget.releasePointerCapture(event.pointerId);
            }

            isDraggingRef.current = false;
          }}
        />
      </div>

      <div className="mt-4 rounded-[1.5rem] bg-slate-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
          Current word
        </p>
        <p className="mt-2 min-h-9 break-all text-3xl font-black tracking-[0.18em] text-slate-900">
          {selectedWord || " "}
        </p>
      </div>

      <div className="mt-4 flex gap-3">
        <button
          type="button"
          disabled={disabled || selectedWord.length === 0}
          onClick={submitSelection}
          className="flex-1 rounded-2xl bg-[linear-gradient(135deg,#0ea5e9_0%,#22c55e_100%)] px-5 py-4 text-sm font-black uppercase tracking-[0.15em] text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          Submit Word
        </button>
      </div>
    </div>
  );
}
