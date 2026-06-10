import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, X, Send, Sparkles, ChevronDown, Trash2, Volume2, Globe } from 'lucide-react'
import { aiAPI } from '../services/api'

type Language = 'en' | 'ur' | 'hi' | 'pa' | 'ps' | 'sd'

interface Message {
  id: number
  role: 'user' | 'ai'
  text: string
  time: string
  translations?: Record<Language, string>
}

const QUICK_CHIPS = [
  '💰 How can I save more money?',
  '📊 Where am I spending the most?',
  '🔮 What is next month’s forecast?',
  '⚠️ Am I overspending this month?',
  '🏆 What is my health score?',
  '📋 Give me this month’s summary',
  '🎯 Help me plan a savings goal',
  '📈 Give me investment advice',
]

const LANGUAGE_NAMES: Record<Language, string> = {
  en: 'English',
  ur: 'اردو',
  hi: 'हिन्दी',
  pa: 'ਪੰਜਾਬੀ',
  ps: 'پشتو',
  sd: 'سندھی',
}

const TRANSLATIONS: Record<Language, any> = {
  en: {
    title: 'AI Finance Assistant',
    subtitle: 'Scikit-Learn · Real-time data',
    placeholder: 'Ask your question...',
    initial: '👋 Hi! I\'m your AI Finance Assistant.\n\nAsk me anything about your spending, savings, or predictions. Try one of the quick questions below!',
    powered: 'Powered by your real financial data',
    error: '⚠️ Could not reach AI service. Make sure the backend is running.',
    listen: 'Listen',
    speaking: 'Speaking...',
  },
  ur: {
    title: 'AI مالیاتی مددگار',
    subtitle: 'Scikit-Learn · ریئل ٹائم ڈیٹا',
    placeholder: 'اپنا سوال پوچھیں...',
    initial: '👋 السلام علیکم! میں آپ کا AI مالیاتی مددگار ہوں۔\n\nاپنے خرچ، بچت یا پیشن گوئیوں کے بارے میں مجھ سے کچھ بھی پوچھیں۔',
    powered: 'آپ کے حقیقی مالیاتی ڈیٹا سے چلتا ہے',
    error: '⚠️ AI سروس تک نہیں پہنچ سکے۔ براہ کرم پھر سے کوشش کریں۔',
    listen: 'سنو',
    speaking: 'بول رہے ہیں...',
  },
  hi: {
    title: 'AI वित्त सहायक',
    subtitle: 'Scikit-Learn · रीयल-टाइम डेटा',
    placeholder: 'अपना सवाल पूछें...',
    initial: '👋 नमस्ते! मैं आपका AI वित्त सहायक हूं।\n\nअपने खर्च, बचत या भविष्यवाणियों के बारे में मुझसे कुछ भी पूछें।',
    powered: 'आपके वास्तविक वित्तीय डेटा द्वारा संचालित',
    error: '⚠️ AI सेवा तक नहीं पहुंच सकते। कृपया पुनः प्रयास करें।',
    listen: 'सुनो',
    speaking: 'बोल रहे हैं...',
  },
  pa: {
    title: 'AI ਵਿੱਤੀ ਸਹਾਇਕ',
    subtitle: 'Scikit-Learn · ਰੀਅਲ-ਟਾਈਮ ਡੇਟਾ',
    placeholder: 'ਆਪਣਾ ਸਵਾਲ ਪੁੱਛੋ...',
    initial: '👋 ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਤੁਹਾਡਾ AI ਵਿੱਤੀ ਸਹਾਇਕ ਹਾਂ।\n\nਆਪਣੇ ਖਰਚ, ਬਚਤ ਜਾਂ ਭਵਿਸ਼ਯਵਾਣੀਆਂ ਬਾਰੇ ਮੇਰੇ ਨਾਲ ਕੁਝ ਵੀ ਪੁੱਛੋ।',
    powered: 'ਆਪਣੇ ਅਸਲ ਵਿੱਤੀ ਡੇਟਾ ਦੁਆਰਾ ਸਮਰਥਿਤ',
    error: '⚠️ AI ਸੇਵਾ ਤਕ ਨਹੀਂ ਪਹੁੰਚ ਸਕਦਾ। ਮੁਹਰਬਾਨੀ ਕਰਕੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।',
    listen: 'ਸੁਨੋ',
    speaking: 'ਬੋਲ ਰਹੇ ਹੋ...',
  },
  ps: {
    title: 'AI مالي مددگار',
    subtitle: 'Scikit-Learn · بیلبیل وقت ډیټا',
    placeholder: 'ستاسو پوښتنه پوچحول کړئ...',
    initial: '👋 السلام علیکم! زه ستاسو AI مالي مددگار یم۔\n\nزما څخه د خرج، بچت یا وړاندویني په اړه هر شی پوچحول کړئ۔',
    powered: 'ستاسو واقعي مالي ڈیټا لخوا چلول',
    error: '⚠️ AI سروس ته نشو رسیدلی. براہ کرم دوبارہ کوشش کړئ۔',
    listen: 'واورو',
    speaking: 'وایل...',
  },
  sd: {
    title: 'AI مالياتي مددگار',
    subtitle: 'Scikit-Learn · حقيقي وقت ڊيٽا',
    placeholder: 'پنھنجو سوال پڇو...',
    initial: '👋 السلام علیکم! مان توھان جي AI مالياتي مددگار آھيان۔\n\nپنھنجي خرچ، بچت يا پيشنگوئيين جي باره ۾ مجھ کان سوال پڇو۔',
    powered: 'توھان جي حقيقي مالياتي ڊيٽا کان چلايل آھي',
    error: '⚠️ AI سروس تائين نہ پهچ سگو. برائے مھربانی ٻيهر ڪوشش ڪريو۔',
    listen: 'ٻڌو',
    speaking: 'ڳالهائي رھيا آھي...',
  },
}

const LANGUAGE_CODES: Record<Language, string> = {
  en: 'en-US',
  ur: 'ur-PK',
  hi: 'hi-IN',
  pa: 'pa-IN',
  ps: 'ps-AF',
  sd: 'sd-PK',
}

function speakText(text: string, language: Language, onEnd?: () => void) {
  if (!('speechSynthesis' in window)) {
    console.error('Speech Synthesis not supported')
    return
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel()

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = LANGUAGE_CODES[language] || 'en-US'
  utterance.rate = 0.85
  utterance.pitch = 1.0
  utterance.volume = 1.0

  if (onEnd) {
    utterance.onend = onEnd
  }

  window.speechSynthesis.speak(utterance)
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

function MessageBubble({ msg, language }: { msg: Message; language: Language }) {
  const isUser = msg.role === 'user'
  const [speaking, setSpeaking] = useState(false)

  const handleSpeak = () => {
    if (speaking) {
      window.speechSynthesis.cancel()
      setSpeaking(false)
    } else {
      setSpeaking(true)
      const text = msg.translations?.[language] || msg.text
      speakText(text, language, () => setSpeaking(false))
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.22 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-2 group`}
    >
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0 mr-2 mt-0.5 shadow-md shadow-primary/30">
          <Brain size={13} className="text-white" />
        </div>
      )}
      <div className={`max-w-[100%] sm:max-w-[80%] ${isUser ? 'items-end' : 'items-start'} flex flex-col relative`}>
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
        {!isUser && (
          <button
            onClick={handleSpeak}
            className={`mt-1.5 text-[10px] px-2 py-1 rounded-lg flex items-center gap-1 transition-all ${
              speaking
                ? 'bg-primary/30 text-primary'
                : 'bg-white/5 text-white/40 hover:bg-primary/20 hover:text-primary'
            }`}
          >
            <Volume2 size={11} />
            {speaking ? TRANSLATIONS[language].speaking : TRANSLATIONS[language].listen}
          </button>
        )}
      </div>
    </motion.div>
  )
}


const LANGUAGE_ORDER: Language[] = ['en', 'ur', 'hi', 'pa', 'ps', 'sd']

export default function AIChatBot() {
  const [open, setOpen]              = useState(false)
  const [language, setLanguage]      = useState<Language>('en')
  const [showLangMenu, setShowLangMenu] = useState(false)
  const [input, setInput]            = useState('')
  const [messages, setMessages]      = useState<Message[]>(() => {
    const trans = TRANSLATIONS['en']
    const translations: Record<Language, string> = {
      en: TRANSLATIONS.en.initial,
      ur: TRANSLATIONS.ur.initial,
      hi: TRANSLATIONS.hi.initial,
      pa: TRANSLATIONS.pa.initial,
      ps: TRANSLATIONS.ps.initial,
      sd: TRANSLATIONS.sd.initial,
    }
    return [{ id: 0, role: 'ai', text: trans.initial, time: now(), translations }]
  })
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
    const trans = TRANSLATIONS[language]
    const translations: Record<Language, string> = {
      en: TRANSLATIONS.en.initial,
      ur: TRANSLATIONS.ur.initial,
      hi: TRANSLATIONS.hi.initial,
      pa: TRANSLATIONS.pa.initial,
      ps: TRANSLATIONS.ps.initial,
      sd: TRANSLATIONS.sd.initial,
    }
    setMessages([{ id: 0, role: 'ai', text: trans.initial, time: now(), translations }])
    nextId.current = 1
  }

  function toggleLanguage() {
    const currentIndex = LANGUAGE_ORDER.indexOf(language)
    const nextIndex = (currentIndex + 1) % LANGUAGE_ORDER.length
    const newLang = LANGUAGE_ORDER[nextIndex]
    setLanguage(newLang)
    setShowLangMenu(false)
    clearChat()
  }

  function selectLanguage(lang: Language) {
    setLanguage(lang)
    setShowLangMenu(false)
    clearChat()
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
      const responseText = res.data.response || TRANSLATIONS[language].error
      const aiMsg: Message = {
        id: nextId.current++,
        role: 'ai',
        text: responseText,
        time: now(),
        translations: {
          en: responseText,
          ur: responseText,
          hi: responseText,
          pa: responseText,
          ps: responseText,
          sd: responseText,
        },
      }
      setMessages(prev => [...prev, aiMsg])
      if (!open) setUnread(u => u + 1)
    } catch {
      const errorMsg = TRANSLATIONS[language].error
      setMessages(prev => [
        ...prev,
        {
          id: nextId.current++,
          role: 'ai',
          text: errorMsg,
          time: now(),
          translations: {
            en: TRANSLATIONS.en.error,
            ur: TRANSLATIONS.ur.error,
            hi: TRANSLATIONS.hi.error,
            pa: TRANSLATIONS.pa.error,
            ps: TRANSLATIONS.ps.error,
            sd: TRANSLATIONS.sd.error,
          },
        },
      ])
    } finally {
      setTyping(false)
    }
  }

  const trans = TRANSLATIONS[language]

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
            className="fixed bottom-24 right-5 left-5 sm:left-auto rounded-2xl border border-white/[0.08] shadow-2xl shadow-black/70 z-50 flex flex-col overflow-hidden"
            style={{ maxWidth: '370px', minWidth: '280px', height: 'min(92vh, 540px)', background: 'linear-gradient(180deg, #0c0c1a 0%, #080810 100%)' }}
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
                  <p className="font-bold text-sm text-white leading-tight">{trans.title}</p>
                  <p className="text-[10px] text-white/40">{LANGUAGE_NAMES[language]}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 relative">
                <div className="relative">
                  <button
                    onClick={() => setShowLangMenu(!showLangMenu)}
                    title="Select language"
                    className="text-[9px] px-2.5 py-1.5 rounded-lg bg-white/[0.06] hover:bg-primary/20 text-white/70 hover:text-primary transition-all font-semibold flex items-center gap-1.5"
                  >
                    <Globe size={12} />
                    {LANGUAGE_NAMES[language]}
                  </button>
                  <AnimatePresence>
                    {showLangMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full right-0 mt-1 bg-[#0c0c1a] border border-white/[0.12] rounded-lg shadow-xl z-50"
                        style={{ minWidth: '140px' }}
                      >
                        {LANGUAGE_ORDER.map((lang) => (
                          <button
                            key={lang}
                            onClick={() => selectLanguage(lang)}
                            className={`w-full text-left px-3 py-2 text-[11px] transition-all flex items-center gap-2 ${
                              language === lang
                                ? 'bg-primary/30 text-primary font-semibold'
                                : 'text-white/70 hover:bg-white/[0.08] hover:text-white'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full transition-all ${
                              language === lang ? 'bg-primary' : 'bg-white/20'
                            }`} />
                            {LANGUAGE_NAMES[lang]}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
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
              {messages.map(msg => <MessageBubble key={msg.id} msg={msg} language={language} />)}
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
              <div className="flex flex-wrap gap-1.5 overflow-x-auto scrollbar-none pb-0.5" style={{ scrollbarWidth: 'none' }}>
                {QUICK_CHIPS.map((chip, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(chip)}
                    disabled={typing}
                    className="flex-shrink-0 min-w-[120px] text-[10px] px-2.5 py-1.5 rounded-xl border border-primary/25 text-primary/80 hover:bg-primary/10 hover:border-primary/50 transition-all disabled:opacity-40"
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
                  placeholder={trans.placeholder}
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
              <p className="text-center text-white/15 text-[9px] mt-1.5">{trans.powered}</p>
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

