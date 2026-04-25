// ── Filler words ─────────────────────────────────────────────────────────────
const FILLERS = [
  'um', 'uh', 'like', 'you know', 'basically', 'literally',
  'sort of', 'kind of', 'i mean', 'right', 'so', 'well',
  'actually', 'honestly', 'obviously', 'clearly',
]

/**
 * Detect filler words in a transcript.
 * @param {string} text
 * @returns {{ word: string; count: number; indices: number[] }[]}
 */
export function detectFillers(text) {
  const lower = text.toLowerCase()
  const results = []

  for (const filler of FILLERS) {
    const regex = new RegExp(`\\b${filler}\\b`, 'gi')
    const matches = [...lower.matchAll(regex)]
    if (matches.length > 0) {
      results.push({
        word: filler,
        count: matches.length,
        indices: matches.map((m) => m.index),
      })
    }
  }

  return results.sort((a, b) => b.count - a.count)
}

/**
 * Calculate words per minute.
 * @param {string} text
 * @param {number} durationSeconds
 * @returns {number}
 */
export function calcWPM(text, durationSeconds) {
  if (!durationSeconds || durationSeconds <= 0) return 0
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length
  return Math.round((wordCount / durationSeconds) * 60)
}

/**
 * Rate WPM — returns a label and color key.
 * @param {number} wpm
 * @returns {{ label: string; status: 'slow'|'good'|'fast' }}
 */
export function rateWPM(wpm) {
  if (wpm < 100) return { label: 'Too slow', status: 'slow' }
  if (wpm <= 160) return { label: 'Great pace', status: 'good' }
  return { label: 'Too fast', status: 'fast' }
}

/**
 * Get overall delivery score (0–100) based on filler ratio and WPM.
 * @param {string} text
 * @param {number} durationSeconds
 * @returns {number}
 */
export function deliveryScore(text, durationSeconds) {
  const words = text.trim().split(/\s+/).filter(Boolean)
  const totalWords = words.length || 1
  const fillers = detectFillers(text)
  const fillerCount = fillers.reduce((sum, f) => sum + f.count, 0)
  const fillerRatio = fillerCount / totalWords

  const wpm = calcWPM(text, durationSeconds)
  const wpmScore = wpm >= 100 && wpm <= 160 ? 100 : wpm < 100 ? (wpm / 100) * 100 : Math.max(0, 100 - (wpm - 160))

  const fillerScore = Math.max(0, 100 - fillerRatio * 300)

  return Math.round(wpmScore * 0.5 + fillerScore * 0.5)
}
