import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, X, Send, Sparkles, ChevronDown } from 'lucide-react'
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
      <div className={`max-w-[78%] ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        <div
          className={`px-3 py-2.5 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
            isUser
              ? 'bg-gradient-to-br from-primary to-secondary text-white rounded-br-sm'
              : 'glass border border-white/8 text-white/85 rounded-bl-sm'
          }`}
        >
          {msg.text}
        </div>
        <p className="text-white/20 text-[9px] mt-1 px-1">{msg.time}</p>
      </div>
    </motion.div>
  )
}

export default function AIChatBot() {
  const [open, setOpen]           = useState(false)
  const [input, setInput]         = useState('')
  const [messages, setMessages]   = useState<Message[]>([
    {
      id: 0,
      role: 'ai',
      text: '👋 Hi! I\'m your AI Finance Assistant.\n\nAsk me anything about your spending, savings, or predictions. Try one of the quick questions below!',
      time: now(),
    },
  ])
  const [typing, setTyping]       = useState(false)
  const [unread, setUnread]       = useState(0)
  const bottomRef                 = useRef<HTMLDivElement>(null)
  const inputRef                  = useRef<HTMLInputElement>(null)
  const nextId                    = useRef(1)

  function now() {
    return new Date().toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' })
  }

  useEffect(() => {
    if (open) {
      setUnread(0)
      setTimeout(() => inputRef.current?.focus(), 200)
    }
  }, [open])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

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
            className="fixed bottom-24 right-5 w-80 rounded-2xl border border-white/10 shadow-2xl shadow-black/60 z-50 flex flex-col overflow-hidden"
            style={{ height: '480px', background: '#0a1220' }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3 flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.18), rgba(139,92,246,0.12))' }}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/30">
                  <Brain size={15} className="text-white" />
                </div>
                <div>
                  <p className="font-bold text-sm text-white">AI Finance Assistant</p>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                    <p className="text-[10px] text-white/40">Powered by ML · Scikit-Learn</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-7 h-7 rounded-lg bg-white/6 hover:bg-white/12 flex items-center justify-center transition-colors"
              >
                <ChevronDown size={14} className="text-white/50" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
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
                  <div className="glass border border-white/8 rounded-2xl rounded-bl-sm">
                    <TypingDots />
                  </div>
                </motion.div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Quick chips */}
            <div className="px-3 pb-2 flex flex-wrap gap-1.5">
              {QUICK_CHIPS.map((chip, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(chip)}
                  disabled={typing}
                  className="text-[10px] px-2.5 py-1.5 rounded-xl glass border border-primary/20 text-primary/80 hover:bg-primary/10 hover:border-primary/40 transition-all disabled:opacity-40"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="flex-shrink-0 px-3 pb-3 pt-1 border-t border-white/6">
              <div className="flex items-center gap-2 glass rounded-xl border border-white/8 px-3 py-2">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
                  placeholder="Ask about your finances..."
                  className="flex-1 bg-transparent text-xs text-white placeholder-white/25 outline-none"
                />
                <button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || typing}
                  className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0 disabled:opacity-30 hover:shadow-md hover:shadow-primary/30 transition-all"
                >
                  <Send size={12} className="text-white" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Floating Button (WhatsApp style) ── */}
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
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-danger text-white text-[10px] font-black flex items-center justify-center border-2 border-[#070e1a]"
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
