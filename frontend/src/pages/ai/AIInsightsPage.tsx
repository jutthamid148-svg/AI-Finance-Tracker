import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SkeletonAIInsights } from '../../components/ui/Skeleton'
import ErrorState from '../../components/ui/ErrorState'
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  PieChart, Pie, ComposedChart,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, ReferenceLine, Legend, Label,
} from 'recharts'
import {
  Brain, TrendingUp, TrendingDown, AlertTriangle,
  Lightbulb, Target, BarChart2, Sparkles,
  ArrowUpRight, ArrowDownRight, Wallet, ChevronRight,
  ShieldCheck, Calendar, Activity, PiggyBank, Zap,
  Coffee, ShoppingBag, Car, Utensils, CheckCircle, RefreshCw,
  Trash2, X,
} from 'lucide-react'
import { aiAPI, transactionAPI, authAPI } from '../../services/api'

// ── Colors ───────────────────────────────────────────────────────────────────
const CAT_COLORS: Record<string, string> = {
  food: '#F59E0B', transport: '#6366F1', shopping: '#EC4899',
  bills: '#EF4444', health: '#10B981', education: '#06B6D4',
  entertainment: '#8B5CF6', other: '#64748B',
}
const CAT_EMOJIS: Record<string, string> = {
  food: '🍔', transport: '🚗', shopping: '🛍️',
  bills: '📄', health: '🏥', education: '📚',
  entertainment: '🎮', other: '💼',
}
const HEALTH_COLORS: Record<string, string> = {
  success: '#10B981', primary: '#6366F1', warning: '#F59E0B', danger: '#EF4444',
}

// ── Tooltips ─────────────────────────────────────────────────────────────────
function Tip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="glass rounded-xl px-3.5 py-3 border border-white/10 text-xs shadow-xl">
      <p className="text-white/50 mb-2 font-medium">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="font-semibold mb-0.5" style={{ color: p.color }}>
          {p.name}: ₨{Number(p.value).toLocaleString()}
        </p>
      ))}
    </div>
  )
}

function PieTip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const d = payload[0]
  return (
    <div className="glass rounded-xl px-3 py-2 border border-white/10 text-xs shadow-xl">
      <p className="font-bold capitalize" style={{ color: d.payload.fill || '#fff' }}>
        {CAT_EMOJIS[d.name] || '💼'} {d.name}
      </p>
      <p className="text-white/60 mt-0.5">₨{Number(d.value).toLocaleString()}</p>
      <p className="text-white/40">{d.payload.percentage}% of spending</p>
    </div>
  )
}

function RadarTip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="glass rounded-xl px-3 py-2 border border-white/10 text-xs shadow-xl">
      <p className="font-bold text-white/70 capitalize">{payload[0]?.payload?.category}</p>
      <p className="text-primary">₨{Number(payload[0]?.value || 0).toLocaleString()}</p>
    </div>
  )
}

function BarTip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="glass rounded-xl px-3.5 py-3 border border-white/10 text-xs shadow-xl">
      <p className="text-white/50 mb-1.5 font-medium">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="font-semibold mb-0.5" style={{ color: p.color }}>
          {p.name}: ₨{Number(p.value).toLocaleString()}
        </p>
      ))}
    </div>
  )
}

// ── Mini stat card ────────────────────────────────────────────────────────────
function MiniStat({ label, value, sub, color, icon: Icon, trend }: {
  label: string; value: string; sub?: string; color: string
  icon: any; trend?: 'up' | 'down' | null
}) {
  return (
    <motion.div whileHover={{ y: -3 }} className="card relative overflow-hidden">
      <div className={`absolute inset-0 opacity-[0.05] bg-gradient-to-br ${color}`} />
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg`}>
            <Icon size={16} className="text-white" />
          </div>
          {trend && (
            <div className={`flex items-center gap-0.5 text-xs font-semibold ${trend === 'up' ? 'text-success' : 'text-danger'}`}>
              {trend === 'up' ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
            </div>
          )}
        </div>
        <p className="text-white/40 text-xs mb-0.5">{label}</p>
        <p className="text-xl font-black text-white">{value}</p>
        {sub && <p className="text-white/30 text-[10px] mt-0.5">{sub}</p>}
      </div>
    </motion.div>
  )
}

// ── Section wrapper ───────────────────────────────────────────────────────────
function Section({ title, subtitle, icon: Icon, color = 'from-primary to-secondary', badge, children }: {
  title: string; subtitle: string; icon: any; color?: string; badge?: string; children: React.ReactNode
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45 }}
      className="card"
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-md`}>
            <Icon size={17} className="text-white" />
          </div>
          <div>
            <h2 className="font-bold text-sm">{title}</h2>
            <p className="text-white/35 text-xs">{subtitle}</p>
          </div>
        </div>
        {badge && <span className="badge badge-primary text-[10px]">{badge}</span>}
      </div>
      {children}
    </motion.div>
  )
}

// ── Savings Tip Card ─────────────────────────────────────────────────────────
function SavingTip({ icon: Icon, title, amount, desc, color, delay = 0 }: {
  icon: any; title: string; amount?: string; desc: string; color: string; delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ y: -3 }}
      className="glass rounded-2xl p-4 border border-white/6 relative overflow-hidden group"
    >
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-[0.04] bg-gradient-to-br ${color} transition-opacity`} />
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0 shadow-lg`}>
          <Icon size={18} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <p className="font-bold text-sm">{title}</p>
            {amount && <span className="text-success font-bold text-sm flex-shrink-0">{amount}</span>}
          </div>
          <p className="text-white/50 text-xs leading-relaxed">{desc}</p>
        </div>
      </div>
    </motion.div>
  )
}

// ── 50/30/20 Rule Card ────────────────────────────────────────────────────────
function BudgetRuleBar({ label, pct, amount, color, target }: {
  label: string; pct: number; amount: number; color: string; target: string
}) {
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between text-xs mb-1.5">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
          <span className="text-white/70 font-medium">{label}</span>
          <span className="text-white/30">({target})</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-white/40">{pct.toFixed(0)}%</span>
          <span className="font-bold">₨{Math.round(amount).toLocaleString()}</span>
        </div>
      </div>
      <div className="w-full h-2.5 rounded-full bg-white/5 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(pct, 100)}%` }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ background: color }}
        />
      </div>
    </div>
  )
}

// ── Main Page ────────────────────────────────────────────────────────────────
// ── Analysis steps definition ────────────────────────────────────────────────
const ANALYSIS_STEPS = [
  { label: 'Loading your transactions',        icon: '📥', detail: 'Fetching income & expenses from database...' },
  { label: 'Analyzing spending categories',    icon: '🔍', detail: 'Grouping expenses by food, transport, bills...' },
  { label: 'Running Polynomial Regression',    icon: '🤖', detail: 'Training ML model on your historical data...' },
  { label: 'Generating 3-month forecast',      icon: '🔮', detail: 'Predicting expenses for next 3 months...' },
  { label: 'Calculating financial health',     icon: '💊', detail: 'Computing savings rate, budget compliance...' },
  { label: 'Detecting overspending patterns',  icon: '⚠️', detail: 'Comparing current vs previous month...' },
  { label: 'Building personalized tips',       icon: '💡', detail: 'Generating recommendations for your data...' },
  { label: 'Analysis complete!',               icon: '✅', detail: 'All insights ready.' },
]

// ── Analysis Overlay Component ────────────────────────────────────────────────
function AnalysisOverlay({ onDone, insights, historicalData }: {
  onDone: () => void
  insights: any
  historicalData: any[]
}) {
  const [step, setStep] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    // Step through steps; last step = done state
    if (step >= ANALYSIS_STEPS.length - 1) {
      setDone(true)
      return
    }
    const delays = [500, 700, 900, 750, 600, 650, 700]
    const t = setTimeout(() => setStep(s => s + 1), delays[step] ?? 600)
    return () => clearTimeout(t)
  }, [step])

  const analysis   = insights?.spending_analysis
  const expPred    = insights?.predictions
  const healthData = insights?.health_score
  const totalExp   = analysis?.total_expenses || 0
  const monthlyInc = analysis?.monthly_income  || 0
  const catBreak   = analysis?.category_breakdown || []

  const summaryStats = [
    { label: 'Months Analyzed',   value: `${historicalData.length}`,                                          color: 'text-accent',   icon: '📅' },
    { label: 'Total Expenses',    value: totalExp   > 0 ? `₨${(totalExp   / 1000).toFixed(1)}k` : '—',        color: 'text-danger',   icon: '💸' },
    { label: 'Monthly Income',    value: monthlyInc > 0 ? `₨${(monthlyInc / 1000).toFixed(1)}k` : '—',        color: 'text-success',  icon: '💵' },
    { label: 'Next Month Pred.',  value: expPred?.prediction > 0 ? `₨${(expPred.prediction / 1000).toFixed(1)}k` : '—', color: 'text-primary', icon: '🔮' },
    { label: 'Health Score',      value: healthData?.score != null ? `${healthData.score}/100` : '—',          color: 'text-warning',  icon: '🏆' },
    { label: 'Savings Rate',      value: analysis?.savings_rate != null ? `${Math.round(analysis.savings_rate)}%` : '—', color: 'text-emerald-400', icon: '💰' },
    { label: 'Categories Found',  value: `${catBreak.length}`,                                                 color: 'text-secondary', icon: '📊' },
    { label: 'Top Category',      value: catBreak[0]?.category ? catBreak[0].category.charAt(0).toUpperCase() + catBreak[0].category.slice(1) : '—', color: 'text-orange-400', icon: '🥇' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(10px)' }}
    >
      <motion.div
        initial={{ scale: 0.9, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 30 }}
        className="w-full max-w-lg rounded-2xl border border-primary/30 overflow-hidden shadow-2xl"
        style={{ background: 'linear-gradient(135deg, #0c0c1e 0%, #080812 100%)' }}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/6"
          style={{ background: 'linear-gradient(90deg, rgba(99,102,241,0.12), rgba(139,92,246,0.08))' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/30">
              <Brain size={20} className="text-white" />
            </div>
            <div>
              <p className="font-black text-base text-white">AI Analysis Running</p>
              <p className="text-white/35 text-xs">Scikit-Learn · Polynomial Regression · Pandas</p>
            </div>
            {done && (
              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
                className="ml-auto badge badge-success text-xs font-bold">
                ✅ Complete
              </motion.span>
            )}
          </div>
        </div>

        <div className="p-6 space-y-4">

          {/* Steps list */}
          <div className="space-y-2">
            {ANALYSIS_STEPS.map((s, i) => {
              const isActive  = i === step
              const isPast    = i < step
              const isFuture  = i > step
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: isFuture ? 0.3 : 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                    isActive ? 'border border-primary/40' : 'border border-transparent'
                  }`}
                  style={isActive ? { background: 'rgba(99,102,241,0.08)' } : {}}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-sm transition-all ${
                    isPast   ? 'bg-success/20'  :
                    isActive ? 'bg-primary/25 shadow-md shadow-primary/20' :
                               'bg-white/5'
                  }`}>
                    {isPast ? '✓' : s.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-semibold transition-colors ${
                      isPast ? 'text-white/50' : isActive ? 'text-white' : 'text-white/25'
                    }`}>{s.label}</p>
                    {isActive && (
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="text-[10px] text-white/35 mt-0.5">{s.detail}</motion.p>
                    )}
                  </div>
                  {isActive && !done && (
                    <div className="flex gap-0.5 flex-shrink-0">
                      {[0,1,2].map(j => (
                        <motion.div key={j} className="w-1.5 h-1.5 rounded-full bg-primary/60"
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 0.8, repeat: Infinity, delay: j * 0.2 }} />
                      ))}
                    </div>
                  )}
                  {isPast && (
                    <span className="text-success text-xs flex-shrink-0">✓</span>
                  )}
                </motion.div>
              )
            })}
          </div>

          {/* Progress bar */}
          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #6366F1, #8B5CF6, #06B6D4)' }}
              animate={{ width: `${((step + 1) / ANALYSIS_STEPS.length) * 100}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>
          <p className="text-center text-white/20 text-[10px]">
            {step + 1}/{ANALYSIS_STEPS.length} steps
          </p>

          {/* Results summary — shown when done */}
          <AnimatePresence>
            {done && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-3"
              >
                <p className="text-white/30 text-[10px] font-semibold uppercase tracking-wider">Analysis Results</p>
                <div className="grid grid-cols-4 gap-2">
                  {summaryStats.map((s, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 + i * 0.06 }}
                      className="glass rounded-xl p-2.5 border border-white/5 text-center"
                    >
                      <div className="text-base mb-1">{s.icon}</div>
                      <p className={`text-sm font-black ${s.color}`}>{s.value}</p>
                      <p className="text-white/25 text-[9px] mt-0.5 leading-tight">{s.label}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Top recommendations preview */}
                {(insights?.recommendations || []).slice(0, 2).map((rec: string, i: number) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + i * 0.1 }}
                    className="flex items-start gap-2 glass px-3 py-2 rounded-xl border border-warning/15"
                  >
                    <span className="text-warning text-xs mt-0.5">💡</span>
                    <p className="text-xs text-white/60 leading-relaxed">{rec}</p>
                  </motion.div>
                ))}

                <motion.button
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                  onClick={onDone}
                  className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', boxShadow: '0 6px 20px rgba(99,102,241,0.4)' }}
                >
                  View Full Report →
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </motion.div>
    </motion.div>
  )
}

// ── Reset Data Modal ──────────────────────────────────────────────────────────
function ResetDataModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [text, setText]       = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone]       = useState(false)
  const confirmed              = text === 'RESET'

  const handleReset = async () => {
    if (!confirmed || loading) return
    setLoading(true)
    try {
      await authAPI.resetData()
      setDone(true)
      setTimeout(onSuccess, 1800)
    } catch (err: any) {
      setLoading(false)
      const msg = err?.response?.data?.error || err?.message || 'Reset failed. Try again.'
      alert(msg)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center px-4"
        style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
        onClick={(e) => { if (e.target === e.currentTarget && !loading) onClose() }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="glass-card p-6 w-full max-w-sm relative"
        >
          {!done ? (
            <>
              <button onClick={onClose} disabled={loading}
                className="absolute top-4 right-4 text-white/30 hover:text-white/70 transition-colors">
                <X size={18} />
              </button>

              <div className="w-12 h-12 rounded-2xl bg-danger/15 border border-danger/30 flex items-center justify-center mb-4">
                <Trash2 size={22} className="text-danger" />
              </div>

              <h3 className="text-lg font-black mb-1">Reset All Data</h3>
              <p className="text-white/50 text-sm mb-4 leading-relaxed">
                Yeh action <span className="text-danger font-semibold">permanently</span> delete karega:
                expenses, income, budgets, savings goals, aur notifications.
              </p>

              <div className="glass rounded-xl p-3 border border-white/8 mb-4 space-y-1.5 text-xs text-white/50">
                {['All Expenses', 'All Income Records', 'All Budgets', 'All Savings Goals', 'All Notifications'].map(item => (
                  <div key={item} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-danger/60 flex-shrink-0" />
                    {item}
                  </div>
                ))}
              </div>

              <label className="text-xs text-white/40 mb-1.5 block font-semibold uppercase tracking-wide">
                Confirm karne ke liye "RESET" likhein
              </label>
              <input
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder='Type RESET here'
                autoFocus
                className="w-full glass rounded-xl px-3.5 py-2.5 text-sm border border-white/10 focus:border-danger/50 outline-none bg-transparent mb-4 placeholder:text-white/20 font-mono tracking-widest"
              />

              <div className="flex gap-2.5">
                <button onClick={onClose} disabled={loading}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold glass border border-white/10 text-white/60 hover:text-white transition-colors">
                  Cancel
                </button>
                <button
                  onClick={handleReset}
                  disabled={!confirmed || loading}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  style={confirmed ? { background: 'linear-gradient(135deg,#EF4444,#DC2626)', boxShadow: '0 4px 14px rgba(239,68,68,0.4)' } : { background: 'rgba(239,68,68,0.15)' }}
                >
                  {loading ? <><RefreshCw size={13} className="animate-spin" /> Deleting...</> : <><Trash2 size={13} /> Reset Data</>}
                </button>
              </div>
            </>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center py-4 text-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-success/15 border border-success/30 flex items-center justify-center">
                <CheckCircle size={28} className="text-success" />
              </div>
              <div>
                <p className="font-black text-lg">Data Reset Ho Gaya!</p>
                <p className="text-white/40 text-sm mt-0.5">Sab kuch delete kar diya gaya</p>
              </div>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function AIInsightsPage() {

  const [lastRunAt, setLastRunAt]       = useState<Date | null>(null)
  const [showOverlay, setShowOverlay]   = useState(false)
  const [showReset, setShowReset]       = useState(false)
  const initialLoadDone                 = useRef(false)
  const queryClient                     = useQueryClient()

  const { data: insights, isLoading: insightsLoading, error: insightsError, refetch: refetchInsights, isFetching: insightsFetching, dataUpdatedAt } = useQuery({
    queryKey: ['ai-insights'],
    queryFn: () => aiAPI.insights().then(r => r.data),
  })

  // Set lastRunAt on first successful load
  useEffect(() => {
    if (dataUpdatedAt > 0 && !initialLoadDone.current) {
      initialLoadDone.current = true
      setLastRunAt(new Date(dataUpdatedAt))
    }
  }, [dataUpdatedAt])

  const handleRunAnalysis = () => {
    setLastRunAt(new Date())
    setShowOverlay(true)
    refetchInsights()
  }

  const { data: monthlyHistory, isLoading: historyLoading } = useQuery({
    queryKey: ['monthly-chart'],
    queryFn: () => transactionAPI.monthlyChart().then(r => r.data),
  })

  const isLoading = insightsLoading || historyLoading

  const analysis   = insights?.spending_analysis
  const overspend  = insights?.overspending
  const recs       = insights?.recommendations as string[] | undefined
  const expPred    = insights?.predictions
  const savPred    = insights?.savings_predictions
  const healthData = insights?.health_score

  // ── Build historical chart data ───────────────────────────────────────────
  const historicalData: any[] = (monthlyHistory || []).map((m: any) => ({
    month: m.month,
    expenses: m.expenses,
    income: m.income,
    savings: Math.max(m.savings, 0),
  }))

  const savingsTimeline: any[] = [
    ...historicalData.map(m => ({
      month: m.month,
      actualSavings: m.savings,
      predictedSavings: null,
      cumulativePredicted: null,
    })),
    ...(savPred?.predictions || []).map((p: any) => ({
      month: p.month,
      actualSavings: null,
      predictedSavings: p.predicted_savings,
      cumulativePredicted: p.cumulative_savings,
    })),
  ]

  // 3-month expense forecast timeline
  const expenseTimeline: any[] = [
    ...historicalData.map(m => ({ month: m.month, actual: m.expenses, predicted: null })),
    ...(expPred?.monthly_predictions || []).map((p: any) => ({
      month: p.month,
      actual: null,
      predicted: p.predicted,
    })),
  ]

  const lastActualSavings = historicalData.length > 0 ? historicalData[historicalData.length - 1].savings : 0
  const totalHistoricalExpenses = historicalData.reduce((s, m) => s + m.expenses, 0)
  const avgMonthlyExpense = historicalData.length > 0 ? totalHistoricalExpenses / historicalData.length : 0
  const currentMonthSavings = historicalData.length > 0 ? historicalData[historicalData.length - 1].savings : 0

  // Radar data: category spending vs average
  const radarData = (analysis?.category_breakdown || []).map((c: any) => ({
    category: c.category,
    amount: c.amount,
    avgAmount: avgMonthlyExpense > 0 ? (c.amount / analysis.total_expenses) * avgMonthlyExpense : 0,
  }))

  // Monthly income vs expenses bar chart (last 6 months)
  const monthlyBarData = historicalData.slice(-6).map((m: any) => ({
    month: m.month,
    income: m.income,
    expenses: m.expenses,
    savings: Math.max(m.savings, 0),
  }))

  // 50/30/20 rule
  const monthlyIncome = analysis?.monthly_income || 0
  const needsTarget   = monthlyIncome * 0.50
  const wantsTarget   = monthlyIncome * 0.30
  const savingsTarget = monthlyIncome * 0.20
  const totalExp      = analysis?.total_expenses || 0
  const catBreak      = analysis?.category_breakdown || []
  const needsCats     = ['food', 'transport', 'health', 'bills', 'education']
  const needsAmt      = catBreak.filter((c: any) => needsCats.includes(c.category)).reduce((s: number, c: any) => s + c.amount, 0)
  const wantsAmt      = catBreak.filter((c: any) => !needsCats.includes(c.category)).reduce((s: number, c: any) => s + c.amount, 0)
  const actualSavings = Math.max(monthlyIncome - totalExp, 0)

  // Personalized saving tips
  const savingTips = (() => {
    const tips: Array<{ icon: any; title: string; amount?: string; desc: string; color: string }> = []
    const food = catBreak.find((c: any) => c.category === 'food')
    if (food && food.amount > 8000)
      tips.push({ icon: Utensils, title: 'Cook at Home More', amount: `+₨${Math.round(food.amount * 0.15).toLocaleString()}/mo`, desc: `Reducing restaurant visits by 15% could save ₨${Math.round(food.amount * 0.15).toLocaleString()} monthly. Meal prep on Sundays helps!`, color: 'from-orange-500 to-amber-400' })
    const transport = catBreak.find((c: any) => c.category === 'transport')
    if (transport && transport.amount > 6000)
      tips.push({ icon: Car, title: 'Use Public Transport', amount: `+₨${Math.round(transport.amount * 0.35).toLocaleString()}/mo`, desc: `Carpooling or bus on 3 days/week could cut your ₨${Math.round(transport.amount).toLocaleString()} transport bill by 35%.`, color: 'from-blue-500 to-cyan-400' })
    const shopping = catBreak.find((c: any) => c.category === 'shopping')
    if (shopping && shopping.amount > 5000)
      tips.push({ icon: ShoppingBag, title: '24-Hour Purchase Rule', amount: `+₨${Math.round(shopping.amount * 0.25).toLocaleString()}/mo`, desc: 'Wait 24 hours before any non-essential purchase. Eliminates impulse buying — could save 25% of shopping spend.', color: 'from-pink-500 to-rose-400' })
    const entertainment = catBreak.find((c: any) => c.category === 'entertainment')
    if (entertainment && entertainment.amount > 3000)
      tips.push({ icon: Coffee, title: 'Cut Entertainment', amount: `+₨${Math.round(entertainment.amount * 0.3).toLocaleString()}/mo`, desc: 'Switch cinema to streaming services. A Netflix subscription saves vs multiple cinema trips per month.', color: 'from-purple-500 to-violet-400' })
    if (actualSavings > 0)
      tips.push({ icon: PiggyBank, title: 'Automate Your Savings', amount: `₨${Math.round(actualSavings).toLocaleString()}/mo`, desc: 'Set up an auto-transfer of your monthly surplus on salary day. Saved money you never see gets spent on goals.', color: 'from-green-500 to-emerald-400' })
    if (monthlyIncome > 0 && actualSavings / monthlyIncome >= 0.15)
      tips.push({ icon: Zap, title: 'Invest Your Surplus', amount: '', desc: 'With 15%+ savings rate, consider putting extra funds in savings accounts, mutual funds, or government bonds for passive returns.', color: 'from-yellow-500 to-amber-400' })
    if (tips.length === 0)
      tips.push({ icon: Lightbulb, title: 'Track All Expenses', amount: '', desc: 'Add more expense transactions so AI can generate personalized saving tips for your exact spending patterns.', color: 'from-primary to-secondary' })
    return tips.slice(0, 6)
  })()

  // ── Prediction-center derived data ─────────────────────────────────────
  const currentCatMap: Record<string, number> = {}
  catBreak.forEach((c: any) => { currentCatMap[c.category] = c.amount })

  const predTotal   = expPred?.prediction || 0
  const predTrendPct = predTotal > 0 && analysis?.total_expenses > 0
    ? ((predTotal - analysis.total_expenses) / analysis.total_expenses) * 100
    : 0

  const catPredictions: Array<{
    category: string; current: number; predicted: number; changePct: number
  }> = (expPred?.predictions_by_category || []).map((c: any) => {
    const cur = currentCatMap[c.category] || 0
    const chg = cur > 0 ? ((c.predicted_amount - cur) / cur) * 100 : 0
    return { category: c.category, current: cur, predicted: c.predicted_amount, changePct: chg }
  })

  const predAlerts = catPredictions
    .filter(c => c.current > 0 && c.changePct > 15)
    .sort((a, b) => b.changePct - a.changePct)
    .slice(0, 4)

  const monthlyIncomePred = savPred?.monthly_income || monthlyIncome
  const predSurplus = monthlyIncomePred - predTotal
  const predOverBudget = monthlyIncomePred > 0 && predTotal > monthlyIncomePred

  // Pie chart data for category breakdown
  const pieData = (analysis?.category_breakdown || []).map((c: any) => ({
    name: c.category,
    value: c.amount,
    percentage: c.percentage,
    fill: CAT_COLORS[c.category] || '#6366F1',
  }))

  // Radial data for health score gauge
  const healthScore = healthData?.score || 0
  const healthColor = HEALTH_COLORS[healthData?.color || 'warning']
  const gaugeData = [
    { name: 'Score', value: healthScore, fill: healthColor },
    { name: 'Remaining', value: 100 - healthScore, fill: 'rgba(255,255,255,0.05)' },
  ]

  // Savings rate donut
  const savingsRate = analysis?.savings_rate || 0
  const savingsDonut = [
    { name: 'Saved', value: Math.max(savingsRate, 0), fill: '#10B981' },
    { name: 'Spent', value: Math.max(100 - savingsRate, 0), fill: 'rgba(255,255,255,0.05)' },
  ]

  const handleResetSuccess = () => {
    queryClient.clear()
    setShowReset(false)
    window.location.href = '/dashboard'
  }

  return (
    <div className="p-5 md:p-6 max-w-7xl mx-auto">

      {/* ── Reset Modal ── */}
      {showReset && (
        <ResetDataModal
          onClose={() => setShowReset(false)}
          onSuccess={handleResetSuccess}
        />
      )}

      {/* ── Analysis Overlay ── */}
      <AnimatePresence>
        {showOverlay && (
          <AnalysisOverlay
            onDone={() => setShowOverlay(false)}
            insights={insights}
            historicalData={historicalData}
          />
        )}
      </AnimatePresence>

      {/* ── Header ── */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-7">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-secondary to-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/25">
              <Brain size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black">AI Insights</h1>
              <p className="text-white/40 text-sm">Polynomial Regression · Pandas · Scikit-Learn</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Data quality badge */}
            {expPred?.months_analyzed != null && (
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-semibold
                ${expPred.months_analyzed >= 4
                  ? 'border-success/30 text-success bg-success/[0.07]'
                  : expPred.months_analyzed >= 2
                  ? 'border-warning/30 text-warning bg-warning/[0.07]'
                  : 'border-danger/30 text-danger bg-danger/[0.07]'}`}>
                <Activity size={11} />
                {expPred.months_analyzed} months data
                {expPred.months_analyzed < 3 && ' — add more for accuracy'}
              </div>
            )}
            {lastRunAt && (
              <div className="flex items-center gap-1.5 glass px-3 py-1.5 rounded-xl border border-white/10">
                <Calendar size={12} className="text-white/30" />
                <span className="text-[11px] text-white/40 font-medium uppercase tracking-wide">
                  Last Run: {lastRunAt.toLocaleString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
                </span>
              </div>
            )}
            <button
              onClick={() => setShowReset(true)}
              title="Reset all data"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-danger border border-danger/30 bg-danger/[0.07] hover:bg-danger/15 transition-all"
            >
              <Trash2 size={13} /> Reset
            </button>
            <button
              onClick={handleRunAnalysis}
              disabled={insightsFetching}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', boxShadow: '0 4px 14px rgba(99,102,241,0.35)' }}
            >
              {insightsFetching
                ? <><RefreshCw size={14} className="animate-spin" /> Running...</>
                : <>🤖 Run Analysis</>
              }
            </button>
          </div>
        </div>
      </motion.div>

      {isLoading ? (
        <SkeletonAIInsights />
      ) : insightsError ? (
        <ErrorState
          type="server"
          title="AI Analysis Unavailable"
          message="Could not load your AI insights. The ML engine may be starting up. Please try again."
          onRetry={() => refetchInsights()}
        />
      ) : (
        <div className="space-y-5">

          {/* ── Overview Cards ── */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MiniStat label="Total Expenses" value={`₨${Math.round(totalHistoricalExpenses / 1000)}k`} sub="All recorded" color="from-danger to-rose-600" icon={TrendingDown} />
            <MiniStat label="Avg Monthly" value={`₨${Math.round(avgMonthlyExpense / 1000)}k`} sub="Per month" color="from-warning to-amber-500" icon={BarChart2} />
            <MiniStat label="Current Savings" value={`₨${Math.round(currentMonthSavings / 1000)}k`} sub="This month" color="from-success to-emerald-600" icon={Wallet} trend={currentMonthSavings > 0 ? 'up' : 'down'} />
            <MiniStat label="Next Month Forecast" value={expPred?.prediction > 0 ? `₨${Math.round(expPred.prediction / 1000)}k` : avgMonthlyExpense > 0 ? `₨${Math.round(avgMonthlyExpense / 1000)}k` : '—'} sub={expPred?.confidence ? `${expPred.confidence} confidence` : avgMonthlyExpense > 0 ? 'trend estimate' : 'Need data'} color="from-accent to-cyan-600" icon={Target} trend="up" />
          </motion.div>

          {/* ════════════════════════════════════════════════════════════════
              🔮  SMART PREDICTIONS PANEL  —  always visible
          ════════════════════════════════════════════════════════════════ */}
          {(() => {
            if (historicalData.length === 0) return null

            // ── derive prediction values (ML if available, else trend) ──
            const last2 = historicalData.slice(-2)
            const trendMult = last2.length >= 2 && last2[0].expenses > 0
              ? Math.min(last2[1].expenses / last2[0].expenses, 1.5)   // cap at 150%
              : 1
            const incTrendMult = last2.length >= 2 && last2[0].income > 0
              ? Math.min(last2[1].income / last2[0].income, 1.5)
              : 1

            const mlAvailable = expPred && predTotal > 0
            const nextExp = mlAvailable ? predTotal : Math.round(avgMonthlyExpense * trendMult)
            const nextInc = savPred?.monthly_income || Math.round((historicalData.reduce((s,m)=>s+m.income,0)/(historicalData.length||1)) * incTrendMult)
            const nextSav = Math.max(nextInc - nextExp, 0)
            const overBudget = nextInc > 0 && nextExp > nextInc
            const confidence = mlAvailable ? expPred.confidence : historicalData.length >= 3 ? 'medium' : 'low'

            // ── 3-month bar chart data ──
            const mlMonths = expPred?.monthly_predictions || []
            const forecast3 = mlMonths.length >= 3
              ? mlMonths.slice(0, 3).map((m: any, i: number) => ({
                  month: m.month, expenses: m.predicted,
                  savings: Math.max(nextInc - m.predicted, 0),
                  type: 'ml',
                }))
              : [1, 2, 3].map(i => {
                  const exp = Math.round(nextExp * Math.pow(trendMult, i - 1))
                  const now = new Date()
                  now.setMonth(now.getMonth() + i)
                  return {
                    month: now.toLocaleString('default', { month: 'short', year: '2-digit' }),
                    expenses: exp,
                    savings: Math.max(nextInc - exp, 0),
                    type: 'trend',
                  }
                })

            // ── category trends ──
            const catTrends = catPredictions.length > 0
              ? catPredictions
              : catBreak.map((c: any) => ({
                  category: c.category,
                  current: c.amount,
                  predicted: Math.round(c.amount * trendMult),
                  changePct: ((trendMult - 1) * 100),
                }))

            const confColor = confidence === 'high' ? '#10B981' : confidence === 'medium' ? '#F59E0B' : '#EF4444'
            const confBadge = confidence === 'high' ? 'badge-success' : confidence === 'medium' ? 'badge-warning' : 'badge-danger'

            return (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="rounded-2xl border border-accent/25 overflow-hidden"
                style={{ background: 'linear-gradient(135deg, rgba(6,182,212,0.07) 0%, rgba(99,102,241,0.06) 50%, rgba(139,92,246,0.05) 100%)' }}
              >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/6"
                  style={{ background: 'linear-gradient(90deg, rgba(6,182,212,0.10), rgba(99,102,241,0.07))' }}>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-accent to-primary flex items-center justify-center shadow-lg shadow-accent/30">
                      <Sparkles size={15} className="text-white" />
                    </div>
                    <div>
                      <p className="font-black text-sm">Smart Predictions</p>
                      <p className="text-white/35 text-[10px]">
                        {mlAvailable
                          ? `Polynomial Regression · ${expPred.months_analyzed} months training`
                          : `Trend Estimate · ${historicalData.length} months history`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`badge text-[10px] font-bold ${confBadge}`}>
                      {confidence.toUpperCase()} CONFIDENCE
                    </span>
                    {!mlAvailable && (
                      <span className="badge badge-primary text-[10px]">📊 Trend</span>
                    )}
                    {overBudget && (
                      <span className="badge badge-danger text-[10px] animate-pulse">⚠ OVER BUDGET</span>
                    )}
                  </div>
                </div>

                <div className="p-5 space-y-5">

                  {/* ── Row 1: 3 big stat cards ── */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                    {/* Next month expenses */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                      className="glass rounded-2xl p-4 border border-accent/20 relative overflow-hidden"
                    >
                      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent" />
                      <div className="flex items-center gap-2 mb-3">
                        <TrendingUp size={13} className="text-accent" />
                        <p className="text-white/40 text-xs font-semibold uppercase tracking-wide">Next Month Expenses</p>
                      </div>
                      <p className="text-3xl font-black mb-1"
                        style={{ background: 'linear-gradient(135deg,#06B6D4,#6366F1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        ₨{nextExp >= 1000 ? `${(nextExp / 1000).toFixed(1)}k` : nextExp.toLocaleString()}
                      </p>
                      <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold ${trendMult > 1 ? 'bg-danger/15 text-danger' : 'bg-success/15 text-success'}`}>
                        {trendMult > 1 ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
                        {Math.abs((trendMult - 1) * 100).toFixed(1)}% vs now
                      </div>
                      <div className="mt-2 h-1 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: nextInc > 0 ? `${Math.min((nextExp / nextInc) * 100, 100)}%` : '0%' }}
                          transition={{ duration: 1 }}
                          className="h-full rounded-full"
                          style={{ background: overBudget ? '#EF4444' : '#06B6D4' }}
                        />
                      </div>
                      <p className="text-white/25 text-[9px] mt-1">
                        {nextInc > 0 ? `${Math.min(Math.round((nextExp / nextInc) * 100), 999)}% of income` : 'Add income for % calc'}
                      </p>
                    </motion.div>

                    {/* Predicted savings */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
                      className="glass rounded-2xl p-4 border border-success/20 relative overflow-hidden"
                    >
                      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-success/60 to-transparent" />
                      <div className="flex items-center gap-2 mb-3">
                        <PiggyBank size={13} className="text-success" />
                        <p className="text-white/40 text-xs font-semibold uppercase tracking-wide">Predicted Savings</p>
                      </div>
                      <p className="text-3xl font-black text-success mb-1">
                        ₨{nextSav >= 1000 ? `${(nextSav / 1000).toFixed(1)}k` : nextSav.toLocaleString()}
                      </p>
                      <p className="text-white/35 text-xs">
                        {nextInc > 0 ? `${Math.round((nextSav / nextInc) * 100)}% savings rate` : 'per month'}
                      </p>
                      <div className="mt-2 h-1 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: nextInc > 0 ? `${Math.min((nextSav / nextInc) * 100, 100)}%` : '0%' }}
                          transition={{ duration: 1, delay: 0.2 }}
                          className="h-full rounded-full bg-success"
                        />
                      </div>
                      <p className="text-white/25 text-[9px] mt-1">
                        {(savPred?.predictions || []).length >= 6
                          ? `6-mo total: ₨${((savPred.predictions[5]?.cumulative_savings || nextSav * 6) / 1000).toFixed(0)}k`
                          : `6-mo estimate: ₨${((nextSav * 6) / 1000).toFixed(0)}k`}
                      </p>
                    </motion.div>

                    {/* Budget status */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.26 }}
                      className={`glass rounded-2xl p-4 relative overflow-hidden border ${overBudget ? 'border-danger/30' : 'border-success/20'}`}
                    >
                      <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent ${overBudget ? 'via-danger/60' : 'via-success/60'} to-transparent`} />
                      <div className="flex items-center gap-2 mb-3">
                        <ShieldCheck size={13} className={overBudget ? 'text-danger' : 'text-success'} />
                        <p className="text-white/40 text-xs font-semibold uppercase tracking-wide">Budget Status</p>
                      </div>
                      <p className={`text-3xl font-black mb-1 ${overBudget ? 'text-danger' : 'text-success'}`}>
                        {overBudget ? 'Over' : 'Safe'}
                      </p>
                      <p className="text-white/35 text-xs">
                        {nextInc > 0
                          ? overBudget
                            ? `₨${Math.abs(predSurplus || nextExp - nextInc).toLocaleString()} deficit predicted`
                            : `₨${(nextSav).toLocaleString()} surplus predicted`
                          : 'Add income to check budget'}
                      </p>
                      <div className="mt-3 flex gap-1">
                        {[20,40,60,80,100].map(v => {
                          const pct = nextInc > 0 ? (nextExp / nextInc) * 100 : 0
                          return (
                            <div key={v} className={`flex-1 h-2 rounded-sm ${pct >= v ? (pct > 100 ? 'bg-danger' : pct > 80 ? 'bg-warning' : 'bg-success') : 'bg-white/8'}`} />
                          )
                        })}
                      </div>
                      <p className="text-white/20 text-[9px] mt-1">
                        {nextInc > 0 ? `${Math.min(Math.round((nextExp / nextInc) * 100), 999)}% of income used` : ''}
                      </p>
                    </motion.div>
                  </div>

                  {/* ── Row 2: 3-month bar chart + category trends ── */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                    {/* 3-month bar chart */}
                    <div>
                      <p className="text-white/25 text-[10px] font-semibold uppercase tracking-wider mb-3">
                        3-Month Expense Projection
                      </p>
                      <ResponsiveContainer width="100%" height={160}>
                        <BarChart data={forecast3} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                          <defs>
                            <linearGradient id="predExpGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#06B6D4" stopOpacity={0.9} />
                              <stop offset="100%" stopColor="#6366F1" stopOpacity={0.7} />
                            </linearGradient>
                            <linearGradient id="predSavGrad2" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#10B981" stopOpacity={0.85} />
                              <stop offset="100%" stopColor="#10B981" stopOpacity={0.5} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                          <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.40)', fontSize: 10 }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fill: 'rgba(255,255,255,0.30)', fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={v => `₨${(v/1000).toFixed(0)}k`} width={38} />
                          <Tooltip content={<BarTip />} />
                          <Bar dataKey="expenses" name="Expenses" fill="url(#predExpGrad)" radius={[5,5,0,0]} maxBarSize={44} />
                          <Bar dataKey="savings" name="Savings" fill="url(#predSavGrad2)" radius={[5,5,0,0]} maxBarSize={44} />
                        </BarChart>
                      </ResponsiveContainer>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-sm" style={{ background: '#06B6D4' }} />
                          <span className="text-[10px] text-white/35">Expenses</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-sm bg-success" />
                          <span className="text-[10px] text-white/35">Savings</span>
                        </div>
                        <span className="text-[9px] text-white/20 ml-auto">
                          {mlAvailable ? '• ML forecast' : '• Trend estimate'}
                        </span>
                      </div>
                    </div>

                    {/* Category trends grid */}
                    <div>
                      <p className="text-white/25 text-[10px] font-semibold uppercase tracking-wider mb-3">
                        Category Predictions
                      </p>
                      <div className="space-y-2">
                        {catTrends.slice(0, 5).map((c: any, i: number) => {
                          const color = CAT_COLORS[c.category] || '#6366F1'
                          const isUp = c.changePct > 5
                          const isDown = c.changePct < -5
                          return (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, x: 14 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.1 + i * 0.07 }}
                              className="flex items-center gap-3 glass px-3 py-2 rounded-xl border border-white/5"
                            >
                              <span className="text-sm flex-shrink-0">{CAT_EMOJIS[c.category] || '💼'}</span>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs text-white/70 capitalize font-medium">{c.category}</span>
                                  <div className={`flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-md
                                    ${isUp ? 'bg-danger/15 text-danger' : isDown ? 'bg-success/15 text-success' : 'bg-white/8 text-white/40'}`}>
                                    {isUp ? <ArrowUpRight size={10}/> : isDown ? <ArrowDownRight size={10}/> : null}
                                    {Math.abs(c.changePct).toFixed(0)}%
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 text-[10px]">
                                  <span className="text-white/30">₨{(c.current/1000).toFixed(1)}k</span>
                                  <span className="text-white/20">→</span>
                                  <span className="font-bold" style={{ color }}>₨{(c.predicted/1000).toFixed(1)}k</span>
                                </div>
                              </div>
                            </motion.div>
                          )
                        })}
                        {catTrends.length === 0 && (
                          <div className="text-white/25 text-xs text-center py-6">Add expenses to see category predictions</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ── Confidence note ── */}
                  <div className="flex items-center gap-2 pt-1 border-t border-white/5 flex-wrap">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: confColor }} />
                    <p className="text-[10px] text-white/30">
                      {mlAvailable
                        ? `ML model trained on ${expPred.months_analyzed} months · Polynomial Regression · ${confidence} confidence`
                        : `Trend estimate based on ${historicalData.length} month${historicalData.length > 1 ? 's' : ''} · Run Analysis for ML predictions`}
                    </p>
                    {!mlAvailable && historicalData.length < 3 && (
                      <span className="text-[10px] text-warning font-semibold ml-auto">
                        ⚠ Add {3 - historicalData.length} more month(s) for ML accuracy
                      </span>
                    )}
                  </div>

                </div>
              </motion.div>
            )
          })()}

          {/* ════════════════════════════════════════════════════════════════
              🔮  AI PREDICTION CENTER  —  MAIN FEATURE
          ════════════════════════════════════════════════════════════════ */}
          {expPred && predTotal > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="rounded-2xl border border-primary/30 overflow-hidden"
              style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(139,92,246,0.06) 50%, rgba(6,182,212,0.05) 100%)' }}
            >
              {/* ── Header bar ── */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/6"
                style={{ background: 'linear-gradient(90deg, rgba(99,102,241,0.12), rgba(139,92,246,0.08))' }}>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/30">
                    <Sparkles size={15} className="text-white" />
                  </div>
                  <div>
                    <p className="font-black text-sm">AI Prediction Center</p>
                    <p className="text-white/35 text-[10px]">Polynomial Regression · {expPred.months_analyzed || 0} months analyzed</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`badge text-[10px] font-bold ${expPred.confidence === 'high' ? 'badge-success' : expPred.confidence === 'medium' ? 'badge-warning' : 'badge-danger'}`}>
                    {(expPred.confidence || 'low').toUpperCase()} CONFIDENCE
                  </span>
                  {predOverBudget && (
                    <span className="badge badge-danger text-[10px] animate-pulse">⚠ OVER BUDGET</span>
                  )}
                </div>
              </div>

              <div className="p-5 space-y-5">

                {/* ── Hero: next-month big number ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center">

                  {/* Left: big prediction */}
                  <div className="text-center md:text-left">
                    <p className="text-white/35 text-xs font-semibold uppercase tracking-widest mb-2">Next Month Predicted Expenses</p>
                    <div className="flex items-end gap-3 justify-center md:justify-start flex-wrap">
                      <motion.p
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 120, delay: 0.2 }}
                        className="text-5xl font-black"
                        style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6, #06B6D4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
                      >
                        ₨{predTotal >= 1000 ? `${(predTotal / 1000).toFixed(1)}k` : predTotal.toLocaleString()}
                      </motion.p>
                      <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold mb-1 ${predTrendPct > 0 ? 'bg-danger/15 text-danger' : 'bg-success/15 text-success'}`}>
                        {predTrendPct > 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                        {Math.abs(predTrendPct).toFixed(1)}% vs now
                      </div>
                    </div>
                    <p className="text-white/30 text-xs mt-2">{expPred.message}</p>

                    {/* Budget surplus / deficit */}
                    {monthlyIncomePred > 0 && (
                      <div className={`mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border ${predOverBudget ? 'border-danger/30 bg-danger/10 text-danger' : 'border-success/30 bg-success/10 text-success'}`}>
                        {predOverBudget ? <AlertTriangle size={12} /> : <ShieldCheck size={12} />}
                        {predOverBudget
                          ? `Deficit: ₨${Math.abs(predSurplus).toLocaleString()} over income`
                          : `Surplus: ₨${predSurplus.toLocaleString()} predicted savings`}
                      </div>
                    )}
                  </div>

                  {/* Right: 3-month timeline cards */}
                  <div className="space-y-2">
                    <p className="text-white/25 text-[10px] font-semibold uppercase tracking-wider">3-Month Forecast</p>
                    {(expPred.monthly_predictions || []).map((mp: any, i: number) => {
                      const prev = i === 0 ? predTotal : expPred.monthly_predictions[i - 1].predicted
                      const diff = prev > 0 ? ((mp.predicted - prev) / prev) * 100 : 0
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 + i * 0.1 }}
                          className="flex items-center justify-between glass px-3.5 py-2.5 rounded-xl border border-white/6"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black ${i === 0 ? 'bg-primary/20 text-primary' : i === 1 ? 'bg-secondary/20 text-secondary' : 'bg-accent/20 text-accent'}`}>
                              {i + 1}
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-white/80">{mp.month}</p>
                              <p className="text-[10px] text-white/30">{i === 0 ? 'Next month' : i === 1 ? '2 months ahead' : '3 months ahead'}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-black text-sm text-white">₨{(mp.predicted / 1000).toFixed(1)}k</p>
                            <div className={`flex items-center justify-end gap-0.5 text-[10px] font-semibold ${diff > 0 ? 'text-danger' : 'text-success'}`}>
                              {diff > 0 ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                              {Math.abs(diff).toFixed(1)}%
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                </div>

                {/* ── Category Prediction Grid ── */}
                {catPredictions.length > 0 && (
                  <div>
                    <p className="text-white/25 text-[10px] font-semibold uppercase tracking-wider mb-3">Category-by-Category Forecast</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                      {catPredictions.map((c, i) => {
                        const color = CAT_COLORS[c.category] || '#6366F1'
                        const isUp   = c.changePct > 5
                        const isDown = c.changePct < -5
                        return (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.92 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.05 * i }}
                            whileHover={{ y: -3, scale: 1.02 }}
                            className="glass rounded-xl p-3 border border-white/5 relative overflow-hidden"
                          >
                            <div className="absolute inset-0 opacity-[0.04]" style={{ background: `linear-gradient(135deg, ${color}, transparent)` }} />
                            <div className="relative">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-base">{CAT_EMOJIS[c.category] || '💼'}</span>
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${isUp ? 'bg-danger/20 text-danger' : isDown ? 'bg-success/20 text-success' : 'bg-white/10 text-white/40'}`}>
                                  {isUp ? '↑' : isDown ? '↓' : '→'} {Math.abs(c.changePct).toFixed(0)}%
                                </span>
                              </div>
                              <p className="text-white/45 text-[9px] capitalize mb-0.5">{c.category}</p>
                              <p className="font-black text-sm" style={{ color }}>₨{(c.predicted / 1000).toFixed(1)}k</p>
                              {c.current > 0 && (
                                <p className="text-white/25 text-[9px] mt-0.5">was ₨{(c.current / 1000).toFixed(1)}k</p>
                              )}
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* ── Smart Prediction Alerts ── */}
                {predAlerts.length > 0 && (
                  <div className="glass rounded-xl p-4 border border-warning/20">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle size={14} className="text-warning" />
                      <p className="text-xs font-bold text-warning">Smart Alerts — Categories Predicted to Rise</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {predAlerts.map((a, i) => (
                        <div key={i} className="flex items-center justify-between text-xs glass px-3 py-2 rounded-lg border border-white/5">
                          <div className="flex items-center gap-2">
                            <span>{CAT_EMOJIS[a.category] || '💼'}</span>
                            <span className="text-white/65 capitalize">{a.category}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-white/30">₨{(a.current / 1000).toFixed(1)}k</span>
                            <ArrowUpRight size={11} className="text-danger" />
                            <span className="font-bold text-white/80">₨{(a.predicted / 1000).toFixed(1)}k</span>
                            <span className="badge badge-danger text-[9px] py-0.5">+{a.changePct.toFixed(0)}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── Model info footer ── */}
                <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-white/5">
                  {[
                    { label: 'Model', val: `Polynomial Regression (deg ${(expPred.months_analyzed || 0) >= 4 ? '2' : '1'})` },
                    { label: 'Training Data', val: `${expPred.months_analyzed || 0} months` },
                    { label: 'Confidence', val: (expPred.confidence || 'low').charAt(0).toUpperCase() + (expPred.confidence || 'low').slice(1) },
                    { label: 'Categories', val: `${catPredictions.length} tracked` },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-[10px]">
                      <span className="text-white/25">{item.label}:</span>
                      <span className="text-white/55 font-medium">{item.val}</span>
                    </div>
                  ))}
                </div>

              </div>
            </motion.div>
          )}

          {/* ── Financial Health Score + Savings Rate Donut ── */}
          {healthData && (
            <Section title="Financial Health Score" subtitle="AI-calculated score based on savings, spending & data richness" icon={ShieldCheck} color="from-primary to-secondary" badge={`Grade ${healthData.grade}`}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">

                {/* Health Score Gauge */}
                <div className="flex flex-col items-center">
                  <p className="text-white/35 text-xs mb-2 font-semibold uppercase tracking-wider">Overall Score</p>
                  <div className="relative">
                    <PieChart width={180} height={180}>
                      <Pie data={gaugeData} cx={85} cy={85} innerRadius={62} outerRadius={82}
                        startAngle={90} endAngle={-270} dataKey="value" strokeWidth={0} paddingAngle={2}>
                        {gaugeData.map((entry, i) => (
                          <Cell key={i} fill={entry.fill} />
                        ))}
                        <Label
                          content={() => (
                            <text x={85} y={85} textAnchor="middle" dominantBaseline="middle">
                              <tspan x={85} dy="-8" fontSize="30" fontWeight="900" fill="white">{healthScore}</tspan>
                              <tspan x={85} dy="22" fontSize="11" fill="rgba(255,255,255,0.4)">/100</tspan>
                            </text>
                          )}
                        />
                      </Pie>
                    </PieChart>
                  </div>
                  <div className="text-center -mt-2">
                    <p className="font-black text-lg" style={{ color: healthColor }}>{healthData.label}</p>
                    <p className="text-white/30 text-xs">Grade {healthData.grade}</p>
                  </div>
                </div>

                {/* Score Breakdown */}
                <div className="space-y-2.5 col-span-1 md:col-span-1">
                  <p className="text-white/30 text-[10px] font-semibold uppercase tracking-wider mb-3">Score Breakdown</p>
                  {(healthData.breakdown || []).map((b: any, i: number) => (
                    <div key={i}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-white/60">{b.metric}</span>
                        <span className="font-bold" style={{ color: b.status === 'good' || b.status === 'excellent' ? '#10B981' : b.status === 'warning' ? '#F59E0B' : '#EF4444' }}>
                          {b.score}/{b.max}
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-white/5">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(b.score / b.max) * 100}%` }}
                          transition={{ duration: 0.8, delay: i * 0.1 }}
                          className="h-full rounded-full"
                          style={{ background: b.status === 'good' || b.status === 'excellent' ? '#10B981' : b.status === 'warning' ? '#F59E0B' : '#EF4444' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Savings Rate Donut */}
                <div className="flex flex-col items-center">
                  <p className="text-white/35 text-xs mb-2 font-semibold uppercase tracking-wider">Savings Rate</p>
                  <div className="relative">
                    <PieChart width={180} height={180}>
                      <Pie data={savingsDonut} cx={85} cy={85} innerRadius={62} outerRadius={82}
                        startAngle={90} endAngle={-270} dataKey="value" strokeWidth={0} paddingAngle={2}>
                        {savingsDonut.map((entry, i) => (
                          <Cell key={i} fill={entry.fill} />
                        ))}
                        <Label
                          content={() => (
                            <text x={85} y={85} textAnchor="middle" dominantBaseline="middle">
                              <tspan x={85} dy="-8" fontSize="28" fontWeight="900" fill="white">{savingsRate > 0 ? Math.round(savingsRate) : 0}%</tspan>
                              <tspan x={85} dy="22" fontSize="10" fill="rgba(255,255,255,0.4)">saved</tspan>
                            </text>
                          )}
                        />
                      </Pie>
                    </PieChart>
                  </div>
                  <div className="text-center -mt-2">
                    <p className="font-black text-lg text-success">{savingsRate >= 20 ? 'On Target' : savingsRate >= 10 ? 'Below Target' : 'Critical'}</p>
                    <p className="text-white/30 text-xs">Target: 20%+ savings</p>
                  </div>
                </div>
              </div>
            </Section>
          )}

          {/* ── Chart 1: Historical Trend ── */}
          {historicalData.length > 0 && (
            <Section title="Historical Expense & Savings Trend" subtitle="Actual recorded data — Area Chart" icon={TrendingDown} color="from-primary to-secondary" badge="History">
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={historicalData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="incGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="savGradH" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₨${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<Tip />} />
                  <Legend wrapperStyle={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', paddingTop: '12px' }} />
                  <Area type="monotone" dataKey="income" name="Income" stroke="#10B981" fill="url(#incGrad)" strokeWidth={2} dot={{ fill: '#10B981', r: 3, strokeWidth: 0 }} />
                  <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#EF4444" fill="url(#expGrad)" strokeWidth={2} dot={{ fill: '#EF4444', r: 3, strokeWidth: 0 }} />
                  <Area type="monotone" dataKey="savings" name="Savings" stroke="#06B6D4" fill="url(#savGradH)" strokeWidth={2} dot={{ fill: '#06B6D4', r: 3, strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            </Section>
          )}

          {/* ── Category Breakdown: Pie + Progress Bars ── */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

            {/* Pie Chart */}
            <Section title="Spending Distribution" subtitle="Category pie chart — current month" icon={Activity} color="from-warning to-amber-500" badge="Pie Chart">
              {pieData.length > 0 ? (
                <div className="flex flex-col md:flex-row items-center gap-4">
                  <ResponsiveContainer width={220} height={220}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx={105}
                        cy={105}
                        innerRadius={55}
                        outerRadius={95}
                        dataKey="value"
                        nameKey="name"
                        paddingAngle={3}
                        strokeWidth={0}
                      >
                        {pieData.map((entry: any, i: number) => (
                          <Cell key={i} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip content={<PieTip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex-1 space-y-2 w-full">
                    {pieData.map((c: any, i: number) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: c.fill }} />
                          <span className="text-white/65 capitalize">{CAT_EMOJIS[c.name] || '💼'} {c.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-white/40">{c.percentage}%</span>
                          <span className="font-bold text-white/80">₨{Number(c.value).toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-44 flex flex-col items-center justify-center text-white/20 gap-2">
                  <Activity size={28} />
                  <p className="text-sm">No expenses this month</p>
                </div>
              )}
            </Section>

            {/* Category Progress Bars */}
            <Section title="This Month — Category Amounts" subtitle="Progress bars showing spending weight" icon={BarChart2} color="from-accent to-cyan-600">
              {analysis?.category_breakdown?.length > 0 ? (
                <div className="space-y-3">
                  {analysis.category_breakdown.map((c: any, i: number) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
                      <div className="flex items-center justify-between text-sm mb-1.5">
                        <div className="flex items-center gap-2">
                          <span>{CAT_EMOJIS[c.category] || '💼'}</span>
                          <span className="text-white/70 capitalize font-medium">{c.category}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-white/40 text-xs">{c.percentage}%</span>
                          <span className="font-bold text-white/90">₨{Number(c.amount).toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${c.percentage}%` }}
                          transition={{ duration: 0.8, delay: 0.2 + i * 0.07 }}
                          className="h-full rounded-full"
                          style={{ background: CAT_COLORS[c.category] || '#6366F1' }}
                        />
                      </div>
                    </motion.div>
                  ))}
                  <div className="mt-3 pt-3 border-t border-white/5 flex justify-between text-xs">
                    <span className="text-white/35">Total this month</span>
                    <span className="font-bold text-white">₨{Number(analysis.total_expenses).toLocaleString()}</span>
                  </div>
                </div>
              ) : (
                <div className="h-36 flex flex-col items-center justify-center text-white/20 gap-2">
                  <BarChart2 size={28} />
                  <p className="text-sm">No expenses this month</p>
                </div>
              )}
            </Section>
          </div>

          {/* ── 3-Month Expense Forecast (Line Chart + Table) ── */}
          {expenseTimeline.length > 1 && (
            <Section title="3-Month Expense Forecast" subtitle="Historical actual + AI predicted next 3 months — Line Chart" icon={Sparkles} color="from-accent to-cyan-600" badge="ML Forecast">
              <ResponsiveContainer width="100%" height={230}>
                <LineChart data={expenseTimeline} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₨${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<Tip />} />
                  <Legend wrapperStyle={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', paddingTop: '12px' }} />
                  {expPred?.monthly_predictions?.length > 0 && (
                    <ReferenceLine x={expPred.monthly_predictions[0].month} stroke="rgba(99,102,241,0.4)" strokeDasharray="4 4"
                      label={{ value: 'Forecast →', fill: 'rgba(99,102,241,0.7)', fontSize: 10, position: 'top' }} />
                  )}
                  <Line type="monotone" dataKey="actual" name="Actual Expenses" stroke="#EF4444" strokeWidth={2.5}
                    dot={{ fill: '#EF4444', r: 4, strokeWidth: 0 }} connectNulls={false} />
                  <Line type="monotone" dataKey="predicted" name="Predicted Expenses" stroke="#06B6D4" strokeWidth={2.5}
                    strokeDasharray="6 4" dot={{ fill: '#06B6D4', r: 5, strokeWidth: 2, stroke: '#fff' }} connectNulls={false} />
                </LineChart>
              </ResponsiveContainer>

              {/* 3-Month Prediction Table */}
              {expPred?.monthly_predictions?.length > 0 && (
                <div className="mt-5">
                  <p className="text-white/30 text-[10px] font-semibold uppercase tracking-wider mb-3">Month-by-Month Forecast Table</p>
                  <div className="grid grid-cols-3 gap-3">
                    {expPred.monthly_predictions.map((mp: any, i: number) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.12 }}
                        className="glass p-3.5 rounded-xl border border-accent/20 text-center"
                      >
                        <div className="flex items-center justify-center gap-1.5 mb-2">
                          <Calendar size={11} className="text-accent" />
                          <p className="text-white/45 text-[10px] font-semibold">{mp.month}</p>
                        </div>
                        <p className="text-lg font-black text-accent">₨{Math.round(mp.predicted / 1000)}k</p>
                        <p className="text-white/25 text-[9px] mt-1">₨{Number(mp.predicted).toLocaleString()}</p>
                        <span className={`badge text-[9px] mt-2 ${expPred.confidence === 'high' ? 'badge-success' : 'badge-warning'}`}>
                          {expPred.confidence} conf.
                        </span>
                      </motion.div>
                    ))}
                  </div>
                  <p className="text-white/20 text-[10px] mt-3 text-center">
                    {expPred.message} • Polynomial Regression (degree {expPred.months_analyzed >= 4 ? '2' : '1'})
                  </p>
                </div>
              )}
            </Section>
          )}

          {/* ── Predicted by Category (Bar Chart) ── */}
          {expPred?.predictions_by_category?.length > 0 && (
            <Section title="Next Month — Predicted by Category" subtitle="ML regression per category — Bar Chart" icon={Target} color="from-secondary to-purple-600">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={expPred.predictions_by_category.slice(0, 8)} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="category" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `₨${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<Tip />} />
                  <Bar dataKey="predicted_amount" name="Predicted" radius={[6, 6, 0, 0]} maxBarSize={44}>
                    {expPred.predictions_by_category.map((e: any, i: number) => (
                      <Cell key={i} fill={CAT_COLORS[e.category] || '#6366F1'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
                {expPred.predictions_by_category.slice(0, 4).map((item: any, i: number) => (
                  <div key={i} className="glass px-3 py-2 rounded-lg border border-white/5 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: CAT_COLORS[item.category] || '#6366F1' }} />
                    <div className="min-w-0">
                      <p className="text-white/40 text-[10px] capitalize truncate">{item.category}</p>
                      <p className="text-white/80 text-xs font-bold">₨{Number(item.predicted_amount).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* ── Savings Forecast ── */}
          {savingsTimeline.length > 0 && (
            <Section title="Savings Forecast" subtitle="Historical savings + 6-month AI prediction — Area Chart" icon={TrendingUp} color="from-success to-emerald-600" badge="6-Month Outlook">
              {savPred && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                  {[
                    { label: 'Monthly Income', value: savPred.monthly_income, color: 'text-success', border: 'border-success/20' },
                    { label: 'Predicted Expenses', value: savPred.predicted_expenses, color: 'text-danger', border: 'border-danger/20' },
                    { label: 'Monthly Savings', value: savPred.predicted_savings, color: 'text-accent', border: 'border-accent/20' },
                    { label: '6-Month Total', value: (savPred.predicted_savings || 0) * 6, color: 'text-primary', border: 'border-primary/20' },
                  ].map((s, i) => (
                    <div key={i} className={`glass p-3 rounded-xl border ${s.border} text-center`}>
                      <p className="text-white/35 text-[10px] mb-1">{s.label}</p>
                      <p className={`text-base font-bold ${s.color}`}>₨{Number(s.value || 0).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              )}
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={savingsTimeline} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="actSavGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="predSavGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="cumGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `₨${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<Tip />} />
                  <Legend wrapperStyle={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', paddingTop: '10px' }} />
                  {lastActualSavings > 0 && historicalData.length > 0 && (
                    <ReferenceLine x={historicalData[historicalData.length - 1].month} stroke="rgba(255,255,255,0.15)" strokeDasharray="4 4"
                      label={{ value: 'Now', fill: 'rgba(255,255,255,0.3)', fontSize: 10, position: 'top' }} />
                  )}
                  <Area type="monotone" dataKey="actualSavings" name="Actual Savings" stroke="#10B981" fill="url(#actSavGrad)" strokeWidth={2.5} dot={{ fill: '#10B981', r: 4, strokeWidth: 0 }} connectNulls={false} />
                  <Area type="monotone" dataKey="predictedSavings" name="Predicted Monthly" stroke="#06B6D4" fill="url(#predSavGrad)" strokeWidth={2.5} strokeDasharray="6 4" dot={{ fill: '#06B6D4', r: 4, strokeWidth: 0 }} connectNulls={false} />
                  <Area type="monotone" dataKey="cumulativePredicted" name="Cumulative Forecast" stroke="#8B5CF6" fill="url(#cumGrad)" strokeWidth={2} strokeDasharray="4 3" dot={{ fill: '#8B5CF6', r: 3, strokeWidth: 0 }} connectNulls={false} />
                </AreaChart>
              </ResponsiveContainer>
            </Section>
          )}

          {/* ── Overspending + Recommendations ── */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            <Section title="Overspending Detection" subtitle="Current month vs previous month comparison" icon={AlertTriangle} color="from-danger to-rose-600">
              {overspend?.alerts?.length > 0 && !overspend.alerts[0].includes('stable') ? (
                <div className="space-y-2 mb-4">
                  {overspend.alerts.map((alert: string, i: number) => (
                    <div key={i} className="flex items-start gap-2.5 glass p-3 rounded-xl border border-danger/20">
                      <AlertTriangle size={13} className="text-danger flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-white/75 leading-relaxed">{alert}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-2.5 glass p-3 rounded-xl border border-success/20 mb-4">
                  <span className="text-base">✅</span>
                  <p className="text-xs text-success">Spending stable compared to last month!</p>
                </div>
              )}
              {overspend?.comparison?.length > 0 && (
                <div className="space-y-2">
                  {overspend.comparison.slice(0, 5).map((c: any, i: number) => (
                    <div key={i} className="flex items-center justify-between text-xs glass p-2.5 rounded-lg border border-white/5">
                      <div className="flex items-center gap-2">
                        <span>{CAT_EMOJIS[c.category] || '💼'}</span>
                        <span className="text-white/60 capitalize">{c.category}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-white/30">₨{Number(c.previous).toLocaleString()}</span>
                        <ChevronRight size={11} className="text-white/20" />
                        <span className="text-white/70 font-medium">₨{Number(c.current).toLocaleString()}</span>
                        <span className={`badge text-[10px] py-0.5 px-1.5 ${c.change_percentage > 0 ? 'badge-danger' : 'badge-success'}`}>
                          {c.change_percentage > 0 ? '+' : ''}{c.change_percentage}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Section>

            <Section title="AI Recommendations" subtitle="Personalized tips based on your spending data" icon={Lightbulb} color="from-warning to-amber-500">
              <div className="space-y-3">
                {(recs || ['Add more transactions to get personalized recommendations.']).map((rec, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.08 }}
                    className="flex items-start gap-3 glass p-3.5 rounded-xl border border-warning/12 hover:border-warning/25 transition-colors">
                    <div className="w-6 h-6 rounded-full bg-warning/20 flex items-center justify-center text-warning text-xs font-bold flex-shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <p className="text-sm text-white/70 leading-relaxed">{rec}</p>
                  </motion.div>
                ))}
              </div>
            </Section>
          </div>

          {/* ── Written AI Analysis Report ── */}
          {analysis?.insights?.length > 0 && (
            <Section title="AI Financial Analysis Report" subtitle="Written insights based on your complete financial data" icon={Brain} color="from-secondary to-purple-600" badge="AI Report">
              <div className="space-y-3">
                <div className="glass p-4 rounded-xl border border-primary/15">
                  <p className="text-white/30 text-[10px] font-semibold uppercase tracking-wider mb-3">📊 This Month's Findings</p>
                  <div className="space-y-2">
                    {analysis.insights.map((ins: string, i: number) => (
                      <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                        className="flex items-start gap-2.5 text-sm text-white/70 leading-relaxed">
                        <span className="text-primary flex-shrink-0 mt-0.5 text-base">💡</span>
                        <span>{ins}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {analysis.monthly_income > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <div className="glass p-3 rounded-xl border border-success/20 text-center">
                      <p className="text-white/30 text-[10px] mb-1">Monthly Income</p>
                      <p className="text-success font-bold">₨{Number(analysis.monthly_income).toLocaleString()}</p>
                    </div>
                    <div className="glass p-3 rounded-xl border border-danger/20 text-center">
                      <p className="text-white/30 text-[10px] mb-1">Monthly Expenses</p>
                      <p className="text-danger font-bold">₨{Number(analysis.total_expenses).toLocaleString()}</p>
                    </div>
                    <div className={`glass p-3 rounded-xl border ${savingsRate >= 20 ? 'border-success/20' : 'border-warning/20'} text-center`}>
                      <p className="text-white/30 text-[10px] mb-1">Net Savings</p>
                      <p className={`font-bold ${savingsRate >= 20 ? 'text-success' : 'text-warning'}`}>
                        ₨{Math.max(Number(analysis.monthly_income) - Number(analysis.total_expenses), 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}

                <div className="glass p-3.5 rounded-xl border border-white/5 text-xs leading-relaxed">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-primary font-semibold">ℹ️ Prediction Accuracy</span>
                    <span className={`badge text-[9px] font-bold ${
                      expPred?.confidence === 'high' ? 'badge-success' :
                      expPred?.confidence === 'medium' ? 'badge-warning' : 'badge-danger'
                    }`}>{(expPred?.confidence || 'low').toUpperCase()}</span>
                  </div>
                  <p className="text-white/35">
                    Model: Polynomial Regression (deg {(expPred?.months_analyzed || 0) >= 4 ? '2' : '1'}) · Trained on {expPred?.months_analyzed || 0} months.
                    {(expPred?.months_analyzed || 0) < 3
                      ? ' ⚠️ Add 3+ months of expenses for high-confidence predictions.'
                      : ' Accuracy improves as you log more months.'}
                  </p>
                  <p className="text-white/25 mt-1">Savings rate: 10% = Fair · 20% = Good · 30%+ = Excellent</p>
                </div>
              </div>
            </Section>
          )}

          {/* ── 503 / ML Not Available Error ── */}
          {insightsError && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card border border-danger/20">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-danger/15 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle size={24} className="text-danger" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-danger mb-1">ML Service Unavailable (503)</h3>
                  <p className="text-white/55 text-sm mb-3 leading-relaxed">
                    The AI prediction engine requires Python ML libraries. Run the following in your backend venv to fix:
                  </p>
                  <div className="glass p-3 rounded-xl border border-white/8 font-mono text-xs text-accent leading-relaxed">
                    venv\Scripts\python.exe -m pip install pandas numpy scikit-learn
                  </div>
                  <p className="text-white/30 text-xs mt-2">Then restart the Django server — predictions will work immediately.</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Radar Chart: Spending Pattern ── */}
          {radarData.length > 0 && (() => {
            // Merge current + predicted into one radar dataset
            const radarChartData = radarData.map((r: any) => {
              const pred = catPredictions.find((c: any) => c.category === r.category)
              return {
                category: r.category,
                current: r.amount,
                predicted: pred ? pred.predicted : r.amount,
              }
            })
            const topCategory = radarChartData.reduce((a: any, b: any) => a.current > b.current ? a : b, radarChartData[0])

            return (
              <Section
                title="Spending Pattern Radar"
                subtitle="Current spending vs next-month prediction — Spider Chart"
                icon={Activity}
                color="from-secondary to-purple-600"
                badge="Radar"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">

                  {/* Chart */}
                  <div className="md:col-span-2 relative">
                    {/* Glow behind chart */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-48 h-48 rounded-full blur-3xl opacity-20"
                        style={{ background: 'radial-gradient(circle, #6366F1 0%, #8B5CF6 50%, transparent 70%)' }} />
                    </div>
                    <ResponsiveContainer width="100%" height={320}>
                      <RadarChart data={radarChartData} margin={{ top: 14, right: 28, bottom: 14, left: 28 }}>
                        <defs>
                          <radialGradient id="radarGlow" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="#6366F1" stopOpacity={0.15} />
                            <stop offset="100%" stopColor="#6366F1" stopOpacity={0} />
                          </radialGradient>
                        </defs>
                        <PolarGrid
                          stroke="rgba(255,255,255,0.08)"
                          strokeDasharray="3 3"
                        />
                        <PolarAngleAxis
                          dataKey="category"
                          tick={{ fill: 'rgba(255,255,255,0.55)', fontSize: 11, fontWeight: 500 }}
                          tickFormatter={(v: string) => `${CAT_EMOJIS[v] || '💼'} ${v}`}
                        />
                        <PolarRadiusAxis
                          angle={90}
                          tick={{ fill: 'rgba(255,255,255,0.20)', fontSize: 9 }}
                          tickFormatter={(v: number) => `₨${(v / 1000).toFixed(0)}k`}
                          stroke="rgba(255,255,255,0.06)"
                        />
                        {/* Current spending */}
                        <Radar
                          name="Current Spending"
                          dataKey="current"
                          stroke="#6366F1"
                          fill="#6366F1"
                          fillOpacity={0.22}
                          strokeWidth={2.5}
                          dot={{ fill: '#6366F1', r: 5, strokeWidth: 2, stroke: 'rgba(99,102,241,0.4)' }}
                        />
                        {/* Predicted — only if predictions exist */}
                        {catPredictions.length > 0 && (
                          <Radar
                            name="Predicted (Next Month)"
                            dataKey="predicted"
                            stroke="#06B6D4"
                            fill="#06B6D4"
                            fillOpacity={0.12}
                            strokeWidth={2}
                            strokeDasharray="5 3"
                            dot={{ fill: '#06B6D4', r: 4, strokeWidth: 0 }}
                          />
                        )}
                        <Tooltip content={({ active, payload }: any) => {
                          if (!active || !payload?.length) return null
                          const cat = payload[0]?.payload?.category
                          return (
                            <div className="glass rounded-xl px-3.5 py-3 border border-white/10 text-xs shadow-xl">
                              <p className="font-bold text-white/80 mb-2 capitalize">
                                {CAT_EMOJIS[cat] || '💼'} {cat}
                              </p>
                              {payload.map((p: any, i: number) => (
                                <p key={i} className="mb-0.5 font-semibold" style={{ color: p.color }}>
                                  {p.name}: ₨{Number(p.value).toLocaleString()}
                                </p>
                              ))}
                            </div>
                          )
                        }} />
                        <Legend
                          wrapperStyle={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', paddingTop: '10px' }}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Category summary cards */}
                  <div className="space-y-2">
                    <p className="text-white/25 text-[10px] font-semibold uppercase tracking-wider mb-3">
                      Category Breakdown
                    </p>
                    {radarChartData.map((d: any, i: number) => {
                      const color = CAT_COLORS[d.category] || '#6366F1'
                      const pct = analysis?.total_expenses > 0
                        ? Math.round((d.current / analysis.total_expenses) * 100)
                        : 0
                      const isTop = d.category === topCategory?.category
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: 12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.06 }}
                          className={`glass rounded-xl px-3 py-2.5 border transition-all ${isTop ? 'border-primary/30' : 'border-white/5'}`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                              <span className="text-sm">{CAT_EMOJIS[d.category] || '💼'}</span>
                              <span className="text-xs text-white/70 capitalize font-medium">{d.category}</span>
                              {isTop && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold"
                                  style={{ background: 'rgba(99,102,241,0.2)', color: '#818CF8' }}>TOP</span>
                              )}
                            </div>
                            <span className="text-[10px] text-white/40">{pct}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.8, delay: 0.2 + i * 0.06 }}
                              className="h-full rounded-full"
                              style={{ background: color }}
                            />
                          </div>
                          <div className="flex justify-between mt-1">
                            <span className="text-[10px] font-bold" style={{ color }}>
                              ₨{(d.current / 1000).toFixed(1)}k
                            </span>
                            {catPredictions.length > 0 && d.predicted !== d.current && (
                              <span className={`text-[9px] font-semibold ${d.predicted > d.current ? 'text-danger' : 'text-success'}`}>
                                → ₨{(d.predicted / 1000).toFixed(1)}k
                              </span>
                            )}
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>

                </div>

                {/* Insight strip */}
                {topCategory && (
                  <div className="mt-5 flex items-center gap-3 glass px-4 py-3 rounded-xl border border-secondary/20">
                    <span className="text-xl">{CAT_EMOJIS[topCategory.category] || '💼'}</span>
                    <p className="text-xs text-white/60 leading-relaxed">
                      <span className="text-white font-bold capitalize">{topCategory.category}</span> is your biggest spending category at{' '}
                      <span className="text-primary font-bold">₨{Number(topCategory.current).toLocaleString()}</span>
                      {catPredictions.length > 0 && topCategory.predicted > topCategory.current
                        ? <span className="text-danger"> — predicted to rise to ₨{(topCategory.predicted / 1000).toFixed(1)}k next month.</span>
                        : '.'}
                    </p>
                  </div>
                )}
              </Section>
            )
          })()}

          {/* ── Composed Chart: Monthly Income vs Expenses ── */}
          {monthlyBarData.length > 0 && (
            <Section title="Monthly Income vs Expenses" subtitle="Side-by-side bars + savings line — Composed Chart" icon={BarChart2} color="from-accent to-cyan-600" badge="Composed">
              <ResponsiveContainer width="100%" height={260}>
                <ComposedChart data={monthlyBarData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="incBarGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10B981" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#10B981" stopOpacity={0.5} />
                    </linearGradient>
                    <linearGradient id="expBarGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#EF4444" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#EF4444" stopOpacity={0.5} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₨${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<BarTip />} />
                  <Legend wrapperStyle={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', paddingTop: '12px' }} />
                  <Bar dataKey="income" name="Income" fill="url(#incBarGrad)" radius={[5, 5, 0, 0]} maxBarSize={36} />
                  <Bar dataKey="expenses" name="Expenses" fill="url(#expBarGrad)" radius={[5, 5, 0, 0]} maxBarSize={36} />
                  <Line type="monotone" dataKey="savings" name="Savings" stroke="#06B6D4" strokeWidth={2.5}
                    dot={{ fill: '#06B6D4', r: 4, strokeWidth: 2, stroke: '#fff' }} />
                </ComposedChart>
              </ResponsiveContainer>
              <div className="mt-4 grid grid-cols-3 gap-3">
                {[
                  { label: 'Avg Income', val: monthlyBarData.reduce((s: number, m: any) => s + m.income, 0) / (monthlyBarData.length || 1), color: 'text-success', border: 'border-success/20' },
                  { label: 'Avg Expenses', val: monthlyBarData.reduce((s: number, m: any) => s + m.expenses, 0) / (monthlyBarData.length || 1), color: 'text-danger', border: 'border-danger/20' },
                  { label: 'Avg Savings', val: monthlyBarData.reduce((s: number, m: any) => s + m.savings, 0) / (monthlyBarData.length || 1), color: 'text-accent', border: 'border-accent/20' },
                ].map((s, i) => (
                  <div key={i} className={`glass p-3 rounded-xl border ${s.border} text-center`}>
                    <p className="text-white/30 text-[10px] mb-1">{s.label}</p>
                    <p className={`text-sm font-bold ${s.color}`}>₨{Math.round(s.val).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* ── How to Save Money ── */}
          <Section title="How to Save Money" subtitle="Personalized AI tips based on your spending patterns" icon={PiggyBank} color="from-green-500 to-emerald-500" badge="AI Tips">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {savingTips.map((tip, i) => (
                <SavingTip key={i} {...tip} delay={i * 0.08} />
              ))}
            </div>
            {monthlyIncome > 0 && (
              <div className="mt-4 glass p-4 rounded-xl border border-success/15">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle size={15} className="text-success" />
                  <p className="text-xs font-semibold text-success">Your Savings Potential</p>
                </div>
                <p className="text-white/55 text-xs leading-relaxed">
                  If you follow the tips above you could potentially save an extra{' '}
                  <span className="text-success font-bold">₨{Math.round(monthlyIncome * 0.15).toLocaleString()}/month</span>{' '}
                  — that's <span className="text-success font-bold">₨{Math.round(monthlyIncome * 1.8).toLocaleString()}/year</span> toward your financial goals.
                </p>
              </div>
            )}
          </Section>

          {/* ── 50/30/20 Budget Rule ── */}
          {monthlyIncome > 0 && (
            <Section title="50/30/20 Budget Rule" subtitle="Where your money should go vs where it actually goes" icon={Target} color="from-warning to-amber-500" badge="Budget Planner">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-white/30 text-[10px] font-semibold uppercase tracking-wider mb-4">Your Current Allocation</p>
                  <BudgetRuleBar
                    label="Needs (Housing, Food, Transport)"
                    pct={monthlyIncome > 0 ? (needsAmt / monthlyIncome) * 100 : 0}
                    amount={needsAmt}
                    color="#6366F1"
                    target="50% target"
                  />
                  <BudgetRuleBar
                    label="Wants (Shopping, Entertainment)"
                    pct={monthlyIncome > 0 ? (wantsAmt / monthlyIncome) * 100 : 0}
                    amount={wantsAmt}
                    color="#EC4899"
                    target="30% target"
                  />
                  <BudgetRuleBar
                    label="Savings & Investments"
                    pct={monthlyIncome > 0 ? (actualSavings / monthlyIncome) * 100 : 0}
                    amount={actualSavings}
                    color="#10B981"
                    target="20% target"
                  />
                </div>
                <div>
                  <p className="text-white/30 text-[10px] font-semibold uppercase tracking-wider mb-4">Ideal Allocation (₨{monthlyIncome.toLocaleString()} income)</p>
                  <BudgetRuleBar label="Needs" pct={50} amount={needsTarget} color="#6366F1" target="50% — ₨" />
                  <BudgetRuleBar label="Wants" pct={30} amount={wantsTarget} color="#EC4899" target="30% — ₨" />
                  <BudgetRuleBar label="Savings" pct={20} amount={savingsTarget} color="#10B981" target="20% — ₨" />
                  <div className="mt-4 glass p-3 rounded-xl border border-warning/15">
                    <p className="text-[10px] text-warning font-semibold mb-1">💡 Rule of Thumb</p>
                    <p className="text-white/45 text-xs leading-relaxed">
                      Needs: rent, groceries, transport, utilities. Wants: dining out, subscriptions, hobbies. Savings: emergency fund, investments, debt payoff.
                    </p>
                  </div>
                </div>
              </div>
            </Section>
          )}

          {/* ── Empty State ── */}
          {!historicalData.some(m => m.expenses > 0) && !analysis?.category_breakdown?.length && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card text-center py-14">
              <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-primary/20">
                <Brain size={28} className="text-primary" />
              </div>
              <h3 className="font-bold text-lg mb-2">No Data to Analyze Yet</h3>
              <p className="text-white/40 text-sm max-w-sm mx-auto mb-6">
                The ML model needs your real transaction data to generate accurate predictions. Follow these steps:
              </p>
              <div className="flex flex-col gap-3 max-w-xs mx-auto text-left">
                {[
                  { step: '1', label: 'Add your monthly income', sub: 'Go to Income page → Add Income' },
                  { step: '2', label: 'Log your expenses', sub: 'Go to Expenses page → add food, transport, bills…' },
                  { step: '3', label: 'Add at least 2–3 months of data', sub: 'More months = higher confidence predictions' },
                  { step: '4', label: 'Click "Run Analysis"', sub: 'AI will generate forecasts, health score & tips' },
                ].map(({ step, label, sub }) => (
                  <div key={step} className="flex items-start gap-3 glass p-3 rounded-xl border border-white/6">
                    <div className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-black flex items-center justify-center flex-shrink-0 mt-0.5">{step}</div>
                    <div>
                      <p className="text-sm font-semibold text-white/80">{label}</p>
                      <p className="text-white/35 text-xs mt-0.5">{sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

        </div>
      )}
    </div>
  )
}
