// Round-robin scheduler for (clue giver, guesser) pairs. The clue giver
// rotates through players sequentially; the guesser is offset from them by a
// distance that increases by one every full lap, so every ordered pair of
// distinct players gets used before any pair repeats (a circulant / "circle
// method" round-robin schedule).
export function computeRoles(players, roundIndex) {
  const n = players.length
  const clueGiverIdx = roundIndex % n
  const lap = Math.floor(roundIndex / n)
  const offset = 1 + (lap % (n - 1 || 1))
  const guesserIdx = (clueGiverIdx + offset) % n
  return {
    clueGiverId: players[clueGiverIdx].id,
    guesserId: players[guesserIdx].id,
  }
}
