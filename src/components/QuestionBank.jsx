import React, { useState } from 'react'

const CATEGORY_COLORS = {
  hr: 'bg-purple-500/10 text-purple-400',
  communication: 'bg-blue-500/10 text-blue-400',
  behavioural: 'bg-green-500/10 text-green-400',
  technical: 'bg-orange-500/10 text-orange-400',
  situational: 'bg-yellow-500/10 text-yellow-400',
  motivational: 'bg-pink-500/10 text-pink-400',
}

/**
 * Props:
 *  - questions: { id, text, category, difficulty, hint }[]
 *  - currentIndex: number
 *  - answeredIds: string[]  (set of answered question ids)
 *  - onSelect: (index: number) => void
 */
export default function QuestionBank({ questions = [], currentIndex = 0, answeredIds = [], onSelect }) {
  const [filter, setFilter] = useState('all')

  const categories = ['all', ...new Set(questions.map((q) => q.category).filter(Boolean))]

  const filtered =
    filter === 'all' ? questions : questions.filter((q) => q.category === filter)

  return (
    <div className="flex flex-col h-full">
      {/* Filter tabs */}
      <div className="flex gap-1.5 flex-wrap mb-4">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors capitalize
              ${filter === cat
                ? 'bg-accent text-black'
                : 'bg-surface text-muted hover:text-white border border-border'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Question list */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {filtered.length === 0 && (
          <p className="text-muted text-sm text-center py-8">No questions yet.</p>
        )}
        {filtered.map((q, i) => {
          const globalIndex = questions.indexOf(q)
          const isActive = globalIndex === currentIndex
          const isAnswered = answeredIds.includes(q.id)
          const catColor = CATEGORY_COLORS[q.category] || 'bg-accent/10 text-accent'

          return (
            <button
              key={q.id}
              onClick={() => onSelect?.(globalIndex)}
              className={`w-full text-left p-3.5 rounded-xl border text-sm transition-all duration-150
                ${isActive
                  ? 'bg-accent/10 border-accent/40 text-white'
                  : 'bg-surface border-border text-gray-400 hover:border-accent/30 hover:text-white'}`}
            >
              <div className="flex items-start gap-2.5">
                {/* Status dot */}
                <span className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0
                  ${isAnswered ? 'bg-accent' : isActive ? 'bg-accent/60' : 'bg-subtle'}`}
                />
                <span className="leading-snug">{q.text}</span>
              </div>
              <div className="mt-2 ml-4.5 flex items-center gap-2">
                {q.category && (
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full capitalize ${catColor}`}>
                    {q.category}
                  </span>
                )}
                {q.difficulty && (
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full
                    ${q.difficulty === 'easy' ? 'bg-green-500/10 text-green-400'
                      : q.difficulty === 'medium' ? 'bg-yellow-500/10 text-yellow-400'
                      : 'bg-red-500/10 text-red-400'}`}>
                    {q.difficulty}
                  </span>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

