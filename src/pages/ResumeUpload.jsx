import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { jsPDF } from 'jspdf'
import ResumeDropzone from '../components/ResumeDropzone'
import { analyseResume } from '../utils/api'
import { session as sessionStorage } from '../utils/storage'

export default function ResumeUpload() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [file, setFile] = useState(null)
  const [analysis, setAnalysis] = useState(null)
  const [aiAnalysis, setAiAnalysis] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState(null)
  const jobTitle = params.get('role') || ''

  // Call backend AI analysis when a file is selected
  useEffect(() => {
    if (!file || !jobTitle.trim()) return
    setAiLoading(true)
    setAiError(null)
    analyseResume(file, jobTitle.trim())
      .then((data) => {
        setAiAnalysis(data)
        // Store session_id for the interview flow
        const saved = sessionStorage.get() || {}
        sessionStorage.set({
          ...saved,
          sessionId: data.session_id,
          jobTitle: jobTitle.trim(),
        })
      })
      .catch((err) => {
        console.error('AI analysis failed:', err)
        setAiError(err.response?.data?.detail || 'Backend AI analysis failed. You can still continue.')
      })
      .finally(() => setAiLoading(false))
  }, [file])

  const roadmap = useMemo(() => buildRoadmap({ jobTitle, analysis }), [jobTitle, analysis])

  const downloadRoadmap = () => {
    if (!roadmap) return
    const content = formatRoadmapText(roadmap)
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `resume-roadmap-${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const downloadRoadmapPdf = () => {
    if (!roadmap) return

    const doc = new jsPDF({ unit: 'pt', format: 'a4' })
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 48
    const maxWidth = pageWidth - margin * 2
    let y = margin

    const ensureSpace = (needed = 20) => {
      if (y + needed > pageHeight - margin) {
        doc.addPage()
        y = margin
      }
    }

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(16)
    doc.text('InterviewPrep - Resume Improvement Roadmap', margin, y)
    y += 24

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(11)
    doc.text(`Role: ${roadmap.roleLabel}`, margin, y)
    y += 16
    doc.text(`Current Rating: ${roadmap.rating}`, margin, y)
    y += 20

    roadmap.phases.forEach((phase) => {
      ensureSpace(24)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(12)
      doc.text(phase.title, margin, y)
      y += 16

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(11)
      phase.items.forEach((item) => {
        const wrapped = doc.splitTextToSize(`- ${item}`, maxWidth)
        ensureSpace(wrapped.length * 14 + 4)
        doc.text(wrapped, margin, y)
        y += wrapped.length * 14
      })
      y += 10
    })

    doc.save(`resume-roadmap-${Date.now()}.pdf`)
  }

  return (
    <div className="min-h-screen bg-bg text-white">
      <StepBar current={2} />

      <div className="max-w-3xl mx-auto px-6 py-12">
        <button onClick={() => navigate('/upload')} className="flex items-center gap-1.5 text-muted text-sm hover:text-white mb-8 transition-colors">
          ← Back to Setup
        </button>

        <p className="section-label mb-2">Step 2 of 4</p>
        <h1 className="font-display text-3xl font-bold mb-2">Upload resume & get improvement roadmap</h1>
        <p className="text-muted text-sm mb-8">
          Drop your resume to analyze role skills and generate an actionable roadmap you can download.
        </p>

        <ResumeDropzone onFile={setFile} file={file} jobTitle={jobTitle} onAnalysis={setAnalysis} />

        {/* AI Analysis from backend */}
        {aiLoading && (
          <div className="card mt-4 flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-muted">AI is analyzing your resume…</p>
          </div>
        )}
        {aiError && (
          <div className="card mt-4 border-red-900/30">
            <p className="text-xs text-red-400">{aiError}</p>
          </div>
        )}
        {aiAnalysis && !aiLoading && (
          <div className="card mt-4">
            <p className="text-xs font-semibold text-accent uppercase tracking-wider mb-3">🤖 AI Resume Analysis</p>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="rounded-xl border border-border bg-surface p-3 text-center">
                <p className="text-2xl font-display font-bold text-accent">{Math.round(aiAnalysis.overall_fit_score || 0)}</p>
                <p className="text-xs text-muted mt-0.5">Fit Score</p>
              </div>
              <div className="rounded-xl border border-border bg-surface p-3 text-center">
                <p className="text-2xl font-display font-bold text-white">{aiAnalysis.skills_found?.length || 0}</p>
                <p className="text-xs text-muted mt-0.5">Skills Found</p>
              </div>
            </div>
            {aiAnalysis.experience_summary && (
              <p className="text-sm text-gray-300 mb-3">{aiAnalysis.experience_summary}</p>
            )}
            {aiAnalysis.strengths?.length > 0 && (
              <div className="mb-3">
                <p className="text-xs text-accent font-semibold mb-1">Strengths</p>
                <div className="flex flex-wrap gap-1.5">
                  {aiAnalysis.strengths.map((s) => (
                    <span key={s} className="badge bg-accent/10 text-accent">{s}</span>
                  ))}
                </div>
              </div>
            )}
            {aiAnalysis.gaps?.length > 0 && (
              <div className="mb-3">
                <p className="text-xs text-yellow-400 font-semibold mb-1">Gaps to Address</p>
                <div className="flex flex-wrap gap-1.5">
                  {aiAnalysis.gaps.map((g) => (
                    <span key={g} className="badge bg-yellow-500/10 text-yellow-400">{g}</span>
                  ))}
                </div>
              </div>
            )}
            {aiAnalysis.suggested_focus_areas?.length > 0 && (
              <div>
                <p className="text-xs text-blue-400 font-semibold mb-1">Focus Areas for Interview</p>
                <ul className="space-y-1">
                  {aiAnalysis.suggested_focus_areas.map((f) => (
                    <li key={f} className="text-sm text-gray-300">• {f}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {roadmap && (
          <div className="card mt-6">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <p className="text-white font-semibold text-sm">Resume Improvement Roadmap</p>
                <p className="text-xs text-muted mt-1">
                  {roadmap.roleLabel} · Current rating: {roadmap.rating}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={downloadRoadmapPdf} className="btn-primary text-xs py-2 px-3">
                  Download PDF
                </button>
                <button onClick={downloadRoadmap} className="btn-secondary text-xs py-2 px-3">
                  Download TXT
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {roadmap.phases.map((phase) => (
                <div key={phase.title} className="rounded-xl border border-border bg-surface p-4">
                  <p className="text-xs text-accent uppercase tracking-wide font-semibold">{phase.title}</p>
                  <ul className="mt-2 space-y-1.5 text-sm text-gray-300">
                    {phase.items.map((item) => (
                      <li key={item}>- {item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-3 mt-8">
          <button onClick={() => navigate(`/upload${jobTitle ? `?role=${encodeURIComponent(jobTitle)}` : ''}`)} className="btn-secondary text-xs py-2 px-3">
            Edit setup details
          </button>
          <button onClick={() => navigate('/interview')} className="btn-primary text-xs py-2 px-3">
            Continue to Interview →
          </button>
        </div>
      </div>
    </div>
  )
}

function StepBar({ current }) {
  const steps = ['Setup', 'Resume', 'Interview', 'Report']
  return (
    <div className="border-b border-border px-6 py-3 flex items-center gap-2">
      {steps.map((s, i) => (
        <React.Fragment key={s}>
          <div className={`flex items-center gap-1.5 text-xs font-medium
            ${i + 1 === current ? 'text-accent' : i + 1 < current ? 'text-muted' : 'text-subtle'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold
              ${i + 1 === current ? 'bg-accent text-black' : i + 1 < current ? 'bg-subtle text-white' : 'bg-surface border border-border text-muted'}`}>
              {i + 1 < current ? '✓' : i + 1}
            </span>
            {s}
          </div>
          {i < steps.length - 1 && <div className="flex-1 h-px bg-border max-w-8" />}
        </React.Fragment>
      ))}
    </div>
  )
}

function buildRoadmap({ jobTitle, analysis }) {
  if (!analysis) return null
  const roleLabel = jobTitle?.trim() || 'General'
  const matched = analysis.matchedSkills || []
  const rating = analysis.rating?.label || 'Low'

  const missingCore = rating === 'High'
    ? ['Add quantified impact to each bullet', 'Tighten summary to 3 lines']
    : ['Add 3-5 role-relevant skills in projects', 'Use stronger action verbs', 'Add measurable outcomes (%, $, time)']

  return {
    roleLabel,
    rating,
    phases: [
      {
        title: 'Week 1: Structure & clarity',
        items: [
          'Rewrite headline to target your role directly.',
          'Add a concise summary with core strengths.',
          'Prioritize most relevant projects/experience at top.',
        ],
      },
      {
        title: 'Week 2: Skills & evidence',
        items: [
          ...missingCore,
          matched.length > 0 ? `Keep these visible: ${matched.join(', ')}.` : 'Add a dedicated skills section for role keywords.',
        ],
      },
      {
        title: 'Week 3: ATS optimization',
        items: [
          'Mirror wording from target job descriptions.',
          'Ensure clean headings: Summary, Skills, Experience, Projects, Education.',
          'Use standard dates and location formatting for parser compatibility.',
        ],
      },
      {
        title: 'Week 4: Final polish',
        items: [
          'Keep resume to one page (or two for 7+ years experience).',
          'Run grammar and spelling pass.',
          'Create role-specific variants and track callback rate.',
        ],
      },
    ],
  }
}

function formatRoadmapText(roadmap) {
  const lines = [
    'InterviewPrep - Resume Improvement Roadmap',
    `Role: ${roadmap.roleLabel}`,
    `Current Rating: ${roadmap.rating}`,
    '',
  ]

  roadmap.phases.forEach((phase) => {
    lines.push(phase.title)
    phase.items.forEach((item) => lines.push(`- ${item}`))
    lines.push('')
  })

  return lines.join('\n')
}
