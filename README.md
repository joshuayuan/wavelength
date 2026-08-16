# Wavelength

A local, no-network party game app for playing Wavelength with real players in the same room.

## Run it

```
npm install
npm run dev
```

Then open the printed local URL (usually http://localhost:5173) on the device you'll pass around.

## How a round works

Each round has two roles: a **clue giver** and a **guesser**, both rotating through the player
list every round. Everyone else gets a shot at a bonus point.

1. **Set the spectrum** — a topic (from ~100 built-in ideas) and a secret target are picked for the clue giver automatically. They can edit the topic text, pick a different preset, or drag the target dial themselves. The scoring wedge (5 / 3 / 1 points, three equal-size slices) follows the drag live, visible only to the clue giver.
2. **Pass the device** — a cover screen hides the dial while the clue giver gives a verbal clue and hands the device to the guesser.
3. **Guess** — the guesser drags a marker around the (now plain, uncolored) dial to where they think the target is and locks it in.
4. **Bonus guesses** — everyone else privately calls "left" or "right" of that guess for a shot at a bonus point.
5. **Reveal** — the original colored wheel reappears with the guess marker overlaid on top of it. Points (5, 3, 1, or 0) go to **both** the clue giver and the guesser, and you move to the next round.

## Players

Add or remove players from the "Players" panel — open from the start screen, or any time mid-game
via the "👥 Players" button in the header (you can't remove whoever is mid-turn). Scores can also be
adjusted manually with the +/− buttons on the scoreboard.

## Ending a game

"End game" opens a summary: final scores, best clue giver, best guesser, best duo (by combined
points), and the full round-by-round history — including where the target and guess landed, on a
0–10 scale. "Export game summary" downloads it as a text file. "Start new game with these players"
resets scores and history but keeps your player list.
