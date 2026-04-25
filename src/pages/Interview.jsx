import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import InterviewRoom from '../components/InterviewRoom'
import { useInterview } from '../hooks/useInterview'
import { session as sessionStorage } from '../utils/storage'

// Demo questions — in production these come from your API
const DEMO_QUESTIONS = [
  { id: 'q1', text: "Tell me about yourself and why you're interested in this role.", category: 'behavioral', difficulty: 'easy' },
  { id: 'q2', text: "Describe a challenging project you've worked on. What was your approach and what was the outcome?", category: 'behavioral', difficulty: 'medium' },
  { id: 'q3', text: 'How do you prioritize tasks when you have multiple deadlines competing for your attention?', category: 'situational', difficulty: 'medium' },
  { id: 'q4', text: 'Tell me about a time you disagreed with a teammate. How did you handle it?', category: 'behavioral', difficulty: 'medium' },
  { id: 'q5', text: 'Where do you see yourself in five years, and how does this role fit into that vision?', category: 'general', difficulty: 'easy' },
]

export default function Interview() {
  const navigate = useNavigate()
  const [ready, setReady] = useState(false)
  const session = useInterview()

  useEffect(() => {
    // Load questions (simulate API)
    const saved = sessionStorage.get()
    if (!saved) {
      navigate('/upload')
      return
    }

    if (session.questions.length === 0) {
      session.setQuestions(DEMO_QUESTIONS)
    }

    // Small delay so UI loads cleanly
    const t = setTimeout(() => setReady(true), 400)
    return () => clearTimeout(t)
  }, [])

  if (!ready) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted">Preparing your interview…</p>
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
