import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, X, Send, Sparkles, ChevronDown, Trash2 } from 'lucide-react'
import { aiAPI } from '../services/api'

interface Message {
  id: number
  role: 'user' | 'ai'
  text: string
  time: string
}

const QUICK_CHIPS = [
  '💰 Paisa kaise bachayein?',
  '📊 Sabse zyada kahan kharcha hai?',
  '🔮 Aglay mahine ka forecast?',
  '⚠️ Kya main overspend kar raha hoon?',
  '🏆 Mera health score kya hai?',
  '📋 Is mahine ki summary do',
  '🎯 Savings goal plan karo',
  '📈 Investment advice do',
]

const INITIAL_MESSAGE: Message = {
  id: 0,
  role: 'ai',
  text: '👋 Hi! I\'m your AI Finance Assistant.\n\nAsk me anything about your spending, savings, or predictions. Try one of the quick questions below!',
  time: '',
}

function now() {
  return new Date().toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' })
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          className="w-2 h-2 rounded-full bg-primary/60"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>
  )
}

// Render **bold**, _italic_, • bullets, and line breaks
function RichText({ text }: { text: string }) {
  const lines = text.split('\n')
  return (
    <>
      {lines.map((line, i) => {
        const isBullet = line.startsWith('• ') || line.startsWith('- ')
        const content = isBullet ? line.slice(2) : line

        // Parse **bold** and _italic_ inline
        const tokens = content.split(/(\*\*[^*]+\*\*|_[^_]+_)/g)
        const rendered = tokens.map((tok, j) => {
          if (tok.startsWith('**') && tok.endsWith('**'))
            return <strong key={j} className="font-bold text-white">{tok.slice(2, -2)}</strong>
          if (tok.startsWith('_') && tok.endsWith('_'))
            return <em key={j} className="italic text-white/60">{tok.slice(1, -1)}</em>
          return <span key={j}>{tok}</span>
        })

        return (
          <span key={i}>
            {isBullet && <span className="text-primary mr-1.5">•</span>}
            {rendered}
            {i < lines.length - 1 && <br />}
          </span>
        )
      })}
    </>
  )
}

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === 'user'
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.22 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-2`}
    >
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0 mr-2 mt-0.5 shadow-md shadow-primary/30">
          <Brain size={13} className="text-white" />
        </div>
      )}
      <div className={`max-w-[80%] ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        <div
          className={`px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${
            isUser
              ? 'bg-gradient-to-br from-primary to-secondary text-white rounded-br-sm'
              : 'bg-white/[0.06] border border-white/10 text-white/85 rounded-bl-sm'
          }`}
        >
          {isUser ? msg.text : <RichText text={msg.text} />}
        </div>
        {msg.time && <p className="text-white/20 text-[9px] mt-1 px-1">{msg.time}</p>}
      </div>
    </motion.div>
  )
}

export default function AIChatBot() {
  const [open, setOpen]         = useState(false)
  const [input, setInput]       = useState('')
  const [messages, setMessages] = useState<Message[]>([
    { ...INITIAL_MESSAGE, time: now() },
  ])
  const [typing, setTyping]     = useState(false)
  const [unread, setUnread]     = useState(0)
  const bottomRef               = useRef<HTMLDivElement>(null)
  const inputRef                = useRef<HTMLInputElement>(null)
  const nextId                  = useRef(1)

  useEffect(() => {
    if (open) {
      setUnread(0)
      setTimeout(() => inputRef.current?.focus(), 200)
    }
  }, [open])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  function clearChat() {
    setMessages([{ ...INITIAL_MESSAGE, time: now() }])
    nextId.current = 1
  }

  async function sendMessage(text: string) {
    const trimmed = text.trim()
    if (!trimmed || typing) return
    setInput('')

    const userMsg: Message = { id: nextId.current++, role: 'user', text: trimmed, time: now() }
    setMessages(prev => [...prev, userMsg])
    setTyping(true)

    try {
      const res = await aiAPI.chat(trimmed)
      const aiMsg: Message = {
        id: nextId.current++,
        role: 'ai',
        text: res.data.response || 'Sorry, I could not process that.',
        time: now(),
      }
      setMessages(prev => [...prev, aiMsg])
      if (!open) setUnread(u => u + 1)
    } catch {
      setMessages(prev => [
        ...prev,
        { id: nextId.current++, role: 'ai', text: '⚠️ Could not reach AI service. Make sure the backend is running.', time: now() },
      ])
    } finally {
      setTyping(false)
    }
  }

  return (
    <>
      {/* ── Chat Panel ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit  ={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="fixed bottom-24 right-5 rounded-2xl border border-white/[0.08] shadow-2xl shadow-black/70 z-50 flex flex-col overflow-hidden"
            style={{ width: '370px', height: '540px', background: 'linear-gradient(180deg, #0c0c1a 0%, #080810 100%)' }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3 flex-shrink-0 border-b border-white/[0.06]"
              style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.10))' }}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/30 relative">
                  <Brain size={16} className="text-white" />
                  <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#0c0c1a]" />
                </div>
                <div>
                  <p className="font-bold text-sm text-white leading-tight">AI Finance Assistant</p>
                  <p className="text-[10px] text-white/40">Scikit-Learn · Real-time data</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={clearChat}
                  title="Clear chat"
                  className="w-7 h-7 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] flex items-center justify-center transition-colors"
                >
                  <Trash2 size={12} className="text-white/40 hover:text-white/70" />
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="w-7 h-7 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] flex items-center justify-center transition-colors"
                >
                  <ChevronDown size={14} className="text-white/50" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              {messages.map(msg => <MessageBubble key={msg.id} msg={msg} />)}
              {typing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-start"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mr-2 flex-shrink-0 shadow-md shadow-primary/30">
                    <Brain size={13} className="text-white" />
                  </div>
                  <div className="bg-white/[0.06] border border-white/10 rounded-2xl rounded-bl-sm">
                    <TypingDots />
                  </div>
                </motion.div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Quick chips — horizontal scroll */}
            <div className="px-3 pb-2 flex-shrink-0">
              <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-0.5" style={{ scrollbarWidth: 'none' }}>
                {QUICK_CHIPS.map((chip, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(chip)}
                    disabled={typing}
                    className="flex-shrink-0 text-[10px] px-2.5 py-1.5 rounded-xl border border-primary/25 text-primary/80 hover:bg-primary/10 hover:border-primary/50 transition-all disabled:opacity-40 whitespace-nowrap"
                    style={{ background: 'rgba(99,102,241,0.05)' }}
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="flex-shrink-0 px-3 pb-3 pt-1 border-t border-white/[0.06]">
              <div className="flex items-center gap-2 rounded-xl border border-white/[0.10] px-3 py-2.5 transition-all focus-within:border-primary/40"
                style={{ background: 'rgba(255,255,255,0.04)' }}>
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
                  placeholder="Apna sawaal poochein..."
                  className="flex-1 bg-transparent text-xs text-white placeholder-white/25 outline-none"
                />
                <motion.button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || typing}
                  whileTap={{ scale: 0.9 }}
                  className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0 disabled:opacity-30 hover:shadow-md hover:shadow-primary/30 transition-all"
                >
                  <Send size={12} className="text-white" />
                </motion.button>
              </div>
              <p className="text-center text-white/15 text-[9px] mt-1.5">Powered by your real financial data</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Floating Button ── */}
      <motion.button
        onClick={() => setOpen(o => !o)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.93 }}
        className="fixed bottom-5 right-5 w-14 h-14 rounded-full shadow-2xl shadow-primary/40 flex items-center justify-center z-50"
        style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}
        title="AI Finance Assistant"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.18 }}>
              <X size={22} className="text-white" />
            </motion.div>
          ) : (
            <motion.div key="brain" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.18 }}>
              <Sparkles size={22} className="text-white" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Unread badge */}
        <AnimatePresence>
          {unread > 0 && !open && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center border-2 border-black"
            >
              {unread}
            </motion.span>
          )}
        </AnimatePresence>

        {/* Pulsing ring when closed */}
        {!open && (
          <span className="absolute inset-0 rounded-full border-2 border-primary/40 animate-ping" />
        )}
      </motion.button>
    </>
  )
}
