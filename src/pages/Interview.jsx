import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import InterviewRoom from '../components/InterviewRoom'
import { useInterview } from '../hooks/useInterview'
import { session as sessionStorage } from '../utils/storage'
import { getNextQuestion } from '../utils/api'

const CATEGORIES = [
  { value: null, label: 'All Types' },
  { value: 'hr', label: 'HR' },
  { value: 'communication', label: 'Communication' },
  { value: 'technical', label: 'Technical' },
  { value: 'behavioural', label: 'Behavioural' },
  { value: 'situational', label: 'Situational' },
  { value: 'motivational', label: 'Motivational' },
]

export default function Interview() {
  const navigate = useNavigate()
  const [ready, setReady] = useState(false)
  const [loadingFirst, setLoadingFirst] = useState(false)
  const [error, setError] = useState(null)
  const session = useInterview()

  useEffect(() => {
    const saved = sessionStorage.get()
    if (!saved || !saved.sessionId) {
      navigate('/upload')
      return
    }

    // If we already have questions (page refresh), go straight to ready
    if (session.questions.length > 0) {
      setReady(true)
      return
    }

    // Otherwise fetch the first AI question
    fetchFirstQuestion(saved.sessionId, saved.preferredCategory)
  }, [])

  const fetchFirstQuestion = async (sessionId, category) => {
    setLoadingFirst(true)
    setError(null)
    try {
      const data = await getNextQuestion({
        session_id: sessionId,
        question_number: 1,
        preferred_category: category,
      })
      session.addQuestion({
        id: `q_${data.question_number}`,
        text: data.question,
        category: data.question_type,
        hint: data.hint,
        difficulty: data.question_number <= 2 ? 'easy' : data.question_number <= 4 ? 'medium' : 'hard',
      })
      setReady(true)
    } catch (err) {
      console.error('Failed to fetch first question:', err)
      setError(err.response?.data?.detail || 'Failed to generate question. Is the backend running?')
    } finally {
      setLoadingFirst(false)
    }
  }

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
                  if (saved?.sessionId) fetchFirstQuestion(saved.sessionId, saved.preferredCategory)
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
                {loadingFirst ? 'AI is preparing your first question…' : 'Preparing your interview…'}
              </p>
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-accent flex items-center justify-center">
            <span className="text-black text-[10px] font-black">AI</span>
          </div>
          <span className="font-display font-semibold text-sm">InterviewPrep</span>
        </div>
        <div className="flex items-center gap-3">
          {/* Category selector */}
          <select
            value={session.preferredCategory || ''}
            onChange={(e) => session.setPreferredCategory(e.target.value || null)}
            className="bg-surface border border-border rounded-lg px-3 py-1.5 text-xs text-muted focus:outline-none focus:border-accent transition-colors"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.label} value={cat.value || ''}>
                {cat.label}
              </option>
            ))}
          </select>

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

      {/* Room */}
      <div className="flex-1 overflow-hidden">
        <InterviewRoom
          session={session}
          onFinish={() => navigate('/report')}
        />
      </div>
    </div>
  )
}
