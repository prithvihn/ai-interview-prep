import React from 'react'

/**
 * Per-answer feedback card.
 * Props:
 *  - feedback: { score: number, strengths: string[], improvements: string[], sampleAnswer: string }
 *  - loading: boolean
 */
export default function FeedbackCard({ feedback, loading = false }) {
  if (loading) {
    return (
      <div className="card space-y-4 animate-pulse">
        <div className="h-4 bg-white/5 rounded-full w-1/3" />
        <div className="space-y-2">
          {[100, 85, 70].map((w, i) => (
            <div key={i} className="h-3 bg-white/5 rounded-full" style={{ width: `${w}%` }} />
          ))}
        </div>
      </div>
    )
  }

  if (!feedback) {
    return (
      <div className="card flex items-center justify-center py-10">
        <p className="text-muted text-sm">Submit your answer to get AI feedback.</p>
      </div>
    )
  }

  const { score = 0, strengths = [], improvements = [], sampleAnswer = '' } = feedback

  const scoreColor =
    score >= 80 ? 'text-accent' : score >= 55 ? 'text-yellow-400' : 'text-red-400'

  return (
    <div className="space-y-4">
      {/* Score */}
      <div className="card flex items-center gap-5">
        <div className="relative w-16 h-16 flex-shrink-0">
          <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
            <circle cx="18" cy="18" r="15.5" fill="none" stroke="#1e1e2e" strokeWidth="3" />
            <circle
              cx="18" cy="18" r="15.5"
              fill="none"
              stroke={score >= 80 ? '#22c55e' : score >= 55 ? '#eab308' : '#ef4444'}
              strokeWidth="3"
              strokeDasharray={`${(score / 100) * 97.4} 97.4`}
              strokeLinecap="round"
            />
          </svg>
          <span className={`absolute inset-0 flex items-center justify-center text-sm font-bold ${scoreColor}`}>
            {score}
          </span>
        </div>
        <div>
          <p className="text-xs text-muted mb-0.5">Answer Score</p>
          <p className={`text-xl font-display font-bold ${scoreColor}`}>
            {score >= 80 ? 'Excellent' : score >= 55 ? 'Good' : 'Needs Work'}
          </p>
        </div>
      </div>

      {/* Strengths */}
      {strengths.length > 0 && (
        <div className="card">
          <p className="text-xs font-semibold text-accent uppercase tracking-wider mb-3">✓ Strengths</p>
          <ul className="space-y-2">
            {strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                <span className="text-accent mt-0.5 flex-shrink-0">•</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Improvements */}
      {improvements.length > 0 && (
        <div className="card">
          <p className="text-xs font-semibold text-yellow-400 uppercase tracking-wider mb-3">↑ Areas to improve</p>
          <ul className="space-y-2">
            {improvements.map((imp, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                <span className="text-yellow-400 mt-0.5 flex-shrink-0">•</span>
                {imp}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Sample answer */}
      {sampleAnswer && (
        <div className="card border-blue-500/20">
          <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-3">✨ Sample Answer</p>
          <p className="text-sm text-gray-300 leading-relaxed">{sampleAnswer}</p>
        </div>
      )}
    </div>
  )
}
