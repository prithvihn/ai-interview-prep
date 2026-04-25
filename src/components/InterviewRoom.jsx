import React, { useState, useEffect, useCallback } from 'react'
import SpeechButton from './SpeechButton'
import TranscriptPane from './TranscriptPane'
import FeedbackCard from './FeedbackCard'
import QuestionBank from './QuestionBank'
import { useSpeechRecognition } from '../hooks/useSpeechRecognition'
import { useTTS } from '../hooks/useTTS'
import { getFeedback, getNextQuestion } from '../utils/api'

/**
 * Props:
 *  - session: useInterview() return value
 *  - onFinish: () => void
 */
export default function InterviewRoom({ session, onFinish }) {
  const {
    currentQuestion, questions, currentIndex, answers, elapsed,
    isLastQuestion, submitAnswer, nextQuestion, prevQuestion,
    finishSession, startTimer, stopTimer, resetTimer, setFeedback,
    addQuestion, sessionId, preferredCategory,
  } = session

  const [phase, setPhase] = useState('question') // question | recording | reviewing | feedback
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [loadingFeedback, setLoadingFeedback] = useState(false)
  const [loadingNextQ, setLoadingNextQ] = useState(false)
  const [aiError, setAiError] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Store the full backend response for the current answer
  const [currentFeedbackFull, setCurrentFeedbackFull] = useState(null)

  const answeredIds = answers.map((a) => a.questionId)
  const currentAnswer = answers.find((a) => a.questionId === currentQuestion?.id)

  const {
    transcript, interimTranscript, fullTranscript,
    isListening, start: startListening, stop: stopListening, reset: resetTranscript,
    isSupported: speechSupported,
  } = useSpeechRecognition()

  const { speak, cancel: cancelTTS, isSpeaking } = useTTS()

  // Read question aloud when it changes
  useEffect(() => {
    if (currentQuestion?.text && phase === 'question') {
      speak(currentQuestion.text)
    }
    return () => cancelTTS()
  }, [currentQuestion?.id])

  const handleStartRecording = () => {
    resetTranscript()
    setPhase('recording')
    startListening()
    resetTimer()
    startTimer()
  }

  const handleStopRecording = () => {
    stopListening()
    stopTimer()
    setRecordingDuration(elapsed)
    setPhase('reviewing')
  }

  const handleSubmitAnswer = useCallback(async () => {
    const text = transcript || fullTranscript
    if (!text || !text.trim()) {
      setAiError('No answer detected. Please record your answer first.')
      return
    }

    submitAnswer(text, recordingDuration)
    setPhase('feedback')
    setLoadingFeedback(true)
    setAiError(null)
    setCurrentFeedbackFull(null)

    try {
      // Call backend — gets holistic AI content scoring + deep delivery analysis + improvement trends
      const feedbackData = await getFeedback({
        session_id: sessionId,
        question_number: currentIndex + 1,
        question: currentQuestion?.text || '',
        transcript: text,
        duration_seconds: recordingDuration || null,
      })

      // Store full backend response for FeedbackCard
      setCurrentFeedbackFull(feedbackData)

      // Also store a summary in the session for the Report page
      const content = feedbackData.content_score || {}
      const delivery = feedbackData.delivery_score || {}

      const sessionFeedback = {
        score: content.overall_score || 0,
        content_score: content,
        delivery_score: delivery,
        improvement_trends: feedbackData.improvement_trends || null,
      }

      setFeedback(currentQuestion?.id, sessionFeedback)
    } catch (err) {
      console.error('AI feedback failed:', err)
      setAiError(
        err.response?.data?.detail ||
        'Failed to get AI feedback. Check that the backend is running on port 8000.'
      )
    } finally {
      setLoadingFeedback(false)
    }
  }, [transcript, fullTranscript, recordingDuration, submitAnswer, currentQuestion, setFeedback, sessionId, currentIndex])

  const handleNext = useCallback(async () => {
    if (isLastQuestion) {
      // Fetch one more question from AI
      setLoadingNextQ(true)
      setAiError(null)
      try {
        const nextQNum = questions.length + 1
        const data = await getNextQuestion({
          session_id: sessionId,
          question_number: nextQNum,
          last_answer_transcript: transcript || fullTranscript || undefined,
          duration_seconds: recordingDuration || undefined,
          preferred_category: preferredCategory,
        })
        addQuestion({
          id: `q_${data.question_number}`,
          text: data.question,
          category: data.question_type,
          hint: data.hint,
          difficulty: nextQNum <= 2 ? 'easy' : nextQNum <= 4 ? 'medium' : 'hard',
        })
        session.update((prev) => ({
          ...prev,
          currentIndex: prev.questions.length,
        }))
        setPhase('question')
        resetTranscript()
        setCurrentFeedbackFull(null)
      } catch (err) {
        console.error('Failed to fetch next question:', err)
        setAiError('Could not generate next question. You can finish the interview.')
      } finally {
        setLoadingNextQ(false)
      }
    } else {
      nextQuestion()
      setPhase('question')
      resetTranscript()
      setCurrentFeedbackFull(null)
    }
  }, [isLastQuestion, nextQuestion, resetTranscript, sessionId, questions, addQuestion, preferredCategory, transcript, fullTranscript, recordingDuration, session])

  const handleFinish = () => {
    finishSession()
    onFinish?.()
  }

  return (
    <div className="flex h-full relative">
      {/* Sidebar — question bank */}
      <div className={`
        fixed md:relative z-20 md:z-auto top-0 left-0 h-full
        w-72 bg-surface border-r border-border flex flex-col p-4
        transition-transform duration-300 md:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-semibold text-muted uppercase tracking-wider">Questions</p>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-muted hover:text-white">✕</button>
        </div>
        <QuestionBank
          questions={questions}
          currentIndex={currentIndex}
          answeredIds={answeredIds}
          onSelect={(i) => {
            session.update({ currentIndex: i })
            setPhase('question')
            setSidebarOpen(false)
            setCurrentFeedbackFull(null)
          }}
        />
      </div>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-10 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* Top bar */}
        <div className="flex items-center gap-3 p-4 border-b border-border">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden btn-secondary py-2 px-3 text-xs"
          >
            ☰ Questions
          </button>
          <div className="flex items-center gap-2 text-sm text-muted">
            <span className="font-mono text-xs bg-surface border border-border px-2 py-0.5 rounded-lg">
              {currentIndex + 1} / {questions.length}
            </span>
            {currentQuestion?.category && (
              <span className={`badge ${getCategoryColor(currentQuestion.category)}`}>
                {currentQuestion.category}
              </span>
            )}
          </div>
          {elapsed > 0 && phase === 'recording' && (
            <span className="ml-auto font-mono text-xs text-red-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
              {Math.floor(elapsed / 60).toString().padStart(2, '0')}:{(elapsed % 60).toString().padStart(2, '0')}
            </span>
          )}
        </div>

        {/* Question */}
        <div className="p-6 border-b border-border">
          <p className="section-label mb-2">Question {currentIndex + 1}</p>
          <p className="text-white text-lg font-display font-semibold leading-snug">
            {currentQuestion?.text || 'Loading question…'}
          </p>
          {currentQuestion?.hint && phase === 'question' && (
            <p className="text-xs text-accent/70 mt-2 flex items-center gap-1.5">
              💡 <span className="italic">{currentQuestion.hint}</span>
            </p>
          )}
          {isSpeaking && (
            <p className="text-xs text-muted mt-2 flex items-center gap-1.5">
              <WaveformIcon /> Reading aloud…
            </p>
          )}
        </div>

        {/* Interaction area */}
        <div className="p-6 flex-1 space-y-5">
          {/* Recording phase */}
          {(phase === 'question' || phase === 'recording') && (
            <>
              <TranscriptPane
                transcript={transcript}
                interimTranscript={interimTranscript}
                isListening={isListening}
              />

              <div className="flex items-center justify-center gap-6">
                {!speechSupported && (
                  <p className="text-xs text-red-400">Speech recognition not supported in this browser.</p>
                )}
                <SpeechButton
                  isListening={isListening}
                  onToggle={isListening ? handleStopRecording : handleStartRecording}
                  disabled={!speechSupported}
                />
                <p className="text-xs text-muted">{isListening ? 'Click to stop' : 'Click to answer'}</p>
              </div>
            </>
          )}

          {/* Reviewing phase */}
          {phase === 'reviewing' && (
            <div className="space-y-4">
              <TranscriptPane transcript={transcript} />

              <div className="flex gap-3">
                <button onClick={handleStartRecording} className="btn-secondary flex-1">
                  ↺ Re-record
                </button>
                <button onClick={handleSubmitAnswer} className="btn-primary flex-1">
                  Submit → Get AI Feedback
                </button>
              </div>
            </div>
          )}

          {/* Feedback phase */}
          {phase === 'feedback' && (
            <div className="space-y-4">
              <FeedbackCard
                feedbackFull={currentFeedbackFull}
                loading={loadingFeedback}
              />

              {aiError && (
                <div className="card border-red-900/30">
                  <p className="text-xs text-red-400">{aiError}</p>
                </div>
              )}

              {!loadingFeedback && (
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <button
                      onClick={() => { setPhase('recording'); resetTranscript(); setCurrentFeedbackFull(null) }}
                      className="btn-secondary flex-1"
                    >
                      ↺ Try again
                    </button>
                    {aiError && !currentFeedbackFull ? (
                      <button onClick={handleFinish} className="btn-primary flex-1">
                        🏁 Finish Interview
                      </button>
                    ) : (
                      <button
                        onClick={handleNext}
                        disabled={loadingNextQ}
                        className="btn-primary flex-1"
                      >
                        {loadingNextQ ? (
                          <span className="flex items-center gap-2 justify-center">
                            <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                            Generating…
                          </span>
                        ) : (
                          'Next Question →'
                        )}
                      </button>
                    )}
                  </div>
                  {questions.length >= 3 && (
                    <button
                      onClick={handleFinish}
                      className="btn-secondary w-full text-xs py-2 text-muted hover:text-white"
                    >
                      🏁 End Interview & View Report
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function getCategoryColor(category) {
  const colors = {
    hr: 'bg-purple-500/10 text-purple-400',
    communication: 'bg-blue-500/10 text-blue-400',
    behavioural: 'bg-green-500/10 text-green-400',
    technical: 'bg-orange-500/10 text-orange-400',
    situational: 'bg-yellow-500/10 text-yellow-400',
    motivational: 'bg-pink-500/10 text-pink-400',
  }
  return colors[category] || 'bg-accent/10 text-accent'
}

function WaveformIcon() {
  return (
    <span className="flex items-end gap-0.5 h-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className="wave-bar w-0.5 bg-muted rounded-full h-full" />
      ))}
    </span>
  )
}
