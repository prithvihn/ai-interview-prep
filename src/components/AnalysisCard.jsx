import React, { useState } from 'react'

/**
 * Displays AI-generated analysis output with expandable sections.
 * Props:
 *  - title: string
 *  - content: string  (AI text)
 *  - type: 'feedback' | 'sample' | 'tip' | 'warning'
 *  - loading: boolean
 */
export default function AnalysisCard({ title, content, type = 'feedback', loading = false }) {
  const [expanded, setExpanded] = useState(true)

  const colors = {
    feedback: { icon: '💬', ring: 'border-accent/20', badge: 'bg-accent/10 text-accent' },
    sample: { icon: '✨', ring: 'border-blue-500/20', badge: 'bg-blue-500/10 text-blue-400' },
    tip: { icon: '💡', ring: 'border-yellow-500/20', badge: 'bg-yellow-500/10 text-yellow-400' },
    warning: { icon: '⚠️', ring: 'border-red-500/20', badge: 'bg-red-500/10 text-red-400' },
  }

  const c = colors[type] || colors.feedback

  return (
    <div className={`card border ${c.ring} transition-all duration-200`}>
      {/* Header */}
      <button
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center justify-between gap-3 text-left"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-base">{c.icon}</span>
          <span className="font-semibold text-sm text-white">{title}</span>
          <span className={`badge ${c.badge} text-[10px]`}>{type}</span>
        </div>
        <Chevron open={expanded} />
      </button>

      {/* Body */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-border">
          {loading ? (
            <SkeletonLines />
          ) : (
            <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{content}</p>
          )}
        </div>
      )}
    </div>
  )
}

function Chevron({ open }) {
  return (
    <svg
      width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className={`text-muted transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

function SkeletonLines() {
  return (
    <div className="space-y-2 animate-pulse">
      {[100, 90, 80, 60].map((w, i) => (
        <div key={i} className="h-3 bg-white/5 rounded-full" style={{ width: `${w}%` }} />
      ))}
    </div>
  )
}
