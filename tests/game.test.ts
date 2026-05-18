import assert from "node:assert/strict";
import test from "node:test";
import { buildLeaderboard } from "@/lib/game/leaderboard";
import { canFormWordFromGrid } from "@/lib/game/grid";
import { calculatePlayerScore, scoreWord } from "@/lib/game/scoring";
import { normalizeWord, validateSubmittedWord } from "@/lib/game/validation";
import type { LetterGrid, Player } from "@/types/game";

const sampleGrid: LetterGrid = [
  ["C", "A", "R", "D"],
  ["O", "T", "E", "S"],
  ["L", "N", "P", "H"],
  ["M", "I", "G", "O"],
];

test("scoreWord follows the MVP scoring rules", () => {
  assert.equal(scoreWord("CAT"), 1);
  assert.equal(scoreWord("STONE"), 2);
  assert.equal(scoreWord("PLANET"), 3);
  assert.equal(scoreWord("RAINBOW"), 5);
  assert.equal(scoreWord("ELEPHANT"), 11);
  assert.equal(calculatePlayerScore(["CAT", "STONE", "PLANET"]), 6);
});

test("normalizeWord strips punctuation and uppercases text", () => {
  assert.equal(normalizeWord("  Ca-t! "), "CAT");
});

test("canFormWordFromGrid enforces adjacency and prevents tile reuse", () => {
  assert.equal(canFormWordFromGrid("CARD", sampleGrid), true);
  assert.equal(canFormWordFromGrid("CART", sampleGrid), true);
  assert.equal(canFormWordFromGrid("COCO", sampleGrid), false);
  assert.equal(canFormWordFromGrid("ZAP", sampleGrid), false);
});

test("validateSubmittedWord rejects duplicate words", () => {
  const dictionary = new Set(["CARD", "CART"]);
  const result = validateSubmittedWord("card", sampleGrid, dictionary, ["CARD"]);

  assert.equal(result.accepted, false);
  assert.equal(result.reason, "You already submitted that word.");
});

test("buildLeaderboard sorts by score and then valid word count", () => {
  const players: Player[] = [
    {
      id: "1",
      socketId: "a",
      name: "Avery",
      score: 4,
      validWords: ["CARD", "CART"],
      rejectedWords: [],
      connected: true,
    },
    {
      id: "2",
      socketId: "b",
      name: "Blair",
      score: 7,
      validWords: ["STONE"],
      rejectedWords: [],
      connected: true,
    },
    {
      id: "3",
      socketId: "c",
      name: "Casey",
      score: 4,
      validWords: ["CARD"],
      rejectedWords: [],
      connected: true,
    },
  ];

  const leaderboard = buildLeaderboard(players);

  assert.deepEqual(
    leaderboard.map((entry) => entry.name),
    ["Blair", "Avery", "Casey"],
  );
});
