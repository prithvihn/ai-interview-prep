const PREFIX = 'ai_interview_'

export const storage = {
  get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(PREFIX + key)
      return raw !== null ? JSON.parse(raw) : fallback
    } catch {
      return fallback
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value))
    } catch (e) {
      console.error('storage.set failed', e)
    }
  },

  remove(key) {
    localStorage.removeItem(PREFIX + key)
  },

  clear() {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(PREFIX))
      .forEach((k) => localStorage.removeItem(k))
  },
}

// ── Typed helpers ────────────────────────────────────────────────────────────
export const session = {
  get: () => storage.get('session'),
  set: (s) => storage.set('session', s),
  clear: () => storage.remove('session'),
}

export const resume = {
  get: () => storage.get('resume'),
  set: (r) => storage.set('resume', r),
  clear: () => storage.remove('resume'),
}

export const reports = {
  getAll: () => storage.get('reports', []),
  add(report) {
    const all = reports.getAll()
    all.unshift({ ...report, savedAt: Date.now() })
    storage.set('reports', all.slice(0, 20)) // keep last 20
  },
  clear: () => storage.remove('reports'),
}
