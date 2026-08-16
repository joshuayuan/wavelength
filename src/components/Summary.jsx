import { computeStats, toTenScale } from '../stats.js'
import { buildReportText, downloadTextFile } from '../export.js'

export default function Summary({ players, history, onNewGame }) {
  const stats = computeStats(history)
  const ranked = [...players].sort((a, b) => b.score - a.score)

  const exportGame = () => {
    const text = buildReportText({ players, history, stats })
    const stamp = new Date().toISOString().slice(0, 16).replace('T', '_').replace(':', '-')
    downloadTextFile(`wavelength-${stamp}.txt`, text)
  }

  return (
    <div className="panel">
      <h2>Game summary</h2>
      <p className="subtitle">
        {history.length} round{history.length === 1 ? '' : 's'} played.
      </p>

      <ol className="final-scores">
        {ranked.map((p, i) => (
          <li key={p.id} className={i === 0 ? 'winner' : ''}>
            <span>
              {i === 0 ? '🏆 ' : ''}
              {p.name}
            </span>
            <strong>{p.score} pts</strong>
          </li>
        ))}
      </ol>

      {stats.clueGivers.length > 0 && (
        <div className="stats-block">
          <div className="stat-row">
            <span>Best clue giver</span>
            <strong>
              {stats.clueGivers[0].name} · avg {stats.clueGivers[0].avg.toFixed(1)} pts (
              {stats.clueGivers[0].rounds} round{stats.clueGivers[0].rounds === 1 ? '' : 's'})
            </strong>
          </div>
          <div className="stat-row">
            <span>Best guesser</span>
            <strong>
              {stats.guessers[0].name} · avg {stats.guessers[0].avg.toFixed(1)} pts ({stats.guessers[0].rounds}{' '}
              round{stats.guessers[0].rounds === 1 ? '' : 's'})
            </strong>
          </div>
          {stats.combos.slice(0, 3).map((c) => (
            <div className="stat-row" key={c.key}>
              <span>Best duo</span>
              <strong>
                {c.name} · {c.totalPoints} pts ({c.rounds} round{c.rounds === 1 ? '' : 's'})
              </strong>
            </div>
          ))}
        </div>
      )}

      {history.length > 0 && (
        <details className="history" open>
          <summary>Round history ({history.length})</summary>
          <ol>
            {history.map((h, i) => (
              <li key={i}>
                Round {h.round} — Clue: {h.clueGiverName} (+{h.clueGiverPoints}), Guess: {h.guesserName} (+
                {h.guesserPoints}) — "{h.leftLabel}" ↔ "{h.rightLabel}" — target {toTenScale(h.target)}/10, guess{' '}
                {toTenScale(h.guess)}/10
              </li>
            ))}
          </ol>
        </details>
      )}

      <button className="primary" onClick={exportGame}>
        ⬇ Export game summary
      </button>
      <button className="secondary" onClick={onNewGame}>
        Start new game with these players
      </button>
    </div>
  )
}
