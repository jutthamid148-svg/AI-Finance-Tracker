import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, AreaChart, Area, Legend,
} from 'recharts'
import {
  FileText, Download, FileSpreadsheet, Calendar,
  TrendingUp, TrendingDown, PiggyBank, Sparkles,
  RefreshCw, ChevronLeft, ChevronRight, BarChart2,
  Target, Wallet, AlertTriangle, CheckCircle,
} from 'lucide-react'
import { reportAPI } from '../../services/api'
import toast from 'react-hot-toast'

const CAT_COLORS: Record<string, string> = {
  food: '#F59E0B', transport: '#6366F1', shopping: '#EC4899',
  bills: '#EF4444', health: '#10B981', education: '#06B6D4',
  entertainment: '#8B5CF6', other: '#64748B',
}
const CAT_EMOJI: Record<string, string> = {
  food: '🍔', transport: '🚗', shopping: '🛍️',
  bills: '📄', health: '🏥', education: '📚',
  entertainment: '🎮', other: '💼',
}
const SRC_COLORS: Record<string, string> = {
  salary: '#10B981', freelance: '#6366F1', business: '#F59E0B',
  investment: '#06B6D4', gift: '#EC4899', other: '#64748B',
}

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
        {CAT_EMOJI[d.name] || '💼'} {d.name}
      </p>
      <p className="text-white/60 mt-0.5">₨{Number(d.value).toLocaleString()}</p>
      <p className="text-white/40">{d.payload.percentage?.toFixed(1)}%</p>
    </div>
  )
}

const MONTHS = Array.from({ length: 12 }, (_, i) => ({
  value: i + 1,
  label: new Date(2024, i).toLocaleString('default', { month: 'long' }),
  short: new Date(2024, i).toLocaleString('default', { month: 'short' }),
}))

export default function ReportsPage() {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [generated, setGenerated] = useState(false)
  const [exporting, setExporting] = useState<string | null>(null)

  const { data: report, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['report', month, year],
    queryFn: () => reportAPI.monthly({ month, year }).then(r => r.data),
    enabled: false,
  })

  const handleGenerate = async () => {
    setGenerated(true)
    await refetch()
  }

  const handleMonthChange = (dir: number) => {
    let m = month + dir
    let y = year
    if (m > 12) { m = 1; y++ }
    if (m < 1) { m = 12; y-- }
    setMonth(m); setYear(y)
    setGenerated(false)
  }

  const handleExport = async (type: 'pdf' | 'excel') => {
    setExporting(type)
    try {
      const response = type === 'pdf'
        ? await reportAPI.exportPDF({ month, year })
        : await reportAPI.exportExcel({ month, year })
      const blob = new Blob([response.data], {
        type: type === 'pdf'
          ? 'application/pdf'
          : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `finance_report_${year}_${String(month).padStart(2, '0')}.${type === 'pdf' ? 'pdf' : 'xlsx'}`
      a.click()
      window.URL.revokeObjectURL(url)
      toast.success(`${type.toUpperCase()} exported!`)
    } catch (err: any) {
      if (err?.response?.data instanceof Blob) {
        try {
          const text = await err.response.data.text()
          const json = JSON.parse(text)
          toast.error(json.error || 'Export failed.')
        } catch { toast.error(`Export failed`) }
      } else {
        toast.error(err?.message || 'Export failed.')
      }
    } finally { setExporting(null) }
  }

  const monthLabel = `${MONTHS[month - 1].label} ${year}`
  const catPieData = (report?.category_breakdown || []).map((c: any) => ({
    name: c.category,
    value: c.amount,
    percentage: report?.total_expenses > 0 ? (c.amount / report.total_expenses) * 100 : 0,
    fill: CAT_COLORS[c.category] || '#6366F1',
  }))
  const srcData = (report?.income_breakdown || []).map((s: any) => ({
    source: s.source,
    amount: s.amount,
    fill: SRC_COLORS[s.source] || '#6366F1',
  }))
  const savingsRate = Number(report?.savings_rate || 0)
  const netSavings = Number(report?.net_savings || 0)
  const isHealthy = netSavings >= 0

  // Gauge-style bar for savings rate
  const gaugeData = [
    { name: 'Rate', value: Math.min(Math.max(savingsRate, 0), 100) },
    { name: 'Rest', value: Math.max(100 - savingsRate, 0) },
  ]

  return (
    <div className="p-5 md:p-6 max-w-6xl mx-auto">

      {/* ── Header ── */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-7">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/25">
              <FileText size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black">Financial Reports</h1>
              <p className="text-white/40 text-sm">Monthly analysis with charts & export</p>
            </div>
          </div>
          {generated && report && (
            <div className="flex gap-2">
              <button
                onClick={() => handleExport('pdf')}
                disabled={!!exporting}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg,#EF4444,#DC2626)', boxShadow: '0 4px 14px rgba(239,68,68,0.3)' }}
              >
                {exporting === 'pdf' ? <RefreshCw size={14} className="animate-spin" /> : <Download size={14} />}
                PDF
              </button>
              <button
                onClick={() => handleExport('excel')}
                disabled={!!exporting}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg,#10B981,#059669)', boxShadow: '0 4px 14px rgba(16,185,129,0.3)' }}
              >
                {exporting === 'excel' ? <RefreshCw size={14} className="animate-spin" /> : <FileSpreadsheet size={14} />}
                Excel
              </button>
            </div>
          )}
        </div>
      </motion.div>

      {/* ── Period Selector ── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="glass-card p-5 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button onClick={() => handleMonthChange(-1)}
              className="w-9 h-9 rounded-xl glass border border-white/10 flex items-center justify-center hover:bg-white/8 transition-all">
              <ChevronLeft size={16} className="text-white/60" />
            </button>
            <div className="text-center min-w-[160px]">
              <div className="font-black text-xl">{monthLabel}</div>
              <div className="text-white/35 text-xs">Selected Period</div>
            </div>
            <button onClick={() => handleMonthChange(1)}
              className="w-9 h-9 rounded-xl glass border border-white/10 flex items-center justify-center hover:bg-white/8 transition-all">
              <ChevronRight size={16} className="text-white/60" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <select className="input w-36 text-sm" value={month} onChange={e => { setMonth(parseInt(e.target.value)); setGenerated(false) }}>
              {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
            <select className="input w-24 text-sm" value={year} onChange={e => { setYear(parseInt(e.target.value)); setGenerated(false) }}>
              {[2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <button
              onClick={handleGenerate}
              disabled={isFetching}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', boxShadow: '0 4px 14px rgba(99,102,241,0.4)' }}
            >
              {isFetching
                ? <><RefreshCw size={15} className="animate-spin" /> Generating...</>
                : <><Sparkles size={15} /> Generate Report</>
              }
            </button>
          </div>
        </div>
      </motion.div>

      {/* ── Content ── */}
      <AnimatePresence mode="wait">
        {!generated ? (
          /* Empty state */
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="glass-card p-16 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl flex items-center justify-center mx-auto mb-5">
              <BarChart2 size={36} className="text-primary/60" />
            </div>
            <h2 className="text-xl font-bold mb-2">Ready to Generate</h2>
            <p className="text-white/40 text-sm max-w-xs mx-auto mb-6">
              Select a month and year, then click <strong className="text-primary">Generate Report</strong> to see your full financial analysis with charts.
            </p>
            <button onClick={handleGenerate} disabled={isFetching}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white text-sm disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', boxShadow: '0 4px 20px rgba(99,102,241,0.4)' }}>
              {isFetching ? <><RefreshCw size={16} className="animate-spin" /> Generating...</> : <><Sparkles size={16} /> Generate Report</>}
            </button>
          </motion.div>
        ) : isFetching ? (
          /* Loading */
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="glass-card p-20 text-center">
            <RefreshCw size={40} className="text-primary animate-spin mx-auto mb-4" />
            <p className="text-white/50 font-medium">Generating your report...</p>
          </motion.div>
        ) : !report ? (
          /* No data */
          <motion.div key="nodata" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="glass-card p-16 text-center">
            <Calendar size={40} className="text-white/20 mx-auto mb-3" />
            <p className="text-white/50 font-medium">No data found for {monthLabel}</p>
            <p className="text-white/30 text-sm mt-1">Try a different month or add transactions first.</p>
          </motion.div>
        ) : (
          /* Full Report */
          <motion.div key="report" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="space-y-5">

            {/* Report Title Banner */}
            <div className="glass-card p-4 flex items-center justify-between flex-wrap gap-3"
              style={{ background: 'linear-gradient(135deg,rgba(99,102,241,0.15),rgba(139,92,246,0.10))' }}>
              <div className="flex items-center gap-3">
                <Sparkles size={18} className="text-primary" />
                <span className="font-bold text-lg">{monthLabel} — Financial Report</span>
                <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${isHealthy ? 'bg-success/15 text-success' : 'bg-danger/15 text-danger'}`}>
                  {isHealthy ? <span className="flex items-center gap-1"><CheckCircle size={11} /> Healthy</span>
                    : <span className="flex items-center gap-1"><AlertTriangle size={11} /> Deficit</span>}
                </span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleExport('pdf')} disabled={!!exporting}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white disabled:opacity-50"
                  style={{ background: 'rgba(239,68,68,0.8)' }}>
                  <Download size={12} /> PDF
                </button>
                <button onClick={() => handleExport('excel')} disabled={!!exporting}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white disabled:opacity-50"
                  style={{ background: 'rgba(16,185,129,0.8)' }}>
                  <FileSpreadsheet size={12} /> Excel
                </button>
              </div>
            </div>

            {/* ── Summary Cards ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Income', value: report.total_income, icon: TrendingUp, grad: 'from-success to-emerald-600', color: '#10B981' },
                { label: 'Total Expenses', value: report.total_expenses, icon: TrendingDown, grad: 'from-danger to-rose-600', color: '#EF4444' },
                { label: 'Net Savings', value: report.net_savings, icon: PiggyBank, grad: 'from-primary to-secondary', color: '#6366F1' },
                { label: 'Savings Rate', value: `${savingsRate.toFixed(1)}%`, icon: Target, grad: 'from-warning to-amber-600', color: '#F59E0B', raw: true },
              ].map((s, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }} className="glass-card p-4">
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${s.grad} flex items-center justify-center mb-3 shadow-lg`}
                    style={{ boxShadow: `0 4px 12px ${s.color}30` }}>
                    <s.icon size={17} className="text-white" />
                  </div>
                  <p className="text-white/40 text-xs mb-1">{s.label}</p>
                  <p className="text-xl font-black" style={{ color: s.color }}>
                    {s.raw ? s.value : `₨${Number(s.value).toLocaleString()}`}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* ── Stats Row ── */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              className="glass-card p-5">
              <h2 className="font-bold mb-4 flex items-center gap-2">
                <Wallet size={16} className="text-primary" /> Period Summary
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                {[
                  { label: 'Income Records', value: report.income_transactions, color: 'text-success' },
                  { label: 'Expense Records', value: report.expense_transactions, color: 'text-danger' },
                  { label: 'Avg Daily Expense', value: `₨${Math.round(report.total_expenses / 30).toLocaleString()}`, color: 'text-warning' },
                  { label: 'Budget Health', value: isHealthy ? '✅ Healthy' : '⚠️ Deficit', color: isHealthy ? 'text-success' : 'text-danger' },
                ].map((s, i) => (
                  <div key={i} className="glass p-3 rounded-xl">
                    <p className="text-white/35 text-xs mb-1">{s.label}</p>
                    <p className={`text-lg font-black ${s.color}`}>{s.value}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* ── Income vs Expenses Chart ── */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="glass-card p-5">
              <h2 className="font-bold mb-5 flex items-center gap-2">
                <BarChart2 size={16} className="text-primary" /> Income vs Expenses
              </h2>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={[{
                  name: MONTHS[month - 1].short,
                  Income: report.total_income,
                  Expenses: report.total_expenses,
                  Savings: Math.max(netSavings, 0),
                }]} barGap={8}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} />
                  <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
                    tickFormatter={v => `₨${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<Tip />} />
                  <Legend wrapperStyle={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }} />
                  <Bar dataKey="Income" fill="#10B981" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="Expenses" fill="#EF4444" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="Savings" fill="#6366F1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            {/* ── Category Breakdown ── */}
            {catPieData.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                className="glass-card p-5">
                <h2 className="font-bold mb-5 flex items-center gap-2">
                  <TrendingDown size={16} className="text-danger" /> Expense by Category
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  {/* Pie Chart */}
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie data={catPieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100}
                        paddingAngle={3} dataKey="value">
                        {catPieData.map((entry: any, i: number) => (
                          <Cell key={i} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip content={<PieTip />} />
                    </PieChart>
                  </ResponsiveContainer>

                  {/* Category List */}
                  <div className="space-y-3">
                    {catPieData.map((cat: any, i: number) => (
                      <motion.div key={i} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + i * 0.06 }}>
                        <div className="flex items-center gap-2.5 mb-1">
                          <span className="text-base">{CAT_EMOJI[cat.name] || '💼'}</span>
                          <div className="flex-1 flex justify-between text-sm">
                            <span className="capitalize text-white/70 font-medium">{cat.name}</span>
                            <span className="font-bold">₨{Number(cat.value).toLocaleString()}</span>
                          </div>
                          <span className="text-xs text-white/35 w-10 text-right">{cat.percentage.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-white/5 rounded-full h-2 ml-8">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${cat.percentage}%` }}
                            transition={{ duration: 0.9, delay: 0.3 + i * 0.06 }}
                            className="h-full rounded-full" style={{ background: cat.fill }} />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Bar chart for categories */}
                <div className="mt-6 pt-5 border-t border-white/5">
                  <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-4">Category Bar View</p>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={report.category_breakdown} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis type="number" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }}
                        tickFormatter={v => `₨${(v / 1000).toFixed(0)}k`} />
                      <YAxis type="category" dataKey="category" tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 11 }} width={85}
                        tickFormatter={v => `${CAT_EMOJI[v] || ''} ${v}`} />
                      <Tooltip formatter={(v: any) => `₨${Number(v).toLocaleString()}`}
                        contentStyle={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} />
                      <Bar dataKey="amount" radius={[0, 6, 6, 0]}>
                        {report.category_breakdown.map((e: any, i: number) => (
                          <Cell key={i} fill={CAT_COLORS[e.category] || '#6366F1'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            )}

            {/* ── Income Source Breakdown ── */}
            {srcData.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="glass-card p-5">
                <h2 className="font-bold mb-5 flex items-center gap-2">
                  <TrendingUp size={16} className="text-success" /> Income by Source
                </h2>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={srcData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="source" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
                      tickFormatter={v => v.charAt(0).toUpperCase() + v.slice(1)} />
                    <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
                      tickFormatter={v => `₨${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(v: any) => [`₨${Number(v).toLocaleString()}`, 'Amount']}
                      contentStyle={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} />
                    <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                      {srcData.map((e: any, i: number) => (
                        <Cell key={i} fill={e.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>
            )}

            {/* ── Savings Rate Gauge ── */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
              className="glass-card p-5">
              <h2 className="font-bold mb-5 flex items-center gap-2">
                <Target size={16} className="text-primary" /> Financial Health Overview
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

                {/* Savings Rate donut */}
                <div className="text-center">
                  <p className="text-white/40 text-xs mb-3 uppercase tracking-widest">Savings Rate</p>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie data={gaugeData} cx="50%" cy="50%" innerRadius={50} outerRadius={70}
                        startAngle={90} endAngle={-270} dataKey="value" paddingAngle={2}>
                        <Cell fill={savingsRate >= 20 ? '#10B981' : savingsRate >= 10 ? '#F59E0B' : '#EF4444'} />
                        <Cell fill="rgba(255,255,255,0.05)" />
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <p className="text-2xl font-black -mt-2"
                    style={{ color: savingsRate >= 20 ? '#10B981' : savingsRate >= 10 ? '#F59E0B' : '#EF4444' }}>
                    {savingsRate.toFixed(1)}%
                  </p>
                  <p className="text-white/35 text-xs mt-1">
                    {savingsRate >= 20 ? '✅ Excellent' : savingsRate >= 10 ? '⚠️ Average' : '❌ Low'}
                  </p>
                </div>

                {/* Key ratios */}
                <div className="md:col-span-2 space-y-3">
                  {[
                    {
                      label: 'Income Utilization',
                      value: report.total_income > 0 ? (report.total_expenses / report.total_income) * 100 : 0,
                      color: '#EF4444', desc: 'of income spent',
                    },
                    {
                      label: 'Savings Achievement',
                      value: Math.max(savingsRate, 0),
                      color: '#10B981', desc: 'of income saved',
                    },
                    {
                      label: 'Largest Expense Category',
                      value: catPieData.length > 0 ? Math.max(...catPieData.map((c: any) => c.percentage)) : 0,
                      color: '#F59E0B', desc: `${catPieData.length > 0 ? catPieData.sort((a: any, b: any) => b.percentage - a.percentage)[0]?.name : '-'}`,
                    },
                  ].map((r, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="text-white/60 font-medium">{r.label}</span>
                        <span className="font-bold" style={{ color: r.color }}>{r.value.toFixed(1)}% {r.desc}</span>
                      </div>
                      <div className="w-full bg-white/5 rounded-full h-2.5">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(r.value, 100)}%` }}
                          transition={{ duration: 1, delay: 0.4 + i * 0.1 }}
                          className="h-full rounded-full" style={{ background: r.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* ── Export CTA ── */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="glass-card p-5 flex items-center justify-between flex-wrap gap-4"
              style={{ background: 'linear-gradient(135deg,rgba(99,102,241,0.12),rgba(139,92,246,0.08))' }}>
              <div>
                <p className="font-bold text-base">Export this Report</p>
                <p className="text-white/40 text-sm">Download as PDF or Excel for records & sharing</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => handleExport('pdf')} disabled={!!exporting}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg,#EF4444,#DC2626)', boxShadow: '0 4px 14px rgba(239,68,68,0.3)' }}>
                  {exporting === 'pdf' ? <RefreshCw size={14} className="animate-spin" /> : <Download size={14} />}
                  Export PDF
                </button>
                <button onClick={() => handleExport('excel')} disabled={!!exporting}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg,#10B981,#059669)', boxShadow: '0 4px 14px rgba(16,185,129,0.3)' }}>
                  {exporting === 'excel' ? <RefreshCw size={14} className="animate-spin" /> : <FileSpreadsheet size={14} />}
                  Export Excel
                </button>
              </div>
            </motion.div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
