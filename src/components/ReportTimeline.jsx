import React from 'react'

/**
 * Visual timeline of interview moments / answers.
 * Props:
 *  - answers: { questionText, transcript, durationSeconds, feedback: { score } }[]
 */
export default function ReportTimeline({ answers = [] }) {
  if (answers.length === 0) {
    return <p className="text-muted text-sm text-center py-8">No answers recorded.</p>
  }

  return (
    <div className="relative pl-6">
      {/* Vertical line */}
      <div className="absolute left-2 top-2 bottom-2 w-px bg-border" />

      <div className="space-y-6">
        {answers.map((answer, i) => {
          const score = answer.feedback?.score ?? null
          const scoreColor =
            score === null ? 'bg-subtle'
            : score >= 80 ? 'bg-accent'
            : score >= 55 ? 'bg-yellow-400'
            : 'bg-red-400'

          return (
            <div key={i} className="relative">
              {/* Dot */}
              <div className={`absolute -left-6 top-1.5 w-3 h-3 rounded-full border-2 border-bg ${scoreColor}`} />

              <div className="card hover:border-accent/20 transition-colors">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <span className="section-label text-[10px]">Q{i + 1}</span>
                    <p className="text-sm font-medium text-white mt-1 leading-snug">
                      {answer.questionText}
                    </p>
                  </div>
                  {score !== null && (
                    <span className={`flex-shrink-0 text-sm font-bold px-2.5 py-1 rounded-lg
                      ${score >= 80 ? 'bg-accent/15 text-accent'
                        : score >= 55 ? 'bg-yellow-500/15 text-yellow-400'
                        : 'bg-red-500/15 text-red-400'}`}>
                      {score}/100
                    </span>
                  )}
                </div>

                {answer.transcript && (
                  <p className="text-xs text-muted leading-relaxed line-clamp-3">
                    {answer.transcript}
                  </p>
                )}

                {answer.durationSeconds > 0 && (
                  <p className="text-[10px] text-subtle mt-2 font-mono">
                    {answer.durationSeconds}s answer
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
