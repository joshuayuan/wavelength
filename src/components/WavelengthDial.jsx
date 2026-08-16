import { useCallback, useRef } from 'react'
import { SCORE_BANDS } from '../scoring.js'

const VB_W = 400
const VB_H = 210
const CX = 200
const CY = 200
const R = 188

function polar(cx, cy, r, thetaDeg) {
  const rad = (thetaDeg * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy - r * Math.sin(rad) }
}

// Filled pie slice between two angles (0=right, 180=left, sweeping over the top).
function pieSlice(cx, cy, r, thetaA, thetaB) {
  const a = Math.max(0, Math.min(180, thetaA))
  const b = Math.max(0, Math.min(180, thetaB))
  if (b <= a) return ''
  const pA = polar(cx, cy, r, a)
  const pB = polar(cx, cy, r, b)
  const largeArc = b - a > 180 ? 1 : 0
  return `M ${cx} ${cy} L ${pB.x} ${pB.y} A ${r} ${r} 0 ${largeArc} 1 ${pA.x} ${pA.y} Z`
}

const valueToAngle = (value) => 180 - (value / 100) * 180
const angleToValue = (angle) => 100 * (1 - angle / 180)

// A half-circle Wavelength gauge. Pass `zoneCenter` to paint the scoring
// wedges (only when the target should be visible), `needles` for static
// markers (e.g. an overlaid guess), and `interactiveValue`/`onChange` to make
// the dial itself draggable.
export default function WavelengthDial({ leftLabel, rightLabel, zoneCenter = null, needles = [], interactiveValue, onChange }) {
  const svgRef = useRef(null)
  const interactive = interactiveValue !== undefined && !!onChange

  const angleFromEvent = useCallback((clientX, clientY) => {
    const rect = svgRef.current.getBoundingClientRect()
    const svgX = ((clientX - rect.left) / rect.width) * VB_W
    const svgY = ((clientY - rect.top) / rect.height) * VB_H
    const dx = svgX - CX
    const dy = CY - svgY
    let angle = (Math.atan2(dy, dx) * 180) / Math.PI
    if (dy < 0) angle = dx >= 0 ? 0 : 180
    return Math.min(180, Math.max(0, angle))
  }, [])

  const handleMove = (clientX, clientY) => {
    if (!interactive) return
    onChange(angleToValue(angleFromEvent(clientX, clientY)))
  }

  const handlePointerDown = (e) => {
    if (!interactive) return
    e.currentTarget.setPointerCapture(e.pointerId)
    handleMove(e.clientX, e.clientY)
  }

  const handlePointerMove = (e) => {
    if (!interactive || e.buttons === 0) return
    handleMove(e.clientX, e.clientY)
  }

  const allNeedles = [...needles]
  if (interactive) allNeedles.push({ value: interactiveValue, style: 'active' })

  return (
    <div className="dial-wrap">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        className={`dial${interactive ? ' interactive' : ''}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
      >
        <path d={pieSlice(CX, CY, R, 0, 180)} className="dial-bg" />

        {zoneCenter != null &&
          [...SCORE_BANDS]
            .slice()
            .reverse()
            .map((band) => {
              const angle = valueToAngle(zoneCenter)
              const halfWidthDeg = band.within * 1.8
              return (
                <path
                  key={band.points}
                  d={pieSlice(CX, CY, R, angle - halfWidthDeg, angle + halfWidthDeg)}
                  fill={band.color}
                  className="dial-zone"
                />
              )
            })}

        {allNeedles.map((n, i) => {
          const angle = valueToAngle(n.value)
          const tip = polar(CX, CY, R - 8, angle)
          return (
            <g key={i} className={`needle needle-${n.style}`}>
              <line x1={CX} y1={CY} x2={tip.x} y2={tip.y} />
              <circle cx={tip.x} cy={tip.y} r={11} />
            </g>
          )
        })}

        <circle cx={CX} cy={CY} r={7} className="dial-hub" />
      </svg>
      <div className="dial-labels">
        <span>{leftLabel || 'Left end'}</span>
        <span className="dial-arrow">&#8596;</span>
        <span>{rightLabel || 'Right end'}</span>
      </div>
    </div>
  )
}
