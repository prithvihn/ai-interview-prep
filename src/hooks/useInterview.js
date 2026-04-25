import { useState, useCallback, useRef } from 'react'
import { session as sessionStorage } from '../utils/storage'

const INITIAL_STATE = {
  sessionId: null,
  jobTitle: '',
  jobDescription: '',
  resumeId: null,
  questions: [],        // [{ id, text, category, difficulty, hint }]
  currentIndex: 0,
  answers: [],           // [{ questionId, transcript, durationSeconds, feedback }]
  status: 'idle',        // idle | loading | active | paused | finished
  startedAt: null,
  endedAt: null,
  preferredCategory: null, // hr | communication | technical | behavioural | situational | motivational | null (all)
}

/**
 * Central hook that manages interview session state.
 * Persists to localStorage so the session survives a page refresh.
 */
export function useInterview() {
  const [state, setState] = useState(() => {
    const saved = sessionStorage.get()
    return saved || INITIAL_STATE
  })

  const timerRef = useRef(null)
  const [elapsed, setElapsed] = useState(0)

  // ── Persist whenever state changes ────────────────────────────────────────
  const update = useCallback((patch) => {
    setState((prev) => {
      const next = typeof patch === 'function' ? patch(prev) : { ...prev, ...patch }
      sessionStorage.set(next)
      return next
    })
  }, [])

  // ── Session lifecycle ─────────────────────────────────────────────────────
  const initSession = useCallback((payload) => {
    update({
      ...INITIAL_STATE,
      ...payload,
      status: 'loading',
      startedAt: Date.now(),
    })
  }, [update])

  const setQuestions = useCallback((questions) => {
    update({ questions, status: 'active' })
  }, [update])

  /**
   * Add a single AI-generated question to the list dynamically.
   */
  const addQuestion = useCallback((question) => {
    update((prev) => ({
      ...prev,
      questions: [...prev.questions, question],
      status: 'active',
    }))
  }, [update])

  /**
   * Set the preferred question category filter.
   */
  const setPreferredCategory = useCallback((category) => {
    update({ preferredCategory: category })
  }, [update])

  const currentQuestion = state.questions[state.currentIndex] ?? null

  const submitAnswer = useCallback((transcript, durationSeconds) => {
    update((prev) => {
      const answer = {
        questionId: currentQuestion?.id,
        questionText: currentQuestion?.text,
        transcript,
        durationSeconds,
        submittedAt: Date.now(),
        feedback: null,
      }
      return {
        ...prev,
        answers: [...prev.answers, answer],
      }
    })
  }, [update, currentQuestion])

  const setFeedback = useCallback((questionId, feedback) => {
    update((prev) => ({
      ...prev,
      answers: prev.answers.map((a) =>
        a.questionId === questionId ? { ...a, feedback } : a
      ),
    }))
  }, [update])

  const nextQuestion = useCallback(() => {
    update((prev) => ({
      ...prev,
      currentIndex: Math.min(prev.currentIndex + 1, prev.questions.length - 1),
    }))
  }, [update])

  const prevQuestion = useCallback(() => {
    update((prev) => ({
      ...prev,
      currentIndex: Math.max(prev.currentIndex - 1, 0),
    }))
  }, [update])

  const finishSession = useCallback(() => {
    update({ status: 'finished', endedAt: Date.now() })
  }, [update])

  const resetSession = useCallback(() => {
    sessionStorage.clear()
    setState(INITIAL_STATE)
    setElapsed(0)
  }, [])

  // ── Timer ─────────────────────────────────────────────────────────────────
  const startTimer = useCallback(() => {
    setElapsed(0)
    timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000)
  }, [])

  const stopTimer = useCallback(() => {
    clearInterval(timerRef.current)
  }, [])

  const resetTimer = useCallback(() => {
    stopTimer()
    setElapsed(0)
  }, [stopTimer])

  const isLastQuestion = state.currentIndex >= state.questions.length - 1

  return {
    ...state,
    currentQuestion,
    isLastQuestion,
    elapsed,
    initSession,
    setQuestions,
    addQuestion,
    setPreferredCategory,
    submitAnswer,
    setFeedback,
    nextQuestion,
    prevQuestion,
    finishSession,
    resetSession,
    startTimer,
    stopTimer,
    resetTimer,
    update,
  }
}
