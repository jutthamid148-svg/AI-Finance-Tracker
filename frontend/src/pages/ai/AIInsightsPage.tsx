import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  PieChart, Pie, RadialBarChart, RadialBar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, ReferenceLine, Legend, Label,
} from 'recharts'
import {
  Brain, TrendingUp, TrendingDown, AlertTriangle,
  Lightbulb, Target, BarChart2, Sparkles,
  ArrowUpRight, ArrowDownRight, Wallet, ChevronRight,
  ShieldCheck, Calendar, Activity,
} from 'lucide-react'
import { aiAPI, transactionAPI } from '../../services/api'

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

// ── Main Page ────────────────────────────────────────────────────────────────
export default function AIInsightsPage() {

  const { data: insights, isLoading: insightsLoading } = useQuery({
    queryKey: ['ai-insights'],
    queryFn: () => aiAPI.insights().then(r => r.data),
  })

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

  return (
    <div className="p-5 md:p-6 max-w-7xl mx-auto">

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
          <div className="flex items-center gap-2 glass px-3 py-1.5 rounded-xl border border-primary/20">
            <Sparkles size={13} className="text-primary" />
            <span className="text-xs text-primary font-medium">ML-Powered Predictions</span>
          </div>
        </div>
      </motion.div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-28 gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
          <p className="text-white/35 text-sm">Analyzing your financial data...</p>
        </div>
      ) : (
        <div className="space-y-5">

          {/* ── Overview Cards ── */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MiniStat label="Total Expenses" value={`₨${Math.round(totalHistoricalExpenses / 1000)}k`} sub="All recorded" color="from-danger to-rose-600" icon={TrendingDown} />
            <MiniStat label="Avg Monthly" value={`₨${Math.round(avgMonthlyExpense / 1000)}k`} sub="Per month" color="from-warning to-amber-500" icon={BarChart2} />
            <MiniStat label="Current Savings" value={`₨${Math.round(currentMonthSavings / 1000)}k`} sub="This month" color="from-success to-emerald-600" icon={Wallet} trend={currentMonthSavings > 0 ? 'up' : 'down'} />
            <MiniStat label="Next Month Forecast" value={expPred?.prediction > 0 ? `₨${Math.round(expPred.prediction / 1000)}k` : '—'} sub={expPred?.confidence ? `${expPred.confidence} confidence` : 'Need data'} color="from-accent to-cyan-600" icon={Target} trend="up" />
          </motion.div>

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

                <div className="glass p-3.5 rounded-xl border border-white/5 text-xs text-white/35 leading-relaxed">
                  <span className="text-primary font-semibold">ℹ️ Methodology: </span>
                  AI predictions use Polynomial Regression (degree 2) trained on your {expPred?.months_analyzed || 0} months of expense history.
                  Confidence is {expPred?.confidence || 'low'} — adding more monthly data improves prediction accuracy significantly.
                  Savings rate targets: 10% = Fair, 20% = Good, 30%+ = Excellent.
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
              <p className="text-white/40 text-sm max-w-sm mx-auto">
                Add income and expense transactions. The AI will analyze spending patterns and predict future expenses using ML.
              </p>
            </motion.div>
          )}

        </div>
      )}
    </div>
  )
}
