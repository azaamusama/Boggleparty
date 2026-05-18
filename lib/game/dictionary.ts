import fs from "node:fs";
import path from "node:path";

let cachedDictionary: Set<string> | null = null;

export function loadDictionary(): Set<string> {
  if (cachedDictionary) {
    return cachedDictionary;
  }

  const dictionaryPath = path.join(process.cwd(), "data", "words.txt");
  const dictionaryContents = fs.readFileSync(dictionaryPath, "utf8");

  cachedDictionary = new Set(
    dictionaryContents
      .split(/\r?\n/)
      .map((word) => word.trim().toUpperCase())
      .filter(Boolean),
  );

  return cachedDictionary;
}
