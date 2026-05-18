import { canFormWordFromGrid } from "@/lib/game/grid";
import type { LetterGrid, WordValidationResult } from "@/types/game";

export function normalizeWord(word: string): string {
  return word.trim().replace(/[^a-z]/gi, "").toUpperCase();
}

export function validateSubmittedWord(
  word: string,
  grid: LetterGrid,
  dictionary: Set<string>,
  alreadySubmittedWords: string[],
): WordValidationResult {
  const normalizedWord = normalizeWord(word);

  if (normalizedWord.length < 3) {
    return {
      accepted: false,
      normalizedWord,
      reason: "Enter at least 3 letters.",
    };
  }

  if (alreadySubmittedWords.includes(normalizedWord)) {
    return {
      accepted: false,
      normalizedWord,
      reason: "You already submitted that word.",
    };
  }

  if (!dictionary.has(normalizedWord)) {
    return {
      accepted: false,
      normalizedWord,
      reason: "That word is not in the dictionary.",
    };
  }

  // Grid path validation stays pure so it can be tested independently from networking.
  if (!canFormWordFromGrid(normalizedWord, grid)) {
    return {
      accepted: false,
      normalizedWord,
      reason: "That word cannot be formed on this grid.",
    };
  }

  return {
    accepted: true,
    normalizedWord,
  };
}
