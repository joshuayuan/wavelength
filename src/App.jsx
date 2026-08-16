import { useEffect, useState } from 'react'
import PlayerManager from './components/PlayerManager.jsx'
import Scoreboard from './components/Scoreboard.jsx'
import WavelengthDial from './components/WavelengthDial.jsx'
import Summary from './components/Summary.jsx'
import ThemeToggle from './components/ThemeToggle.jsx'
import { PRESETS } from './presets.js'
import { scoreGuess } from './scoring.js'
import { toTenScale } from './stats.js'
import { loadCustomTopics, saveCustomTopic, removeCustomTopic } from './customTopics.js'
import { computeRoles } from './rotation.js'

const PHASES = {
  LOBBY: 'LOBBY',
  CLUE_SETUP: 'CLUE_SETUP',
  PASS_DEVICE: 'PASS_DEVICE',
  GUESSING: 'GUESSING',
  BONUS: 'BONUS',
  REVEAL: 'REVEAL',
  SUMMARY: 'SUMMARY',
}

const ROUND_PHASES = [PHASES.CLUE_SETUP, PHASES.PASS_DEVICE, PHASES.GUESSING, PHASES.BONUS, PHASES.REVEAL]

export default function App() {
  const [phase, setPhase] = useState(PHASES.LOBBY)
  const [players, setPlayers] = useState([])
  const [round, setRound] = useState(1)
  const [clueGiverId, setClueGiverId] = useState(null)
  const [guesserId, setGuesserId] = useState(null)
  const [managerOpen, setManagerOpen] = useState(false)
  const [topicsOpen, setTopicsOpen] = useState(false)
  const [upcomingOpen, setUpcomingOpen] = useState(false)
  const [customTopics, setCustomTopics] = useState(() => loadCustomTopics())
  const [justSaved, setJustSaved] = useState(false)
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme || 'dark')

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('wavelength-theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))

  const [leftLabel, setLeftLabel] = useState('')
  const [rightLabel, setRightLabel] = useState('')
  const [target, setTarget] = useState(50)
  const [guess, setGuess] = useState(50)
  const [bonusChoices, setBonusChoices] = useState({})
  const [lastResult, setLastResult] = useState(null)
  const [history, setHistory] = useState([])

  const clueGiver = players.find((p) => p.id === clueGiverId)
  const guesser = players.find((p) => p.id === guesserId)
  const others = players.filter((p) => p.id !== clueGiverId && p.id !== guesserId)

  const addPlayer = (name) => setPlayers((ps) => [...ps, { id: crypto.randomUUID(), name, score: 0 }])

  const removePlayer = (id) => setPlayers((ps) => ps.filter((p) => p.id !== id))

  const disableRemove = (id) => {
    if (players.length <= 2) return true
    if (ROUND_PHASES.includes(phase) && (id === clueGiverId || id === guesserId)) return true
    return false
  }

  const adjustScore = (id, delta) => {
    setPlayers((ps) => ps.map((p) => (p.id === id ? { ...p, score: p.score + delta } : p)))
  }

  const randomTarget = () => Math.round(Math.random() * 90 + 5)

  const applyTopic = (l, r) => {
    setLeftLabel(l)
    setRightLabel(r)
    setTarget(randomTarget())
  }

  const randomTopic = () => {
    const pool = [...customTopics, ...PRESETS]
    return pool[Math.floor(Math.random() * pool.length)]
  }

  const startGame = () => {
    if (players.length < 2) return
    setPlayers((ps) => ps.map((p) => ({ ...p, score: 0 })))
    setHistory([])
    setRound(1)
    const { clueGiverId: cg, guesserId: gs } = computeRoles(players, 0)
    setClueGiverId(cg)
    setGuesserId(gs)
    applyTopic(...randomTopic())
    setManagerOpen(false)
    setPhase(PHASES.CLUE_SETUP)
  }

  const fillPreset = () => applyTopic(...randomTopic())

  const useTopic = (pair) => {
    applyTopic(...pair)
    setTopicsOpen(false)
  }

  const saveTopic = () => {
    setCustomTopics((ts) => {
      const next = saveCustomTopic(ts, leftLabel, rightLabel)
      if (next !== ts) {
        setJustSaved(true)
        setTimeout(() => setJustSaved(false), 1500)
      }
      return next
    })
  }

  const lockTarget = () => {
    setGuess(50)
    setPhase(PHASES.PASS_DEVICE)
  }

  const startGuessing = () => setPhase(PHASES.GUESSING)

  const lockGuess = () => {
    setBonusChoices({})
    if (others.length > 0) {
      setPhase(PHASES.BONUS)
    } else {
      reveal()
    }
  }

  const chooseBonus = (playerId, choice) => {
    setBonusChoices((b) => ({ ...b, [playerId]: choice }))
  }

  const reveal = () => {
    const guesserPoints = scoreGuess(target, guess)
    const clueGiverPoints = guesserPoints > 0 ? 1 : 0
    const correctDirection = target > guess ? 'right' : target < guess ? 'left' : null

    const bonusResults = others.map((p) => {
      const choice = bonusChoices[p.id]
      const earned = correctDirection && choice === correctDirection ? 1 : 0
      return { playerId: p.id, playerName: p.name, choice, earned }
    })

    setPlayers((ps) =>
      ps.map((p) => {
        let delta = 0
        if (p.id === clueGiverId) delta += clueGiverPoints
        if (p.id === guesserId) delta += guesserPoints
        const bonus = bonusResults.find((b) => b.playerId === p.id)
        if (bonus) delta += bonus.earned
        return delta ? { ...p, score: p.score + delta } : p
      }),
    )

    const result = {
      round,
      clueGiverId,
      clueGiverName: clueGiver.name,
      guesserId,
      guesserName: guesser.name,
      leftLabel,
      rightLabel,
      target,
      guess,
      guesserPoints,
      clueGiverPoints,
      bonusResults,
    }
    setLastResult(result)
    setHistory((h) => [result, ...h])
    setPhase(PHASES.REVEAL)
  }

  const nextRound = () => {
    const newRound = round + 1
    const { clueGiverId: cg, guesserId: gs } = computeRoles(players, newRound - 1)
    setClueGiverId(cg)
    setGuesserId(gs)
    setRound(newRound)
    applyTopic(...randomTopic())
    setGuess(50)
    setBonusChoices({})
    setPhase(PHASES.CLUE_SETUP)
  }

  const endGame = () => setPhase(PHASES.SUMMARY)

  const newGameSamePlayers = () => {
    setPlayers((ps) => ps.map((p) => ({ ...p, score: 0 })))
    setHistory([])
    setRound(1)
    setClueGiverId(null)
    setGuesserId(null)
    setLastResult(null)
    setManagerOpen(true)
    setPhase(PHASES.LOBBY)
  }

  if (phase === PHASES.LOBBY) {
    return (
      <div className="app">
        <header className="app-header">
          <h1>Wavelength</h1>
          <div className="header-actions">
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
          </div>
        </header>
        <div className="panel setup">
          <p className="subtitle">Add your players, then start the first round.</p>
          <PlayerManager players={players} onAdd={addPlayer} onRemove={removePlayer} disableRemove={disableRemove} />
          <button className="primary" disabled={players.length < 2} onClick={startGame}>
            {players.length < 2 ? 'Add at least 2 players' : 'Start game'}
          </button>
        </div>
      </div>
    )
  }

  if (phase === PHASES.SUMMARY) {
    return (
      <div className="app">
        <header className="app-header">
          <h1>Wavelength</h1>
          <div className="header-actions">
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
          </div>
        </header>
        <Summary players={players} history={history} onNewGame={newGameSamePlayers} />
      </div>
    )
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Wavelength</h1>
        <div className="header-actions">
          <button className="link-button" onClick={() => setManagerOpen((o) => !o)}>
            👥 Players
          </button>
          <button className="link-button" onClick={() => setTopicsOpen((o) => !o)}>
            📝 Topics{customTopics.length > 0 ? ` (${customTopics.length})` : ''}
          </button>
          <button className="link-button" onClick={() => setUpcomingOpen((o) => !o)}>
            🔮 Upcoming
          </button>
          <button className="link-button" onClick={endGame}>
            End game
          </button>
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </div>
      </header>

      {managerOpen && (
        <div className="panel">
          <h2>Players</h2>
          <p className="subtitle">Add latecomers or fix a typo — this won't interrupt the round in progress.</p>
          <PlayerManager players={players} onAdd={addPlayer} onRemove={removePlayer} disableRemove={disableRemove} />
        </div>
      )}

      {topicsOpen && (
        <div className="panel">
          <h2>Custom topics</h2>
          <p className="subtitle">Saved on this device. Add more from the "Set the spectrum" screen.</p>
          {customTopics.length === 0 ? (
            <p className="subtitle">None saved yet.</p>
          ) : (
            <ul className="team-list">
              {customTopics.map((t, i) => (
                <li key={i} className="topic-list-item">
                  {phase === PHASES.CLUE_SETUP ? (
                    <button className="topic-use" onClick={() => useTopic(t)}>
                      {t[0]} ↔ {t[1]}
                    </button>
                  ) : (
                    <span>
                      {t[0]} ↔ {t[1]}
                    </span>
                  )}
                  <div className="topic-item-actions">
                    <button className="link-button" onClick={() => setCustomTopics((ts) => removeCustomTopic(ts, i))}>
                      remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {upcomingOpen && (
        <div className="panel">
          <h2>Upcoming rounds</h2>
          <p className="subtitle">Based on the current round-robin rotation — shifts if players are added or removed.</p>
          <ol className="upcoming-list">
            {Array.from({ length: 5 }, (_, i) => {
              const r = round + 1 + i
              const { clueGiverId: cg, guesserId: gs } = computeRoles(players, r - 1)
              const cgName = players.find((p) => p.id === cg)?.name
              const gsName = players.find((p) => p.id === gs)?.name
              return (
                <li key={r}>
                  <span className="upcoming-round">Round {r}</span>
                  <span>
                    {cgName} → {gsName}
                  </span>
                </li>
              )
            })}
          </ol>
        </div>
      )}

      <Scoreboard players={players} clueGiverId={clueGiverId} guesserId={guesserId} onAdjust={adjustScore} />

      <div className="turn-banner">
        Round {round} · <strong>{clueGiver?.name}</strong> gives the clue, <strong>{guesser?.name}</strong> guesses
      </div>

      {phase === PHASES.CLUE_SETUP && (
        <div className="panel">
          <h2>Set the spectrum</h2>
          <p className="subtitle">
            {clueGiver?.name} only: a topic and secret target are picked for you — edit the topic or pick a
            different one, and drag the target if you want to move it.
          </p>

          <div className="label-inputs">
            <input
              type="text"
              placeholder="Left end (e.g. Cold)"
              value={leftLabel}
              onChange={(e) => setLeftLabel(e.target.value)}
            />
            <input
              type="text"
              placeholder="Right end (e.g. Hot)"
              value={rightLabel}
              onChange={(e) => setRightLabel(e.target.value)}
            />
          </div>
          <div className="topic-actions">
            <button className="icon-button" onClick={fillPreset} title="Shuffle random topic" aria-label="Shuffle random topic">
              🎲
            </button>
            <button
              className="icon-button"
              disabled={!leftLabel.trim() || !rightLabel.trim()}
              onClick={saveTopic}
              title={justSaved ? 'Saved!' : 'Save this topic'}
              aria-label="Save this topic"
            >
              {justSaved ? '✓' : '💾'}
            </button>
          </div>

          {others.length > 0 && (
            <div className="guesser-row">
              <label htmlFor="guesser-select">Guesser</label>
              {players.filter((p) => p.id !== clueGiverId).length > 1 ? (
                <select id="guesser-select" value={guesserId} onChange={(e) => setGuesserId(e.target.value)}>
                  {players
                    .filter((p) => p.id !== clueGiverId)
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                </select>
              ) : (
                <strong>{guesser?.name}</strong>
              )}
            </div>
          )}

          <div className="secret-zone">
            <div className="secret-label">🔒 Secret target — only {clueGiver?.name} should look. Drag to set it.</div>
            <WavelengthDial
              leftLabel={leftLabel}
              rightLabel={rightLabel}
              zoneCenter={target}
              interactiveValue={target}
              onChange={setTarget}
            />
          </div>

          <button className="primary" onClick={lockTarget}>
            Lock target &amp; hide it
          </button>
        </div>
      )}

      {phase === PHASES.PASS_DEVICE && (
        <div className="panel cover">
          <h2>🙈 Pass the device</h2>
          <p className="subtitle">
            Hand the device to <strong>{guesser?.name}</strong>. {clueGiver?.name} should now give a verbal clue
            that points at the secret target.
          </p>
          <button className="primary" onClick={startGuessing}>
            We're ready — show the guessing scale
          </button>
        </div>
      )}

      {phase === PHASES.GUESSING && (
        <div className="panel">
          <h2>{guesser?.name}, make your guess</h2>
          <p className="subtitle">Drag the marker to where you think the target is, then lock it in.</p>
          <WavelengthDial
            leftLabel={leftLabel}
            rightLabel={rightLabel}
            interactiveValue={guess}
            onChange={setGuess}
          />
          <button className="primary" onClick={lockGuess}>
            Lock in guess
          </button>
        </div>
      )}

      {phase === PHASES.BONUS && (
        <div className="panel">
          <h2>Bonus guesses</h2>
          <p className="subtitle">
            Everyone else: is the real target further left or right than {guesser?.name}'s guess? Guess right for a
            bonus point.
          </p>
          <WavelengthDial leftLabel={leftLabel} rightLabel={rightLabel} needles={[{ value: guess, style: 'guess' }]} />
          <div className="bonus-list">
            {others.map((p) => (
              <div key={p.id} className="bonus-row">
                <span>{p.name}</span>
                <div className="bonus-buttons">
                  <button
                    className={bonusChoices[p.id] === 'left' ? 'selected' : ''}
                    onClick={() => chooseBonus(p.id, 'left')}
                  >
                    ← Left
                  </button>
                  <button
                    className={bonusChoices[p.id] === 'right' ? 'selected' : ''}
                    onClick={() => chooseBonus(p.id, 'right')}
                  >
                    Right →
                  </button>
                  <button
                    className={bonusChoices[p.id] === 'skip' ? 'selected' : ''}
                    onClick={() => chooseBonus(p.id, 'skip')}
                  >
                    Skip
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button className="primary" onClick={reveal}>
            Reveal target
          </button>
        </div>
      )}

      {phase === PHASES.REVEAL && lastResult && (
        <div className="panel">
          <h2>Reveal</h2>
          <p className="subtitle">The original wheel, with {guesser?.name}'s guess overlaid on top.</p>
          <WavelengthDial
            leftLabel={leftLabel}
            rightLabel={rightLabel}
            zoneCenter={target}
            needles={[{ value: guess, style: 'guess' }]}
          />
          <div className="result-summary">
            <div className="result-points">
              {guesser?.name} scored <strong>{lastResult.guesserPoints}</strong> point
              {lastResult.guesserPoints === 1 ? '' : 's'} guessing
              {lastResult.clueGiverPoints > 0 ? (
                <>
                  {' '}
                  — {clueGiver?.name} earns <strong>{lastResult.clueGiverPoints}</strong> for the clue
                </>
              ) : (
                <> — {clueGiver?.name} earns 0 (guess didn't score)</>
              )}
            </div>
            {lastResult.bonusResults.length > 0 && (
              <ul className="bonus-results">
                {lastResult.bonusResults.map((b) => (
                  <li key={b.playerId}>
                    {b.playerName}: {b.choice ? b.choice : 'no guess'} —{' '}
                    {b.earned ? '+1 bonus point!' : 'no bonus'}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button className="primary" onClick={nextRound}>
            Next round
          </button>
        </div>
      )}

      {history.length > 0 && (
        <details className="history">
          <summary>Round history ({history.length})</summary>
          <ol>
            {history.map((h, i) => (
              <li key={i}>
                Round {h.round} — Clue: {h.clueGiverName} (+{h.clueGiverPoints}), Guess: {h.guesserName} (+
                {h.guesserPoints}) — "{h.leftLabel}" ↔ "{h.rightLabel}" — target {toTenScale(h.target)}/10, guess{' '}
                {toTenScale(h.guess)}/10
                {h.bonusResults.filter((b) => b.earned).length > 0 &&
                  ` (+${h.bonusResults.filter((b) => b.earned).length} bonus)`}
              </li>
            ))}
          </ol>
        </details>
      )}
    </div>
  )
}
