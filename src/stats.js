// Turns round history into leaderboard-style stats for the end-of-game summary.
function bump(map, key, name, points) {
  const existing = map.get(key) || { name, totalPoints: 0, rounds: 0 }
  existing.totalPoints += points
  existing.rounds += 1
  map.set(key, existing)
}

function toRanked(map) {
  return [...map.entries()]
    .map(([key, v]) => ({ key, ...v, avg: v.totalPoints / v.rounds }))
    .sort((a, b) => b.avg - a.avg || b.totalPoints - a.totalPoints)
}

export function computeStats(history) {
  const byClueGiver = new Map()
  const byGuesser = new Map()
  const combos = new Map()

  for (const round of history) {
    // "Best clue giver" is about how well their guessers read the clue, not
    // the clue giver's own (optional, flat) scoring bonus — so both roles,
    // and the duo score, are ranked on the guesser's accuracy points.
    bump(byClueGiver, round.clueGiverId, round.clueGiverName, round.guesserPoints)
    bump(byGuesser, round.guesserId, round.guesserName, round.guesserPoints)
    bump(
      combos,
      `${round.clueGiverId}|${round.guesserId}`,
      `${round.clueGiverName} → ${round.guesserName}`,
      round.guesserPoints,
    )
  }

  return {
    clueGivers: toRanked(byClueGiver),
    guessers: toRanked(byGuesser),
    combos: toRanked(combos),
  }
}

export const toTenScale = (value) => (value / 10).toFixed(1)
