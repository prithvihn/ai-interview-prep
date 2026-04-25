import React, { useState } from 'react'

/**
 * Visual timeline of interview answers with content + delivery data.
 * Props:
 *  - answers: { questionText, transcript, durationSeconds, feedback: { score, content_score, delivery_score } }[]
 */
export default function ReportTimeline({ answers = [] }) {
  const [expanded, setExpanded] = useState(null)

  if (answers.length === 0) {
    return <p className="text-muted text-sm text-center py-8">No answers recorded.</p>
  }

  return (
    <div className="relative pl-6">
      {/* Vertical line */}
      <div className="absolute left-2 top-2 bottom-2 w-px bg-border" />

      <div className="space-y-6">
        {answers.map((answer, i) => {
          const content = answer.feedback?.content_score || {}
          const delivery = answer.feedback?.delivery_score || {}
          const contentScore = content.overall_score ?? answer.feedback?.score ?? null
          const deliveryScore = delivery.delivery_score ?? null
          const isOpen = expanded === i

          const scoreColor =
            contentScore === null ? 'bg-subtle'
            : contentScore >= 80 ? 'bg-accent'
            : contentScore >= 55 ? 'bg-yellow-400'
            : 'bg-red-400'

          return (
            <div key={i} className="relative">
              {/* Dot */}
              <div className={`absolute -left-6 top-1.5 w-3 h-3 rounded-full border-2 border-bg ${scoreColor}`} />

              <div
                className="card hover:border-accent/20 transition-colors cursor-pointer"
                onClick={() => setExpanded(isOpen ? null : i)}
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex-1">
                    <span className="section-label text-[10px]">Q{i + 1}</span>
                    <p className="text-sm font-medium text-white mt-1 leading-snug">
                      {answer.questionText}
                    </p>
                  </div>

                  {/* Scores */}
                  <div className="flex-shrink-0 flex gap-2">
                    {contentScore !== null && (
                      <span className={`text-xs font-bold px-2 py-1 rounded-lg
                        ${contentScore >= 80 ? 'bg-accent/15 text-accent'
                          : contentScore >= 55 ? 'bg-yellow-500/15 text-yellow-400'
                          : 'bg-red-500/15 text-red-400'}`}>
                        C:{Math.round(contentScore)}
                      </span>
                    )}
                    {deliveryScore !== null && (
                      <span className={`text-xs font-bold px-2 py-1 rounded-lg
                        ${deliveryScore >= 80 ? 'bg-blue-500/15 text-blue-400'
                          : deliveryScore >= 55 ? 'bg-purple-500/15 text-purple-400'
                          : 'bg-orange-500/15 text-orange-400'}`}>
                        D:{Math.round(deliveryScore)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Transcript preview */}
                {answer.transcript && (
                  <p className={`text-xs text-muted leading-relaxed ${isOpen ? '' : 'line-clamp-2'}`}>
                    {answer.transcript}
                  </p>
                )}

                {/* Expanded details */}
                {isOpen && (
                  <div className="mt-4 pt-4 border-t border-border space-y-3">
                    {/* Quick delivery stats */}
                    {(delivery.wpm || delivery.filler_count > 0 || delivery.hedging_count > 0) && (
                      <div className="flex flex-wrap gap-2">
                        {delivery.wpm && (
                          <span className="text-[10px] px-2 py-1 rounded-full bg-surface border border-border">
                            {Math.round(delivery.wpm)} WPM
                          </span>
                        )}
                        {delivery.filler_count > 0 && (
                          <span className="text-[10px] px-2 py-1 rounded-full bg-yellow-500/10 text-yellow-400">
                            {delivery.filler_count} fillers
                          </span>
                        )}
                        {delivery.hedging_count > 0 && (
                          <span className="text-[10px] px-2 py-1 rounded-full bg-orange-500/10 text-orange-400">
                            {delivery.hedging_count} hedging
                          </span>
                        )}
                        {delivery.confidence_ratio !== undefined && (
                          <span className={`text-[10px] px-2 py-1 rounded-full
                            ${delivery.confidence_ratio >= 0.6 ? 'bg-accent/10 text-accent'
                              : delivery.confidence_ratio >= 0.3 ? 'bg-yellow-500/10 text-yellow-400'
                              : 'bg-red-500/10 text-red-400'}`}>
                            {Math.round(delivery.confidence_ratio * 100)}% confidence
                          </span>
                        )}
                      </div>
                    )}

                    {/* AI feedback */}
                    {content.feedback && (
                      <p className="text-xs text-gray-400 leading-relaxed">{content.feedback}</p>
                    )}

                    {/* Critical mistakes */}
                    {content.critical_mistakes?.length > 0 && (
                      <div>
                        <p className="text-[10px] text-red-400 font-semibold mb-1">Critical mistakes:</p>
                        <ul className="space-y-1">
                          {content.critical_mistakes.map((m, j) => (
                            <li key={j} className="text-xs text-red-300 flex items-start gap-1.5">
                              <span className="flex-shrink-0">✗</span> {m}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Suggestions */}
                    {content.suggestions?.length > 0 && (
                      <div>
                        <p className="text-[10px] text-accent font-semibold mb-1">Suggestions:</p>
                        <ul className="space-y-1">
                          {content.suggestions.map((s, j) => (
                            <li key={j} className="text-xs text-gray-300 flex items-start gap-1.5">
                              <span className="flex-shrink-0 text-accent">→</span> {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Expand indicator */}
                <p className="text-[10px] text-subtle mt-2 text-center">
                  {isOpen ? '▲ click to collapse' : '▼ click to expand details'}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
