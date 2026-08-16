import { useState } from 'react'

// Embeddable add/remove list for players. Usable both in the lobby and as a
// panel toggled open mid-game, so people can join or be corrected any time.
export default function PlayerManager({ players, onAdd, onRemove, disableRemove }) {
  const [name, setName] = useState('')

  const submit = () => {
    const trimmed = name.trim()
    if (!trimmed) return
    onAdd(trimmed)
    setName('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') submit()
  }

  return (
    <div className="player-manager">
      <div className="team-input-row">
        <input
          type="text"
          placeholder="Player name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button onClick={submit}>Add player</button>
      </div>

      {players.length > 0 && (
        <ul className="team-list">
          {players.map((p) => {
            const locked = disableRemove ? disableRemove(p.id) : false
            return (
              <li key={p.id}>
                <span>{p.name}</span>
                <button
                  className="link-button"
                  disabled={locked}
                  title={locked ? "Can't remove mid-turn" : undefined}
                  onClick={() => onRemove(p.id)}
                >
                  remove
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
