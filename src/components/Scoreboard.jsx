export default function Scoreboard({ players, clueGiverId, guesserId, onAdjust }) {
  return (
    <div className="scoreboard">
      {players.map((p) => {
        const role = p.id === clueGiverId ? 'clue' : p.id === guesserId ? 'guess' : null
        return (
          <div key={p.id} className={`score-card${role ? ` active role-${role}` : ''}`}>
            <div className="score-name">
              {p.name}
              {role === 'clue' && <span className="role-badge">clue giver</span>}
              {role === 'guess' && <span className="role-badge">guesser</span>}
            </div>
            <div className="score-value">{p.score}</div>
            {onAdjust && (
              <div className="score-adjust">
                <button onClick={() => onAdjust(p.id, -1)} aria-label={`Subtract point from ${p.name}`}>
                  −
                </button>
                <button onClick={() => onAdjust(p.id, 1)} aria-label={`Add point to ${p.name}`}>
                  +
                </button>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
