import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
  timeout: 60000, // AI calls can take a while
})

// ── Resume Analysis ──────────────────────────────────────────────────────────
/**
 * Upload a resume and get AI analysis + session_id.
 * @param {File} file - PDF or DOCX file
 * @param {string} jobRole - Target job title
 * @returns {{ session_id, job_role, skills_found, experience_summary, strengths, gaps, overall_fit_score, suggested_focus_areas }}
 */
export const analyseResume = async (file, jobRole) => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('job_role', jobRole)

  const response = await api.post('/api/analyse', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}

// ── Interview Questions ──────────────────────────────────────────────────────
/**
 * Get the next AI-generated interview question.
 * @param {{ session_id: string, question_number: number, last_answer_transcript?: string, duration_seconds?: number, preferred_category?: string }} payload
 * @returns {{ session_id, question_number, question, question_type, hint }}
 */
export const getNextQuestion = async (payload) => {
  const response = await api.post('/api/next-question', payload)
  return response.data
}

// ── Feedback / Scoring ───────────────────────────────────────────────────────
/**
 * Submit an answer and get AI content + delivery feedback.
 * @param {{ session_id: string, question_number: number, question: string, transcript: string, duration_seconds?: number }} payload
 * @returns {{ session_id, question_number, content_score, delivery_score }}
 */
export const getFeedback = async (payload) => {
  const response = await api.post('/api/feedback', payload)
  return response.data
}

// ── Report ───────────────────────────────────────────────────────────────────
/**
 * Generate the final interview report for a session.
 * @param {string} sessionId
 */
export const getReport = async (sessionId) => {
  const response = await api.post('/api/report', { session_id: sessionId })
  return response.data
}

// ── Sessions ─────────────────────────────────────────────────────────────────
/**
 * Get all past interview sessions.
 */
export const getSessions = async () => {
  const response = await api.get('/api/sessions')
  return response.data
}

/**
 * Get a single session by ID.
 */
export const getSession = async (sessionId) => {
  const response = await api.get(`/api/sessions/${sessionId}`)
  return response.data
}

export default api
