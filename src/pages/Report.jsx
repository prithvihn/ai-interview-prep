import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ReportTimeline from '../components/ReportTimeline'
import ScoreChart from '../components/ScoreChart'
import { useInterview } from '../hooks/useInterview'
import { reports } from '../utils/storage'
import { getReport } from '../utils/api'

export default function Report() {
  const navigate = useNavigate()
  const session = useInterview()
  const [saved, setSaved] = useState(false)
  const [chartType, setChartType] = useState('bar')
  const [aiReport, setAiReport] = useState(null)
  const [loadingReport, setLoadingReport] = useState(false)

  const { answers, jobTitle, questions, startedAt, endedAt, sessionId } = session

  const avgScore = answers.length > 0
    ? Math.round(answers.reduce((s, a) => s + (a.feedback?.score || 0), 0) / answers.length)
    : 0

  const avgDelivery = answers.length > 0
    ? Math.round(answers.reduce((s, a) => s + (a.feedback?.delivery_score?.delivery_score || 0), 0) / answers.length)
    : 0

  const duration = startedAt && endedAt
    ? Math.round((endedAt - startedAt) / 1000 / 60)
    : null

  // Fetch AI report from backend
  useEffect(() => {
    if (sessionId && answers.length > 0 && !aiReport) {
      setLoadingReport(true)
      getReport(sessionId)
        .then((data) => setAiReport(data))
        .catch((err) => console.error('Report generation failed:', err))
        .finally(() => setLoadingReport(false))
    }
  }, [sessionId])

  // Save to local history
  useEffect(() => {
    if (!saved && answers.length > 0) {
      reports.add({ jobTitle, avgScore, avgDelivery, answers, duration, date: new Date().toISOString() })
      setSaved(true)
    }
  }, [])

  const handleRetry = () => {
    session.resetSession()
    navigate('/upload')
  }

  const scoreColor = getColor(avgScore)
  const summary = aiReport?.ai_summary || {}

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
        {/* Hero scores */}
        <div className="text-center mb-10">
          <p className="section-label mb-2">Interview Complete</p>
          <h1 className="font-display text-4xl font-extrabold mb-1">
            {jobTitle || 'Practice Session'}
          </h1>
          {duration && (
            <p className="text-muted text-sm">{duration} min · {answers.length} questions answered</p>
          )}

          <div className="flex items-center justify-center gap-6 mt-6">
            <div className="p-6 card text-center">
              <span className={`font-display text-5xl font-black ${scoreColor}`}>{avgScore}</span>
              <p className="text-muted text-xs mt-1">Content Score</p>
            </div>
            <div className="p-6 card text-center">
              <span className={`font-display text-5xl font-black ${getColor(avgDelivery)}`}>{avgDelivery}</span>
              <p className="text-muted text-xs mt-1">Delivery Score</p>
            </div>
          </div>

          {/* Readiness verdict */}
          {summary.readiness_verdict && (
            <div className={`inline-block mt-4 px-4 py-2 rounded-xl text-sm font-semibold
              ${summary.readiness_verdict === 'ready' ? 'bg-accent/15 text-accent'
                : summary.readiness_verdict === 'nearly_ready' ? 'bg-yellow-500/15 text-yellow-400'
                : 'bg-red-500/15 text-red-400'}`}>
              {summary.readiness_verdict.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
            </div>
          )}
        </div>

        {/* AI Executive Summary */}
        {summary.executive_summary && (
          <div className="card mb-8">
            <p className="text-xs font-semibold text-accent uppercase tracking-wider mb-3">🤖 AI Assessment</p>
            <p className="text-sm text-gray-300 leading-relaxed">{summary.executive_summary}</p>
            {summary.readiness_explanation && (
              <p className="text-xs text-muted mt-3 leading-relaxed">{summary.readiness_explanation}</p>
            )}
          </div>
        )}

        {/* Strengths & Improvements side by side */}
        {(summary.top_strengths?.length > 0 || summary.improvement_areas?.length > 0) && (
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            {summary.top_strengths?.length > 0 && (
              <div className="card">
                <p className="text-xs font-semibold text-accent uppercase tracking-wider mb-3">✓ Top Strengths</p>
                <ul className="space-y-3">
                  {summary.top_strengths.map((s, i) => (
                    <li key={i}>
                      <p className="text-sm font-semibold text-white">{s.strength}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{s.evidence}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {summary.improvement_areas?.length > 0 && (
              <div className="card">
                <p className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-3">↑ Areas to Improve</p>
                <ul className="space-y-3">
                  {summary.improvement_areas.map((a, i) => (
                    <li key={i}>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-white">{a.area}</p>
                        {a.priority && (
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium
                            ${a.priority === 'critical' ? 'bg-red-500/15 text-red-400'
                              : a.priority === 'important' ? 'bg-yellow-500/15 text-yellow-400'
                              : 'bg-white/5 text-subtle'}`}>
                            {a.priority}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{a.detail}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Delivery Analysis */}
        {summary.delivery_analysis && (
          <div className="card mb-8">
            <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-3">🎤 Delivery Analysis</p>
            <div className="space-y-3 text-sm text-gray-300">
              {summary.delivery_analysis.filler_trend && (
                <div>
                  <p className="text-xs text-muted font-semibold mb-0.5">Filler Words</p>
                  <p>{summary.delivery_analysis.filler_trend}</p>
                </div>
              )}
              {summary.delivery_analysis.confidence_trend && (
                <div>
                  <p className="text-xs text-muted font-semibold mb-0.5">Confidence</p>
                  <p>{summary.delivery_analysis.confidence_trend}</p>
                </div>
              )}
              {summary.delivery_analysis.pace_assessment && (
                <div>
                  <p className="text-xs text-muted font-semibold mb-0.5">Pace</p>
                  <p>{summary.delivery_analysis.pace_assessment}</p>
                </div>
              )}
              {summary.delivery_analysis.biggest_delivery_issue && (
                <div className="border-l-2 border-red-500/40 pl-3 mt-2">
                  <p className="text-xs text-red-400 font-semibold mb-0.5">Biggest Delivery Issue</p>
                  <p className="text-red-300">{summary.delivery_analysis.biggest_delivery_issue}</p>
                </div>
              )}
            </div>
          </div>
        )}

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

        {/* Next Steps from AI */}
        {summary.next_steps?.length > 0 ? (
          <div className="card border-accent/20 bg-accent/5 mb-8">
            <h2 className="font-display font-bold text-sm mb-3 text-accent">📋 Prioritised Next Steps</h2>
            <ul className="space-y-3">
              {summary.next_steps.map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-accent/15 text-accent text-[10px] font-bold flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm text-white font-medium">{step.action || step}</p>
                    {step.why && <p className="text-xs text-gray-400 mt-0.5">{step.why}</p>}
                    {step.timeline && (
                      <span className="text-[10px] text-accent/70 font-medium">{step.timeline}</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
            <button onClick={handleRetry} className="btn-primary text-sm mt-4">
              Start another session →
            </button>
          </div>
        ) : (
          <div className="card border-accent/20 bg-accent/5">
            <h2 className="font-display font-bold text-sm mb-3 text-accent">What's next?</h2>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>• Practice the questions you scored lowest on</li>
              <li>• Work on reducing filler words and hedging language</li>
              <li>• Focus on using the STAR method for behavioural questions</li>
            </ul>
            <button onClick={handleRetry} className="btn-primary text-sm mt-4">
              Start another session →
            </button>
          </div>
        )}

        {/* Loading indicator for AI report */}
        {loadingReport && (
          <div className="card flex items-center gap-3 mb-8">
            <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-muted">AI is generating your detailed report…</p>
          </div>
        )}
      </div>
    </div>
  )
}

function getColor(score) {
  if (score >= 80) return 'text-accent'
  if (score >= 55) return 'text-yellow-400'
  if (score >= 35) return 'text-red-400'
  return 'text-red-600'
}
