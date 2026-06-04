import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, ReferenceLine, Legend,
} from 'recharts'
import {
  Brain, TrendingUp, TrendingDown, AlertTriangle,
  Lightbulb, Target, BarChart2, Sparkles,
  ArrowUpRight, ArrowDownRight, Wallet, ChevronRight,
} from 'lucide-react'
import { aiAPI, transactionAPI } from '../../services/api'

// ── Constants ────────────────────────────────────────────────────────────────
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

// ── Custom tooltip ────────────────────────────────────────────────────────────
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

  const analysis  = insights?.spending_analysis
  const overspend = insights?.overspending
  const recs      = insights?.recommendations as string[] | undefined
  const expPred   = insights?.predictions
  const savPred   = insights?.savings_predictions

  // ── Build combined historical + future chart data ─────────────────────────
  const historicalData: any[] = (monthlyHistory || []).map((m: any) => ({
    month: m.month,
    expenses: m.expenses,
    income: m.income,
    savings: Math.max(m.savings, 0),
    type: 'actual',
  }))

  // Combine past savings with predicted future
  const savingsTimeline: any[] = [
    ...historicalData.map(m => ({
      month: m.month,
      actualSavings: m.savings,
      predictedSavings: null,
      cumulativePredicted: null,
      type: 'actual',
    })),
    ...(savPred?.predictions || []).map((p: any) => ({
      month: p.month,
      actualSavings: null,
      predictedSavings: p.predicted_savings,
      cumulativePredicted: p.cumulative_savings,
      type: 'predicted',
    })),
  ]

  // Last actual savings (for reference line)
  const lastActualSavings = historicalData.length > 0
    ? historicalData[historicalData.length - 1].savings
    : 0

  // ── Build expense prediction chart (past + future) ────────────────────────
  const expenseTimeline: any[] = [
    ...historicalData.map(m => ({
      month: m.month,
      actual: m.expenses,
      predicted: null,
    })),
    ...(expPred?.prediction > 0 ? [{
      month: 'Next Month',
      actual: null,
      predicted: expPred.prediction,
    }] : []),
  ]

  // ── Totals from historical ────────────────────────────────────────────────
  const totalHistoricalExpenses = historicalData.reduce((s, m) => s + m.expenses, 0)
  const avgMonthlyExpense = historicalData.length > 0
    ? totalHistoricalExpenses / historicalData.length : 0
  const currentMonthSavings = historicalData.length > 0
    ? historicalData[historicalData.length - 1].savings : 0

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
              <p className="text-white/40 text-sm">Expense tracking + future savings prediction</p>
            </div>
          </div>
          <div className="flex items-center gap-2 glass px-3 py-1.5 rounded-xl border border-primary/20">
            <Sparkles size={13} className="text-primary" />
            <span className="text-xs text-primary font-medium">Powered by Linear Regression + Pandas</span>
          </div>
        </div>
      </motion.div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-28 gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
          <p className="text-white/35 text-sm">Analyzing your financial history...</p>
        </div>
      ) : (
        <div className="space-y-5">

          {/* ── Overview Cards ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            <MiniStat
              label="6-Month Expenses"
              value={`₨${Math.round(totalHistoricalExpenses / 1000)}k`}
              sub="Total recorded"
              color="from-danger to-rose-600"
              icon={TrendingDown}
            />
            <MiniStat
              label="Avg Monthly Expense"
              value={`₨${Math.round(avgMonthlyExpense / 1000)}k`}
              sub="Per month avg"
              color="from-warning to-amber-500"
              icon={BarChart2}
            />
            <MiniStat
              label="This Month Savings"
              value={`₨${Math.round(currentMonthSavings / 1000)}k`}
              sub="Current month"
              color="from-success to-emerald-600"
              icon={Wallet}
              trend={currentMonthSavings > 0 ? 'up' : 'down'}
            />
            <MiniStat
              label="Predicted Next Month"
              value={expPred?.prediction > 0 ? `₨${Math.round(expPred.prediction / 1000)}k` : '—'}
              sub={expPred?.confidence ? `${expPred.confidence} confidence` : 'Need more data'}
              color="from-accent to-cyan-600"
              icon={Target}
              trend="up"
            />
          </motion.div>

          {/* ── Chart 1: Historical Expense + Income Trend ── */}
          {historicalData.length > 0 && (
            <Section
              title="Historical Expense & Savings Trend"
              subtitle="Past 6 months — actual recorded data"
              icon={TrendingDown}
              color="from-primary to-secondary"
              badge="6-Month History"
            >
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
                  <YAxis tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false}
                    tickFormatter={v => `₨${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<Tip />} />
                  <Legend wrapperStyle={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', paddingTop: '12px' }} />
                  <Area type="monotone" dataKey="income" name="Income" stroke="#10B981"
                    fill="url(#incGrad)" strokeWidth={2} dot={{ fill: '#10B981', r: 3, strokeWidth: 0 }} />
                  <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#EF4444"
                    fill="url(#expGrad)" strokeWidth={2} dot={{ fill: '#EF4444', r: 3, strokeWidth: 0 }} />
                  <Area type="monotone" dataKey="savings" name="Savings" stroke="#06B6D4"
                    fill="url(#savGradH)" strokeWidth={2} dot={{ fill: '#06B6D4', r: 3, strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            </Section>
          )}

          {/* ── Chart 2: Expense Past → Future (combined) ── */}
          {expenseTimeline.length > 1 && (
            <Section
              title="Expense Forecast"
              subtitle="Past 6 months actual + AI predicted next month"
              icon={Sparkles}
              color="from-accent to-cyan-600"
            >
              <ResponsiveContainer width="100%" height={230}>
                <LineChart data={expenseTimeline} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false}
                    tickFormatter={v => `₨${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<Tip />} />
                  <Legend wrapperStyle={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', paddingTop: '12px' }} />
                  {/* vertical divider between actual and predicted */}
                  {expPred?.prediction > 0 && (
                    <ReferenceLine
                      x="Next Month"
                      stroke="rgba(99,102,241,0.4)"
                      strokeDasharray="4 4"
                      label={{ value: 'Forecast →', fill: 'rgba(99,102,241,0.7)', fontSize: 10, position: 'top' }}
                    />
                  )}
                  <Line type="monotone" dataKey="actual" name="Actual Expenses"
                    stroke="#EF4444" strokeWidth={2.5} dot={{ fill: '#EF4444', r: 4, strokeWidth: 0 }}
                    connectNulls={false} />
                  <Line type="monotone" dataKey="predicted" name="Predicted Expenses"
                    stroke="#06B6D4" strokeWidth={2.5} strokeDasharray="6 4"
                    dot={{ fill: '#06B6D4', r: 5, strokeWidth: 2, stroke: '#fff' }}
                    connectNulls={false} />
                </LineChart>
              </ResponsiveContainer>

              {expPred?.prediction > 0 && (
                <div className="flex flex-wrap gap-3 mt-4">
                  <div className="glass px-4 py-3 rounded-xl border border-accent/25 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
                      <Target size={15} className="text-accent" />
                    </div>
                    <div>
                      <p className="text-white/40 text-xs">Predicted Next Month</p>
                      <p className="text-lg font-bold text-accent">₨{Number(expPred.prediction).toLocaleString()}</p>
                    </div>
                    <span className={`badge text-xs ml-2 ${expPred.confidence === 'high' ? 'badge-success' : expPred.confidence === 'medium' ? 'badge-warning' : 'badge-danger'}`}>
                      {expPred.confidence} confidence
                    </span>
                  </div>
                  <div className="glass px-4 py-3 rounded-xl border border-white/8 flex items-center gap-3">
                    <p className="text-white/40 text-xs">{expPred.message}</p>
                  </div>
                </div>
              )}
            </Section>
          )}

          {/* ── Chart 3: Savings — Past + Future Combined ── */}
          {savingsTimeline.length > 0 && (
            <Section
              title="Savings Forecast"
              subtitle="Historical savings + 6-month AI prediction"
              icon={TrendingUp}
              color="from-success to-emerald-600"
              badge="Past + Future"
            >
              {/* Summary row */}
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
                  <YAxis tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }} axisLine={false} tickLine={false}
                    tickFormatter={v => `₨${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<Tip />} />
                  <Legend wrapperStyle={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', paddingTop: '10px' }} />

                  {/* Reference line at last actual value */}
                  {lastActualSavings > 0 && historicalData.length > 0 && (
                    <ReferenceLine
                      x={historicalData[historicalData.length - 1].month}
                      stroke="rgba(255,255,255,0.15)"
                      strokeDasharray="4 4"
                      label={{ value: 'Now', fill: 'rgba(255,255,255,0.3)', fontSize: 10, position: 'top' }}
                    />
                  )}

                  <Area type="monotone" dataKey="actualSavings" name="Actual Savings"
                    stroke="#10B981" fill="url(#actSavGrad)" strokeWidth={2.5}
                    dot={{ fill: '#10B981', r: 4, strokeWidth: 0 }} connectNulls={false} />
                  <Area type="monotone" dataKey="predictedSavings" name="Predicted Monthly"
                    stroke="#06B6D4" fill="url(#predSavGrad)" strokeWidth={2.5} strokeDasharray="6 4"
                    dot={{ fill: '#06B6D4', r: 4, strokeWidth: 0 }} connectNulls={false} />
                  <Area type="monotone" dataKey="cumulativePredicted" name="Cumulative Forecast"
                    stroke="#8B5CF6" fill="url(#cumGrad)" strokeWidth={2} strokeDasharray="4 3"
                    dot={{ fill: '#8B5CF6', r: 3, strokeWidth: 0 }} connectNulls={false} />
                </AreaChart>
              </ResponsiveContainer>

              <div className="flex flex-wrap gap-3 mt-4 text-xs">
                <div className="flex items-center gap-1.5"><span className="w-6 h-0.5 bg-success rounded inline-block" /> Actual Savings (recorded)</div>
                <div className="flex items-center gap-1.5"><span className="w-6 h-px border-t-2 border-dashed border-accent inline-block" /> Predicted Monthly Savings</div>
                <div className="flex items-center gap-1.5"><span className="w-6 h-px border-t-2 border-dashed border-secondary inline-block" /> Cumulative Savings Forecast</div>
              </div>
            </Section>
          )}

          {/* ── Row: Category Analysis + Predicted by Category ── */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

            {/* Current Month Category Breakdown */}
            <Section
              title="This Month — By Category"
              subtitle="Where your money is going right now"
              icon={BarChart2}
              color="from-warning to-amber-500"
            >
              {analysis?.category_breakdown?.length > 0 ? (
                <div className="space-y-3">
                  {analysis.category_breakdown.map((c: any, i: number) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                    >
                      <div className="flex items-center justify-between text-sm mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{CAT_EMOJIS[c.category] || '💼'}</span>
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
                          transition={{ duration: 0.8, delay: 0.2 + i * 0.07, ease: 'easeOut' }}
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

            {/* Predicted by Category (next month) */}
            <Section
              title="Next Month Prediction — By Category"
              subtitle="AI forecast using Linear Regression"
              icon={Target}
              color="from-accent to-cyan-600"
            >
              {expPred?.predictions_by_category?.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart
                      data={expPred.predictions_by_category.slice(0, 7)}
                      margin={{ top: 4, right: 4, bottom: 0, left: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                      <XAxis dataKey="category" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }} axisLine={false} tickLine={false}
                        tickFormatter={v => `₨${(v / 1000).toFixed(0)}k`} />
                      <Tooltip content={<Tip />} />
                      <Bar dataKey="predicted_amount" name="Predicted" radius={[6, 6, 0, 0]} maxBarSize={44}>
                        {expPred.predictions_by_category.map((e: any, i: number) => (
                          <Cell key={i} fill={CAT_COLORS[e.category] || '#6366F1'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>

                  <div className="mt-3 space-y-1.5">
                    {expPred.predictions_by_category.slice(0, 5).map((item: any, i: number) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ background: CAT_COLORS[item.category] || '#6366F1' }} />
                          <span className="text-white/55 capitalize">{item.category}</span>
                        </div>
                        <span className="font-semibold text-white/80">₨{Number(item.predicted_amount).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="h-44 flex flex-col items-center justify-center text-white/20 gap-2">
                  <Sparkles size={28} />
                  <p className="text-sm text-center">Need more data for category predictions</p>
                </div>
              )}
            </Section>
          </div>

          {/* ── Overspending + Recommendations ── */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

            {/* Overspending Alerts */}
            <Section
              title="Overspending Detection"
              subtitle="Current month vs previous month"
              icon={AlertTriangle}
              color="from-danger to-rose-600"
            >
              {overspend?.alerts?.length > 0 &&
               overspend.alerts[0] !== 'Spending is stable compared to last month.' ? (
                <div className="space-y-2 mb-5">
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

              {/* comparison table */}
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

            {/* AI Recommendations */}
            <Section
              title="AI Recommendations"
              subtitle="Personalized tips to save more money"
              icon={Lightbulb}
              color="from-warning to-amber-500"
            >
              <div className="space-y-3">
                {(recs || ['Add more transactions to get personalized recommendations.']).map((rec, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.08 }}
                    className="flex items-start gap-3 glass p-3.5 rounded-xl border border-warning/12 hover:border-warning/25 transition-colors"
                  >
                    <div className="w-6 h-6 rounded-full bg-warning/20 flex items-center justify-center text-warning text-xs font-bold flex-shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <p className="text-sm text-white/70 leading-relaxed">{rec}</p>
                  </motion.div>
                ))}
              </div>

              {/* AI Insights from spending analysis */}
              {analysis?.insights?.length > 0 && (
                <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
                  <p className="text-white/30 text-[10px] font-semibold uppercase tracking-wider mb-2">AI Observations</p>
                  {analysis.insights.map((ins: string, i: number) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-white/55">
                      <span className="text-primary flex-shrink-0 mt-0.5">💡</span>
                      <span className="leading-relaxed">{ins}</span>
                    </div>
                  ))}
                </div>
              )}
            </Section>
          </div>

          {/* ── Empty state ── */}
          {!historicalData.some(m => m.expenses > 0) && !analysis?.category_breakdown?.length && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="card text-center py-14"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-primary/20">
                <Brain size={28} className="text-primary" />
              </div>
              <h3 className="font-bold text-lg mb-2">No Data to Analyze Yet</h3>
              <p className="text-white/40 text-sm max-w-sm mx-auto">
                Add your income and expense transactions. The AI will automatically analyze your spending and predict future savings.
              </p>
            </motion.div>
          )}

        </div>
      )}
    </div>
  )
}
