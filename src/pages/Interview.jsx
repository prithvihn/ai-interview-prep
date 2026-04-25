import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import InterviewRoom from '../components/InterviewRoom'
import { useInterview } from '../hooks/useInterview'
import { session as sessionStorage } from '../utils/storage'
import { getBatchQuestions } from '../utils/api'

const CATEGORIES = [
  { value: null, label: 'All Types', icon: '🎯', description: 'Mix of all question types' },
  { value: 'hr', label: 'HR', icon: '👔', description: 'Culture fit, goals, expectations' },
  { value: 'communication', label: 'Communication', icon: '💬', description: 'Clarity, feedback, interpersonal' },
  { value: 'technical', label: 'Technical', icon: '⚙️', description: 'Domain knowledge, problem-solving' },
  { value: 'behavioural', label: 'Behavioural', icon: '📖', description: 'Past experiences, STAR method' },
  { value: 'situational', label: 'Situational', icon: '🧩', description: 'Hypothetical scenarios' },
  { value: 'motivational', label: 'Motivational', icon: '🔥', description: 'Drive, passion, vision' },
]

export default function Interview() {
  const navigate = useNavigate()
  const [ready, setReady] = useState(false)
  const [loadingQuestions, setLoadingQuestions] = useState(false)
  const [error, setError] = useState(null)
  const [activeCategory, setActiveCategory] = useState(null)
  const session = useInterview()

  // On mount: check session + load initial questions
  useEffect(() => {
    const saved = sessionStorage.get()
    if (!saved || !saved.sessionId) {
      navigate('/upload')
      return
    }

    // If we already have questions (page refresh), go straight to ready
    if (session.questions.length > 0) {
      setReady(true)
      setActiveCategory(saved.preferredCategory || null)
      return
    }

    // Otherwise fetch the first batch of questions
    const initialCategory = saved.preferredCategory || null
    setActiveCategory(initialCategory)
    loadBatchQuestions(saved.sessionId, initialCategory)
  }, [])

  /**
   * Load a batch of 5 questions from the AI for the given category.
   * Replaces all current questions (for category switching).
   */
  const loadBatchQuestions = useCallback(async (sessionId, category, append = false) => {
    setLoadingQuestions(true)
    setError(null)

    try {
      const data = await getBatchQuestions({
        session_id: sessionId,
        category: category,
        count: 5,
      })

      const newQuestions = (data.questions || []).map((q, i) => ({
        id: `q_${Date.now()}_${i}`,
        text: q.question,
        category: q.question_type,
        hint: q.hint,
        difficulty: q.difficulty || 'medium',
      }))

      if (append) {
        // Add to existing questions
        newQuestions.forEach((q) => session.addQuestion(q))
      } else {
        // Replace questions and reset to first
        session.update((prev) => ({
          ...prev,
          questions: newQuestions,
          currentIndex: 0,
          status: 'active',
        }))
      }

      setReady(true)
    } catch (err) {
      console.error('Failed to generate questions:', err)
      setError(
        err.response?.data?.detail ||
        'Failed to generate questions. Check that the backend is running.'
      )
    } finally {
      setLoadingQuestions(false)
    }
  }, [session])

  /**
   * Handle category change — generate 5 new questions of that type.
   */
  const handleCategoryChange = useCallback((category) => {
    setActiveCategory(category)
    session.setPreferredCategory(category)

    const saved = sessionStorage.get()
    if (saved?.sessionId) {
      // Check if there are unanswered questions — warn user
      const answeredCount = session.answers.length
      if (answeredCount > 0 && answeredCount < session.questions.length) {
        if (!confirm(`Switching to ${category || 'All Types'} will load new questions. Continue?`)) {
          return
        }
      }
      loadBatchQuestions(saved.sessionId, category)
    }
  }, [session, loadBatchQuestions])

  // ── Loading / Error screen ─────────────────────────────────────────────────
  if (!ready) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md px-6">
          {error ? (
            <>
              <div className="w-12 h-12 rounded-full bg-red-500/15 flex items-center justify-center mx-auto">
                <span className="text-red-400 text-xl">!</span>
              </div>
              <p className="text-red-400 text-sm">{error}</p>
              <button
                onClick={() => {
                  const saved = sessionStorage.get()
                  if (saved?.sessionId) loadBatchQuestions(saved.sessionId, activeCategory)
                }}
                className="btn-secondary text-xs py-2 px-4"
              >
                Try Again
              </button>
              <button onClick={() => navigate('/upload')} className="btn-secondary text-xs py-2 px-4 ml-2">
                ← Back to Setup
              </button>
            </>
          ) : (
            <>
              <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm text-muted">
                AI is generating your interview questions…
              </p>
              <p className="text-xs text-subtle">
                Preparing 5 {activeCategory || 'mixed'} questions based on your resume
              </p>
            </>
          )}
        </div>
      </div>
    )
  }

  // ── Main Interview Screen ──────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-accent flex items-center justify-center">
            <span className="text-black text-[10px] font-black">AI</span>
          </div>
          <span className="font-display font-semibold text-sm">InterviewPrep</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted hidden sm:block">
            {session.jobTitle || 'Practice Session'}
          </span>
          <button
            onClick={() => {
              if (confirm('End this interview? Your progress will be saved.')) {
                session.finishSession()
                navigate('/report')
              }
            }}
            className="btn-secondary py-2 px-3 text-xs text-red-400 border-red-900/30 hover:border-red-500/40"
          >
            End Interview
          </button>
        </div>
      </div>

      {/* Category bar */}
      <div className="px-4 py-3 border-b border-border overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.value
            const isLoading = loadingQuestions && activeCategory === cat.value

            return (
              <button
                key={cat.label}
                onClick={() => handleCategoryChange(cat.value)}
                disabled={loadingQuestions}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 border whitespace-nowrap
                  ${isActive
                    ? 'bg-accent/15 border-accent/40 text-accent shadow-lg shadow-accent/5'
                    : 'bg-surface border-border text-muted hover:text-white hover:border-accent/20'}
                  ${loadingQuestions ? 'opacity-60 cursor-wait' : ''}`}
              >
                <span className="text-base">{cat.icon}</span>
                <span>{cat.label}</span>
                {isLoading && (
                  <span className="w-3 h-3 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Loading overlay when switching categories */}
      {loadingQuestions && ready && (
        <div className="px-6 py-3 bg-accent/5 border-b border-accent/20 flex items-center gap-3">
          <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-accent">
            Generating 5 {activeCategory || 'mixed'} questions…
          </p>
        </div>
      )}

      {/* Interview Room */}
      <div className="flex-1 overflow-hidden">
        <InterviewRoom
          session={session}
          onFinish={() => navigate('/report')}
        />
      </div>
    </div>
  )
}
