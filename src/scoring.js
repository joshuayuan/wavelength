// Scoring bands mirrored around the secret target, expressed as +/- distance
// on a 0-100 scale (which maps linearly onto the dial's 180-degree sweep).
// The center band is a single slice straddling the target, while the other
// two bands each form a slice on either side — five slices in total. Their
// "within" thresholds step up by SLICE_WIDTH, but offset by half a slice so
// that all five visual wedges end up the same width (the center one isn't
// split in half like the others, so it needs half the step to match).
const SLICE_WIDTH = 4.5
export const SCORE_BANDS = [
  { within: SLICE_WIDTH / 2, points: 5, color: '#3fd6e8' },
  { within: (SLICE_WIDTH * 3) / 2, points: 3, color: '#f2c94c' },
  { within: (SLICE_WIDTH * 5) / 2, points: 1, color: '#f2622e' },
]

export function scoreGuess(target, guess) {
  const diff = Math.abs(target - guess)
  for (const band of SCORE_BANDS) {
    if (diff <= band.within) return band.points
  }
  return 0
}
