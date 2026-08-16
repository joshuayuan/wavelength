// Scoring bands mirrored around the secret target, expressed as +/- distance
// on a 0-100 scale (which maps linearly onto the dial's 180-degree sweep).
// Each band is the same width, so the wedge is divided into three equal slices.
const BAND_WIDTH = 3.75
export const SCORE_BANDS = [
  { within: BAND_WIDTH * 1, points: 5, color: '#3fd6e8' },
  { within: BAND_WIDTH * 2, points: 3, color: '#f2c94c' },
  { within: BAND_WIDTH * 3, points: 1, color: '#f2622e' },
]

export function scoreGuess(target, guess) {
  const diff = Math.abs(target - guess)
  for (const band of SCORE_BANDS) {
    if (diff <= band.within) return band.points
  }
  return 0
}
