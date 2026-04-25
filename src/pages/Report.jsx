import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ReportTimeline from '../components/ReportTimeline'
import ScoreChart from '../components/ScoreChart'
import { useInterview } from '../hooks/useInterview'
import { reports } from '../utils/storage'

export default function Report() {
  const navigate = useNavigate()
  const session = useInterview()
  const [saved, setSaved] = useState(false)
  const [chartType, setChartType] = useState('bar')

  const { answers, jobTitle, questions, startedAt, endedAt } = session

  const avgScore = answers.length > 0
    ? Math.round(answers.reduce((s, a) => s + (a.feedback?.score || 0), 0) / answers.length)
    : 0

  const duration = startedAt && endedAt
    ? Math.round((endedAt - startedAt) / 1000 / 60)
    : null

  useEffect(() => {
    if (!saved && answers.length > 0) {
      reports.add({ jobTitle, avgScore, answers, duration, date: new Date().toISOString() })
      setSaved(true)
    }
  }, [])

  const handleRetry = () => {
    session.resetSession()
    navigate('/upload')
  }

  const scoreColor =
    avgScore >= 80 ? 'text-accent' : avgScore >= 55 ? 'text-yellow-400' : 'text-red-400'

  return (
    <div className="min-h-screen bg-bg text-white">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-accent flex items-center justify-center">
            <span className="text-black text-[10px] font-black">AI</span>
          </div>
          <span className="font-display font-semibold text-sm">InterviewPrep</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/progress')} className="btn-secondary text-xs py-2 px-3">
            My Progress
          </button>
          <button onClick={handleRetry} className="btn-primary text-xs py-2 px-3">
            Practice Again
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Hero score */}
        <div className="text-center mb-10">
          <p className="section-label mb-2">Interview Complete 🎉</p>
          <h1 className="font-display text-4xl font-extrabold mb-1">
            {jobTitle || 'Practice Session'}
          </h1>
          {duration && (
            <p className="text-muted text-sm">{duration} min · {answers.length} questions answered</p>
          )}

          <div className="inline-flex flex-col items-center mt-6 p-6 card">
            <span className={`font-display text-6xl font-black ${scoreColor}`}>{avgScore}</span>
            <span className="text-muted text-sm mt-1">Overall Score</span>
            <span className={`mt-2 badge ${avgScore >= 80 ? 'bg-accent/15 text-accent' : avgScore >= 55 ? 'bg-yellow-500/15 text-yellow-400' : 'bg-red-500/15 text-red-400'}`}>
              {avgScore >= 80 ? 'Excellent' : avgScore >= 55 ? 'Good job' : 'Keep practicing'}
            </span>
          </div>
        </div>

        {/* Charts */}
        {answers.length > 0 && (
          <div className="card mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-sm">Score Breakdown</h2>
              <div className="flex gap-1 bg-surface border border-border rounded-lg p-1">
                {['bar', 'radar'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setChartType(t)}
                    className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors capitalize
                      ${chartType === t ? 'bg-accent text-black' : 'text-muted hover:text-white'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <ScoreChart answers={answers} type={chartType} />
          </div>
        )}

        {/* Timeline */}
        <div className="mb-8">
          <h2 className="font-display font-bold text-lg mb-5">Answer Review</h2>
          {answers.length === 0 ? (
            <div className="card text-center py-10">
              <p className="text-muted text-sm">No answers recorded in this session.</p>
              <button onClick={handleRetry} className="btn-primary text-sm mt-4">Start a new interview</button>
            </div>
          ) : (
            <ReportTimeline answers={answers} />
          )}
        </div>

        {/* Next steps */}
        <div className="card border-accent/20 bg-accent/5">
          <h2 className="font-display font-bold text-sm mb-3 text-accent">What's next?</h2>
          <ul className="space-y-2 text-sm text-gray-300">
            <li>• Practice the questions you scored lowest on</li>
            <li>• Work on reducing filler words in your answers</li>
            <li>• Try a different role to build breadth</li>
          </ul>
          <button onClick={handleRetry} className="btn-primary text-sm mt-4">
            Start another session →
          </button>
        </div>
      </div>
    </div>
  )
}
