import React, { useState } from 'react'

/**
 * Comprehensive AI feedback display.
 * Props:
 *  - feedbackFull: { content_score, delivery_score, improvement_trends } (full backend response)
 *  - loading: boolean
 */
export default function FeedbackCard({ feedbackFull, loading = false }) {
  const [activeTab, setActiveTab] = useState('content')

  if (loading) {
    return (
      <div className="card space-y-4 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 rounded-full bg-white/5" />
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-white/5 rounded-full w-1/3" />
            <div className="h-3 bg-white/5 rounded-full w-2/3" />
          </div>
        </div>
        <div className="space-y-2">
          {[100, 85, 70, 60].map((w, i) => (
            <div key={i} className="h-3 bg-white/5 rounded-full" style={{ width: `${w}%` }} />
          ))}
        </div>
        <p className="text-xs text-muted text-center">AI is analyzing your answer — content, delivery, and confidence…</p>
      </div>
    )
  }

  if (!feedbackFull) {
    return (
      <div className="card flex items-center justify-center py-10">
        <p className="text-muted text-sm">Submit your answer to get AI feedback.</p>
      </div>
    )
  }

  const content = feedbackFull.content_score || {}
  const delivery = feedbackFull.delivery_score || {}
  const trends = feedbackFull.improvement_trends || null

  const overallScore = content.overall_score || 0

  const TABS = [
    { key: 'content', label: 'Content', icon: '📝' },
    { key: 'delivery', label: 'Delivery', icon: '🎤' },
    { key: 'moments', label: 'Moments', icon: '📌' },
    ...(trends ? [{ key: 'trends', label: 'Trends', icon: '📈' }] : []),
  ]

  return (
    <div className="space-y-4">
      {/* ── Overall Score ─────────────────────────────────────────── */}
      <div className="card flex items-center gap-5">
        <ScoreRing score={overallScore} size={64} />
        <div className="flex-1">
          <p className="text-xs text-muted mb-0.5">Overall Score</p>
          <p className={`text-xl font-display font-bold ${getScoreColor(overallScore)}`}>
            {overallScore >= 80 ? 'Strong Answer' : overallScore >= 55 ? 'Decent' : overallScore >= 35 ? 'Needs Work' : 'Poor Answer'}
          </p>
          {content.feedback && (
            <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">{content.feedback}</p>
          )}
        </div>
      </div>

      {/* ── Tab Navigation ────────────────────────────────────────── */}
      <div className="flex gap-1 bg-surface border border-border rounded-xl p-1">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 text-xs px-3 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-1.5
              ${activeTab === tab.key
                ? 'bg-accent text-black'
                : 'text-muted hover:text-white'}`}
          >
            <span>{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ── Content Tab ───────────────────────────────────────────── */}
      {activeTab === 'content' && (
        <div className="space-y-4">
          {/* Score dimensions */}
          <div className="card">
            <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-4">Score Breakdown</p>
            <div className="space-y-3">
              <ScoreBar label="Relevance" score={content.relevance_score} />
              <ScoreBar label="Depth" score={content.depth_score} />
              <ScoreBar label="STAR Structure" score={content.star_score} />
              <ScoreBar label="Clarity" score={content.clarity_score} />
              <ScoreBar label="Confidence" score={content.confidence_score} />
            </div>
          </div>

          {/* Critical mistakes */}
          {content.critical_mistakes?.length > 0 && (
            <div className="card border-red-900/30">
              <p className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-3">⚠ Critical Mistakes</p>
              <ul className="space-y-2">
                {content.critical_mistakes.map((mistake, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-red-300">
                    <span className="text-red-400 mt-0.5 flex-shrink-0">✗</span>
                    {mistake}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Suggestions */}
          {content.suggestions?.length > 0 && (
            <div className="card">
              <p className="text-xs font-semibold text-accent uppercase tracking-wider mb-3">💡 How to Improve</p>
              <ul className="space-y-2">
                {content.suggestions.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                    <span className="text-accent mt-0.5 flex-shrink-0">{i + 1}.</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* ── Delivery Tab ──────────────────────────────────────────── */}
      {activeTab === 'delivery' && (
        <div className="space-y-4">
          {/* Delivery score + key metrics */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-semibold text-muted uppercase tracking-wider">Delivery Analysis</p>
              <span className={`text-lg font-display font-bold ${getScoreColor(delivery.delivery_score)}`}>
                {Math.round(delivery.delivery_score || 0)}/100
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <MetricCard label="Words/min" value={delivery.wpm ? Math.round(delivery.wpm) : '—'} sub={delivery.pace_assessment?.replace('_', ' ')} />
              <MetricCard label="Fillers" value={delivery.filler_count || 0} color={delivery.filler_count > 3 ? 'text-red-400' : delivery.filler_count > 0 ? 'text-yellow-400' : 'text-accent'} />
              <MetricCard label="Confidence" value={`${Math.round((delivery.confidence_ratio || 0) * 100)}%`} color={delivery.confidence_ratio >= 0.6 ? 'text-accent' : delivery.confidence_ratio >= 0.3 ? 'text-yellow-400' : 'text-red-400'} />
              <MetricCard label="Vocabulary" value={`${Math.round((delivery.vocabulary_richness || 0) * 100)}%`} sub="richness" />
            </div>
          </div>

          {/* Structure assessment */}
          {delivery.structure_notes && (
            <div className="card">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-muted uppercase tracking-wider">Structure</p>
                <span className={`text-sm font-bold ${getScoreColor(delivery.structure_score)}`}>
                  {Math.round(delivery.structure_score || 0)}/100
                </span>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">{delivery.structure_notes}</p>

              {/* STAR signals */}
              {delivery.star_signals && (
                <div className="flex gap-2 mt-3">
                  {Object.entries(delivery.star_signals).map(([key, found]) => (
                    <span key={key} className={`text-[10px] px-2 py-1 rounded-full font-medium capitalize
                      ${found ? 'bg-accent/15 text-accent' : 'bg-white/5 text-subtle line-through'}`}>
                      {key}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Hedging & confidence markers */}
          {(delivery.hedging_phrases?.length > 0 || Object.values(delivery.confidence_markers || {}).some(arr => arr?.length > 0)) && (
            <div className="card">
              <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Language Patterns</p>

              {delivery.confidence_markers?.strong?.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-accent font-semibold mb-1.5">✓ Strong confidence signals</p>
                  <div className="flex flex-wrap gap-1.5">
                    {delivery.confidence_markers.strong.map((s) => (
                      <span key={s} className="text-[10px] px-2 py-1 rounded-full bg-accent/10 text-accent font-mono">"{s}"</span>
                    ))}
                  </div>
                </div>
              )}

              {delivery.confidence_markers?.weak?.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-red-400 font-semibold mb-1.5">✗ Weak/passive language</p>
                  <div className="flex flex-wrap gap-1.5">
                    {delivery.confidence_markers.weak.map((s) => (
                      <span key={s} className="text-[10px] px-2 py-1 rounded-full bg-red-500/10 text-red-400 font-mono">"{s}"</span>
                    ))}
                  </div>
                </div>
              )}

              {delivery.hedging_phrases?.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-yellow-400 font-semibold mb-1.5">⚡ Hedging language ({delivery.hedging_count} found)</p>
                  <div className="flex flex-wrap gap-1.5">
                    {delivery.hedging_phrases.map((h) => (
                      <span key={h} className="text-[10px] px-2 py-1 rounded-full bg-yellow-500/10 text-yellow-400 font-mono">"{h}"</span>
                    ))}
                  </div>
                </div>
              )}

              {delivery.repetition_flags?.length > 0 && (
                <div>
                  <p className="text-xs text-orange-400 font-semibold mb-1.5">🔄 Repetition detected</p>
                  <ul className="space-y-1">
                    {delivery.repetition_flags.map((r, i) => (
                      <li key={i} className="text-xs text-orange-300">{r}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Filler annotations — fillers in context */}
          {delivery.filler_annotations?.length > 0 && (
            <div className="card">
              <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">
                Filler Words in Context ({delivery.filler_count} total)
              </p>
              <div className="space-y-2">
                {delivery.filler_annotations.slice(0, 6).map((ann, i) => (
                  <div key={i} className="text-xs border-l-2 border-yellow-500/40 pl-3 py-1">
                    <span className="text-yellow-400 font-semibold">"{ann.word}"</span>
                    <span className="text-subtle"> — sentence {ann.position}: </span>
                    <span className="text-gray-400 italic">"{ann.sentence}"</span>
                  </div>
                ))}
                {delivery.filler_annotations.length > 6 && (
                  <p className="text-xs text-subtle">…and {delivery.filler_annotations.length - 6} more</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Moments Tab — Quote-pinned feedback ───────────────────── */}
      {activeTab === 'moments' && (
        <div className="space-y-3">
          {content.moment_annotations?.length > 0 ? (
            content.moment_annotations.map((ann, i) => (
              <div key={i} className={`card border-l-4 ${getMomentBorderColor(ann.type)}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium uppercase ${getMomentBadgeColor(ann.type)}`}>
                    {ann.type}
                  </span>
                </div>
                {ann.quote && (
                  <p className="text-sm text-white font-mono bg-white/5 rounded-lg px-3 py-2 mb-2 leading-relaxed">
                    "{ann.quote}"
                  </p>
                )}
                <p className="text-sm text-gray-300 mb-1">{ann.issue}</p>
                {ann.suggestion && (
                  <p className="text-xs text-accent/80 flex items-start gap-1">
                    <span className="flex-shrink-0">💡</span>
                    {ann.suggestion}
                  </p>
                )}
              </div>
            ))
          ) : (
            <div className="card text-center py-8">
              <p className="text-muted text-sm">No moment-specific feedback available for this answer.</p>
            </div>
          )}
        </div>
      )}

      {/* ── Trends Tab — Improvement tracking ─────────────────────── */}
      {activeTab === 'trends' && trends && (
        <div className="space-y-4">
          <div className="card">
            <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-4">
              Improvement Trends ({trends.sessions_compared} past session{trends.sessions_compared !== 1 ? 's' : ''} compared)
            </p>

            <div className="grid grid-cols-2 gap-3">
              <TrendIndicator label="Content Score" trend={trends.content_score_trend} />
              <TrendIndicator label="Delivery Score" trend={trends.delivery_score_trend} />
              <TrendIndicator label="Filler Rate" trend={trends.filler_rate_trend} />
              <TrendIndicator label="Confidence" trend={trends.confidence_trend} />
            </div>

            {(trends.biggest_improvement || trends.biggest_regression) && (
              <div className="mt-4 pt-4 border-t border-border space-y-2">
                {trends.biggest_improvement && (
                  <p className="text-sm text-accent flex items-center gap-2">
                    <span>🎉</span> {trends.biggest_improvement}
                  </p>
                )}
                {trends.biggest_regression && (
                  <p className="text-sm text-red-400 flex items-center gap-2">
                    <span>⚠️</span> {trends.biggest_regression}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}


// ─── Sub-components ──────────────────────────────────────────────────────────

function ScoreRing({ score, size = 64 }) {
  const radius = (size / 2) - 4
  const circumference = 2 * Math.PI * radius
  const strokeDasharray = `${(score / 100) * circumference} ${circumference}`
  const color = score >= 80 ? '#22c55e' : score >= 55 ? '#eab308' : score >= 35 ? '#ef4444' : '#dc2626'

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full -rotate-90">
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#1e1e2e" strokeWidth="4" />
        <circle
          cx={size/2} cy={size/2} r={radius}
          fill="none" stroke={color} strokeWidth="4"
          strokeDasharray={strokeDasharray}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.6s ease' }}
        />
      </svg>
      <span className={`absolute inset-0 flex items-center justify-center text-sm font-bold ${getScoreColor(score)}`}>
        {Math.round(score)}
      </span>
    </div>
  )
}

function ScoreBar({ label, score = 0 }) {
  const pct = Math.max(0, Math.min(100, Math.round(score)))
  const color = pct >= 80 ? 'bg-accent' : pct >= 55 ? 'bg-yellow-400' : pct >= 35 ? 'bg-red-400' : 'bg-red-600'

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-400">{label}</span>
        <span className={`text-xs font-bold ${getScoreColor(pct)}`}>{pct}</span>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function MetricCard({ label, value, sub, color = 'text-white' }) {
  return (
    <div className="rounded-xl border border-border bg-surface/50 p-3 text-center">
      <p className={`text-lg font-display font-bold ${color}`}>{value}</p>
      <p className="text-[10px] text-muted mt-0.5">{label}</p>
      {sub && <p className="text-[10px] text-subtle capitalize">{sub}</p>}
    </div>
  )
}

function TrendIndicator({ label, trend }) {
  const config = {
    improving: { icon: '↑', color: 'text-accent', bg: 'bg-accent/10', text: 'Improving' },
    stable: { icon: '→', color: 'text-blue-400', bg: 'bg-blue-500/10', text: 'Stable' },
    worsening: { icon: '↓', color: 'text-red-400', bg: 'bg-red-500/10', text: 'Declining' },
    no_data: { icon: '—', color: 'text-subtle', bg: 'bg-white/5', text: 'No data' },
  }
  const c = config[trend] || config.no_data

  return (
    <div className={`rounded-xl border border-border p-3 text-center ${c.bg}`}>
      <p className={`text-lg font-bold ${c.color}`}>{c.icon}</p>
      <p className="text-[10px] text-muted mt-0.5">{label}</p>
      <p className={`text-[10px] font-medium ${c.color}`}>{c.text}</p>
    </div>
  )
}


// ─── Helpers ─────────────────────────────────────────────────────────────────

function getScoreColor(score) {
  if (score >= 80) return 'text-accent'
  if (score >= 55) return 'text-yellow-400'
  if (score >= 35) return 'text-red-400'
  return 'text-red-600'
}

function getMomentBorderColor(type) {
  const map = {
    strength: 'border-accent',
    'good-example': 'border-accent',
    weakness: 'border-red-500',
    filler: 'border-yellow-500',
    vague: 'border-orange-500',
    'off-topic': 'border-red-600',
    hedging: 'border-yellow-500',
    repetitive: 'border-orange-500',
  }
  return map[type] || 'border-border'
}

function getMomentBadgeColor(type) {
  const map = {
    strength: 'bg-accent/15 text-accent',
    'good-example': 'bg-accent/15 text-accent',
    weakness: 'bg-red-500/15 text-red-400',
    filler: 'bg-yellow-500/15 text-yellow-400',
    vague: 'bg-orange-500/15 text-orange-400',
    'off-topic': 'bg-red-500/15 text-red-400',
    hedging: 'bg-yellow-500/15 text-yellow-400',
    repetitive: 'bg-orange-500/15 text-orange-400',
  }
  return map[type] || 'bg-white/10 text-muted'
}
