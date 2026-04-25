import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
})

const delay = (ms = 600) => new Promise((resolve) => setTimeout(resolve, ms))
const createResponse = (data) => ({ data })

const DEMO_QUESTIONS = [
  { id: 'q1', text: 'Tell me about yourself and why you are interested in this role.', category: 'behavioral', difficulty: 'easy' },
  { id: 'q2', text: 'Describe a challenging project and how you handled it end-to-end.', category: 'behavioral', difficulty: 'medium' },
  { id: 'q3', text: 'How do you prioritize when timelines collide across teams?', category: 'situational', difficulty: 'medium' },
  { id: 'q4', text: 'Tell me about a time you received critical feedback and what you changed.', category: 'behavioral', difficulty: 'hard' },
  { id: 'q5', text: 'Why should we hire you for this position?', category: 'general', difficulty: 'easy' },
]

// Offline mock API contract. Keep same function signatures for easy backend swap.
export const uploadResume = async (file) => {
  await delay(700)
  return createResponse({
    resumeId: `resume_${Date.now()}`,
    fileName: file?.name || 'resume.pdf',
    size: file?.size || 0,
    status: 'uploaded',
  })
}

export const analyzeResume = async (resumeId) => {
  await delay(900)
  return createResponse({
    resumeId,
    summary: 'Strong technical profile with measurable impact and collaboration examples.',
    strengths: ['Ownership mindset', 'Clear communication', 'Data-driven decision making'],
    improvementAreas: ['Add more quantified outcomes in each bullet'],
  })
}

export const generateQuestions = async (payload) => {
  await delay(1000)
  return createResponse({
    sessionId: `session_${Date.now()}`,
    questions: DEMO_QUESTIONS,
    context: payload,
  })
}

export const getQuestions = async (sessionId) => {
  await delay(500)
  return createResponse({ sessionId, questions: DEMO_QUESTIONS })
}

export const startSession = async (payload) => {
  await delay(500)
  return createResponse({
    sessionId: `session_${Date.now()}`,
    startedAt: Date.now(),
    ...payload,
  })
}

export const submitAnswer = async (payload) => {
  await delay(750)
  return createResponse({
    answerId: `answer_${Date.now()}`,
    accepted: true,
    ...payload,
  })
}

export const getFeedback = async (answerId) => {
  await delay(1200)
  const score = Math.floor(Math.random() * 35) + 60
  return createResponse({
    answerId,
    score,
    strengths: ['Good structure', 'Relevant example', 'Confident pacing'],
    improvements: ['Reduce filler words', 'Tighten opening sentence'],
    sampleAnswer:
      'Use STAR: frame the context, your specific action, and measurable result in under two minutes.',
  })
}

export const getReport = async (sessionId) => {
  await delay(700)
  return createResponse({
    sessionId,
    overallScore: 78,
    metrics: { clarity: 76, relevance: 81, confidence: 75, structure: 80, delivery: 74 },
  })
}

export const getAllReports = async () => {
  await delay(500)
  return createResponse({ reports: [] })
}

export default api
