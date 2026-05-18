import type { LetterGrid } from "@/types/game";

const LETTER_WEIGHTS = [
  "E",
  "E",
  "E",
  "E",
  "A",
  "A",
  "A",
  "O",
  "O",
  "I",
  "I",
  "N",
  "N",
  "R",
  "R",
  "T",
  "T",
  "L",
  "L",
  "S",
  "S",
  "U",
  "D",
  "D",
  "G",
  "B",
  "C",
  "M",
  "P",
  "F",
  "H",
  "V",
  "W",
  "Y",
  "K",
  "J",
  "X",
  "Q",
  "Z",
];

const DIRECTIONS = [-1, 0, 1];

export function generateLetterGrid(size = 4): LetterGrid {
  return Array.from({ length: size }, () =>
    Array.from({ length: size }, () => {
      const index = Math.floor(Math.random() * LETTER_WEIGHTS.length);
      return LETTER_WEIGHTS[index];
    }),
  );
}

export function canFormWordFromGrid(word: string, grid: LetterGrid): boolean {
  const target = word.trim().toUpperCase();

  if (!target) {
    return false;
  }

  const size = grid.length;
  const visited = Array.from({ length: size }, () => Array(size).fill(false));

  // Depth-first search enforces adjacency and one-time tile use without any UI coupling.
  const search = (row: number, column: number, index: number): boolean => {
    if (grid[row][column] !== target[index]) {
      return false;
    }

    if (index === target.length - 1) {
      return true;
    }

    visited[row][column] = true;

    for (const rowOffset of DIRECTIONS) {
      for (const columnOffset of DIRECTIONS) {
        if (rowOffset === 0 && columnOffset === 0) {
          continue;
        }

        const nextRow = row + rowOffset;
        const nextColumn = column + columnOffset;

        if (
          nextRow < 0 ||
          nextRow >= size ||
          nextColumn < 0 ||
          nextColumn >= size ||
          visited[nextRow][nextColumn]
        ) {
          continue;
        }

        if (search(nextRow, nextColumn, index + 1)) {
          visited[row][column] = false;
          return true;
        }
      }
    }

    visited[row][column] = false;
    return false;
  };

  for (let row = 0; row < size; row += 1) {
    for (let column = 0; column < size; column += 1) {
      if (search(row, column, 0)) {
        return true;
      }
    }
  }

  return false;
}
