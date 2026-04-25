import React, { useCallback, useState } from 'react'

const ACCEPTED = ['.pdf', '.doc', '.docx']
const SKILLS = [
  'javascript',
  'typescript',
  'react',
  'node',
  'python',
  'sql',
  'aws',
  'docker',
  'kubernetes',
  'communication',
  'leadership',
  'problem solving',
]

const ROLE_SKILLS = {
  'software engineer': ['javascript', 'typescript', 'react', 'node', 'python', 'sql', 'docker', 'aws'],
  'product manager': ['leadership', 'communication', 'sql', 'problem solving'],
  'business analyst': ['sql', 'communication', 'problem solving'],
  'data analyst': ['python', 'sql', 'communication', 'problem solving'],
  'marketing specialist': ['communication', 'leadership'],
  'ux designer': ['communication', 'problem solving'],
  'customer success': ['communication', 'leadership', 'problem solving'],
  sales: ['communication', 'leadership'],
}

function computeRating(matchCount) {
  if (matchCount >= 7) return { label: 'High', className: 'bg-accent/15 text-accent' }
  if (matchCount >= 4) return { label: 'Intermediate', className: 'bg-yellow-500/15 text-yellow-400' }
  return { label: 'Low', className: 'bg-red-500/15 text-red-400' }
}

export default function ResumeDropzone({ onFile, file, jobTitle = '', onAnalysis }) {
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState(null)

  const validate = (f) => {
    const ext = '.' + f.name.split('.').pop().toLowerCase()
    if (!ACCEPTED.includes(ext)) {
      setError('Only PDF, DOC, DOCX files are accepted.')
      return false
    }
    if (f.size > 10 * 1024 * 1024) {
      setError('File must be under 10 MB.')
      return false
    }
    setError(null)
    return true
  }

  const analyzeResumeSkills = useCallback(async (selectedFile) => {
    setAnalyzing(true)
    try {
      const buffer = await selectedFile.arrayBuffer()
      const text = new TextDecoder('utf-8', { fatal: false })
        .decode(buffer)
        .toLowerCase()
      const combined = `${selectedFile.name.toLowerCase()} ${text}`

      const roleKey = jobTitle.trim().toLowerCase()
      const targetSkills = ROLE_SKILLS[roleKey] || SKILLS
      const matchedSkills = targetSkills.filter((skill) => combined.includes(skill))
      const rating = computeRating(matchedSkills.length)
      const nextAnalysis = {
        rating,
        matchedSkills,
        targetSkillsCount: targetSkills.length,
      }
      setAnalysis(nextAnalysis)
      onAnalysis?.(nextAnalysis)
    } catch (_e) {
      // Keep graceful fallback for binary formats that don't decode cleanly.
      const fallbackMatched = SKILLS.filter((skill) =>
        selectedFile.name.toLowerCase().includes(skill)
      )
      const rating = computeRating(fallbackMatched.length)
      const nextAnalysis = {
        rating,
        matchedSkills: fallbackMatched,
        targetSkillsCount: SKILLS.length,
      }
      setAnalysis(nextAnalysis)
      onAnalysis?.(nextAnalysis)
    } finally {
      setAnalyzing(false)
    }
  }, [jobTitle, onAnalysis])

  const processFile = useCallback(
    async (selectedFile) => {
      if (!selectedFile || !validate(selectedFile)) return
      onFile(selectedFile)
      await analyzeResumeSkills(selectedFile)
    },
    [analyzeResumeSkills, onFile]
  )

  const handleDrop = useCallback(
    async (e) => {
      e.preventDefault()
      setDragging(false)
      const f = e.dataTransfer.files[0]
      await processFile(f)
    },
    [processFile]
  )

  const handleChange = async (e) => {
    const f = e.target.files[0]
    await processFile(f)
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={`relative border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-200 cursor-pointer group
        ${dragging ? 'border-accent bg-accent/5' : 'border-border hover:border-accent/50 hover:bg-white/[0.02]'}
        ${file ? 'border-accent/60 bg-accent/5' : ''}`}
    >
      <input
        type="file"
        accept={ACCEPTED.join(',')}
        onChange={handleChange}
        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
      />

      {file ? (
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-accent/15 flex items-center justify-center">
            <FileIcon className="text-accent" />
          </div>
          <div>
            <p className="font-semibold text-white text-sm">{file.name}</p>
            <p className="text-muted text-xs mt-0.5">{(file.size / 1024).toFixed(1)} KB</p>
          </div>
          <span className="badge bg-accent/15 text-accent">✓ Ready to upload</span>

          {analyzing && (
            <p className="text-xs text-muted">Analyzing resume skills...</p>
          )}

          {!analyzing && analysis && (
            <div className="w-full max-w-md mt-2 rounded-xl border border-border bg-surface p-3 text-left">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs text-muted">Resume skill rating</p>
                <span className={`badge ${analysis.rating.className}`}>{analysis.rating.label}</span>
              </div>
              {jobTitle.trim() && (
                <p className="text-[11px] text-muted mt-1">
                  Target role: {jobTitle}
                </p>
              )}
              <p className="text-[11px] text-gray-300 mt-2">
                Matched skills: {analysis.matchedSkills.length > 0 ? analysis.matchedSkills.join(', ') : 'No major skill keywords found'}
              </p>
              <p className="text-[11px] text-muted mt-1">
                Coverage: {analysis.matchedSkills.length}/{analysis.targetSkillsCount}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-accent/10 transition-colors">
            <UploadIcon />
          </div>
          <div>
            <p className="text-white font-medium text-sm">Drop your resume here</p>
            <p className="text-muted text-xs mt-1">PDF, DOC, DOCX — max 10 MB</p>
          </div>
          <span className="text-accent text-xs font-medium underline underline-offset-2">
            or click to browse
          </span>
        </div>
      )}

      {error && (
        <p className="mt-3 text-red-400 text-xs">{error}</p>
      )}
    </div>
  )
}

function UploadIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  )
}

function FileIcon({ className = '' }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  )
}
