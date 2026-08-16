import { toTenScale } from './stats.js'

export function buildReportText({ players, history, stats }) {
  const lines = []
  const played = new Date().toLocaleString()

  lines.push('WAVELENGTH — Game Summary')
  lines.push(`Played: ${played}`)
  lines.push(`Rounds played: ${history.length}`)
  lines.push(`Players: ${players.map((p) => p.name).join(', ')}`)
  lines.push('')

  lines.push('FINAL SCORES')
  ;[...players]
    .sort((a, b) => b.score - a.score)
    .forEach((p, i) => lines.push(`${i + 1}. ${p.name} — ${p.score} pts`))
  lines.push('')

  if (stats.clueGivers.length > 0) {
    lines.push('STATS')
    const bestClue = stats.clueGivers[0]
    lines.push(
      `Best Clue Giver: ${bestClue.name} (avg ${bestClue.avg.toFixed(1)} pts over ${bestClue.rounds} round${bestClue.rounds === 1 ? '' : 's'}, ${bestClue.totalPoints} total)`,
    )
    const bestGuess = stats.guessers[0]
    lines.push(
      `Best Guesser: ${bestGuess.name} (avg ${bestGuess.avg.toFixed(1)} pts over ${bestGuess.rounds} round${bestGuess.rounds === 1 ? '' : 's'}, ${bestGuess.totalPoints} total)`,
    )
    lines.push('Best Duos:')
    stats.combos.slice(0, 3).forEach((c) => {
      lines.push(`  ${c.name} — ${c.totalPoints} pts combined over ${c.rounds} round${c.rounds === 1 ? '' : 's'}`)
    })
    lines.push('')
  }

  lines.push('ROUND HISTORY')
  history.forEach((h) => {
    lines.push(`Round ${h.round} — Clue: ${h.clueGiverName}, Guess: ${h.guesserName}`)
    lines.push(`  Topic: ${h.leftLabel} ↔ ${h.rightLabel}`)
    lines.push(`  Target: ${toTenScale(h.target)}/10   Guess: ${toTenScale(h.guess)}/10`)
    lines.push(`  Points: guesser +${h.guesserPoints}, clue giver +${h.clueGiverPoints}`)
    const earners = h.bonusResults.filter((b) => b.choice)
    if (earners.length > 0) {
      lines.push(
        `  Bonus: ${earners.map((b) => `${b.playerName} ${b.earned ? '+1' : '+0'} (${b.choice})`).join(', ')}`,
      )
    }
    lines.push('')
  })

  return lines.join('\n')
}

export function downloadTextFile(filename, text) {
  const blob = new Blob([text], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
