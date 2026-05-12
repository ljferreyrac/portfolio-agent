const API_BASE = import.meta.env.VITE_API_URL ?? '/api'

export interface Message {
  role: 'user' | 'assistant'
  content: string
  isError?: boolean
}

export interface CategoryScore {
  name: string
  score: number
}

export interface ScoreResult {
  score: number
  verdict: 'Strong Match' | 'Good Fit' | 'Partial Fit' | 'Not a Match'
  summary: string
  categories: CategoryScore[]
  matched: string[]
  gaps: string[]
}

// ── Session ────────────────────────────────────────────────────────────────────

export async function createSession(): Promise<string> {
  const res = await fetch(`${API_BASE}/session`, { method: 'POST' })
  if (!res.ok) throw new Error('Could not create session')
  const data = await res.json() as { session_id: string }
  return data.session_id
}

export function closeSession(sessionId: string): void {
  // sendBeacon is fire-and-forget, guaranteed to complete even mid-tab-close
  navigator.sendBeacon(`${API_BASE}/session/${sessionId}/close`)
}

export async function pingSession(sessionId: string): Promise<void> {
  await fetch(`${API_BASE}/session/${sessionId}/ping`, { method: 'POST' })
}

// ── Chat ───────────────────────────────────────────────────────────────────────

export async function sendMessage(message: string, sessionId: string): Promise<string> {
  const res = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Session-ID': sessionId },
    body: JSON.stringify({ message }),
  })

  if (res.status === 404) throw new SessionExpiredError()
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { detail?: string }).detail ?? `Error ${res.status}`)
  }

  const data = await res.json() as { reply: string }
  return data.reply
}

// ── Analyze ────────────────────────────────────────────────────────────────────

export async function analyzeJob(file: File, sessionId: string): Promise<ScoreResult> {
  const form = new FormData()
  form.append('file', file)

  const res = await fetch(`${API_BASE}/analyze`, {
    method: 'POST',
    headers: { 'X-Session-ID': sessionId },
    body: form,
  })

  if (res.status === 404) throw new SessionExpiredError()
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { detail?: string }).detail ?? `Error ${res.status}`)
  }

  return res.json() as Promise<ScoreResult>
}

// ── Errors ─────────────────────────────────────────────────────────────────────

export class SessionExpiredError extends Error {
  constructor() {
    super('Session expired')
    this.name = 'SessionExpiredError'
  }
}
