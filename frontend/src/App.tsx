import { useEffect, useRef, useState } from 'react'
import { Github, ExternalLink } from 'lucide-react'
import Chat from './components/Chat'
import JobAnalyzer from './components/JobAnalyzer'
import ScoreCard from './components/ScoreCard'
import { sendMessage, analyzeJob, createSession, closeSession, pingSession, SessionExpiredError } from './api'
import type { Message, ScoreResult } from './api'

const SESSION_KEY = 'path_pilot_session_id'
const HEARTBEAT_MS = 4 * 60 * 1000 // 4 minutes

export default function App() {
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [sessionReady, setSessionReady] = useState(false)
  const sessionRef = useRef<string | null>(null) // stable ref for event listeners

  const [messages, setMessages] = useState<Message[]>([])
  const [chatLoading, setChatLoading] = useState(false)

  const [jdFile, setJdFile] = useState<File | null>(null)
  const [jdFileName, setJdFileName] = useState<string | null>(null)
  const [analyzeLoading, setAnalyzeLoading] = useState(false)
  const [analyzeError, setAnalyzeError] = useState<string | null>(null)
  const [score, setScore] = useState<ScoreResult | null>(null)

  // ── Session init ─────────────────────────────────────────────────────────────

  useEffect(() => {
    const init = async () => {
      let sid = sessionStorage.getItem(SESSION_KEY)
      if (!sid) {
        sid = await createSession()
        sessionStorage.setItem(SESSION_KEY, sid)
      }
      setSessionId(sid)
      sessionRef.current = sid
      setSessionReady(true)
    }
    init().catch(() => {
      // retry once on failure
      createSession().then((sid) => {
        sessionStorage.setItem(SESSION_KEY, sid)
        setSessionId(sid)
        sessionRef.current = sid
        setSessionReady(true)
      })
    })
  }, [])

  // ── Heartbeat — keeps idle tab sessions alive ────────────────────────────────

  useEffect(() => {
    if (!sessionId) return
    const id = setInterval(() => {
      pingSession(sessionId).catch(() => {})
    }, HEARTBEAT_MS)
    return () => clearInterval(id)
  }, [sessionId])

  // ── beforeunload — immediate cleanup on tab close ─────────────────────────────

  useEffect(() => {
    const handleUnload = () => {
      if (sessionRef.current) closeSession(sessionRef.current)
    }
    window.addEventListener('beforeunload', handleUnload)
    return () => window.removeEventListener('beforeunload', handleUnload)
  }, [])

  // ── Session recovery — auto-create new session if expired ────────────────────

  const recoverSession = async (): Promise<string> => {
    const sid = await createSession()
    sessionStorage.setItem(SESSION_KEY, sid)
    setSessionId(sid)
    sessionRef.current = sid
    // Clear all local state — the new session is empty
    setMessages([])
    setJdFile(null)
    setJdFileName(null)
    setScore(null)
    setSessionReady(true)
    return sid
  }

  // ── Chat ─────────────────────────────────────────────────────────────────────

  const handleSend = async (text: string) => {
    if (!sessionId) return
    const userMsg: Message = { role: 'user', content: text }
    setMessages((prev) => [...prev, userMsg])
    setChatLoading(true)
    try {
      const reply = await sendMessage(text, sessionId)
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }])
    } catch (err) {
      if (err instanceof SessionExpiredError) {
        const newSid = await recoverSession()
        // Retry once with the new session
        try {
          const reply = await sendMessage(text, newSid)
          setMessages((prev) => [...prev, { role: 'assistant', content: reply }])
        } catch {
          setMessages((prev) => [...prev, { role: 'assistant', content: 'Something went wrong — please try again', isError: true }])
        }
      } else {
        const msg = err instanceof Error ? err.message : 'Something went wrong'
        setMessages((prev) => [...prev, { role: 'assistant', content: msg, isError: true }])
      }
    } finally {
      setChatLoading(false)
    }
  }

  // ── Job analyzer ─────────────────────────────────────────────────────────────

  const handleFileSelect = (file: File) => {
    setJdFile(file)
    setJdFileName(file.name)
    setScore(null)
    setAnalyzeError(null)
  }

  const handleClearFile = () => {
    setJdFile(null)
    setJdFileName(null)
    setScore(null)
    setAnalyzeError(null)
  }

  const handleGenerateScore = async () => {
    if (!jdFile || !sessionId) return
    setAnalyzeLoading(true)
    setAnalyzeError(null)
    setScore(null)
    // New JD = fresh conversation — clear messages to avoid confusion
    setMessages([])
    try {
      const result = await analyzeJob(jdFile, sessionId)
      setScore(result)
    } catch (err) {
      if (err instanceof SessionExpiredError) {
        const newSid = await recoverSession()
        try {
          const result = await analyzeJob(jdFile, newSid)
          setScore(result)
        } catch {
          setAnalyzeError('Something went wrong — please try again')
        }
      } else {
        setAnalyzeError(err instanceof Error ? err.message : 'Analysis failed — please try again')
      }
    } finally {
      setAnalyzeLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="flex-shrink-0 flex items-center justify-between px-6 py-3 border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
            <span className="text-white font-bold text-sm">P</span>
          </div>
          <div>
            <p className="font-semibold text-slate-100 text-sm leading-none">PathPilot Demo</p>
            <p className="text-xs text-slate-500 mt-0.5">Leonardo Ferreyra · AI Portfolio</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="https://github.com/ljferreyrac"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all"
          >
            <Github size={14} />
            GitHub
          </a>
          <a
            href="https://www.linkedin.com/in/leonardo-ferreyra-ljfc"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all"
          >
            <ExternalLink size={14} />
            LinkedIn
          </a>
        </div>
      </header>

      {/* Main layout */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Left — Chat */}
        <div className="flex-1 flex flex-col min-w-0 border-r border-slate-800">
          <Chat messages={messages} loading={chatLoading} onSend={handleSend} disabled={!sessionReady} />
        </div>

        {/* Right — Job analyzer */}
        <div className="w-80 xl:w-96 flex-shrink-0 flex flex-col overflow-y-auto bg-slate-950">
          <div className="p-5 space-y-5">
            <JobAnalyzer
              fileName={jdFileName}
              analyzing={analyzeLoading}
              hasScore={score !== null}
              error={analyzeError}
              onFileSelect={handleFileSelect}
              onClearFile={handleClearFile}
              onGenerateScore={handleGenerateScore}
            />

            {score && (
              <div className="border-t border-slate-800 pt-5">
                <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">
                  Match Analysis
                </h2>
                <ScoreCard result={score} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
