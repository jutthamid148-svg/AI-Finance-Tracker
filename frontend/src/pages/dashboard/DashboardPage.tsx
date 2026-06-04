import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import {
  AreaChart, Area, BarChart, Bar, RadialBarChart, RadialBar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, PieChart, Pie, Legend,
} from 'recharts'
import {
  TrendingUp, TrendingDown, Wallet, Target, Brain,
  ArrowUpRight, ArrowDownRight, Plus, X, Zap,
  CheckCircle2, Clock, Activity, Shield,
  DollarSign, BarChart2, Sparkles,
} from 'lucide-react'
import {
  authAPI, transactionAPI, budgetAPI, savingsAPI, aiAPI
} from '../../services/api'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import toast from 'react-hot-toast'

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
const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#EC4899', '#64748B']

// ── Quick Add Modal ──────────────────────────────────────────────────────────
const EXPENSE_CATEGORIES = [
  { value: 'food', label: '🍔 Food & Dining' },
  { value: 'transport', label: '🚗 Transport' },
  { value: 'shopping', label: '🛍️ Shopping' },
  { value: 'bills', label: '📄 Bills & Utilities' },
  { value: 'health', label: '🏥 Health' },
  { value: 'education', label: '📚 Education' },
  { value: 'entertainment', label: '🎮 Entertainment' },
  { value: 'other', label: '💼 Other' },
]
const INCOME_SOURCES = [
  { value: 'salary', label: '💼 Salary' },
  { value: 'freelance', label: '💻 Freelance' },
  { value: 'business', label: '🏢 Business' },
  { value: 'investment', label: '📈 Investment' },
  { value: 'gift', label: '🎁 Gift' },
  { value: 'other', label: '💰 Other' },
]

function QuickAddModal({ type, onClose }: { type: 'income' | 'expense'; onClose: () => void }) {
  const qc = useQueryClient()
  const { register, handleSubmit, formState: { errors } } = useForm<Record<string, any>>({
    defaultValues: { date: new Date().toISOString().split('T')[0] },
  })

  const mutation = useMutation({
    mutationFn: (data: any) =>
      type === 'income' ? transactionAPI.addIncome(data) : transactionAPI.addExpense(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] })
      qc.invalidateQueries({ queryKey: ['recent-transactions'] })
      qc.invalidateQueries({ queryKey: ['monthly-chart'] })
      qc.invalidateQueries({ queryKey: ['category-chart'] })
      toast.success(type === 'income' ? 'Income added! 💰' : 'Expense recorded! 📝')
      onClose()
    },
    onError: () => toast.error('Failed to save'),
  })

  const isIncome = type === 'income'

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 20 }}
        className="card w-full max-w-md"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isIncome ? 'bg-gradient-to-br from-success to-emerald-600' : 'bg-gradient-to-br from-danger to-rose-600'}`}>
              {isIncome ? <TrendingUp size={16} className="text-white" /> : <TrendingDown size={16} className="text-white" />}
            </div>
            <h2 className="font-bold text-base">{isIncome ? 'Add Income' : 'Add Expense'}</h2>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-3.5">
          <div>
            <label className="label">Amount (PKR)</label>
            <input type="number" step="0.01" className="input" placeholder={isIncome ? '50,000' : '5,000'}
              {...register('amount', { required: 'Required', min: { value: 1, message: 'Must be > 0' } })} />
            {errors.amount && <p className="text-danger text-xs mt-1">{errors.amount.message as string}</p>}
          </div>

          <div>
            <label className="label">{isIncome ? 'Source' : 'Category'}</label>
            <select className="input" {...register(isIncome ? 'source' : 'category', { required: 'Required' })}>
              <option value="">Select {isIncome ? 'source' : 'category'}</option>
              {(isIncome ? INCOME_SOURCES : EXPENSE_CATEGORIES).map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Description (Optional)</label>
            <input className="input" placeholder={isIncome ? 'Monthly salary...' : 'Lunch, bills...'}
              {...register('description')} />
          </div>

          <div>
            <label className="label">Date</label>
            <input type="date" className="input" {...register('date', { required: true })} />
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 py-2.5 text-sm">Cancel</button>
            <button type="submit" disabled={mutation.isPending}
              className={`flex-1 py-2.5 text-sm rounded-xl font-semibold text-white transition-all ${isIncome ? 'bg-gradient-to-r from-success to-emerald-600' : 'bg-gradient-to-r from-danger to-rose-600'}`}
            >
              {mutation.isPending ? <div className="spinner w-4 h-4 border-2 mx-auto" /> : `Add ${isIncome ? 'Income' : 'Expense'}`}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

// ── Custom Tooltip ────────────────────────────────────────────────────────────
function Tip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="glass rounded-xl px-3.5 py-2.5 border border-white/10 text-xs shadow-xl">
      <p className="text-white/45 mb-1.5">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="font-semibold mb-0.5" style={{ color: p.color }}>
          {p.name}: ₨{Number(p.value).toLocaleString()}
        </p>
      ))}
    </div>
  )
}

// ── Financial Health Score ────────────────────────────────────────────────────
function HealthScore({ income, expenses, budgetRate }: { income: number; expenses: number; budgetRate: number }) {
  const savingsRate = income > 0 ? Math.max(((income - expenses) / income) * 100, 0) : 0
  const score = Math.min(
    Math.round((savingsRate * 0.5) + (budgetRate * 0.5)),
    100
  )
  const color = score >= 70 ? '#10B981' : score >= 40 ? '#F59E0B' : '#EF4444'
  const label = score >= 70 ? 'Excellent' : score >= 40 ? 'Good' : 'Needs Work'

  const data = [{ name: 'score', value: score, fill: color }]

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <ResponsiveContainer width={120} height={120}>
          <RadialBarChart
            cx="50%" cy="50%"
            innerRadius="70%" outerRadius="100%"
            data={data}
            startAngle={180} endAngle={0}
          >
            <RadialBar dataKey="value" cornerRadius={8} background={{ fill: 'rgba(255,255,255,0.04)' }} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center mt-4">
          <span className="text-2xl font-black" style={{ color }}>{score}</span>
          <span className="text-[10px] text-white/40">/100</span>
        </div>
      </div>
      <span className="text-xs font-semibold mt-1" style={{ color }}>{label}</span>
      <span className="text-[10px] text-white/30 mt-0.5">Savings: {savingsRate.toFixed(0)}%</span>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user } = useAuthStore()
  const [quickAdd, setQuickAdd] = useState<'income' | 'expense' | null>(null)

  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => authAPI.dashboardStats().then(r => r.data),
  })
  const { data: monthlyData } = useQuery({
    queryKey: ['monthly-chart'],
    queryFn: () => transactionAPI.monthlyChart().then(r => r.data),
  })
  const { data: categoryData } = useQuery({
    queryKey: ['category-chart'],
    queryFn: () => transactionAPI.categoryChart().then(r => r.data),
  })
  const { data: recentExpenses } = useQuery({
    queryKey: ['recent-transactions', 'expenses'],
    queryFn: () => transactionAPI.expenseList().then(r => (r.data.results || r.data).slice(0, 5)),
  })
  const { data: recentIncomes } = useQuery({
    queryKey: ['recent-transactions', 'income'],
    queryFn: () => transactionAPI.incomeList().then(r => (r.data.results || r.data).slice(0, 5)),
  })
  const { data: budgets } = useQuery({
    queryKey: ['budgets-dashboard'],
    queryFn: () => {
      const now = new Date()
      return budgetAPI.list({ month: now.getMonth() + 1, year: now.getFullYear() })
        .then(r => (r.data.results || r.data).slice(0, 4))
    },
  })
  const { data: budgetSummary } = useQuery({
    queryKey: ['budget-summary'],
    queryFn: () => budgetAPI.summary().then(r => r.data),
  })
  const { data: savings } = useQuery({
    queryKey: ['savings-dashboard'],
    queryFn: () => savingsAPI.list().then(r => (r.data.results || r.data).slice(0, 3)),
  })
  const { data: aiInsights } = useQuery({
    queryKey: ['ai-insights-quick'],
    queryFn: () => aiAPI.spendingAnalysis().then(r => r.data),
  })

  // Merge & sort recent transactions
  const recentTxns = [
    ...(recentExpenses || []).map((e: any) => ({ ...e, txType: 'expense' })),
    ...(recentIncomes || []).map((i: any) => ({ ...i, txType: 'income' })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6)

  // Monthly comparison (this month vs last month from monthlyData)
  const last2Months = (monthlyData || []).slice(-2)
  const comparisonData = last2Months.length === 2
    ? [
        { name: 'Income', lastMonth: last2Months[0].income, thisMonth: last2Months[1].income },
        { name: 'Expenses', lastMonth: last2Months[0].expenses, thisMonth: last2Months[1].expenses },
        { name: 'Savings', lastMonth: Math.max(last2Months[0].savings, 0), thisMonth: Math.max(last2Months[1].savings, 0) },
      ]
    : []

  const getGreeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const stagger = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.07 } } }
  const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } }

  return (
    <div className="p-5 md:p-6 max-w-7xl mx-auto">

      {/* ── Header ── */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-black">
              {getGreeting()}, <span className="gradient-text">{user?.first_name}! 👋</span>
            </h1>
            <p className="text-white/35 text-sm mt-0.5">
              {new Date().toLocaleDateString('en-PK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          {/* Quick Add Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setQuickAdd('income')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-success to-emerald-600 hover:shadow-lg hover:shadow-success/25 transition-all hover:-translate-y-0.5"
            >
              <Plus size={15} /> Income
            </button>
            <button
              onClick={() => setQuickAdd('expense')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-danger to-rose-600 hover:shadow-lg hover:shadow-danger/25 transition-all hover:-translate-y-0.5"
            >
              <Plus size={15} /> Expense
            </button>
            <Link to="/dashboard/ai-insights"
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold btn-primary"
            >
              <Sparkles size={14} /> AI
            </Link>
          </div>
        </div>
      </motion.div>

      {/* ── Admin Panel Banner (staff only) ── */}
      {user?.is_staff && (
        <motion.a
          href="/admin"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          whileHover={{ scale: 1.01 }}
          className="flex items-center justify-between px-5 py-3.5 rounded-2xl mb-5 cursor-pointer group relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(139,92,246,0.15) 100%)', border: '1px solid rgba(99,102,241,0.35)' }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/30">
              <Shield size={17} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-sm text-white">Admin Panel</p>
              <p className="text-white/45 text-xs">Manage users, view platform stats, activate/deactivate accounts</p>
            </div>
          </div>
          <div className="flex items-center gap-2 relative z-10">
            <span className="badge badge-primary text-[10px] py-0.5">Staff Access</span>
            <ArrowUpRight size={16} className="text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
        </motion.a>
      )}

      {/* ── Stat Cards ── */}
      <motion.div variants={stagger} initial="hidden" animate="visible"
        className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
        {[
          {
            title: 'Current Balance', value: stats?.current_balance || 0,
            icon: Wallet, grad: 'from-primary to-secondary', change: stats?.balance_change,
          },
          {
            title: 'Monthly Income', value: stats?.monthly_income || 0,
            icon: TrendingUp, grad: 'from-success to-emerald-600', change: stats?.income_change,
          },
          {
            title: 'Monthly Expenses', value: stats?.monthly_expenses || 0,
            icon: TrendingDown, grad: 'from-danger to-rose-600', change: stats?.expense_change,
          },
          {
            title: 'Total Savings', value: stats?.total_savings || 0,
            icon: Target, grad: 'from-warning to-amber-600', change: undefined,
          },
        ].map((s, i) => (
          <motion.div key={i} variants={fadeUp}
            whileHover={{ y: -3, scale: 1.015 }}
            className="card relative overflow-hidden"
          >
            <div className={`absolute inset-0 opacity-[0.05] bg-gradient-to-br ${s.grad}`} />
            <div className="relative">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-white/40 text-xs mb-1">{s.title}</p>
                  <p className="text-xl md:text-2xl font-black">₨{Number(s.value).toLocaleString()}</p>
                </div>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${s.grad} shadow-lg flex-shrink-0`}>
                  <s.icon size={18} className="text-white" />
                </div>
              </div>
              {s.change !== undefined && (
                <div className={`flex items-center gap-1 text-xs font-medium ${s.change >= 0 ? 'text-success' : 'text-danger'}`}>
                  {s.change >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  <span>{Math.abs(s.change)}% vs last month</span>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Row: Area Chart + Health Score ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-5">

        {/* Income vs Expenses Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="card xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-sm">Income vs Expenses</h2>
              <p className="text-white/35 text-xs">6-month trend</p>
            </div>
            <span className="badge badge-primary text-[10px]">Last 6 Months</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthlyData || []} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="incG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="savG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false}
                tickFormatter={v => `₨${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<Tip />} />
              <Legend wrapperStyle={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', paddingTop: '8px' }} />
              <Area type="monotone" dataKey="income" name="Income" stroke="#10B981" fill="url(#incG)" strokeWidth={2} dot={{ fill: '#10B981', r: 3, strokeWidth: 0 }} />
              <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#EF4444" fill="url(#expG)" strokeWidth={2} dot={{ fill: '#EF4444', r: 3, strokeWidth: 0 }} />
              <Area type="monotone" dataKey="savings" name="Savings" stroke="#06B6D4" fill="url(#savG)" strokeWidth={1.5} dot={{ fill: '#06B6D4', r: 2, strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Financial Health + Category Pie */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="card flex flex-col">
          {/* Health Score */}
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="font-bold text-sm">Financial Health</h2>
              <p className="text-white/35 text-xs">Based on savings & budget</p>
            </div>
            <Activity size={14} className="text-white/25" />
          </div>
          <div className="flex items-center gap-4 mb-4 pb-4 border-b border-white/5">
            <HealthScore
              income={stats?.monthly_income || 0}
              expenses={stats?.monthly_expenses || 0}
              budgetRate={budgetSummary?.success_rate || 0}
            />
            <div className="flex-1 space-y-2">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-white/40">Savings Rate</span>
                  <span className="text-success font-medium">
                    {stats?.monthly_income > 0
                      ? `${Math.max(((stats.monthly_income - stats.monthly_expenses) / stats.monthly_income) * 100, 0).toFixed(0)}%`
                      : '—'}
                  </span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-success rounded-full transition-all"
                    style={{ width: `${stats?.monthly_income > 0 ? Math.min(((stats.monthly_income - stats.monthly_expenses) / stats.monthly_income) * 100, 100) : 0}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-white/40">Budget Adherence</span>
                  <span className="text-primary font-medium">{budgetSummary?.success_rate || 0}%</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${budgetSummary?.success_rate || 0}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Category Pie (compact) */}
          <h3 className="text-xs font-semibold text-white/40 mb-2">Spending by Category</h3>
          {categoryData?.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={110}>
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={28} outerRadius={50}
                    paddingAngle={3} dataKey="total">
                    {categoryData.map((e: any, i: number) => (
                      <Cell key={i} fill={CAT_COLORS[e.category] || COLORS[i % COLORS.length]} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: any) => `₨${Number(v).toLocaleString()}`}
                    contentStyle={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1 mt-1">
                {categoryData.slice(0, 4).map((c: any, i: number) => (
                  <div key={i} className="flex items-center gap-1.5 text-[10px]">
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: CAT_COLORS[c.category] || COLORS[i] }} />
                    <span className="text-white/45 capitalize truncate">{c.category}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-white/20 text-xs">No data this month</div>
          )}
        </motion.div>
      </div>

      {/* ── Row: Monthly Comparison + Recent Transactions ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mb-5">

        {/* Monthly Comparison Bar */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-sm">Monthly Comparison</h2>
              <p className="text-white/35 text-xs">
                {last2Months.length === 2
                  ? `${last2Months[0].month} vs ${last2Months[1].month}`
                  : 'This month vs last month'}
              </p>
            </div>
            <BarChart2 size={15} className="text-white/20" />
          </div>

          {comparisonData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={comparisonData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }} axisLine={false} tickLine={false}
                    tickFormatter={v => `₨${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<Tip />} />
                  <Legend wrapperStyle={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', paddingTop: '8px' }} />
                  <Bar dataKey="lastMonth" name={last2Months[0]?.month || 'Last Month'} fill="rgba(255,255,255,0.12)" radius={[4, 4, 0, 0]} maxBarSize={32} />
                  <Bar dataKey="thisMonth" name={last2Months[1]?.month || 'This Month'} fill="#6366F1" radius={[4, 4, 0, 0]} maxBarSize={32} />
                </BarChart>
              </ResponsiveContainer>

              {/* Change indicators */}
              {last2Months.length === 2 && (
                <div className="grid grid-cols-3 gap-2 mt-3">
                  {[
                    { label: 'Income', curr: last2Months[1].income, prev: last2Months[0].income, good: true },
                    { label: 'Expenses', curr: last2Months[1].expenses, prev: last2Months[0].expenses, good: false },
                    { label: 'Savings', curr: Math.max(last2Months[1].savings, 0), prev: Math.max(last2Months[0].savings, 0), good: true },
                  ].map((item, i) => {
                    const pct = item.prev > 0 ? ((item.curr - item.prev) / item.prev) * 100 : 0
                    const isPositive = item.good ? pct >= 0 : pct <= 0
                    return (
                      <div key={i} className="glass p-2 rounded-lg border border-white/5 text-center">
                        <p className="text-white/30 text-[9px] mb-0.5">{item.label}</p>
                        <p className={`text-xs font-bold ${isPositive ? 'text-success' : 'text-danger'}`}>
                          {pct >= 0 ? '+' : ''}{pct.toFixed(0)}%
                        </p>
                      </div>
                    )
                  })}
                </div>
              )}
            </>
          ) : (
            <div className="h-44 flex items-center justify-center text-white/20 text-sm">
              Not enough data for comparison
            </div>
          )}
        </motion.div>

        {/* Recent Transactions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-sm">Recent Transactions</h2>
              <p className="text-white/35 text-xs">Latest income & expenses</p>
            </div>
            <div className="flex gap-2">
              <Link to="/dashboard/income" className="text-[10px] text-white/30 hover:text-success transition-colors">Income</Link>
              <span className="text-white/15">·</span>
              <Link to="/dashboard/expenses" className="text-[10px] text-white/30 hover:text-danger transition-colors">Expenses</Link>
            </div>
          </div>

          {recentTxns.length === 0 ? (
            <div className="h-44 flex flex-col items-center justify-center text-white/20 gap-2">
              <Clock size={28} />
              <p className="text-sm">No transactions yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentTxns.map((tx: any, i: number) => {
                const isIncome = tx.txType === 'income'
                const catColor = CAT_COLORS[tx.category] || '#6366F1'
                return (
                  <motion.div
                    key={`${tx.txType}-${tx.id}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-center gap-3 py-2 px-3 rounded-xl hover:bg-white/[0.03] transition-colors border border-transparent hover:border-white/5"
                  >
                    {/* Icon */}
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm"
                      style={{ background: isIncome ? 'rgba(16,185,129,0.15)' : catColor + '20' }}
                    >
                      {isIncome ? '💰' : CAT_EMOJIS[tx.category] || '💼'}
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white/80 truncate">
                        {tx.description || (isIncome ? tx.source : tx.category)}
                      </p>
                      <p className="text-[10px] text-white/30">{tx.date}</p>
                    </div>
                    {/* Amount */}
                    <span className={`text-sm font-bold flex-shrink-0 ${isIncome ? 'text-success' : 'text-danger'}`}>
                      {isIncome ? '+' : '-'}₨{Number(tx.amount).toLocaleString()}
                    </span>
                  </motion.div>
                )
              })}
            </div>
          )}

          <div className="flex gap-2 mt-4 pt-3 border-t border-white/5">
            <button onClick={() => setQuickAdd('income')}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs text-success hover:bg-success/10 transition-colors border border-success/20">
              <Plus size={12} /> Add Income
            </button>
            <button onClick={() => setQuickAdd('expense')}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs text-danger hover:bg-danger/10 transition-colors border border-danger/20">
              <Plus size={12} /> Add Expense
            </button>
          </div>
        </motion.div>
      </div>

      {/* ── Row: Budget Progress + Savings Goals ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mb-5">

        {/* Budget Progress */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-sm">Budget Progress</h2>
              <p className="text-white/35 text-xs">
                {new Date().toLocaleString('default', { month: 'long' })} {new Date().getFullYear()}
              </p>
            </div>
            <Link to="/dashboard/budget" className="text-[10px] text-primary hover:text-secondary transition-colors flex items-center gap-1">
              View All <ArrowUpRight size={11} />
            </Link>
          </div>

          {!budgets || budgets.length === 0 ? (
            <div className="h-32 flex flex-col items-center justify-center text-white/20 gap-2">
              <DollarSign size={24} />
              <p className="text-xs text-center">No budgets set. <Link to="/dashboard/budget" className="text-primary">Add budget</Link></p>
            </div>
          ) : (
            <div className="space-y-4">
              {budgets.map((b: any, i: number) => {
                const pct = Math.min(b.percentage_used || 0, 100)
                const exceeded = b.is_exceeded
                const barColor = exceeded ? '#EF4444' : pct >= 80 ? '#F59E0B' : CAT_COLORS[b.category] || '#6366F1'
                return (
                  <div key={b.id}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{CAT_EMOJIS[b.category] || '💼'}</span>
                        <span className="text-sm font-medium capitalize">{b.category}</span>
                        {exceeded && <span className="badge badge-danger text-[9px] py-0 px-1.5">Over!</span>}
                        {!exceeded && pct >= 80 && <span className="badge badge-warning text-[9px] py-0 px-1.5">Near</span>}
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-semibold" style={{ color: barColor }}>{pct.toFixed(0)}%</span>
                        <span className="text-white/25 text-[10px] ml-1">
                          ₨{Number(b.spent).toLocaleString()} / ₨{Number(b.amount).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, delay: 0.1 + i * 0.1, ease: 'easeOut' }}
                        className="h-full rounded-full"
                        style={{ background: barColor }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {budgetSummary && (
            <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-white/5 text-xs text-center">
              <div>
                <p className="text-white/30">Total Budget</p>
                <p className="font-bold text-white/70">₨{Number(budgetSummary.total_budget || 0).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-white/30">Spent</p>
                <p className="font-bold text-danger">₨{Number(budgetSummary.total_spent || 0).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-white/30">Remaining</p>
                <p className="font-bold text-success">₨{Number(budgetSummary.total_remaining || 0).toLocaleString()}</p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Savings Goals */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
          className="card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-sm">Savings Goals</h2>
              <p className="text-white/35 text-xs">Your financial milestones</p>
            </div>
            <Link to="/dashboard/savings" className="text-[10px] text-primary hover:text-secondary transition-colors flex items-center gap-1">
              View All <ArrowUpRight size={11} />
            </Link>
          </div>

          {!savings || savings.length === 0 ? (
            <div className="h-32 flex flex-col items-center justify-center text-white/20 gap-2">
              <Target size={24} />
              <p className="text-xs text-center">No goals yet. <Link to="/dashboard/savings" className="text-primary">Create goal</Link></p>
            </div>
          ) : (
            <div className="space-y-4">
              {savings.map((g: any, i: number) => {
                const pct = Math.min(g.progress_percentage || 0, 100)
                return (
                  <div key={g.id}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{g.icon || '🎯'}</span>
                        <div>
                          <span className="text-sm font-medium">{g.name}</span>
                          {g.is_completed && <CheckCircle2 size={12} className="inline ml-1.5 text-success" />}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-success">{pct.toFixed(0)}%</p>
                        <p className="text-[10px] text-white/25">
                          ₨{Number(g.current_amount).toLocaleString()} / ₨{Number(g.target_amount).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.9, delay: 0.2 + i * 0.1, ease: 'easeOut' }}
                        className="h-full rounded-full bg-gradient-to-r from-success to-emerald-400"
                      />
                    </div>
                    {g.target_date && (
                      <p className="text-[10px] text-white/25 mt-0.5">Target: {g.target_date}</p>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </motion.div>
      </div>

      {/* ── AI Quick Insights ── */}
      {aiInsights?.insights?.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-gradient-to-br from-secondary to-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                <Brain size={16} className="text-white" />
              </div>
              <div>
                <h2 className="font-bold text-sm">AI Quick Insights</h2>
                <p className="text-white/35 text-xs">Based on your spending patterns</p>
              </div>
            </div>
            <Link to="/dashboard/ai-insights"
              className="text-primary text-xs hover:text-secondary transition-colors flex items-center gap-1 font-medium">
              Full Analysis <ArrowUpRight size={12} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {aiInsights.insights.slice(0, 4).map((insight: string, i: number) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.55 + i * 0.06 }}
                className="glass p-3.5 rounded-xl border border-primary/12 hover:border-primary/25 transition-colors"
              >
                <span className="text-base block mb-1.5">💡</span>
                <p className="text-xs text-white/65 leading-relaxed">{insight}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Empty State ── */}
      {!stats?.monthly_income && !stats?.monthly_expenses && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          className="card text-center py-12 mt-5">
          <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-primary/20">
            <Zap size={28} className="text-primary" />
          </div>
          <h3 className="font-bold text-lg mb-2">Get Started!</h3>
          <p className="text-white/40 text-sm mb-6 max-w-sm mx-auto">
            Add your first income or expense to unlock all dashboard features, charts, and AI insights.
          </p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => setQuickAdd('income')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-success to-emerald-600">
              <Plus size={15} /> Add Income
            </button>
            <button onClick={() => setQuickAdd('expense')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-danger to-rose-600">
              <Plus size={15} /> Add Expense
            </button>
          </div>
        </motion.div>
      )}

      {/* ── Quick Add Modal ── */}
      <AnimatePresence>
        {quickAdd && (
          <QuickAddModal type={quickAdd} onClose={() => setQuickAdd(null)} />
        )}
      </AnimatePresence>
    </div>
  )
}
