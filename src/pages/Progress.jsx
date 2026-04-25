import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { reports } from '../utils/storage'
import ScoreChart from '../components/ScoreChart'

export default function Progress() {
  const navigate = useNavigate()
  const [history, setHistory] = useState([])

  useEffect(() => {
    setHistory(reports.getAll())
  }, [])

  const overallAvg = history.length > 0
    ? Math.round(history.reduce((s, r) => s + (r.avgScore || 0), 0) / history.length)
    : null

  const handleClear = () => {
    if (confirm('Clear all session history?')) {
      reports.clear()
      setHistory([])
    }
  }

  return (
    <div className="min-h-screen bg-bg text-white">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-muted hover:text-white transition-colors text-sm">
          ← Home
        </button>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-accent flex items-center justify-center">
            <span className="text-black text-[10px] font-black">AI</span>
          </div>
          <span className="font-display font-semibold text-sm">InterviewPrep</span>
        </div>
        <button onClick={() => navigate('/upload')} className="btn-primary text-xs py-2 px-3">
          New Session
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <p className="section-label mb-2">My Progress</p>
        <h1 className="font-display text-3xl font-bold mb-6">Interview History</h1>

        {/* Summary stats */}
        {history.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            <StatCard label="Sessions" value={history.length} />
            <StatCard label="Avg Score" value={overallAvg} suffix="/100" color={overallAvg >= 80 ? 'text-accent' : overallAvg >= 55 ? 'text-yellow-400' : 'text-red-400'} />
            <StatCard label="Questions Answered" value={history.reduce((s, r) => s + (r.answers?.length || 0), 0)} />
            <StatCard label="Best Score" value={Math.max(...history.map((r) => r.avgScore || 0))} suffix="/100" color="text-accent" />
          </div>
        )}

        {/* History list */}
        {history.length === 0 ? (
          <div className="card text-center py-16">
            <p className="text-3xl mb-3">📋</p>
            <p className="font-semibold text-white mb-1">No sessions yet</p>
            <p className="text-muted text-sm mb-6">Complete your first interview to see your progress here.</p>
            <button onClick={() => navigate('/upload')} className="btn-primary text-sm">
              Start your first session →
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((report, i) => {
              const date = new Date(report.date || report.savedAt)
              const sc = report.avgScore || 0
              const scoreColor = sc >= 80 ? 'text-accent' : sc >= 55 ? 'text-yellow-400' : 'text-red-400'

              return (
                <div key={i} className="card hover:border-accent/20 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-sm text-white">
                        {report.jobTitle || 'Practice Session'}
                      </p>
                      <p className="text-xs text-muted mt-0.5">
                        {date.toLocaleDateString()} · {report.answers?.length || 0} questions
                        {report.duration ? ` · ${report.duration} min` : ''}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`text-2xl font-display font-black ${scoreColor}`}>{sc}</span>
                      <p className="text-[10px] text-muted">avg score</p>
                    </div>
                  </div>

                  {/* Mini score bar */}
                  <div className="mt-3 h-1.5 bg-surface rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${sc >= 80 ? 'bg-accent' : sc >= 55 ? 'bg-yellow-400' : 'bg-red-400'}`}
                      style={{ width: `${sc}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {history.length > 0 && (
          <div className="mt-8 text-center">
            <button onClick={handleClear} className="text-xs text-muted hover:text-red-400 transition-colors underline underline-offset-2">
              Clear all history
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value, suffix = '', color = 'text-white' }) {
  return (
    <div className="card text-center">
      <p className={`text-2xl font-display font-black ${color}`}>
        {value ?? '—'}{suffix}
      </p>
      <p className="text-xs text-muted mt-0.5">{label}</p>
    </div>
  )
}
