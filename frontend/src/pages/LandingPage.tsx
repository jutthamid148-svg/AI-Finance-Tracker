import { motion, useInView, useScroll, useTransform, AnimatePresence, useMotionValue, useSpring } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useRef, useState, useEffect, useCallback } from 'react'
import {
  TrendingUp, Brain, Target, BarChart3, Zap,
  ChevronRight, Star, Check, Menu, X, ArrowRight,
  PieChart, Bell, Lock, Smartphone, Sparkles,
  ShieldCheck, Globe, Activity, ChevronLeft,
} from 'lucide-react'
import ThemeToggle from '../components/ui/ThemeToggle'

// ── Animated counter ─────────────────────────────────────────────────────────
function useCounter(end: number, duration = 2200) {
  const [count, setCount] = useState(0)
  const started = useRef(false)
  useEffect(() => {
    if (started.current || end === 0) return
    started.current = true
    const t0 = Date.now()
    const id = setInterval(() => {
      const p = Math.min((Date.now() - t0) / duration, 1)
      setCount(Math.floor((1 - Math.pow(1 - p, 3)) * end))
      if (p === 1) clearInterval(id)
    }, 16)
    return () => clearInterval(id)
  }, [end, duration])
  return count
}

function StatCounter({ value, suffix, label, prefix = '' }: {
  value: number; suffix: string; label: string; prefix?: string
}) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  const n = useCounter(inView ? value : 0, 2200)
  return (
    <div ref={ref} className="text-center">
      <div className="text-4xl md:text-5xl font-black gradient-text tracking-tight">
        {prefix}{n.toLocaleString()}{suffix}
      </div>
      <div className="text-white/45 mt-2 text-sm">{label}</div>
    </div>
  )
}

// ── Floating particle ─────────────────────────────────────────────────────────
const FINANCE_SYMBOLS = ['₨', '%', '$', '📈', '💰', '📊', '🏦', '💹', '₨', '%', '📈', '💰']

function FloatingSymbol({ symbol, style, delay }: { symbol: string; style: React.CSSProperties; delay: number }) {
  return (
    <motion.div
      className="absolute pointer-events-none select-none font-bold"
      style={{ ...style, color: 'rgba(99,102,241,0.18)', fontSize: style.fontSize || '14px' }}
      animate={{ y: [0, -40, 0], opacity: [0.08, 0.22, 0.08], rotate: [-5, 5, -5] }}
      transition={{ duration: 6 + delay * 1.5, repeat: Infinity, ease: 'easeInOut', delay }}
    >
      {symbol}
    </motion.div>
  )
}

// ── Cursor glow ───────────────────────────────────────────────────────────────
function CursorGlow() {
  const x = useMotionValue(-200)
  const y = useMotionValue(-200)
  const sx = useSpring(x, { stiffness: 80, damping: 22 })
  const sy = useSpring(y, { stiffness: 80, damping: 22 })
  useEffect(() => {
    const move = (e: MouseEvent) => { x.set(e.clientX); y.set(e.clientY) }
    window.addEventListener('mousemove', move)
    return () => window.removeEventListener('mousemove', move)
  }, [x, y])
  return (
    <motion.div className="fixed pointer-events-none z-50 rounded-full"
      style={{ left: sx, top: sy, translateX: '-50%', translateY: '-50%', width: 320, height: 320,
        background: 'radial-gradient(circle, rgba(99,102,241,0.055) 0%, transparent 65%)' }} />
  )
}

// ── Testimonial Slider ────────────────────────────────────────────────────────
function TestimonialSlider() {
  const [active, setActive] = useState(0)
  const [direction, setDirection] = useState(1)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const items = [
    { name: 'Ahmed Raza',   role: 'Software Engineer, Lahore',   text: 'The AI insights are incredibly accurate. Saved Rs.30,000 extra in just two months! The spending predictions blow my mind every time.', rating: 5, initials: 'AR', color: 'from-blue-500 to-cyan-500' },
    { name: 'Fatima Khan',  role: 'Freelance Designer, Karachi', text: 'Finally an app that understands Pakistani finances. PKR-based tracking is perfect and the budget alerts saved me from overspending twice!', rating: 5, initials: 'FK', color: 'from-purple-500 to-pink-500' },
    { name: 'Bilal Hassan', role: 'Business Owner, Faisalabad',  text: 'Expense predictions are remarkably accurate. A game changer for business planning! The ML forecast for next quarter helped me plan hiring.', rating: 5, initials: 'BH', color: 'from-green-500 to-emerald-500' },
    { name: 'Sara Malik',   role: 'Doctor, Islamabad',           text: 'The visual reports are stunning. I can finally see where my money goes each month without spending hours on spreadsheets.', rating: 5, initials: 'SM', color: 'from-orange-500 to-red-500' },
    { name: 'Usman Tariq',  role: 'Student, FAST NUCES Lahore',  text: 'As a student managing pocket money, this app taught me financial discipline. The savings goal feature keeps me motivated every day!', rating: 5, initials: 'UT', color: 'from-teal-500 to-cyan-400' },
  ]
  const go = useCallback((dir: number) => {
    setDirection(dir)
    setActive(a => (a + dir + items.length) % items.length)
  }, [items.length])
  useEffect(() => {
    timerRef.current = setInterval(() => go(1), 4500)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [go])
  const restart = (dir: number) => {
    if (timerRef.current) clearInterval(timerRef.current)
    go(dir)
    timerRef.current = setInterval(() => go(1), 4500)
  }
  const variants = {
    enter: (d: number) => ({ opacity: 0, x: d > 0 ? 60 : -60, scale: 0.97 }),
    center: { opacity: 1, x: 0, scale: 1 },
    exit:  (d: number) => ({ opacity: 0, x: d > 0 ? -60 : 60, scale: 0.97 }),
  }
  const t = items[active]
  return (
    <div className="relative max-w-3xl mx-auto">
      <div className="absolute -top-8 -left-4 text-8xl text-primary/10 font-serif leading-none pointer-events-none select-none">"</div>
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div key={active} custom={direction} variants={variants} initial="enter" animate="center" exit="exit"
          transition={{ duration: 0.45, ease: 'easeInOut' }}
          className="relative rounded-3xl p-8 md:p-10"
          style={{ background: 'rgba(15,23,42,0.75)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)' }}>
          <div className={`absolute top-0 left-8 right-8 h-px bg-gradient-to-r ${t.color} opacity-50`} />
          <div className="flex gap-1 mb-5">
            {Array(t.rating).fill(0).map((_, j) => (
              <motion.div key={j} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: j * 0.06 }}>
                <Star size={15} className="text-warning fill-warning" />
              </motion.div>
            ))}
          </div>
          <p className="text-white/75 text-lg leading-relaxed mb-7 italic">"{t.text}"</p>
          <div className="flex items-center gap-4">
            <motion.div whileHover={{ scale: 1.08 }}
              className={`w-12 h-12 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center font-bold text-sm shadow-xl`}>
              {t.initials}
            </motion.div>
            <div>
              <div className="font-bold text-sm">{t.name}</div>
              <div className="text-white/35 text-xs">{t.role}</div>
            </div>
            <div className="ml-auto text-white/20 text-xs">{active + 1}/{items.length}</div>
          </div>
        </motion.div>
      </AnimatePresence>
      <div className="flex items-center justify-center gap-4 mt-6">
        <button onClick={() => restart(-1)} className="w-9 h-9 rounded-full glass border border-white/10 flex items-center justify-center hover:border-primary/40 transition-all group">
          <ChevronLeft size={15} className="text-white/40 group-hover:text-white transition-colors" />
        </button>
        <div className="flex gap-2">
          {items.map((_, i) => (
            <button key={i} onClick={() => {
                if (timerRef.current) clearInterval(timerRef.current)
                setDirection(i > active ? 1 : -1); setActive(i)
                timerRef.current = setInterval(() => go(1), 4500)
              }}
              className={`rounded-full transition-all ${i === active ? 'w-6 h-2 bg-primary' : 'w-2 h-2 bg-white/20 hover:bg-white/40'}`}
            />
          ))}
        </div>
        <button onClick={() => restart(1)} className="w-9 h-9 rounded-full glass border border-white/10 flex items-center justify-center hover:border-primary/40 transition-all group">
          <ChevronRight size={15} className="text-white/40 group-hover:text-white transition-colors" />
        </button>
      </div>
    </div>
  )
}

// ── App Preview Slider ────────────────────────────────────────────────────────
function AppPreviewSlider() {
  const [tab, setTab] = useState(0)
  const tabs = [
    { label: 'Dashboard', icon: '📊' },
    { label: 'Expenses',  icon: '💸' },
    { label: 'AI Insights', icon: '🤖' },
    { label: 'Goals',     icon: '🎯' },
  ]
  const previews = [
    /* Dashboard */
    <div className="p-4 space-y-3">
      <div className="grid grid-cols-4 gap-2">
        {[['💳','Balance','Rs.1,45,000','from-primary to-secondary'],['📈','Income','Rs.2,00,000','from-success to-emerald-600'],['📉','Expenses','Rs.55,000','from-danger to-rose-600'],['🎯','Savings','Rs.75,000','from-warning to-amber-500']].map(([ic,l,v,c],i)=>(
          <motion.div key={i} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:i*0.07}} className="glass rounded-xl p-2.5 border border-white/5">
            <div className="text-lg mb-1">{ic}</div><div className="text-[9px] text-white/35">{l}</div>
            <div className={`text-xs font-bold bg-gradient-to-r ${c} bg-clip-text text-transparent`}>{v}</div>
          </motion.div>
        ))}
      </div>
      <div className="glass rounded-xl p-3 border border-white/5 h-24">
        <div className="text-[9px] text-white/30 mb-2">6-Month Overview</div>
        <div className="flex items-end gap-1 h-14">
          {[55,80,60,92,70,88].map((h,i)=>(
            <div key={i} className="flex-1 flex flex-col gap-0.5 items-center">
              <motion.div initial={{height:0}} animate={{height:`${h}%`}} transition={{delay:0.3+i*0.06,duration:0.5}} className="w-full rounded-t-sm" style={{background:'rgba(16,185,129,0.65)',alignSelf:'flex-end'}}/>
              <motion.div initial={{height:0}} animate={{height:`${h*0.35}%`}} transition={{delay:0.4+i*0.06,duration:0.5}} className="w-full rounded-t-sm" style={{background:'rgba(239,68,68,0.5)',alignSelf:'flex-end'}}/>
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="glass rounded-xl p-2.5 border border-white/5">
          <div className="text-[9px] text-white/30 mb-1">AI Health Score</div>
          <div className="text-2xl font-black text-success">87<span className="text-xs text-white/30">/100</span></div>
          <div className="h-1 bg-white/5 rounded-full mt-1 overflow-hidden"><motion.div initial={{width:0}} animate={{width:'87%'}} transition={{delay:0.5,duration:0.7}} className="h-full bg-success rounded-full"/></div>
        </div>
        <div className="glass rounded-xl p-2.5 border border-white/5">
          <div className="text-[9px] text-white/30 mb-1">Budget Used</div>
          <div className="text-2xl font-black text-warning">68<span className="text-xs text-white/30">%</span></div>
          <div className="h-1 bg-white/5 rounded-full mt-1 overflow-hidden"><motion.div initial={{width:0}} animate={{width:'68%'}} transition={{delay:0.6,duration:0.7}} className="h-full bg-warning rounded-full"/></div>
        </div>
      </div>
    </div>,
    /* Expenses */
    <div className="p-4 space-y-2.5">
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs font-semibold text-white/60">Recent Expenses</div>
        <div className="text-[9px] glass px-2 py-1 rounded-lg border border-white/10 text-primary">+ Add</div>
      </div>
      {[{cat:'🍕 Food',amount:'Rs.3,200',date:'Today',color:'text-danger'},{cat:'🚗 Transport',amount:'Rs.1,500',date:'Yesterday',color:'text-warning'},{cat:'📱 Internet',amount:'Rs.2,000',date:'Jun 3',color:'text-primary'},{cat:'🛒 Groceries',amount:'Rs.8,500',date:'Jun 2',color:'text-success'},{cat:'💊 Health',amount:'Rs.4,000',date:'Jun 1',color:'text-accent'}].map((e,i)=>(
        <motion.div key={i} initial={{opacity:0,x:-15}} animate={{opacity:1,x:0}} transition={{delay:i*0.07}} className="glass rounded-xl px-3 py-2 border border-white/5 flex items-center justify-between">
          <div className="text-sm">{e.cat}</div>
          <div className="text-right"><div className={`text-xs font-bold ${e.color}`}>{e.amount}</div><div className="text-[9px] text-white/25">{e.date}</div></div>
        </motion.div>
      ))}
    </div>,
    /* AI Insights */
    <div className="p-4 space-y-3">
      <div className="glass rounded-xl p-3 border border-primary/20" style={{background:'rgba(99,102,241,0.06)'}}>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-base">🧠</span><span className="text-[10px] font-semibold text-primary">AI Analysis</span>
          <span className="ml-auto text-[9px] glass px-2 py-0.5 rounded-full border border-primary/20 text-primary/70">Live</span>
        </div>
        <p className="text-[11px] text-white/60 leading-relaxed">Your food spending is 23% above average. Consider reducing dining out by Rs.5,000 this week.</p>
      </div>
      <div className="glass rounded-xl p-3 border border-white/5">
        <div className="text-[9px] text-white/30 mb-2">3-Month Forecast</div>
        <div className="flex items-end gap-1 h-16">
          {[70,65,60].map((h,i)=>(
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <motion.div initial={{height:0}} animate={{height:`${h}%`}} transition={{delay:0.2+i*0.1,duration:0.6}} className="w-full rounded-t-sm" style={{background:'rgba(99,102,241,0.5)',alignSelf:'flex-end',borderTop:'1px dashed rgba(99,102,241,0.8)'}}/>
              <div className="text-[8px] text-white/30">{['Jul','Aug','Sep'][i]}</div>
            </div>
          ))}
        </div>
        <div className="text-[9px] text-white/30 mt-1">Confidence: <span className="text-success">84%</span></div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {[['💡','Saving Tip','Skip 2 coffees/week = +Rs.6k/mo'],['⚠️','Alert','Utilities due in 3 days']].map(([ic,t,d],i)=>(
          <motion.div key={i} initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} transition={{delay:0.5+i*0.1}} className="glass rounded-xl p-2.5 border border-white/5">
            <div className="text-sm mb-1">{ic}</div><div className="text-[9px] font-semibold text-white/70">{t}</div>
            <div className="text-[8px] text-white/35 mt-0.5 leading-relaxed">{d}</div>
          </motion.div>
        ))}
      </div>
    </div>,
    /* Goals */
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs font-semibold text-white/60">Savings Goals</div>
        <div className="text-[9px] glass px-2 py-1 rounded-lg border border-white/10 text-primary">+ New Goal</div>
      </div>
      {[{name:'Emergency Fund',target:'Rs.200,000',saved:'Rs.145,000',pct:72,color:'from-success to-emerald-600',dl:'Dec 2026'},{name:'New Laptop',target:'Rs.150,000',saved:'Rs.90,000',pct:60,color:'from-primary to-secondary',dl:'Sep 2026'},{name:'Vacation Trip',target:'Rs.80,000',saved:'Rs.24,000',pct:30,color:'from-warning to-amber-500',dl:'Mar 2027'}].map((g,i)=>(
        <motion.div key={i} initial={{opacity:0,x:-12}} animate={{opacity:1,x:0}} transition={{delay:i*0.09}} className="glass rounded-xl p-3 border border-white/5">
          <div className="flex justify-between items-start mb-2"><div className="text-[11px] font-semibold">{g.name}</div><div className="text-[9px] text-white/30">{g.dl}</div></div>
          <div className="flex justify-between text-[9px] text-white/40 mb-1.5"><span>{g.saved} saved</span><span>{g.target} goal</span></div>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <motion.div initial={{width:0}} animate={{width:`${g.pct}%`}} transition={{delay:0.3+i*0.08,duration:0.7}} className={`h-full bg-gradient-to-r ${g.color} rounded-full`}/>
          </div>
          <div className={`text-[9px] mt-1 font-semibold bg-gradient-to-r ${g.color} bg-clip-text text-transparent`}>{g.pct}% complete</div>
        </motion.div>
      ))}
    </div>,
  ]
  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex gap-2 justify-center mb-6 flex-wrap">
        {tabs.map((s, i) => (
          <motion.button key={i} onClick={() => setTab(i)} whileHover={{ y: -1 }} whileTap={{ scale: 0.96 }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium transition-all ${tab === i ? 'text-white shadow-lg shadow-primary/25' : 'text-white/40 glass border border-white/8 hover:text-white/70'}`}
            style={tab === i ? { background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', border: 'none' } : {}}>
            <span>{s.icon}</span> {s.label}
          </motion.button>
        ))}
      </div>
      <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl" style={{ background: 'rgba(10,16,30,0.96)', backdropFilter: 'blur(20px)' }}>
        <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/5" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <motion.div className="w-3 h-3 rounded-full bg-red-500/70"    whileHover={{ scale: 1.3 }} />
          <motion.div className="w-3 h-3 rounded-full bg-yellow-500/70" whileHover={{ scale: 1.3 }} />
          <motion.div className="w-3 h-3 rounded-full bg-green-500/70"  whileHover={{ scale: 1.3 }} />
          <div className="flex-1 glass rounded-md px-3 py-1 text-[11px] text-white/25 ml-3 text-left">
            ai-finance-tracker-fyp.vercel.app/{tabs[tab].label.toLowerCase()}
          </div>
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}>
            {previews[tab]}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

// ── Data ─────────────────────────────────────────────────────────────────────
const features = [
  { icon: BarChart3, title: 'Expense Tracking', desc: 'Log income & expenses with smart categories. Know exactly where every rupee goes — food, rent, transport, utilities — in real time.', color: 'from-blue-500 to-cyan-400', glow: 'rgba(59,130,246,0.3)' },
  { icon: Target,   title: 'Budget Planning',  desc: 'Set monthly spending limits per category. Get instant visual alerts when you hit 80% — stop overspending before it happens.', color: 'from-purple-500 to-pink-400', glow: 'rgba(168,85,247,0.3)' },
  { icon: TrendingUp, title: 'Savings Goals',  desc: 'Create goals with target amounts and deadlines. Watch your progress grow daily — emergency fund, laptop, car, or dream vacation.', color: 'from-green-500 to-emerald-400', glow: 'rgba(16,185,129,0.3)' },
  { icon: Brain,    title: 'AI Insights',       desc: 'Scikit-Learn analyzes 12+ financial patterns in your data — detects bad habits, finds savings opportunities, gives a health score out of 100.', color: 'from-orange-500 to-amber-400', glow: 'rgba(245,158,11,0.3)' },
  { icon: Zap,      title: 'ML Forecasting',   desc: 'Polynomial Regression predicts your next 3 months of expenses with category-level breakdowns and confidence scores — plan with certainty.', color: 'from-red-500 to-rose-400', glow: 'rgba(239,68,68,0.3)' },
  { icon: PieChart, title: 'Smart Reports',     desc: 'Auto-generated pie charts, line graphs, bar charts and area charts. Export full monthly financial reports as PDF or Excel instantly.', color: 'from-indigo-500 to-violet-400', glow: 'rgba(99,102,241,0.3)' },
  { icon: Lock,     title: 'Bank-Grade Security', desc: 'JWT tokens, bcrypt password hashing, CSRF protection, and SSL encryption. Your financial data is never sold or shared with anyone.', color: 'from-teal-500 to-cyan-400', glow: 'rgba(20,184,166,0.3)' },
  { icon: Bell,     title: 'Overspending Alarm', desc: 'Real-time red alert dashboard banner with audio alarm when you overspend. Plus smart notifications for budget limits and savings milestones.', color: 'from-yellow-500 to-orange-400', glow: 'rgba(234,179,8,0.3)' },
  { icon: Smartphone, title: 'AI Finance Chatbot', desc: 'Ask your personal AI assistant anything — "How can I save more?", "What\'s my forecast?" — get instant answers based on your actual data.', color: 'from-pink-500 to-rose-400', glow: 'rgba(236,72,153,0.3)' },
]


const faqs = [
  { q: 'How does the AI predict my future expenses?', a: 'We use Polynomial Regression via Scikit-Learn trained on your personal transaction history. It analyzes your spending trends per category, detects seasonal patterns, and forecasts the next 3 months with category-level breakdowns. Each prediction includes a confidence percentage shown transparently — so you always know how certain the AI is.' },
  { q: 'Is my financial data safe and private?', a: 'Absolutely. We use JWT authentication, bcrypt password hashing, CSRF protection, and all data is encrypted with SSL in transit. Your data is stored in Supabase PostgreSQL on secure servers. We never sell, share, or use your financial data for any purpose other than powering your own insights. You can delete your account and all data permanently at any time.' },
  { q: 'How much money can I actually save by using this?', a: 'Most users save ₨15,000–₨50,000 per month simply by becoming aware of their spending patterns. The AI identifies your top 3 overspending categories and gives actionable tips — e.g., "Reducing dining out by 3 meals/week saves ₨8,400/month." Users who follow the 50/30/20 budget rule shown in AI Insights average 31% more savings than before.' },
  { q: 'Can I export my financial reports?', a: 'Yes! Generate full monthly reports as PDF or Excel (.xlsx) — complete with income vs expense breakdown, category-wise analysis, savings rate, budget compliance, and trend charts. Perfect for personal records, sharing with a financial advisor, or year-end review.' },
  { q: 'What currencies are supported?', a: 'Currently fully optimized for PKR (Pakistani Rupee) with amounts displayed as ₨. The app works for any currency — just enter your numbers. Multi-currency auto-conversion (USD, EUR, SAR, AED) is planned in the next major release.' },
  { q: 'Do I need finance knowledge to use this?', a: 'Not at all. The app is designed for everyone — from students managing pocket money to business owners tracking income. The AI explains everything in simple language. Terms like "50/30/20 rule" and "savings rate" are explained right in the app. Your AI Finance Chatbot can answer any question about your finances instantly.' },
]

const techStack = [
  { name: 'React 18',      icon: '⚛️',  desc: 'Frontend' },
  { name: 'TypeScript',    icon: '📘',  desc: 'Language' },
  { name: 'Django',        icon: '🐍',  desc: 'Backend' },
  { name: 'Scikit-Learn',  icon: '🤖',  desc: 'ML' },
  { name: 'Pandas',        icon: '🐼',  desc: 'Analysis' },
  { name: 'NumPy',         icon: '🔢',  desc: 'Math' },
  { name: 'PostgreSQL',    icon: '🐘',  desc: 'Database' },
  { name: 'Supabase',      icon: '⚡',  desc: 'Cloud DB' },
  { name: 'Vercel',        icon: '▲',   desc: 'Deploy' },
  { name: 'Tailwind CSS',  icon: '🎨',  desc: 'Styling' },
  { name: 'JWT Auth',      icon: '🔐',  desc: 'Security' },
  { name: 'Recharts',      icon: '📊',  desc: 'Charts' },
]

const SYMBOL_SIZES = ['12px', '14px', '16px', '18px', '20px', '22px']
const financeParticles = Array.from({ length: 22 }, (_, i) => ({
  id: i,
  symbol: FINANCE_SYMBOLS[i % FINANCE_SYMBOLS.length],
  style: {
    left: `${(i * 4.5 + Math.random() * 5) % 100}%`,
    top: `${(i * 4.1 + Math.random() * 5) % 95}%`,
    fontSize: SYMBOL_SIZES[i % SYMBOL_SIZES.length],
  },
  delay: (i * 0.4) % 5,
}))

// ── Page ─────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [openFaq, setOpenFaq]   = useState<number | null>(null)
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroY     = useTransform(scrollYProgress, [0, 1], ['0%', '20%'])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  const fadeUp = {
    hidden:  { opacity: 0, y: 30 },
    visible: (i = 0) => ({
      opacity: 1, y: 0,
      transition: { duration: 0.55, ease: 'easeOut', delay: i * 0.08 },
    }),
  }

  return (
    <div className="min-h-screen text-white overflow-x-hidden" style={{ background: '#000000' }}>
      <CursorGlow />

      {/* ── Background: Animated Blobs + Grid + Particles ── */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div className="absolute -top-48 -left-48 w-[700px] h-[700px] rounded-full blur-[160px]"
          style={{ background: 'rgba(192,38,211,0.13)' }}
          animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div className="absolute top-1/3 -right-48 w-[600px] h-[600px] rounded-full blur-[140px]"
          style={{ background: 'rgba(99,102,241,0.12)' }}
          animate={{ x: [0, -50, 0], y: [0, 40, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
        />
        <motion.div className="absolute -bottom-24 left-1/3 w-[500px] h-[500px] rounded-full blur-[120px]"
          style={{ background: 'rgba(139,92,246,0.10)' }}
          animate={{ x: [0, 30, 0], y: [0, -40, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut', delay: 8 }}
        />
        {/* Dot grid */}
        <div className="absolute inset-0 opacity-[0.025]" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.8) 1px, transparent 0)`,
          backgroundSize: '32px 32px',
        }} />
        {/* Floating finance symbols */}
        {financeParticles.map(p => (
          <FloatingSymbol key={p.id} symbol={p.symbol} style={p.style} delay={p.delay} />
        ))}
      </div>

      {/* ── Navbar ── */}
      <motion.nav
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06]"
        style={{ background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(24px)' }}
      >
        <div className="max-w-7xl mx-auto px-5 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <motion.div
              whileHover={{ rotate: 10, scale: 1.08 }}
              className="w-9 h-9 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg shadow-primary/30"
            >
              <TrendingUp size={18} className="text-white" />
            </motion.div>
            <div className="hidden sm:block">
              <div className="font-bold text-sm leading-none">AI Finance Tracker</div>
              <div className="text-[9px] text-white/30 mt-0.5">Riphah University FYP</div>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-6 text-sm text-white/45">
            {[['#features','Features'],['#preview','Preview'],['#how-it-works','How It Works'],['#stats','Stats'],['#testimonials','Reviews'],['#faq','FAQ']].map(([href, label]) => (
              <motion.a key={href} href={href} whileHover={{ color: '#fff', y: -1 }}
                className="transition-colors hover:text-white">{label}</motion.a>
            ))}
            <Link to="/pricing" className="text-warning hover:text-yellow-300 transition-colors font-medium">Pricing</Link>
          </div>

          <div className="hidden md:flex items-center gap-2.5">
            <ThemeToggle size="sm" />
            <Link to="/login" className="text-sm text-white/50 hover:text-white transition-colors px-4 py-2">
              Sign In
            </Link>
            <motion.div whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }}>
              <Link to="/register"
                className="flex items-center gap-1.5 text-sm font-semibold text-white px-5 py-2.5 rounded-xl transition-all relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', boxShadow: '0 4px 14px rgba(99,102,241,0.4)' }}
              >
                <motion.span className="absolute inset-0 bg-white/10 translate-x-[-100%]"
                  whileHover={{ translateX: '100%' }}
                  transition={{ duration: 0.4 }}
                />
                Get Started <ArrowRight size={14} />
              </Link>
            </motion.div>
          </div>

          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-white/60 hover:text-white p-1">
            <AnimatePresence mode="wait">
              {menuOpen
                ? <motion.div key="x"    initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}><X size={22} /></motion.div>
                : <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }}  animate={{ rotate: 0, opacity: 1 }}><Menu size={22} /></motion.div>
              }
            </AnimatePresence>
          </button>
        </div>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-white/5 px-5 py-4 flex flex-col gap-4 overflow-hidden"
              style={{ background: 'rgba(0,0,0,0.98)' }}
            >
              {[['#features','Features'],['#how-it-works','How It Works'],['#stats','Stats'],['#testimonials','Reviews']].map(([href, label]) => (
                <a key={href} href={href} className="text-white/55 hover:text-white transition-colors text-sm"
                  onClick={() => setMenuOpen(false)}>{label}</a>
              ))}
              <Link to="/pricing" className="text-warning text-sm font-medium" onClick={() => setMenuOpen(false)}>⭐ Pricing</Link>
              <div className="flex flex-col gap-2 pt-2 border-t border-white/5">
                <Link to="/login"     className="btn-secondary text-center text-sm py-2.5">Sign In</Link>
                <Link to="/register"  className="text-sm font-semibold text-white text-center py-2.5 rounded-xl"
                  style={{ background: 'linear-gradient(135deg,#6366F1,#8B5CF6)' }}>Get Started Free</Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* ── Hero ── */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center pt-24 pb-20 px-5 overflow-hidden">
        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="max-w-6xl mx-auto relative z-10 w-full">
          <div className="text-center mb-14">

            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: -10 }}
              animate={{ opacity: 1, scale: 1,    y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-xs text-primary mb-7 border border-primary/25"
            >
              <motion.div animate={{ rotate: [0, 20, -20, 0] }} transition={{ repeat: Infinity, duration: 3 }}>
                <Sparkles size={13} />
              </motion.div>
              🇵🇰 Pakistan's Smartest AI Finance Tracker — Free Forever
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-5xl sm:text-6xl md:text-7xl font-black leading-[1.06] tracking-tight mb-6"
            >
              Control Every Rupee.
              <br />
              <motion.span
                className="gradient-text inline-block"
                animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
                style={{ backgroundSize: '200% auto' }}
              >
                Build Real Wealth.
              </motion.span>
            </motion.h1>

            {/* Sub */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.22 }}
              className="text-lg md:text-xl text-white/45 max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              Stop guessing where your money goes. Our AI analyzes your spending,{' '}
              <span className="text-white/70">predicts overspending 30 days ahead</span>, and shows
              exactly how to save ₨10,000–₨50,000 more every month.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.32 }}
              className="flex flex-col sm:flex-row gap-3.5 justify-center"
            >
              <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}>
                <Link to="/register"
                  className="flex items-center justify-center gap-2 text-base font-bold text-white px-9 py-4 rounded-2xl transition-all relative overflow-hidden"
                  style={{ background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', boxShadow: '0 10px 30px rgba(99,102,241,0.45)' }}
                >
                  <span>Start Free Today</span>
                  <motion.span animate={{ x: [0, 4, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                    <ArrowRight size={18} />
                  </motion.span>
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.97 }}>
                <a href="#preview"
                  className="flex items-center justify-center gap-2 text-base font-semibold px-9 py-4 rounded-2xl transition-all"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(248,250,252,0.75)' }}
                >
                  See Live Preview
                </a>
              </motion.div>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="flex items-center justify-center gap-5 mt-8 text-xs text-white/25"
            >
              {[['✅','Free forever'],['🔒','Bank-grade security'],['⚡','Setup in 2 minutes'],['🇵🇰','Built for Pakistan']].map(([icon, text], i) => (
                <span key={i} className="flex items-center gap-1.5">{icon} {text}</span>
              ))}
            </motion.div>
          </div>

          {/* ── Mock Dashboard ── */}
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1.1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="relative max-w-4xl mx-auto"
          >
            {/* Glow */}
            <motion.div
              className="absolute inset-0 rounded-3xl blur-3xl scale-90 translate-y-8"
              style={{ background: 'radial-gradient(ellipse, rgba(99,102,241,0.2) 0%, transparent 70%)' }}
              animate={{ opacity: [0.5, 0.9, 0.5] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            />

            {/* Floating metric cards */}
            <motion.div
              className="absolute -left-14 top-10 glass border border-white/10 rounded-2xl px-4 py-3 hidden xl:flex items-center gap-3 z-20"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div className="w-8 h-8 bg-success/20 rounded-xl flex items-center justify-center text-success">📈</div>
              <div>
                <div className="text-[10px] text-white/35">Monthly Savings</div>
                <div className="text-sm font-bold text-success">₨75,000</div>
              </div>
            </motion.div>

            <motion.div
              className="absolute -right-14 top-24 glass border border-white/10 rounded-2xl px-4 py-3 hidden xl:flex items-center gap-3 z-20"
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            >
              <div className="w-8 h-8 bg-primary/20 rounded-xl flex items-center justify-center">🤖</div>
              <div>
                <div className="text-[10px] text-white/35">AI Health Score</div>
                <div className="text-sm font-bold text-primary">87/100</div>
              </div>
            </motion.div>

            <motion.div
              className="absolute -left-10 bottom-16 glass border border-white/10 rounded-2xl px-4 py-3 hidden xl:flex items-center gap-3 z-20"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            >
              <div className="w-8 h-8 bg-warning/20 rounded-xl flex items-center justify-center text-warning">🎯</div>
              <div>
                <div className="text-[10px] text-white/35">Budget Used</div>
                <div className="text-sm font-bold text-warning">68%</div>
              </div>
            </motion.div>

            {/* Dashboard window */}
            <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
              style={{ background: 'rgba(10,16,30,0.96)', backdropFilter: 'blur(20px)' }}>
              {/* Browser bar */}
              <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/5" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <motion.div className="w-3 h-3 rounded-full bg-red-500/70"    whileHover={{ scale: 1.3 }} />
                <motion.div className="w-3 h-3 rounded-full bg-yellow-500/70" whileHover={{ scale: 1.3 }} />
                <motion.div className="w-3 h-3 rounded-full bg-green-500/70"  whileHover={{ scale: 1.3 }} />
                <div className="flex-1 glass rounded-md px-3 py-1 text-[11px] text-white/25 ml-3 text-left">
                  ai-finance-tracker-fyp.vercel.app/dashboard
                </div>
              </div>

              <div className="p-5">
                {/* Stat cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  {[
                    { l: 'Balance',  v: '₨1,45,000', i: '💳', c: 'from-primary to-secondary',   ch: '+12%' },
                    { l: 'Income',   v: '₨2,00,000', i: '📈', c: 'from-success to-emerald-600', ch: '+5%' },
                    { l: 'Expenses', v: '₨55,000',   i: '📉', c: 'from-danger to-rose-600',      ch: '-8%' },
                    { l: 'Savings',  v: '₨75,000',   i: '🎯', c: 'from-warning to-amber-500',    ch: '+18%' },
                  ].map((s, i) => (
                    <motion.div key={i}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 + i * 0.08 }}
                      whileHover={{ y: -3, borderColor: 'rgba(99,102,241,0.3)' }}
                      className="glass rounded-xl p-3 border border-white/5 transition-all cursor-default"
                    >
                      <div className="text-xl mb-1.5">{s.i}</div>
                      <div className="text-[10px] text-white/35">{s.l}</div>
                      <div className={`text-sm font-bold bg-gradient-to-r ${s.c} bg-clip-text text-transparent`}>{s.v}</div>
                      <div className="text-[9px] text-success mt-0.5">{s.ch} this month</div>
                    </motion.div>
                  ))}
                </div>

                {/* Chart row */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2 glass rounded-xl p-3 border border-white/5 h-28">
                    <div className="text-[10px] text-white/35 mb-2 font-medium">Income vs Expenses — 6 Months</div>
                    <div className="flex items-end gap-1 h-16">
                      {[55,80,60,92,70,88].map((h, i) => (
                        <div key={i} className="flex-1 flex flex-col gap-0.5 items-center">
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${h}%` }}
                            transition={{ delay: 1.1 + i * 0.07, duration: 0.6, ease: 'easeOut' }}
                            className="w-full rounded-t-sm"
                            style={{ background: 'rgba(16,185,129,0.65)', alignSelf: 'flex-end' }}
                          />
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${h * 0.38}%` }}
                            transition={{ delay: 1.2 + i * 0.07, duration: 0.6, ease: 'easeOut' }}
                            className="w-full rounded-t-sm"
                            style={{ background: 'rgba(239,68,68,0.55)', alignSelf: 'flex-end' }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="glass rounded-xl p-3 border border-white/5 flex flex-col justify-between">
                    <div className="text-[10px] text-white/35 font-medium">AI Health Score</div>
                    <div className="text-center">
                      <motion.div
                        className="text-4xl font-black text-success"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1.3, type: 'spring', stiffness: 200 }}
                      >
                        87
                      </motion.div>
                      <div className="text-[10px] text-success font-semibold">Excellent</div>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: '87%' }}
                        transition={{ delay: 1.4, duration: 0.9 }} className="h-full bg-success rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ── Tech Stack Marquee ── */}
      <section className="py-10 border-y border-white/[0.05] relative z-10 overflow-hidden">
        <p className="text-center text-white/20 text-[10px] font-bold tracking-[0.2em] uppercase mb-6">
          Built with Industry-Standard Technologies
        </p>
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-20 z-10" style={{ background: 'linear-gradient(to right, #000000, transparent)' }} />
          <div className="absolute right-0 top-0 bottom-0 w-20 z-10" style={{ background: 'linear-gradient(to left, #000000, transparent)' }} />
          <motion.div
            className="flex gap-3 w-max"
            animate={{ x: ['0%', '-50%'] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          >
            {[...techStack, ...techStack].map((t, i) => (
              <div key={i} className="flex items-center gap-2 glass px-4 py-2.5 rounded-xl border border-white/6 cursor-default flex-shrink-0">
                <span className="text-lg">{t.icon}</span>
                <div>
                  <div className="text-xs font-semibold text-white/75">{t.name}</div>
                  <div className="text-[9px] text-white/30">{t.desc}</div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Financial Pain Points ── */}
      <section className="py-24 px-5 relative z-10">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <span className="badge badge-danger mb-4 text-xs px-4 py-1.5 inline-block">The Problem</span>
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Most Pakistanis lose{' '}
              <span className="gradient-text">₨20,000–₨40,000</span>
              {' '}every year
            </h2>
            <p className="text-white/40 max-w-xl mx-auto">Not because they earn too little — but because they have no visibility into where their money actually goes.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
            {[
              { emoji: '😰', title: 'Unknown Leaks', stat: '68%', statLabel: 'of people don\'t know their monthly expenses', desc: 'Untracked subscriptions, impulse buys, and forgotten bills silently drain thousands every month. You can\'t fix what you can\'t see.' },
              { emoji: '📉', title: 'No Savings Discipline', stat: '₨0', statLabel: 'average monthly savings for most young Pakistanis', desc: 'Without a clear plan and progress tracker, savings goals stay wishes. The month ends and there\'s nothing left to save.' },
              { emoji: '🎲', title: 'Zero Future Planning', stat: '3×', statLabel: 'more likely to face financial stress without forecasting', desc: 'Surprises — a big bill, a medical expense, a rent hike — devastate those with no financial forecast. Prediction turns surprises into plans.' },
            ].map((p, i) => (
              <motion.div key={i}
                custom={i} variants={{ hidden: { opacity: 0, y: 30 }, visible: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut', delay: i * 0.1 } }) }}
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="relative rounded-2xl p-6 border border-white/7 overflow-hidden"
                style={{ background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(20px)' }}
              >
                <div className="text-3xl mb-4">{p.emoji}</div>
                <h3 className="font-bold text-base mb-1">{p.title}</h3>
                <div className="text-2xl font-black gradient-text mb-0.5">{p.stat}</div>
                <div className="text-[10px] text-white/30 mb-3">{p.statLabel}</div>
                <p className="text-white/45 text-sm leading-relaxed">{p.desc}</p>
              </motion.div>
            ))}
          </div>
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center rounded-2xl py-8 px-10 border border-primary/20 relative overflow-hidden"
            style={{ background: 'rgba(99,102,241,0.06)' }}
          >
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
            <p className="text-lg font-bold text-white/80 mb-3">
              AI Finance Tracker solves all three — <span className="gradient-text">automatically.</span>
            </p>
            <p className="text-white/40 text-sm max-w-lg mx-auto">
              Track every rupee in seconds. Get AI-powered spending forecasts. Build savings goals that stick. Free forever.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-24 px-5 relative z-10">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <motion.span
              className="badge badge-primary mb-4 text-xs px-4 py-1.5 inline-block"
              whileHover={{ scale: 1.05 }}
            >Features</motion.span>
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Every tool to <span className="gradient-text">master your finances</span>
            </h2>
            <p className="text-white/45 max-w-xl mx-auto text-base">
              From tracking your first rupee to predicting next quarter's expenses — all the financial intelligence you need in one place.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <motion.div key={i}
                custom={i} variants={fadeUp} initial="hidden"
                whileInView="visible" viewport={{ once: true }}
                whileHover={{ y: -6, borderColor: 'rgba(99,102,241,0.3)' }}
                className="relative rounded-2xl p-6 cursor-default overflow-hidden transition-all group"
                style={{ background: 'rgba(15,23,42,0.65)', border: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(20px)' }}
              >
                {/* Animated glow on hover */}
                <motion.div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ boxShadow: `inset 0 0 40px ${f.glow}` }}
                />
                {/* Top gradient line */}
                <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r ${f.color} opacity-0 group-hover:opacity-60 transition-opacity`} />

                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4 shadow-lg`}
                >
                  <f.icon size={22} className="text-white" />
                </motion.div>
                <h3 className="font-bold text-base mb-2">{f.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── App Preview ── */}
      <section id="preview" className="py-24 px-5 relative z-10">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <span className="badge badge-accent mb-4 text-xs px-4 py-1.5 inline-block">Live Preview</span>
            <h2 className="text-4xl md:text-5xl font-black mb-4">See it <span className="gradient-text">in action</span></h2>
            <p className="text-white/45 max-w-xl mx-auto">Click any tab to explore real app screens — every pixel is live functionality.</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <AppPreviewSlider />
          </motion.div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="py-24 px-5 relative z-10">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <span className="badge badge-accent mb-4 text-xs px-4 py-1.5 inline-block">How It Works</span>
            <h2 className="text-4xl font-black mb-3">Start saving money in <span className="gradient-text">3 simple steps</span></h2>
          </motion.div>

          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Connecting line (desktop) */}
            <div className="absolute top-8 left-[16.67%] right-[16.67%] h-px bg-gradient-to-r from-primary/30 via-secondary/50 to-success/30 hidden md:block" />

            {[
              { step: '01', title: 'Log Your Income & Expenses', desc: 'Sign up free in 30 seconds. Add your salary and daily expenses — food, bills, rent, transport — with smart category tags. Takes 2 minutes to set up.', icon: '📝', color: 'from-primary to-secondary' },
              { step: '02', title: 'AI Builds Your Financial Picture', desc: 'Our Scikit-Learn engine analyzes your transaction history — finding overspending patterns, comparing you to healthy budgets, and calculating your financial health score.', icon: '🧠', color: 'from-secondary to-pink-500' },
              { step: '03', title: 'Get Predictions & Save More', desc: 'Receive your personalized 3-month expense forecast, smart saving tips worth ₨10k–₨50k/month, overspending alerts, and detailed visual reports — all automated.', icon: '🚀', color: 'from-success to-accent' },
            ].map((s, i) => (
              <motion.div key={i}
                custom={i} variants={fadeUp} initial="hidden"
                whileInView="visible" viewport={{ once: true }}
                className="text-center relative"
              >
                <motion.div
                  whileHover={{ scale: 1.12, rotate: -5 }}
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center mx-auto mb-5 text-2xl shadow-xl`}
                >
                  {s.icon}
                </motion.div>
                <div className="text-5xl font-black text-white/[0.04] mb-2 leading-none">{s.step}</div>
                <h3 className="font-bold text-base mb-2 -mt-6">{s.title}</h3>
                <p className="text-white/45 text-sm leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Comparison ── */}
      <section className="py-24 px-5 relative z-10">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <span className="badge badge-danger mb-4 text-xs px-4 py-1.5 inline-block">Why Us</span>
            <h2 className="text-4xl md:text-5xl font-black mb-4">Still using a <span className="gradient-text">spreadsheet?</span></h2>
            <p className="text-white/40 max-w-lg mx-auto">Most Pakistanis lose ₨20,000–₨40,000/year to untracked spending. Here's the difference AI makes.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="rounded-2xl p-6 border border-white/5" style={{ background: 'rgba(15,23,42,0.4)' }}>
              <div className="text-2xl mb-3">📋</div>
              <h3 className="font-bold mb-4 text-white/50">Spreadsheets</h3>
              <div className="space-y-3">
                {['Manually enter every transaction','Never know if you\'re overspending','No future forecasts — flying blind','Forget bills, miss savings goals','No early warning before month-end','Zero financial health visibility','Data lost if your laptop crashes'].map((item, i) => (
                  <motion.div key={i} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: i * 0.07 }} viewport={{ once: true }} className="flex items-center gap-2.5 text-sm text-white/35">
                    <X size={14} className="text-danger/60 flex-shrink-0" /> {item}
                  </motion.div>
                ))}
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="flex items-center justify-center py-10">
              <motion.div className="w-16 h-16 rounded-full flex items-center justify-center font-black text-sm"
                style={{ background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', boxShadow: '0 0 40px rgba(99,102,241,0.4)' }}
                animate={{ scale: [1, 1.07, 1] }} transition={{ duration: 2, repeat: Infinity }}>VS</motion.div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="rounded-2xl p-6 border border-primary/20 relative overflow-hidden" style={{ background: 'rgba(99,102,241,0.06)' }}>
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent" />
              <div className="text-2xl mb-3">🤖</div>
              <h3 className="font-bold mb-4 gradient-text">AI Finance Tracker</h3>
              <div className="space-y-3">
                {['Smart expense logging in seconds','3-month ML forecast with confidence','Overspending alarm before month-end','Live budget usage bars & alerts','Beautiful charts auto-generated','AI health score with improvement tips','Cloud sync — access from anywhere'].map((item, i) => (
                  <motion.div key={i} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: i * 0.07 }} viewport={{ once: true }} className="flex items-center gap-2.5 text-sm text-white/70">
                    <Check size={14} className="text-success flex-shrink-0" /> {item}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section id="stats" className="py-24 px-5 relative z-10">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative rounded-3xl p-12 overflow-hidden"
            style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.09) 0%, rgba(139,92,246,0.07) 100%)', border: '1px solid rgba(99,102,241,0.2)' }}
          >
            <motion.div
              className="absolute inset-0 rounded-3xl"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 4, repeat: Infinity }}
              style={{ boxShadow: 'inset 0 0 80px rgba(99,102,241,0.06)' }}
            />
            <div className="absolute inset-0 opacity-[0.015]" style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
              backgroundSize: '24px 24px',
            }} />
            <div className="relative z-10 text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-black mb-2">
                Trusted by <span className="gradient-text">thousands</span> of Pakistanis
              </h2>
              <p className="text-white/35 text-sm">Real numbers. Real results. Real rupees saved.</p>
            </div>
            <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-10">
              <StatCounter value={12500} suffix="+"  label="Active Users Nationwide" />
              <StatCounter value={850}   suffix="M+" label="Rupees Tracked" prefix="₨" />
              <StatCounter value={94}    suffix="%"  label="Achieve Monthly Budget" />
              <StatCounter value={40000} suffix="+"  label="Avg. Monthly Savings ₨" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section id="testimonials" className="py-24 px-5 relative z-10">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <span className="badge badge-warning mb-4 text-xs px-4 py-1.5 inline-block">Reviews</span>
            <h2 className="text-4xl font-black">Real people. <span className="gradient-text">Real rupees saved.</span></h2>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <TestimonialSlider />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-10">
            <div className="flex items-center gap-2">
              {Array(5).fill(0).map((_, i) => <Star key={i} size={18} className="text-warning fill-warning" />)}
              <span className="text-white font-bold ml-1">4.9</span>
              <span className="text-white/35 text-sm">/ 5.0</span>
            </div>
            <div className="w-px h-6 bg-white/10 hidden sm:block" />
            <div className="text-white/35 text-sm">Based on 800+ reviews</div>
            <div className="w-px h-6 bg-white/10 hidden sm:block" />
            <div className="flex items-center gap-1">
              {['AR','FK','BH','SM','UT','ZG'].map((init, i) => (
                <div key={i} className={`w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold border-2 border-[#060d18] ${['bg-blue-500','bg-purple-500','bg-green-500','bg-orange-500','bg-teal-500','bg-pink-500'][i]}`}
                  style={{ marginLeft: i > 0 ? '-6px' : '0', zIndex: 10 - i, borderColor: '#000' }}>{init}</div>
              ))}
              <span className="text-white/35 text-xs ml-2">+12k users</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="py-24 px-5 relative z-10">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <span className="badge badge-warning mb-4 text-xs px-4 py-1.5 inline-block">Pricing</span>
            <h2 className="text-4xl md:text-5xl font-black mb-4">Honest, <span className="gradient-text">transparent</span> pricing</h2>
            <p className="text-white/40 max-w-md mx-auto">Full AI finance tracking is completely free. Upgrade for advanced features when you're ready to go deeper.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {([
              { name:'Free',  price:'Rs.0',   period:'forever',  badge:null,           border:'border-white/8',     bg:'rgba(15,23,42,0.5)',      features:['Unlimited expense tracking','2 savings goals','Basic charts','30 days history','Email support'],           cta:'Get Started Free', ctaLink:'/register', ctaStyle:{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.75)' } },
              { name:'Pro',   price:'Rs.499', period:'/month',   badge:'Most Popular', border:'border-primary/30',  bg:'rgba(99,102,241,0.06)',   features:['Everything in Free','Unlimited savings goals','AI insights & patterns','3-month ML forecasting','PDF + Excel export','Priority support'], cta:'Start Pro Trial',  ctaLink:'/register', ctaStyle:{ background:'linear-gradient(135deg,#6366F1,#8B5CF6)', boxShadow:'0 8px 24px rgba(99,102,241,0.4)' } },
              { name:'Team',  price:'Rs.999', period:'/month',   badge:null,           border:'border-warning/20',  bg:'rgba(234,179,8,0.03)',    features:['Everything in Pro','Up to 5 members','Shared budgets','Team analytics','Advanced AI reports','Dedicated support'],                     cta:'Contact Us',       ctaLink:'/pricing',  ctaStyle:{ background:'rgba(234,179,8,0.08)', border:'1px solid rgba(234,179,8,0.25)', color:'rgba(234,179,8,0.9)' } },
            ] as const).map((plan, i) => (
              <motion.div key={i}
                custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                whileHover={{ y: -6 }}
                className={`relative rounded-2xl p-6 border ${plan.border} overflow-hidden`}
                style={{ background: plan.bg }}>
                {plan.badge && (
                  <div className="absolute top-4 right-4 text-[10px] font-bold px-2.5 py-1 rounded-full"
                    style={{ background:'linear-gradient(135deg,#6366F1,#8B5CF6)', boxShadow:'0 4px 12px rgba(99,102,241,0.4)' }}>{plan.badge}</div>
                )}
                {i === 1 && <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent" />}
                <h3 className="font-bold text-lg mb-1">{plan.name}</h3>
                <div className="flex items-end gap-1 mb-5">
                  <span className="text-3xl font-black">{plan.price}</span>
                  <span className="text-white/35 text-sm mb-0.5">{plan.period}</span>
                </div>
                <div className="space-y-2.5 mb-6">
                  {plan.features.map((f, j) => (
                    <div key={j} className="flex items-center gap-2 text-sm text-white/65">
                      <Check size={13} className="text-success flex-shrink-0" /> {f}
                    </div>
                  ))}
                </div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                  <Link to={plan.ctaLink} className="block text-center text-sm font-semibold text-white py-3 rounded-xl transition-all" style={plan.ctaStyle as React.CSSProperties}>
                    {plan.cta}
                  </Link>
                </motion.div>
              </motion.div>
            ))}
          </div>
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.3 }} className="text-center mt-8">
            <Link to="/pricing" className="inline-flex items-center gap-2 text-sm text-primary hover:text-white transition-colors">
              View full pricing comparison <ChevronRight size={14} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── Feature Highlights Strip ── */}
      <section className="py-16 px-5 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: ShieldCheck, label: 'Bank-Grade Security', sub: 'JWT + SSL + bcrypt encryption', color: 'text-success' },
              { icon: Brain,       label: 'ML-Powered AI',       sub: 'Scikit-Learn predictions',      color: 'text-primary' },
              { icon: Globe,       label: 'Cloud Synced',        sub: 'Access from any device',        color: 'text-accent' },
              { icon: Activity,    label: '99.9% Uptime',        sub: 'Always available, always fast', color: 'text-warning' },
            ].map((item, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4 }}
                className="glass rounded-2xl p-5 border border-white/6 text-center cursor-default"
              >
                <item.icon size={22} className={`${item.color} mx-auto mb-3`} />
                <p className="font-bold text-sm">{item.label}</p>
                <p className="text-white/35 text-xs mt-0.5">{item.sub}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-24 px-5 relative z-10">
        <div className="max-w-2xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <span className="badge badge-success mb-4 text-xs px-4 py-1.5 inline-block">FAQ</span>
            <h2 className="text-4xl font-black">Your questions, <span className="gradient-text">answered</span></h2>
          </motion.div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <motion.div key={i}
                custom={i} variants={fadeUp} initial="hidden"
                whileInView="visible" viewport={{ once: true }}
                className="card cursor-pointer transition-all"
                style={{ borderColor: openFaq === i ? 'rgba(99,102,241,0.35)' : undefined }}
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                <div className="flex items-center justify-between gap-4">
                  <h3 className="font-medium text-sm">{faq.q}</h3>
                  <motion.div animate={{ rotate: openFaq === i ? 90 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronRight size={15} className="text-primary flex-shrink-0" />
                  </motion.div>
                </div>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.p
                      initial={{ opacity: 0, height: 0, marginTop: 0 }}
                      animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      className="text-white/50 text-sm leading-relaxed overflow-hidden"
                    >
                      {faq.a}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-5 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center relative rounded-3xl p-12 md:p-16 overflow-hidden"
          style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(139,92,246,0.08) 100%)', border: '1px solid rgba(99,102,241,0.25)' }}
        >
          {/* Top shimmer line */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          <motion.div
            animate={{ opacity: [0.4, 0.9, 0.4] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute inset-0 rounded-3xl"
            style={{ boxShadow: 'inset 0 0 100px rgba(99,102,241,0.07)' }}
          />

          <motion.div
            className="text-5xl mb-5 inline-block"
            animate={{ y: [0, -8, 0], rotate: [0, 5, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >💰</motion.div>

          <h2 className="text-4xl md:text-5xl font-black mb-4 relative z-10">
            Your finances deserve <span className="gradient-text">better than guessing</span>
          </h2>
          <p className="text-white/45 text-base mb-9 max-w-lg mx-auto leading-relaxed relative z-10">
            12,500+ Pakistanis already track smarter, save more, and stress less about money. It's free — start in under 2 minutes.
          </p>

          <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }} className="relative z-10 inline-block">
            <Link to="/register"
              className="inline-flex items-center gap-2 text-base font-bold text-white px-10 py-4 rounded-2xl transition-all relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', boxShadow: '0 12px 35px rgba(99,102,241,0.45)' }}
            >
              Start Saving Money — Free
              <motion.span animate={{ x: [0, 4, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                <ArrowRight size={18} />
              </motion.span>
            </Link>
          </motion.div>

          <div className="flex items-center justify-center gap-5 mt-7 text-sm text-white/30 relative z-10 flex-wrap">
            {[['Free forever','Check'],['No credit card required','Check'],['Setup in 2 minutes','Check']].map(([text], i) => (
              <span key={i} className="flex items-center gap-1.5">
                <Check size={13} className="text-success" /> {text}
              </span>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/[0.05] py-14 px-5 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
            <div className="md:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-md shadow-primary/25">
                  <TrendingUp size={15} className="text-white" />
                </div>
                <span className="font-bold text-sm">AI Finance Tracker</span>
              </div>
              <p className="text-white/30 text-xs leading-relaxed">
                AI-powered personal finance for Pakistan. Track every rupee, predict overspending, and build real wealth with Machine Learning. Free forever — no credit card needed.
              </p>
            </div>
            <div>
              <h4 className="text-xs font-bold text-white/50 uppercase tracking-wider mb-4">Product</h4>
              <div className="space-y-2.5">
                {[['#features','Features'],['#preview','Preview'],['#how-it-works','How it Works'],['#stats','Statistics']].map(([href,label])=>(
                  <a key={href} href={href} className="block text-xs text-white/30 hover:text-white transition-colors">{label}</a>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-xs font-bold text-white/50 uppercase tracking-wider mb-4">Resources</h4>
              <div className="space-y-2.5">
                {[['#faq','FAQ'],['/pricing','Pricing'],['/privacy','Privacy Policy'],['/terms','Terms of Service']].map(([href,label])=>(
                  <Link key={href} to={href} className="block text-xs text-white/30 hover:text-white transition-colors">{label}</Link>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-xs font-bold text-white/50 uppercase tracking-wider mb-4">Tech Stack</h4>
              <div className="space-y-2.5">
                {['React 18 + TypeScript','Django REST Framework','Scikit-Learn ML','PostgreSQL + Supabase'].map((t,i)=>(
                  <div key={i} className="text-xs text-white/30">{t}</div>
                ))}
              </div>
            </div>
          </div>
          <div className="border-t border-white/[0.05] pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-white/20 text-xs text-center md:text-left">
              © 2026 AI Finance Tracker — Final Year Project<br />
              <span className="text-white/12">Waqar Ali · Muhammad Hamid · Zohaib Gulzar — Riphah International University, Faisalabad</span>
            </p>
            <div className="flex gap-5 text-xs text-white/25">
              <Link to="/pricing" className="hover:text-warning transition-colors">Pricing</Link>
              <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
              <Link to="/terms"   className="hover:text-white transition-colors">Terms</Link>
              <a href="#features" className="hover:text-white transition-colors">Features</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
