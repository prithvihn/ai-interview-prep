import React, { useState, useEffect, useCallback } from 'react'
import SpeechButton from './SpeechButton'
import TranscriptPane from './TranscriptPane'
import FeedbackCard from './FeedbackCard'
import QuestionBank from './QuestionBank'
import { useSpeechRecognition } from '../hooks/useSpeechRecognition'
import { useTTS } from '../hooks/useTTS'
import { calcWPM, detectFillers } from '../utils/delivery'

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
  } = session

  const [phase, setPhase] = useState('question') // question | recording | reviewing | feedback
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [loadingFeedback, setLoadingFeedback] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

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
    submitAnswer(text, recordingDuration)

    setPhase('feedback')
    setLoadingFeedback(true)

    // Simulate API call — replace with real API
    await new Promise((r) => setTimeout(r, 1500))
    const mockFeedback = {
      score: Math.floor(Math.random() * 30 + 65),
      strengths: ['Clear structure', 'Used specific examples', 'Confident delivery'],
      improvements: ['Reduce filler words', 'Be more concise'],
      sampleAnswer: `A strong answer would use the STAR method: describe the Situation, the Task, the Action you took, and the Result you achieved. Focus on measurable outcomes and keep the answer under 2 minutes.`,
    }
    setFeedback(currentQuestion?.id, mockFeedback)
    setLoadingFeedback(false)
  }, [transcript, fullTranscript, recordingDuration, submitAnswer, currentQuestion, setFeedback])

  const handleNext = () => {
    if (isLastQuestion) {
      finishSession()
      onFinish?.()
    } else {
      nextQuestion()
      setPhase('question')
      resetTranscript()
    }
  }

  const fillers = phase === 'reviewing' ? detectFillers(transcript) : []
  const wpm = phase === 'reviewing' && recordingDuration > 0 ? calcWPM(transcript, recordingDuration) : null

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
              <span className="badge bg-accent/10 text-accent">{currentQuestion.category}</span>
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

              {/* Delivery stats */}
              {(wpm !== null || fillers.length > 0) && (
                <div className="grid grid-cols-2 gap-3">
                  {wpm !== null && (
                    <div className="card text-center">
                      <p className="text-2xl font-display font-bold text-white">{wpm}</p>
                      <p className="text-xs text-muted mt-0.5">words / min</p>
                    </div>
                  )}
                  {fillers.length > 0 && (
                    <div className="card text-center">
                      <p className="text-2xl font-display font-bold text-yellow-400">
                        {fillers.reduce((s, f) => s + f.count, 0)}
                      </p>
                      <p className="text-xs text-muted mt-0.5">filler words</p>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    handleStartRecording()
                  }}
                  className="btn-secondary flex-1"
                >
                  ↺ Re-record
                </button>
                <button onClick={handleSubmitAnswer} className="btn-primary flex-1">
                  Submit → Get Feedback
                </button>
              </div>
            </div>
          )}

          {/* Feedback phase */}
          {phase === 'feedback' && (
            <div className="space-y-4">
              <FeedbackCard feedback={currentAnswer?.feedback} loading={loadingFeedback} />

              {!loadingFeedback && (
                <div className="flex gap-3">
                  <button
                    onClick={() => { setPhase('recording'); resetTranscript() }}
                    className="btn-secondary flex-1"
                  >
                    ↺ Try again
                  </button>
                  <button onClick={handleNext} className="btn-primary flex-1">
                    {isLastQuestion ? '🏁 Finish Interview' : 'Next Question →'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
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
