import { useState } from 'react'
import WavelengthDial from './WavelengthDial.jsx'
import { scoreGuess } from '../scoring.js'

const DEMO_TARGET = 42

export default function HowToPlay() {
  const [demoGuess, setDemoGuess] = useState(50)
  const points = scoreGuess(DEMO_TARGET, demoGuess)

  return (
    <details className="history how-to-play" open>
      <summary>❓ How to play</summary>

      <ol className="how-to-list">
        <li>Best with <strong>2–5 players</strong>.</li>
        <li>
          Each round, one player is the <strong>Clue Giver</strong> and another is the <strong>Guesser</strong> —
          roles rotate every round.
        </li>
        <li>The Clue Giver sees a secret spot on the dial and gives a one-word clue pointing at it.</li>
        <li>The Guesser drags the marker to where they think that spot is.</li>
        <li>Closer guesses score more for both of them. Try it below:</li>
      </ol>

      <div className="demo">
        <WavelengthDial
          leftLabel="Overrated"
          rightLabel="Underrated"
          zoneCenter={DEMO_TARGET}
          interactiveValue={demoGuess}
          onChange={setDemoGuess}
        />
        <div className="demo-score">
          That guess would score <strong>{points}</strong> point{points === 1 ? '' : 's'}
        </div>
      </div>

      <p className="subtitle how-to-diff">
        <strong>👀 Different from the original:</strong> new scoring options you can toggle in Settings — bonus
        guessing for onlookers, and whether the clue giver scores too.
      </p>

      <p className="subtitle how-to-diff">
        <strong>📱 One device:</strong> everything happens on a single screen — pass it around, and make sure
        whoever's turn it is (clue giver or guesser) can actually see it before revealing anything.
      </p>
    </details>
  )
}
