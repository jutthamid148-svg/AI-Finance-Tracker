import { motion, useInView } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useRef, useState, useEffect } from 'react'
import {
  TrendingUp, Brain, Target, BarChart3, Zap,
  ChevronRight, Star, Check, Menu, X, ArrowRight,
  PieChart, Bell, Lock, Smartphone, Sparkles,
} from 'lucide-react'

// ── Animated counter ─────────────────────────────────────────────────────────
function useCounter(end: number, duration = 2000) {
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

// ── Data ─────────────────────────────────────────────────────────────────────
const features = [
  { icon: BarChart3, title: 'Expense Tracking', desc: 'Categorize every expense with emoji tags. Add, edit, delete with real-time updates.', color: 'from-blue-500 to-cyan-400', glow: 'rgba(59,130,246,0.2)' },
  { icon: Target, title: 'Budget Planning', desc: 'Monthly budgets per category with visual progress bars and instant limit alerts.', color: 'from-purple-500 to-pink-400', glow: 'rgba(168,85,247,0.2)' },
  { icon: TrendingUp, title: 'Savings Goals', desc: 'Create goals with deadlines. Track progress visually and hit every milestone.', color: 'from-green-500 to-emerald-400', glow: 'rgba(16,185,129,0.2)' },
  { icon: Brain, title: 'AI Insights', desc: 'Pandas + NumPy + Scikit-Learn analyze patterns and give personalized recommendations.', color: 'from-orange-500 to-amber-400', glow: 'rgba(245,158,11,0.2)' },
  { icon: Zap, title: 'Forecasting', desc: 'Linear Regression predicts next month expenses with high/medium/low confidence.', color: 'from-red-500 to-rose-400', glow: 'rgba(239,68,68,0.2)' },
  { icon: PieChart, title: 'Smart Reports', desc: 'Beautiful charts + export reports as PDF or Excel with full breakdowns.', color: 'from-indigo-500 to-violet-400', glow: 'rgba(99,102,241,0.2)' },
  { icon: Lock, title: 'Secure & Private', desc: 'JWT auth, bcrypt hashing, CSRF protection. Your data is never shared or sold.', color: 'from-teal-500 to-cyan-400', glow: 'rgba(20,184,166,0.2)' },
  { icon: Bell, title: 'Smart Alerts', desc: 'Real-time notifications for budget limits, savings milestones, and AI detections.', color: 'from-yellow-500 to-orange-400', glow: 'rgba(234,179,8,0.2)' },
  { icon: Smartphone, title: 'Fully Responsive', desc: 'Desktop, tablet, mobile — manage finances anywhere, anytime.', color: 'from-pink-500 to-rose-400', glow: 'rgba(236,72,153,0.2)' },
]

const testimonials = [
  { name: 'Ahmed Raza', role: 'Software Engineer, Lahore', text: 'The AI insights are incredibly accurate. Saved ₨30,000 extra in just two months!', rating: 5, initials: 'AR', color: 'from-blue-500 to-cyan-500' },
  { name: 'Fatima Khan', role: 'Freelance Designer, Karachi', text: 'Finally an app that understands Pakistani finances. The PKR-based tracking is perfect!', rating: 5, initials: 'FK', color: 'from-purple-500 to-pink-500' },
  { name: 'Bilal Hassan', role: 'Business Owner, Faisalabad', text: 'Expense predictions are remarkably accurate. Game changer for business cashflow planning!', rating: 5, initials: 'BH', color: 'from-green-500 to-emerald-500' },
]

const faqs = [
  { q: 'How does the AI analysis work?', a: 'We use Linear Regression and time-series analysis with Pandas, NumPy, and Scikit-Learn. It analyzes your historical transactions to detect spending patterns, overspending, and predict future expenses with confidence scores.' },
  { q: 'Is my financial data secure?', a: 'Yes. JWT authentication, bcrypt password hashing, and CSRF protection are all in place. Your data is never sold to third parties or shared with anyone.' },
  { q: 'Can I export my financial reports?', a: 'Yes! Export monthly reports as PDF or Excel (.xlsx) with complete breakdowns of income, expenses, savings, and category-wise analysis.' },
  { q: 'What currencies are supported?', a: 'Currently optimized for PKR (Pakistani Rupee). Support for USD, EUR, and other major currencies is planned for the next release.' },
  { q: 'How accurate are the spending predictions?', a: 'Accuracy improves with more data. With 3+ months of transactions, our model achieves high-confidence forecasts. The dashboard shows confidence levels for transparency.' },
]

const techStack = [
  { name: 'React', icon: '⚛️', desc: 'Frontend' },
  { name: 'Django', icon: '🐍', desc: 'Backend' },
  { name: 'Scikit-Learn', icon: '🤖', desc: 'ML' },
  { name: 'Pandas', icon: '🐼', desc: 'Analysis' },
  { name: 'NumPy', icon: '🔢', desc: 'Math' },
  { name: 'SQLite', icon: '🗄️', desc: 'Database' },
]

// ── Page ─────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const fadeUp = {
    hidden: { opacity: 0, y: 28 },
    visible: (i = 0) => ({
      opacity: 1, y: 0,
      transition: { duration: 0.55, ease: 'easeOut', delay: i * 0.07 },
    }),
  }

  return (
    <div className="min-h-screen text-white overflow-x-hidden" style={{ background: '#060d18' }}>

      {/* ── Ambient blobs ── */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full blur-[140px]" style={{ background: 'rgba(99,102,241,0.07)' }} />
        <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] rounded-full blur-[120px]" style={{ background: 'rgba(139,92,246,0.06)', animationDelay: '2s' }} />
        <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] rounded-full blur-[100px]" style={{ background: 'rgba(6,182,212,0.05)' }} />
        {/* subtle grid */}
        <div className="absolute inset-0 opacity-[0.018]" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.8) 1px, transparent 0)`,
          backgroundSize: '32px 32px',
        }} />
      </div>

      {/* ── Navbar ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06]"
        style={{ background: 'rgba(6,13,24,0.92)', backdropFilter: 'blur(24px)' }}>
        <div className="max-w-7xl mx-auto px-5 py-4 flex items-center justify-between">

          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg shadow-primary/30 group-hover:shadow-primary/50 transition-shadow">
              <TrendingUp size={18} className="text-white" />
            </div>
            <div className="hidden sm:block">
              <div className="font-bold text-sm leading-none">AI Finance Tracker</div>
              <div className="text-[9px] text-white/30 mt-0.5">Riphah University FYP</div>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-6 text-sm text-white/45">
            {[['#features', 'Features'], ['#how-it-works', 'How It Works'], ['#stats', 'Stats'], ['#testimonials', 'Reviews'], ['#faq', 'FAQ']].map(([href, label]) => (
              <a key={href} href={href} className="hover:text-white transition-colors">{label}</a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-2.5">
            <Link to="/login" className="text-sm text-white/50 hover:text-white transition-colors px-4 py-2">
              Sign In
            </Link>
            <Link to="/register"
              className="flex items-center gap-1.5 text-sm font-semibold text-white px-4 py-2.5 rounded-xl transition-all hover:-translate-y-0.5"
              style={{ background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', boxShadow: '0 4px 14px rgba(99,102,241,0.35)' }}
            >
              Get Started Free <ArrowRight size={14} />
            </Link>
          </div>

          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-white/60 hover:text-white p-1">
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="md:hidden border-t border-white/5 px-5 py-4 flex flex-col gap-4"
            style={{ background: 'rgba(6,13,24,0.98)' }}
          >
            {[['#features', 'Features'], ['#how-it-works', 'How It Works'], ['#stats', 'Stats'], ['#testimonials', 'Reviews']].map(([href, label]) => (
              <a key={href} href={href} className="text-white/55 hover:text-white transition-colors text-sm"
                onClick={() => setMenuOpen(false)}>{label}</a>
            ))}
            <div className="flex flex-col gap-2 pt-2 border-t border-white/5">
              <Link to="/login" className="btn-secondary text-center text-sm py-2.5">Sign In</Link>
              <Link to="/register"
                className="text-sm font-semibold text-white text-center py-2.5 rounded-xl"
                style={{ background: 'linear-gradient(135deg,#6366F1,#8B5CF6)' }}
              >
                Get Started Free
              </Link>
            </div>
          </motion.div>
        )}
      </nav>

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center justify-center pt-28 pb-20 px-5">
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-xs text-primary mb-7 border border-primary/25"
            >
              <Sparkles size={13} />
              FYP Project · Riphah International University, Faisalabad
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-5xl sm:text-6xl md:text-7xl font-black leading-[1.06] tracking-tight mb-6"
            >
              Manage Money
              <br />
              <span className="gradient-text">Smarter with AI</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.22 }}
              className="text-lg md:text-xl text-white/45 max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              An intelligent finance system built with <span className="text-white/70">Django + React + Machine Learning</span>.
              Track, predict, and optimize your finances — all in one platform.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-3.5 justify-center"
            >
              <Link to="/register"
                className="flex items-center justify-center gap-2 text-base font-bold text-white px-8 py-4 rounded-2xl transition-all hover:-translate-y-1"
                style={{ background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', boxShadow: '0 8px 28px rgba(99,102,241,0.4)' }}
              >
                Start Free Today <ArrowRight size={18} />
              </Link>
              <Link to="/login"
                className="flex items-center justify-center gap-2 text-base font-semibold px-8 py-4 rounded-2xl transition-all hover:-translate-y-0.5"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(248,250,252,0.75)' }}
              >
                Sign In to Dashboard
              </Link>
            </motion.div>
          </div>

          {/* ── Mock Dashboard ── */}
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1, delay: 0.45 }}
            className="relative max-w-4xl mx-auto"
          >
            {/* Glow behind */}
            <div className="absolute inset-0 rounded-3xl blur-3xl scale-95 translate-y-6"
              style={{ background: 'radial-gradient(ellipse, rgba(99,102,241,0.18) 0%, transparent 70%)' }} />

            <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
              style={{ background: 'rgba(10,16,30,0.95)', backdropFilter: 'blur(20px)' }}>

              {/* Browser bar */}
              <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/5"
                style={{ background: 'rgba(255,255,255,0.02)' }}>
                <div className="w-3 h-3 rounded-full bg-red-500/70" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                <div className="w-3 h-3 rounded-full bg-green-500/70" />
                <div className="flex-1 glass rounded-md px-3 py-1 text-[11px] text-white/25 ml-3 text-left">
                  aifinancetracker.vercel.app/dashboard
                </div>
              </div>

              <div className="p-5">
                {/* Stat cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  {[
                    { l: 'Balance', v: '₨1,45,000', i: '💳', c: 'from-primary to-secondary', ch: '+12%' },
                    { l: 'Income', v: '₨2,00,000', i: '📈', c: 'from-success to-emerald-600', ch: '+5%' },
                    { l: 'Expenses', v: '₨55,000', i: '📉', c: 'from-danger to-rose-600', ch: '-8%' },
                    { l: 'Savings', v: '₨75,000', i: '🎯', c: 'from-warning to-amber-500', ch: '+18%' },
                  ].map((s, i) => (
                    <motion.div key={i}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 + i * 0.08 }}
                      className="glass rounded-xl p-3 border border-white/5"
                    >
                      <div className="text-xl mb-1.5">{s.i}</div>
                      <div className="text-[10px] text-white/35">{s.l}</div>
                      <div className={`text-sm font-bold bg-gradient-to-r ${s.c} bg-clip-text text-transparent`}>{s.v}</div>
                      <div className="text-[9px] text-success mt-0.5">{s.ch} this month</div>
                    </motion.div>
                  ))}
                </div>

                {/* Chart area */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2 glass rounded-xl p-3 border border-white/5 h-28">
                    <div className="text-[10px] text-white/35 mb-2 font-medium">Income vs Expenses — 6 Months</div>
                    <div className="flex items-end gap-1 h-16">
                      {[55, 80, 60, 92, 70, 88].map((h, i) => (
                        <div key={i} className="flex-1 flex flex-col gap-0.5 items-center">
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${h}%` }}
                            transition={{ delay: 1 + i * 0.07, duration: 0.5, ease: 'easeOut' }}
                            className="w-full rounded-t-sm"
                            style={{ background: 'rgba(16,185,129,0.65)', alignSelf: 'flex-end' }}
                          />
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${h * 0.38}%` }}
                            transition={{ delay: 1.1 + i * 0.07, duration: 0.5, ease: 'easeOut' }}
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
                      <div className="text-4xl font-black text-success">87</div>
                      <div className="text-[10px] text-success font-semibold">Excellent</div>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '87%' }}
                        transition={{ delay: 1.2, duration: 0.8 }}
                        className="h-full bg-success rounded-full"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Tech Stack strip ── */}
      <section className="py-10 px-5 border-y border-white/[0.05] relative z-10">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-white/25 text-[10px] font-bold tracking-[0.2em] uppercase mb-6">
            Built with Industry-Standard Technologies
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {techStack.map((t, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="flex items-center gap-2 glass px-4 py-2.5 rounded-xl border border-white/6 hover:border-primary/25 transition-colors cursor-default"
              >
                <span className="text-lg">{t.icon}</span>
                <div>
                  <div className="text-xs font-semibold text-white/75">{t.name}</div>
                  <div className="text-[9px] text-white/30">{t.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-24 px-5 relative z-10">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-14">
            <span className="badge badge-primary mb-4 text-xs px-4 py-1.5">Features</span>
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Everything to <span className="gradient-text">master your money</span>
            </h2>
            <p className="text-white/45 max-w-xl mx-auto text-base">
              From simple expense tracking to AI-powered predictions — all the tools you need.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <motion.div key={i}
                custom={i} variants={fadeUp} initial="hidden"
                whileInView="visible" viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="relative rounded-2xl p-6 cursor-default overflow-hidden transition-all"
                style={{
                  background: `rgba(15,23,42,0.65)`,
                  border: '1px solid rgba(255,255,255,0.07)',
                  backdropFilter: 'blur(20px)',
                }}
              >
                <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity rounded-2xl"
                  style={{ boxShadow: `0 0 40px ${f.glow}` }} />
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4 shadow-lg`}>
                  <f.icon size={22} className="text-white" />
                </div>
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
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-14">
            <span className="badge badge-accent mb-4 text-xs px-4 py-1.5">How It Works</span>
            <h2 className="text-4xl font-black mb-3">Simple as <span className="gradient-text">1, 2, 3</span></h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Register & Add Transactions', desc: 'Create a free account and start logging income and expenses with category tags.', icon: '📝', color: 'from-primary to-secondary' },
              { step: '02', title: 'AI Analyzes Your Data', desc: 'Scikit-Learn + Pandas processes your transactions to detect spending patterns and saving opportunities.', icon: '🧠', color: 'from-secondary to-pink-500' },
              { step: '03', title: 'Get Insights & Predictions', desc: 'Receive personalized tips, future expense forecasts, and beautiful visual reports.', icon: '🚀', color: 'from-success to-accent' },
            ].map((s, i) => (
              <motion.div key={i}
                custom={i} variants={fadeUp} initial="hidden"
                whileInView="visible" viewport={{ once: true }}
                className="text-center"
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center mx-auto mb-5 text-2xl shadow-xl`}>
                  {s.icon}
                </div>
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
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative rounded-3xl p-12 overflow-hidden"
            style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(139,92,246,0.06) 100%)', border: '1px solid rgba(99,102,241,0.2)' }}
          >
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
              <StatCounter value={12500} suffix="+" label="Active Users" />
              <StatCounter value={850} suffix="M+" prefix="₨" label="Total Tracked" />
              <StatCounter value={94} suffix="%" label="Budget Success Rate" />
              <StatCounter value={25000} suffix="+" label="Goals Achieved" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section id="testimonials" className="py-24 px-5 relative z-10">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-14">
            <span className="badge badge-warning mb-4 text-xs px-4 py-1.5">Reviews</span>
            <h2 className="text-4xl font-black">What our <span className="gradient-text">users say</span></h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {testimonials.map((t, i) => (
              <motion.div key={i}
                custom={i} variants={fadeUp} initial="hidden"
                whileInView="visible" viewport={{ once: true }}
                whileHover={{ y: -4 }}
                className="card"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center font-bold text-sm shadow-lg`}>
                    {t.initials}
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{t.name}</div>
                    <div className="text-white/35 text-xs">{t.role}</div>
                  </div>
                </div>
                <div className="flex gap-0.5 mb-3">
                  {Array(t.rating).fill(0).map((_, j) => (
                    <Star key={j} size={13} className="text-warning fill-warning" />
                  ))}
                </div>
                <p className="text-white/60 text-sm leading-relaxed">"{t.text}"</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-24 px-5 relative z-10">
        <div className="max-w-2xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-12">
            <span className="badge badge-success mb-4 text-xs px-4 py-1.5">FAQ</span>
            <h2 className="text-4xl font-black">Frequently <span className="gradient-text">Asked Questions</span></h2>
          </motion.div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <motion.div key={i}
                custom={i} variants={fadeUp} initial="hidden"
                whileInView="visible" viewport={{ once: true }}
                className="card cursor-pointer hover:border-primary/20 transition-colors"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                <div className="flex items-center justify-between gap-4">
                  <h3 className="font-medium text-sm">{faq.q}</h3>
                  <ChevronRight size={15} className={`text-primary flex-shrink-0 transition-transform duration-200 ${openFaq === i ? 'rotate-90' : ''}`} />
                </div>
                {openFaq === i && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="text-white/50 text-sm mt-3 leading-relaxed"
                  >
                    {faq.a}
                  </motion.p>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-5 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center relative rounded-3xl p-12 md:p-16 overflow-hidden"
          style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(139,92,246,0.08) 100%)', border: '1px solid rgba(99,102,241,0.25)' }}
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          <div className="text-5xl mb-5">🚀</div>
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            Start your journey <span className="gradient-text">today</span>
          </h2>
          <p className="text-white/45 text-base mb-9 max-w-lg mx-auto leading-relaxed">
            Join thousands of Pakistanis managing money smarter with AI-powered insights and predictions.
          </p>
          <Link to="/register"
            className="inline-flex items-center gap-2 text-base font-bold text-white px-10 py-4 rounded-2xl transition-all hover:-translate-y-1"
            style={{ background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', boxShadow: '0 10px 32px rgba(99,102,241,0.4)' }}
          >
            Create Free Account <ArrowRight size={18} />
          </Link>
          <div className="flex items-center justify-center gap-5 mt-7 text-sm text-white/30">
            <span className="flex items-center gap-1.5"><Check size={13} className="text-success" /> Free forever</span>
            <span className="flex items-center gap-1.5"><Check size={13} className="text-success" /> No credit card</span>
            <span className="flex items-center gap-1.5"><Check size={13} className="text-success" /> Instant access</span>
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
            © 2025 AI Finance Tracker — Final Year Project<br />
            <span className="text-white/15">Waqar Ali · Muhammad Hamid · Zohaib Gulzar — Riphah International University, Faisalabad</span>
          </p>
          <div className="flex gap-5 text-xs text-white/25">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
