import type { LeaderboardEntry, Player } from "@/types/game";

export function buildLeaderboard(players: Player[]): LeaderboardEntry[] {
  return [...players]
    .map((player) => ({
      id: player.id,
      name: player.name,
      score: player.score,
      validWords: [...player.validWords].sort(),
      rejectedWords: [...player.rejectedWords],
    }))
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }

      if (right.validWords.length !== left.validWords.length) {
        return right.validWords.length - left.validWords.length;
      }

      return left.name.localeCompare(right.name);
    });
}
