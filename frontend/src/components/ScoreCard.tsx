import { useEffect, useState } from 'react'
import { CheckCircle2, XCircle } from 'lucide-react'
import type { ScoreResult } from '../api'

interface Props {
  result: ScoreResult
}

const RADIUS = 54
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

function scoreColor(score: number): string {
  if (score >= 85) return '#22c55e'  // green-500
  if (score >= 70) return '#3b82f6'  // blue-500
  if (score >= 50) return '#f59e0b'  // amber-500
  return '#ef4444'                    // red-500
}

function verdictStyle(verdict: string) {
  switch (verdict) {
    case 'Strong Match': return 'bg-green-500/20 text-green-400 border-green-500/40'
    case 'Good Fit':     return 'bg-blue-500/20 text-blue-400 border-blue-500/40'
    case 'Partial Fit':  return 'bg-amber-500/20 text-amber-400 border-amber-500/40'
    default:             return 'bg-red-500/20 text-red-400 border-red-500/40'
  }
}

export default function ScoreCard({ result }: Props) {
  const [animatedScore, setAnimatedScore] = useState(0)
  const [animateBars, setAnimateBars] = useState(false)

  useEffect(() => {
    setAnimatedScore(0)
    setAnimateBars(false)
    const scoreTimer = setTimeout(() => setAnimatedScore(result.score), 80)
    const barTimer = setTimeout(() => setAnimateBars(true), 300)
    return () => { clearTimeout(scoreTimer); clearTimeout(barTimer) }
  }, [result])

  const offset = CIRCUMFERENCE * (1 - animatedScore / 100)
  const color = scoreColor(result.score)

  return (
    <div className="space-y-5 animate-slide-up">
      {/* Ring + verdict */}
      <div className="flex flex-col items-center gap-3 pt-2">
        <svg width="140" height="140" viewBox="0 0 140 140">
          {/* Track */}
          <circle
            cx="70" cy="70" r={RADIUS}
            fill="none"
            stroke="#1e293b"
            strokeWidth="12"
          />
          {/* Progress */}
          <circle
            cx="70" cy="70" r={RADIUS}
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)', transformOrigin: '70px 70px', transform: 'rotate(-90deg)' }}
          />
          {/* Score number */}
          <text x="70" y="65" textAnchor="middle" dominantBaseline="middle" fill={color} fontSize="28" fontWeight="700" fontFamily="system-ui">
            {animatedScore}
          </text>
          <text x="70" y="84" textAnchor="middle" dominantBaseline="middle" fill="#64748b" fontSize="11" fontFamily="system-ui">
            / 100
          </text>
        </svg>

        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${verdictStyle(result.verdict)}`}>
          {result.verdict}
        </span>

        <p className="text-sm text-slate-400 text-center leading-relaxed px-2">
          {result.summary}
        </p>
      </div>

      {/* Category bars */}
      <div className="space-y-3">
        {result.categories.map((cat) => (
          <div key={cat.name}>
            <div className="flex justify-between text-xs text-slate-400 mb-1.5">
              <span>{cat.name}</span>
              <span style={{ color: scoreColor(cat.score) }} className="font-semibold">{cat.score}</span>
            </div>
            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: animateBars ? `${cat.score}%` : '0%',
                  backgroundColor: scoreColor(cat.score),
                  transition: 'width 1s cubic-bezier(0.4,0,0.2,1)',
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Matched + Gaps */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Strengths</p>
          <div className="space-y-1.5">
            {result.matched.map((item) => (
              <div key={item} className="flex gap-1.5 items-start">
                <CheckCircle2 size={13} className="text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-xs text-slate-300 leading-snug">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Gaps</p>
          <div className="space-y-1.5">
            {result.gaps.map((item) => (
              <div key={item} className="flex gap-1.5 items-start">
                <XCircle size={13} className="text-amber-500 flex-shrink-0 mt-0.5" />
                <span className="text-xs text-slate-300 leading-snug">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
