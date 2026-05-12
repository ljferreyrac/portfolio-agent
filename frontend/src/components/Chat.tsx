import { useEffect, useRef, useState } from 'react'
import { Send, Bot, User, Loader2 } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Message } from '../api'

interface Props {
  messages: Message[]
  loading: boolean
  disabled: boolean
  onSend: (text: string) => void
}

const SUGGESTIONS = [
  "What's your experience with AI agents?",
  'Tell me about your most recent project',
  'What cloud platforms have you worked with?',
  'How do you approach system design?',
]

export default function Chat({ messages, loading, disabled, onSend }: Props) {
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const handleSubmit = () => {
    const text = input.trim()
    if (!text || loading || disabled) return
    setInput('')
    onSend(text)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in">
            <div className="w-14 h-14 rounded-2xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center mb-4">
              <Bot size={28} className="text-brand-400" />
            </div>
            <p className="text-slate-300 font-medium mb-1">Ask me anything</p>
            <p className="text-slate-500 text-sm mb-6">
              I'm Leonardo's AI assistant — explore my background and experience
            </p>
            <div className="grid grid-cols-1 gap-2 w-full max-w-xs">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => { if (!disabled) onSend(s) }}
                  disabled={disabled}
                  className="text-left text-sm px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:border-brand-500/50 hover:text-slate-100 hover:bg-slate-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-3 animate-slide-up ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div
              className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                msg.role === 'user'
                  ? 'bg-brand-500/20 border border-brand-500/30'
                  : 'bg-slate-700 border border-slate-600'
              }`}
            >
              {msg.role === 'user' ? (
                <User size={14} className="text-brand-400" />
              ) : (
                <Bot size={14} className="text-slate-300" />
              )}
            </div>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-brand-500/20 border border-brand-500/30 text-slate-100 rounded-tr-sm'
                  : msg.isError
                  ? 'bg-red-500/10 border border-red-500/30 text-red-300 rounded-tl-sm'
                  : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-tl-sm'
              }`}
            >
              {msg.role === 'assistant' && !msg.isError ? (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                    ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                    li: ({ children }) => <li className="text-slate-200">{children}</li>,
                    strong: ({ children }) => <strong className="text-slate-100 font-semibold">{children}</strong>,
                    em: ({ children }) => <em className="text-slate-300 italic">{children}</em>,
                    h1: ({ children }) => <h1 className="text-base font-bold text-slate-100 mb-2 mt-1">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-sm font-bold text-slate-100 mb-2 mt-1">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-sm font-semibold text-slate-200 mb-1 mt-1">{children}</h3>,
                    code: ({ children }) => <code className="bg-slate-700 text-slate-200 rounded px-1 py-0.5 text-xs font-mono">{children}</code>,
                    blockquote: ({ children }) => <blockquote className="border-l-2 border-slate-600 pl-3 text-slate-400 italic mb-2">{children}</blockquote>,
                    table: ({ children }) => (
                      <div className="overflow-x-auto mb-2">
                        <table className="w-full text-xs border-collapse">{children}</table>
                      </div>
                    ),
                    thead: ({ children }) => <thead className="border-b border-slate-600">{children}</thead>,
                    tbody: ({ children }) => <tbody>{children}</tbody>,
                    tr: ({ children }) => <tr className="border-b border-slate-700/50 last:border-0">{children}</tr>,
                    th: ({ children }) => <th className="text-left py-1.5 pr-4 font-semibold text-slate-300">{children}</th>,
                    td: ({ children }) => <td className="py-1.5 pr-4 text-slate-300">{children}</td>,
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 animate-fade-in">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center">
              <Bot size={14} className="text-slate-300" />
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-tl-sm px-4 py-3">
              <Loader2 size={16} className="text-brand-400 animate-spin" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-slate-800">
        <div className="flex gap-2 items-end bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 focus-within:border-brand-500/60 transition-colors">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value.slice(0, 1000))}
            onKeyDown={handleKeyDown}
            placeholder={disabled ? 'Connecting...' : 'Ask about my experience, projects, skills...'}
            disabled={disabled}
            rows={1}
            className="flex-1 bg-transparent text-sm text-slate-100 placeholder-slate-500 resize-none focus:outline-none max-h-32 disabled:opacity-50"
            style={{ minHeight: '24px' }}
          />
          <button
            onClick={handleSubmit}
            disabled={!input.trim() || loading || disabled}
            className="flex-shrink-0 w-8 h-8 rounded-lg bg-brand-500 hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
          >
            <Send size={14} className="text-white" />
          </button>
        </div>
        <p className="text-slate-600 text-xs mt-1.5 text-right">{input.length}/1000</p>
      </div>
    </div>
  )
}
