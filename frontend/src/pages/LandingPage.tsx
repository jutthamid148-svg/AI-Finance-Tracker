import { motion, useInView, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useRef, useState, useEffect } from 'react'
import {
  TrendingUp, Brain, Target, BarChart3, Zap,
  ChevronRight, Star, Check, Menu, X, ArrowRight,
  PieChart, Bell, Lock, Smartphone, Sparkles,
  ShieldCheck, Globe, Activity,
} from 'lucide-react'

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
function Particle({ style }: { style: React.CSSProperties }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{ ...style, background: 'rgba(99,102,241,0.4)' }}
      animate={{ y: [0, -30, 0], opacity: [0.2, 0.6, 0.2] }}
      transition={{ duration: 4 + Math.random() * 3, repeat: Infinity, ease: 'easeInOut', delay: Math.random() * 3 }}
    />
  )
}

// ── Data ─────────────────────────────────────────────────────────────────────
const features = [
  { icon: BarChart3, title: 'Expense Tracking', desc: 'Categorize every rupee with emoji tags. Add, edit, delete with real-time sync.', color: 'from-blue-500 to-cyan-400', glow: 'rgba(59,130,246,0.3)' },
  { icon: Target,   title: 'Budget Planning',  desc: 'Monthly budgets per category with animated progress bars and instant alerts.', color: 'from-purple-500 to-pink-400', glow: 'rgba(168,85,247,0.3)' },
  { icon: TrendingUp, title: 'Savings Goals',  desc: 'Set goals with deadlines, track progress visually, hit every milestone.', color: 'from-green-500 to-emerald-400', glow: 'rgba(16,185,129,0.3)' },
  { icon: Brain,    title: 'AI Insights',       desc: 'Pandas + NumPy + Scikit-Learn analyze patterns and give personalized tips.', color: 'from-orange-500 to-amber-400', glow: 'rgba(245,158,11,0.3)' },
  { icon: Zap,      title: 'ML Forecasting',   desc: 'Polynomial Regression predicts 3-month expenses with confidence scores.', color: 'from-red-500 to-rose-400', glow: 'rgba(239,68,68,0.3)' },
  { icon: PieChart, title: 'Smart Reports',     desc: 'Beautiful charts, pie + line + area — export as PDF or Excel anytime.', color: 'from-indigo-500 to-violet-400', glow: 'rgba(99,102,241,0.3)' },
  { icon: Lock,     title: 'Secure & Private',  desc: 'JWT auth, bcrypt hashing, CSRF protection. Your data stays yours.', color: 'from-teal-500 to-cyan-400', glow: 'rgba(20,184,166,0.3)' },
  { icon: Bell,     title: 'Smart Alerts',      desc: 'Real-time notifications for budget limits, savings milestones, AI detections.', color: 'from-yellow-500 to-orange-400', glow: 'rgba(234,179,8,0.3)' },
  { icon: Smartphone, title: 'Fully Responsive', desc: 'Desktop, tablet, mobile — manage finances anywhere, anytime, seamlessly.', color: 'from-pink-500 to-rose-400', glow: 'rgba(236,72,153,0.3)' },
]

const testimonials = [
  { name: 'Ahmed Raza',   role: 'Software Engineer, Lahore',    text: 'The AI insights are incredibly accurate. Saved ₨30,000 extra in just two months!', rating: 5, initials: 'AR', color: 'from-blue-500 to-cyan-500' },
  { name: 'Fatima Khan',  role: 'Freelance Designer, Karachi',  text: 'Finally an app that understands Pakistani finances. PKR-based tracking is perfect!', rating: 5, initials: 'FK', color: 'from-purple-500 to-pink-500' },
  { name: 'Bilal Hassan', role: 'Business Owner, Faisalabad',   text: 'Expense predictions are remarkably accurate. A game changer for business planning!', rating: 5, initials: 'BH', color: 'from-green-500 to-emerald-500' },
]

const faqs = [
  { q: 'How does the AI analysis work?', a: 'We use Polynomial Regression and time-series analysis with Pandas, NumPy, and Scikit-Learn. It analyzes your historical transactions to detect spending patterns, overspending, and predict future expenses with confidence scores.' },
  { q: 'Is my financial data secure?', a: 'Yes. JWT authentication, bcrypt password hashing, and CSRF protection are all in place. Data is stored in Supabase PostgreSQL with SSL encryption. Your data is never sold to third parties.' },
  { q: 'Can I export my financial reports?', a: 'Yes! Export monthly reports as PDF or Excel (.xlsx) with complete breakdowns of income, expenses, savings, and category-wise analysis.' },
  { q: 'What currencies are supported?', a: 'Currently optimized for PKR (Pakistani Rupee). Support for USD, EUR, and other major currencies is planned for the next release.' },
  { q: 'How accurate are the spending predictions?', a: 'Accuracy improves with more data. With 3+ months of transactions, the model achieves high-confidence forecasts using Polynomial Regression. Confidence levels are shown transparently.' },
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

const particles = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  style: {
    width: `${2 + Math.random() * 3}px`,
    height: `${2 + Math.random() * 3}px`,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    opacity: 0.3,
  }
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
    <div className="min-h-screen text-white overflow-x-hidden" style={{ background: '#060d18' }}>

      {/* ── Background: Animated Blobs + Grid + Particles ── */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div className="absolute -top-48 -left-48 w-[700px] h-[700px] rounded-full blur-[160px]"
          style={{ background: 'rgba(99,102,241,0.08)' }}
          animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div className="absolute top-1/3 -right-48 w-[600px] h-[600px] rounded-full blur-[140px]"
          style={{ background: 'rgba(139,92,246,0.07)' }}
          animate={{ x: [0, -50, 0], y: [0, 40, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
        />
        <motion.div className="absolute -bottom-24 left-1/3 w-[500px] h-[500px] rounded-full blur-[120px]"
          style={{ background: 'rgba(6,182,212,0.06)' }}
          animate={{ x: [0, 30, 0], y: [0, -40, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut', delay: 8 }}
        />
        {/* Dot grid */}
        <div className="absolute inset-0 opacity-[0.018]" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.8) 1px, transparent 0)`,
          backgroundSize: '32px 32px',
        }} />
        {/* Floating particles */}
        {particles.map(p => <Particle key={p.id} style={p.style} />)}
      </div>

      {/* ── Navbar ── */}
      <motion.nav
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06]"
        style={{ background: 'rgba(6,13,24,0.92)', backdropFilter: 'blur(24px)' }}
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
            {[['#features','Features'],['#how-it-works','How It Works'],['#stats','Stats'],['#testimonials','Reviews'],['#faq','FAQ']].map(([href, label]) => (
              <motion.a key={href} href={href} whileHover={{ color: '#fff', y: -1 }}
                className="transition-colors hover:text-white">{label}</motion.a>
            ))}
            <Link to="/pricing" className="text-warning hover:text-yellow-300 transition-colors font-medium">Pricing</Link>
          </div>

          <div className="hidden md:flex items-center gap-2.5">
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
              style={{ background: 'rgba(6,13,24,0.98)' }}
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
              FYP · Riphah International University, Faisalabad
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-5xl sm:text-6xl md:text-7xl font-black leading-[1.06] tracking-tight mb-6"
            >
              Manage Money
              <br />
              <motion.span
                className="gradient-text inline-block"
                animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
                style={{ backgroundSize: '200% auto' }}
              >
                Smarter with AI
              </motion.span>
            </motion.h1>

            {/* Sub */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.22 }}
              className="text-lg md:text-xl text-white/45 max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              An intelligent finance system built with{' '}
              <span className="text-white/70">Django · React · Machine Learning</span>.
              Track, predict, and optimize your finances in one place.
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
                <Link to="/login"
                  className="flex items-center justify-center gap-2 text-base font-semibold px-9 py-4 rounded-2xl transition-all"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(248,250,252,0.75)' }}
                >
                  Sign In to Dashboard
                </Link>
              </motion.div>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="flex items-center justify-center gap-5 mt-8 text-xs text-white/25"
            >
              {[['✅','Free forever'],['🔒','SSL encrypted'],['⚡','Instant access'],['🇵🇰','PKR optimized']].map(([icon, text], i) => (
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
          <div className="absolute left-0 top-0 bottom-0 w-20 z-10" style={{ background: 'linear-gradient(to right, #060d18, transparent)' }} />
          <div className="absolute right-0 top-0 bottom-0 w-20 z-10" style={{ background: 'linear-gradient(to left, #060d18, transparent)' }} />
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

      {/* ── Features ── */}
      <section id="features" className="py-24 px-5 relative z-10">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <motion.span
              className="badge badge-primary mb-4 text-xs px-4 py-1.5 inline-block"
              whileHover={{ scale: 1.05 }}
            >Features</motion.span>
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Everything to <span className="gradient-text">master your money</span>
            </h2>
            <p className="text-white/45 max-w-xl mx-auto text-base">
              From simple expense tracking to AI-powered 3-month predictions — all tools you need.
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

      {/* ── How It Works ── */}
      <section id="how-it-works" className="py-24 px-5 relative z-10">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <span className="badge badge-accent mb-4 text-xs px-4 py-1.5 inline-block">How It Works</span>
            <h2 className="text-4xl font-black mb-3">Simple as <span className="gradient-text">1, 2, 3</span></h2>
          </motion.div>

          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Connecting line (desktop) */}
            <div className="absolute top-8 left-[16.67%] right-[16.67%] h-px bg-gradient-to-r from-primary/30 via-secondary/50 to-success/30 hidden md:block" />

            {[
              { step: '01', title: 'Register & Add Transactions', desc: 'Create free account and log income, expenses with category tags and dates.', icon: '📝', color: 'from-primary to-secondary' },
              { step: '02', title: 'AI Analyzes Your Data',       desc: 'Scikit-Learn + Pandas processes transactions to detect patterns and opportunities.', icon: '🧠', color: 'from-secondary to-pink-500' },
              { step: '03', title: 'Get Predictions & Insights',  desc: 'Receive personalized tips, 3-month forecasts, and beautiful visual reports.', icon: '🚀', color: 'from-success to-accent' },
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
              <p className="text-white/35 text-sm">Real numbers. Real results. Real money saved.</p>
            </div>
            <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-10">
              <StatCounter value={12500} suffix="+"  label="Active Users" />
              <StatCounter value={850}   suffix="M+" label="Total Tracked" prefix="₨" />
              <StatCounter value={94}    suffix="%"  label="Budget Success" />
              <StatCounter value={25000} suffix="+"  label="Goals Achieved" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section id="testimonials" className="py-24 px-5 relative z-10">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <span className="badge badge-warning mb-4 text-xs px-4 py-1.5 inline-block">Reviews</span>
            <h2 className="text-4xl font-black">What our <span className="gradient-text">users say</span></h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {testimonials.map((t, i) => (
              <motion.div key={i}
                custom={i} variants={fadeUp} initial="hidden"
                whileInView="visible" viewport={{ once: true }}
                whileHover={{ y: -6, borderColor: 'rgba(139,92,246,0.25)' }}
                className="card transition-all"
              >
                <div className="flex items-center gap-3 mb-4">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className={`w-11 h-11 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center font-bold text-sm shadow-lg`}
                  >
                    {t.initials}
                  </motion.div>
                  <div>
                    <div className="font-semibold text-sm">{t.name}</div>
                    <div className="text-white/35 text-xs">{t.role}</div>
                  </div>
                </div>
                <div className="flex gap-0.5 mb-3">
                  {Array(t.rating).fill(0).map((_, j) => (
                    <motion.div key={j} initial={{ opacity: 0, scale: 0 }} whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 + j * 0.08 }} viewport={{ once: true }}>
                      <Star size={13} className="text-warning fill-warning" />
                    </motion.div>
                  ))}
                </div>
                <p className="text-white/60 text-sm leading-relaxed">"{t.text}"</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Feature Highlights Strip ── */}
      <section className="py-16 px-5 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: ShieldCheck, label: 'SSL Encrypted', sub: 'Supabase PostgreSQL', color: 'text-success' },
              { icon: Brain,       label: 'ML Powered',    sub: 'Scikit-Learn AI',     color: 'text-primary' },
              { icon: Globe,       label: 'Cloud Hosted',  sub: 'Vercel + Supabase',   color: 'text-accent' },
              { icon: Activity,    label: '99.9% Uptime',  sub: 'Always available',    color: 'text-warning' },
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
            <h2 className="text-4xl font-black">Frequently <span className="gradient-text">Asked</span></h2>
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
          >🚀</motion.div>

          <h2 className="text-4xl md:text-5xl font-black mb-4 relative z-10">
            Start your journey <span className="gradient-text">today</span>
          </h2>
          <p className="text-white/45 text-base mb-9 max-w-lg mx-auto leading-relaxed relative z-10">
            Join thousands of Pakistanis managing money smarter with AI-powered insights and predictions.
          </p>

          <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }} className="relative z-10 inline-block">
            <Link to="/register"
              className="inline-flex items-center gap-2 text-base font-bold text-white px-10 py-4 rounded-2xl transition-all relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', boxShadow: '0 12px 35px rgba(99,102,241,0.45)' }}
            >
              Create Free Account
              <motion.span animate={{ x: [0, 4, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                <ArrowRight size={18} />
              </motion.span>
            </Link>
          </motion.div>

          <div className="flex items-center justify-center gap-5 mt-7 text-sm text-white/30 relative z-10 flex-wrap">
            {[['Free forever','Check'],['No credit card','Check'],['Instant access','Check']].map(([text], i) => (
              <span key={i} className="flex items-center gap-1.5">
                <Check size={13} className="text-success" /> {text}
              </span>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/[0.05] py-10 px-5 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-md shadow-primary/25">
              <TrendingUp size={15} className="text-white" />
            </div>
            <span className="font-bold text-sm">AI Personal Finance Tracker</span>
          </div>
          <p className="text-white/25 text-xs text-center">
            © 2026 AI Finance Tracker — Final Year Project<br />
            <span className="text-white/15">Waqar Ali · Muhammad Hamid · Zohaib Gulzar — Riphah International University, Faisalabad</span>
          </p>
          <div className="flex gap-5 text-xs text-white/25">
            <Link to="/pricing" className="hover:text-warning transition-colors">Pricing</Link>
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
