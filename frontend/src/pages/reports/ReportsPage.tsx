import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend, RadialBarChart, RadialBar, LabelList, Label,
} from 'recharts'
import {
  FileText, Download, FileSpreadsheet, Calendar,
  TrendingUp, TrendingDown, PiggyBank, Sparkles,
  RefreshCw, ChevronLeft, ChevronRight, BarChart2,
  Target, Wallet, AlertTriangle, CheckCircle, ArrowRight, Activity,
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

function ChartCard({ title, subtitle, icon: Icon, color = 'text-primary', badge, delay = 0, children }: {
  title: string; subtitle?: string; icon: any; color?: string; badge?: string; delay?: number; children: React.ReactNode
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }} className="glass-card p-5">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <Icon size={16} className={color} />
          <div>
            <h2 className="font-bold text-sm">{title}</h2>
            {subtitle && <p className="text-white/35 text-xs">{subtitle}</p>}
          </div>
        </div>
        {badge && (
          <span className="text-[10px] px-2.5 py-1 rounded-full font-semibold bg-primary/10 text-primary border border-primary/20">
            {badge}
          </span>
        )}
      </div>
      {children}
    </motion.div>
  )
}

export default function ReportsPage() {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [generated, setGenerated] = useState(false)
  const [exporting, setExporting] = useState<string | null>(null)

  const { data: report, isFetching, refetch } = useQuery({
    queryKey: ['report', month, year],
    queryFn: () => reportAPI.monthly({ month, year }).then(r => r.data),
    enabled: false,
  })

  const handleGenerate = async () => { setGenerated(true); await refetch() }

  const handleMonthChange = (dir: number) => {
    let m = month + dir, y = year
    if (m > 12) { m = 1; y++ }
    if (m < 1)  { m = 12; y-- }
    setMonth(m); setYear(y); setGenerated(false)
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
        try { const json = JSON.parse(await err.response.data.text()); toast.error(json.error || 'Export failed.') }
        catch { toast.error('Export failed') }
      } else { toast.error(err?.message || 'Export failed.') }
    } finally { setExporting(null) }
  }

  const monthLabel   = `${MONTHS[month - 1].label} ${year}`
  const savingsRate  = Number(report?.savings_rate || 0)
  const netSavings   = Number(report?.net_savings   || 0)
  const isHealthy    = netSavings >= 0

  const catPieData = (report?.category_breakdown || []).map((c: any) => ({
    name: c.category,
    value: c.amount,
    percentage: report?.total_expenses > 0 ? (c.amount / report.total_expenses) * 100 : 0,
    fill: CAT_COLORS[c.category] || '#6366F1',
  }))

  const srcData = (report?.income_breakdown || []).map((s: any) => ({
    source: s.source, amount: s.amount, fill: SRC_COLORS[s.source] || '#6366F1',
  }))

  const gaugeData = [
    { name: 'Rate', value: Math.min(Math.max(savingsRate, 0), 100) },
    { name: 'Rest', value: Math.max(100 - savingsRate, 0) },
  ]

  // RadialBar data — top 6 categories by percentage
  const radialCatData = [...(report?.category_breakdown || [])]
    .sort((a: any, b: any) => b.amount - a.amount)
    .slice(0, 6)
    .map((c: any) => ({
      name: `${CAT_EMOJI[c.category] || '💼'} ${c.category}`,
      category: c.category,
      value: report?.total_expenses > 0 ? Math.round((c.amount / report.total_expenses) * 100) : 0,
      amount: c.amount,
      fill: CAT_COLORS[c.category] || '#6366F1',
    }))

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
              <p className="text-white/40 text-sm">Monthly analysis with charts &amp; export</p>
            </div>
          </div>
          {generated && report && (
            <div className="flex gap-2">
              <button onClick={() => handleExport('pdf')} disabled={!!exporting}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg,#EF4444,#DC2626)', boxShadow: '0 4px 14px rgba(239,68,68,0.3)' }}>
                {exporting === 'pdf' ? <RefreshCw size={14} className="animate-spin" /> : <Download size={14} />} PDF
              </button>
              <button onClick={() => handleExport('excel')} disabled={!!exporting}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg,#10B981,#059669)', boxShadow: '0 4px 14px rgba(16,185,129,0.3)' }}>
                {exporting === 'excel' ? <RefreshCw size={14} className="animate-spin" /> : <FileSpreadsheet size={14} />} Excel
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
            <button onClick={handleGenerate} disabled={isFetching}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white hover:opacity-90 disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', boxShadow: '0 4px 14px rgba(99,102,241,0.4)' }}>
              {isFetching ? <><RefreshCw size={15} className="animate-spin" /> Generating...</> : <><Sparkles size={15} /> Generate Report</>}
            </button>
          </div>
        </div>
      </motion.div>

      {/* ── Content ── */}
      <AnimatePresence mode="wait">
        {!generated ? (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="glass-card p-16 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl flex items-center justify-center mx-auto mb-5 border border-primary/20">
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
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="glass-card p-20 text-center">
            <div className="relative w-16 h-16 mx-auto mb-5">
              <RefreshCw size={40} className="text-primary animate-spin mx-auto" />
              <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping" />
            </div>
            <p className="text-white/50 font-medium">Generating your report...</p>
            <p className="text-white/25 text-xs mt-1">Fetching transactions &amp; crunching numbers</p>
          </motion.div>

        ) : !report ? (
          <motion.div key="nodata" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="glass-card p-16 text-center">
            <Calendar size={40} className="text-white/20 mx-auto mb-3" />
            <p className="text-white/50 font-medium">No data found for {monthLabel}</p>
            <p className="text-white/30 text-sm mt-1">Try a different month or add transactions first.</p>
          </motion.div>

        ) : (
          <motion.div key="report" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="space-y-5">

            {/* ── Title Banner ── */}
            <div className="glass-card p-4 flex items-center justify-between flex-wrap gap-3"
              style={{ background: 'linear-gradient(135deg,rgba(99,102,241,0.15),rgba(139,92,246,0.10))' }}>
              <div className="flex items-center gap-3">
                <Sparkles size={18} className="text-primary" />
                <span className="font-bold text-lg">{monthLabel} — Financial Report</span>
                <span className={`text-xs px-2.5 py-1 rounded-full font-semibold flex items-center gap-1 ${isHealthy ? 'bg-success/15 text-success' : 'bg-danger/15 text-danger'}`}>
                  {isHealthy ? <><CheckCircle size={11} /> Healthy</> : <><AlertTriangle size={11} /> Deficit</>}
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
                { label: 'Total Income',   value: report.total_income,   icon: TrendingUp,   grad: 'from-success to-emerald-600', color: '#10B981', shadow: 'rgba(16,185,129,0.35)' },
                { label: 'Total Expenses', value: report.total_expenses, icon: TrendingDown,  grad: 'from-danger to-rose-600',    color: '#EF4444', shadow: 'rgba(239,68,68,0.35)' },
                { label: 'Net Savings',    value: report.net_savings,    icon: PiggyBank,     grad: 'from-primary to-secondary',  color: '#6366F1', shadow: 'rgba(99,102,241,0.35)' },
                { label: 'Savings Rate',   value: `${savingsRate.toFixed(1)}%`, icon: Target, grad: 'from-warning to-amber-600', color: '#F59E0B', shadow: 'rgba(245,158,11,0.35)', raw: true },
              ].map((s, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -3 }} transition={{ delay: i * 0.07 }}
                  className="glass-card p-4 relative overflow-hidden cursor-default">
                  <div className={`absolute inset-0 opacity-[0.05] bg-gradient-to-br ${s.grad}`} />
                  <div className="relative">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.grad} flex items-center justify-center mb-3 shadow-lg`}
                      style={{ boxShadow: `0 6px 18px ${s.shadow}` }}>
                      <s.icon size={18} className="text-white" />
                    </div>
                    <p className="text-white/40 text-xs mb-1">{s.label}</p>
                    <p className="text-xl font-black" style={{ color: s.color }}>
                      {(s as any).raw ? s.value : `₨${Number(s.value).toLocaleString()}`}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* ── Cash Flow Visual ── */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
              className="glass-card p-5 overflow-hidden"
              style={{ background: 'linear-gradient(135deg,rgba(16,185,129,0.05),rgba(99,102,241,0.05))' }}>
              <div className="flex items-center gap-2 mb-5">
                <Activity size={15} className="text-success" />
                <h2 className="font-bold text-sm">Cash Flow — {monthLabel}</h2>
                <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full font-semibold bg-success/10 text-success border border-success/20">Monthly Flow</span>
              </div>
              <div className="flex items-stretch gap-1 md:gap-2 overflow-x-auto pb-1">

                {[
                  { emoji: '💵', val: report.total_income,  label: 'Total Income',    sub: `${report.income_transactions} records`,  color: 'success', border: 'border-success/25', bg: 'bg-success' },
                  null,
                  { emoji: '💸', val: report.total_expenses, label: 'Total Expenses', sub: `${report.expense_transactions} records`, color: 'danger',  border: 'border-danger/25',  bg: 'bg-danger'  },
                  null,
                  { emoji: isHealthy ? '🏦' : '⚠️', val: Math.abs(netSavings), label: isHealthy ? 'Net Savings' : 'Deficit',
                    sub: `${savingsRate.toFixed(1)}% rate`, color: isHealthy ? 'primary' : 'warning',
                    border: isHealthy ? 'border-primary/25' : 'border-warning/25', bg: isHealthy ? 'bg-primary' : 'bg-warning' },
                  null,
                  { emoji: '📅', val: Math.round(report.total_expenses / 30), label: 'Avg Daily',      sub: 'per day',                        color: 'warning', border: 'border-warning/25', bg: 'bg-warning' },
                ].map((item, i) => {
                  if (item === null) return (
                    <div key={i} className="flex items-center flex-shrink-0 px-0.5">
                      <div className="flex flex-col items-center gap-0.5">
                        <ArrowRight size={18} className="text-white/20" />
                      </div>
                    </div>
                  )
                  return (
                    <div key={i} className={`flex-1 min-w-[110px] glass rounded-2xl p-3.5 border ${item.border} text-center relative overflow-hidden`}>
                      <div className={`absolute inset-0 rounded-2xl opacity-[0.05] ${item.bg}`} />
                      <div className="relative">
                        <div className="text-2xl mb-1.5">{item.emoji}</div>
                        <p className={`font-black text-base text-${item.color}`}>
                          ₨{(item.val / 1000).toFixed(1)}k
                        </p>
                        <p className="text-white/40 text-[11px] mt-0.5 font-medium">{item.label}</p>
                        <p className="text-white/22 text-[10px] mt-0.5">{item.sub}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.div>

            {/* ── Chart 1: Income vs Expenses vs Savings — Gradient Bars + Labels ── */}
            <ChartCard title="Income vs Expenses vs Savings" subtitle="Gradient bars with value labels" icon={BarChart2} badge="Bar Chart" delay={0.16}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={[{
                    name: MONTHS[month - 1].short,
                    Income:   report.total_income,
                    Expenses: report.total_expenses,
                    Savings:  Math.max(netSavings, 0),
                  }]}
                  barGap={14}
                  barCategoryGap="28%"
                  margin={{ top: 28, right: 10, bottom: 0, left: 0 }}
                >
                  <defs>
                    <linearGradient id="rptIncG" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"   stopColor="#10B981" stopOpacity={1} />
                      <stop offset="100%" stopColor="#059669" stopOpacity={0.7} />
                    </linearGradient>
                    <linearGradient id="rptExpG" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"   stopColor="#EF4444" stopOpacity={1} />
                      <stop offset="100%" stopColor="#DC2626" stopOpacity={0.7} />
                    </linearGradient>
                    <linearGradient id="rptSavG" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"   stopColor="#6366F1" stopOpacity={1} />
                      <stop offset="100%" stopColor="#4F46E5" stopOpacity={0.7} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 13, fontWeight: 700 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'rgba(255,255,255,0.30)', fontSize: 11 }} axisLine={false} tickLine={false}
                    tickFormatter={v => `₨${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<Tip />} />
                  <Legend wrapperStyle={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', paddingTop: 14 }} />
                  <Bar dataKey="Income"   name="Income"   fill="url(#rptIncG)" radius={[10, 10, 0, 0]} maxBarSize={100}>
                    <LabelList dataKey="Income"   position="top" formatter={(v: any) => `₨${(v/1000).toFixed(1)}k`}
                      style={{ fill: '#10B981', fontSize: 11, fontWeight: 800 }} />
                  </Bar>
                  <Bar dataKey="Expenses" name="Expenses" fill="url(#rptExpG)" radius={[10, 10, 0, 0]} maxBarSize={100}>
                    <LabelList dataKey="Expenses" position="top" formatter={(v: any) => `₨${(v/1000).toFixed(1)}k`}
                      style={{ fill: '#EF4444', fontSize: 11, fontWeight: 800 }} />
                  </Bar>
                  <Bar dataKey="Savings"  name="Savings"  fill="url(#rptSavG)" radius={[10, 10, 0, 0]} maxBarSize={100}>
                    <LabelList dataKey="Savings"  position="top" formatter={(v: any) => `₨${(v/1000).toFixed(1)}k`}
                      style={{ fill: '#818CF8', fontSize: 11, fontWeight: 800 }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

              {/* Bottom strip */}
              <div className="mt-4 grid grid-cols-3 gap-3">
                {[
                  { label: 'Income',      val: report.total_income,   cls: 'text-success',  border: 'border-success/20 bg-success/5' },
                  { label: 'Expenses',    val: report.total_expenses,  cls: 'text-danger',   border: 'border-danger/20 bg-danger/5'   },
                  { label: 'Net Savings', val: netSavings,             cls: netSavings >= 0 ? 'text-primary' : 'text-danger', border: netSavings >= 0 ? 'border-primary/20 bg-primary/5' : 'border-danger/20 bg-danger/5' },
                ].map((s, i) => (
                  <div key={i} className={`glass p-3 rounded-xl border ${s.border} text-center`}>
                    <p className="text-white/30 text-[10px] mb-1">{s.label}</p>
                    <p className={`text-sm font-black ${s.cls}`}>₨{Number(s.val).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </ChartCard>

            {/* ── Chart 2: Category Breakdown — Pie + Progress + RadialBar ── */}
            {catPieData.length > 0 && (
              <ChartCard title="Expense Distribution by Category" subtitle="Donut chart + radial view + progress bars" icon={TrendingDown} color="text-danger" badge="Multi-Chart" delay={0.20}>

                {/* Row 1: Pie + Progress */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">

                  {/* Donut with center label */}
                  <div className="flex flex-col items-center">
                    <ResponsiveContainer width={270} height={270}>
                      <PieChart>
                        <Pie
                          data={catPieData}
                          cx={130} cy={130}
                          innerRadius={72}
                          outerRadius={115}
                          paddingAngle={3}
                          dataKey="value"
                          strokeWidth={0}
                        >
                          {catPieData.map((entry: any, i: number) => (
                            <Cell key={i} fill={entry.fill} />
                          ))}
                          <Label
                            content={() => (
                              <text x={130} y={130} textAnchor="middle" dominantBaseline="middle">
                                <tspan x={130} dy="-10" fontSize="10" fill="rgba(255,255,255,0.4)">Total</tspan>
                                <tspan x={130} dy="22" fontSize="20" fontWeight="900" fill="white">
                                  ₨{Math.round((report?.total_expenses || 0) / 1000)}k
                                </tspan>
                              </text>
                            )}
                          />
                        </Pie>
                        <Tooltip content={<PieTip />} />
                      </PieChart>
                    </ResponsiveContainer>
                    {/* Color dots */}
                    <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 -mt-2">
                      {catPieData.map((c: any, i: number) => (
                        <div key={i} className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full" style={{ background: c.fill }} />
                          <span className="text-[10px] text-white/40 capitalize">{c.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Progress bars */}
                  <div className="space-y-3.5">
                    {[...catPieData].sort((a: any, b: any) => b.value - a.value).map((cat: any, i: number) => (
                      <motion.div key={i} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.25 + i * 0.06 }}>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-base leading-none">{CAT_EMOJI[cat.name] || '💼'}</span>
                          <span className="flex-1 capitalize text-white/70 text-sm font-medium">{cat.name}</span>
                          <span className="font-bold text-sm text-white/90">₨{Number(cat.value).toLocaleString()}</span>
                          <span className="text-xs font-bold w-11 text-right" style={{ color: cat.fill }}>{cat.percentage.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-white/5 rounded-full h-2.5 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }} animate={{ width: `${cat.percentage}%` }}
                            transition={{ duration: 0.9, delay: 0.3 + i * 0.06, ease: 'easeOut' }}
                            className="h-full rounded-full"
                            style={{ background: cat.fill, boxShadow: `0 0 8px ${cat.fill}70` }}
                          />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Row 2: RadialBarChart — premium category view */}
                {radialCatData.length > 1 && (
                  <div className="mt-6 pt-5 border-t border-white/5">
                    <p className="text-white/25 text-[10px] font-semibold uppercase tracking-widest mb-4">Category Distribution — Radial View</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">

                      <ResponsiveContainer width="100%" height={250}>
                        <RadialBarChart
                          cx="50%" cy="50%"
                          innerRadius="18%"
                          outerRadius="88%"
                          data={radialCatData}
                          startAngle={180}
                          endAngle={0}
                          barSize={14}
                        >
                          <RadialBar
                            dataKey="value"
                            cornerRadius={7}
                            background={{ fill: 'rgba(255,255,255,0.03)' }}
                            minPointSize={3}
                          >
                            {radialCatData.map((entry: any, i: number) => (
                              <Cell key={i} fill={entry.fill} />
                            ))}
                          </RadialBar>
                          <Tooltip
                            content={({ active, payload }: any) => {
                              if (!active || !payload?.length) return null
                              const d = payload[0].payload
                              return (
                                <div className="glass rounded-xl px-3 py-2 border border-white/10 text-xs shadow-xl">
                                  <p className="font-bold capitalize" style={{ color: d.fill }}>{d.name}</p>
                                  <p className="text-white/60 mt-0.5">₨{Number(d.amount).toLocaleString()}</p>
                                  <p className="text-white/40">{d.value}% of expenses</p>
                                </div>
                              )
                            }}
                          />
                        </RadialBarChart>
                      </ResponsiveContainer>

                      <div className="space-y-2">
                        {radialCatData.map((d: any, i: number) => (
                          <motion.div key={i}
                            initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.05 * i }}
                            className="flex items-center justify-between glass px-3 py-2.5 rounded-xl border border-white/5"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="w-3 h-3 rounded-full flex-shrink-0"
                                style={{ background: d.fill, boxShadow: `0 0 7px ${d.fill}` }} />
                              <span className="text-xs text-white/65 capitalize">{d.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-white/80">₨{Number(d.amount).toLocaleString()}</span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded-md font-bold"
                                style={{ background: `${d.fill}22`, color: d.fill }}>{d.value}%</span>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </ChartCard>
            )}

            {/* ── Chart 3: Income Sources — Gradient Bars + Labels ── */}
            {srcData.length > 0 && (
              <ChartCard title="Income by Source" subtitle="Gradient bars with amount labels" icon={TrendingUp} color="text-success" badge="Bar Chart" delay={0.24}>
                <ResponsiveContainer width="100%" height={230}>
                  <BarChart data={srcData} barCategoryGap="40%" margin={{ top: 28, right: 10, bottom: 0, left: 0 }}>
                    <defs>
                      {srcData.map((s: any, i: number) => (
                        <linearGradient key={i} id={`srcG${i}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%"   stopColor={s.fill} stopOpacity={1}   />
                          <stop offset="100%" stopColor={s.fill} stopOpacity={0.6} />
                        </linearGradient>
                      ))}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis dataKey="source" tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 12 }} axisLine={false} tickLine={false}
                      tickFormatter={v => v.charAt(0).toUpperCase() + v.slice(1)} />
                    <YAxis tick={{ fill: 'rgba(255,255,255,0.30)', fontSize: 11 }} axisLine={false} tickLine={false}
                      tickFormatter={v => `₨${(v / 1000).toFixed(0)}k`} />
                    <Tooltip content={<Tip />} />
                    <Bar dataKey="amount" name="Amount" radius={[10, 10, 0, 0]} maxBarSize={90}>
                      {srcData.map((e: any, i: number) => (
                        <Cell key={i} fill={`url(#srcG${i})`} />
                      ))}
                      <LabelList dataKey="amount" position="top"
                        formatter={(v: any) => `₨${(v / 1000).toFixed(1)}k`}
                        style={{ fontSize: 11, fontWeight: 800, fill: 'rgba(255,255,255,0.75)' }} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>

                <div className="mt-4 flex flex-wrap gap-2">
                  {srcData.map((s: any, i: number) => (
                    <div key={i} className="flex items-center gap-2 glass px-3 py-1.5 rounded-xl border border-white/6">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: s.fill, boxShadow: `0 0 6px ${s.fill}` }} />
                      <span className="text-xs text-white/55 capitalize">{s.source}</span>
                      <span className="text-xs font-bold text-white/80">₨{Number(s.amount).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </ChartCard>
            )}

            {/* ── Chart 4: Financial Health — Donut + Ratio Bars ── */}
            <ChartCard title="Financial Health Overview" subtitle="Savings rate gauge + key financial ratios" icon={Target} color="text-primary" badge="Health" delay={0.28}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Savings rate donut with label */}
                <div className="flex flex-col items-center">
                  <p className="text-white/35 text-xs mb-3 uppercase tracking-widest font-semibold">Savings Rate</p>
                  <div className="relative">
                    <ResponsiveContainer width={190} height={190}>
                      <PieChart>
                        <Pie
                          data={gaugeData}
                          cx={92} cy={92}
                          innerRadius={58} outerRadius={82}
                          startAngle={90} endAngle={-270}
                          dataKey="value"
                          paddingAngle={2}
                          strokeWidth={0}
                        >
                          <Cell fill={savingsRate >= 20 ? '#10B981' : savingsRate >= 10 ? '#F59E0B' : '#EF4444'} />
                          <Cell fill="rgba(255,255,255,0.04)" />
                          <Label
                            content={() => (
                              <text x={92} y={92} textAnchor="middle" dominantBaseline="middle">
                                <tspan x={92} dy="-9"  fontSize="26" fontWeight="900" fill="white">{savingsRate.toFixed(0)}%</tspan>
                                <tspan x={92} dy="22"  fontSize="10" fill="rgba(255,255,255,0.4)">saved</tspan>
                              </text>
                            )}
                          />
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="font-black text-base -mt-3"
                    style={{ color: savingsRate >= 20 ? '#10B981' : savingsRate >= 10 ? '#F59E0B' : '#EF4444' }}>
                    {savingsRate >= 20 ? '✅ Excellent' : savingsRate >= 10 ? '⚠️ Average' : '❌ Low'}
                  </p>
                  <p className="text-white/30 text-xs mt-0.5">Target: 20%+ savings</p>
                </div>

                {/* Key ratio bars */}
                <div className="md:col-span-2 space-y-4">
                  <p className="text-white/25 text-[10px] font-semibold uppercase tracking-wider">Key Financial Ratios</p>
                  {[
                    {
                      label: 'Income Utilization', icon: '💸',
                      value: report.total_income > 0 ? (report.total_expenses / report.total_income) * 100 : 0,
                      desc: 'of income spent',
                      grad: 'linear-gradient(90deg,#EF4444,#F87171)', color: '#EF4444',
                    },
                    {
                      label: 'Savings Achievement', icon: '💰',
                      value: Math.max(savingsRate, 0),
                      desc: 'of income saved',
                      grad: 'linear-gradient(90deg,#10B981,#34D399)', color: '#10B981',
                    },
                    {
                      label: 'Top Category', icon: '📊',
                      value: catPieData.length > 0 ? Math.max(...catPieData.map((c: any) => c.percentage)) : 0,
                      desc: catPieData.length > 0
                        ? [...catPieData].sort((a: any, b: any) => b.percentage - a.percentage)[0]?.name
                        : '—',
                      grad: 'linear-gradient(90deg,#F59E0B,#FCD34D)', color: '#F59E0B',
                    },
                  ].map((r, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="text-white/55 font-medium flex items-center gap-1.5">
                          <span>{r.icon}</span>{r.label}
                        </span>
                        <span className="text-xs font-bold" style={{ color: r.color }}>
                          {r.value.toFixed(1)}% <span className="text-white/30 font-normal">{r.desc}</span>
                        </span>
                      </div>
                      <div className="w-full bg-white/5 rounded-full h-3 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(r.value, 100)}%` }}
                          transition={{ duration: 1.1, delay: 0.4 + i * 0.12, ease: 'easeOut' }}
                          className="h-full rounded-full"
                          style={{ background: r.grad, boxShadow: `0 0 14px ${r.color}45` }}
                        />
                      </div>
                    </div>
                  ))}

                  <div className={`mt-2 glass p-3.5 rounded-xl border flex items-center gap-3 ${isHealthy ? 'border-success/20' : 'border-danger/20'}`}>
                    {isHealthy
                      ? <CheckCircle size={20} className="text-success flex-shrink-0" />
                      : <AlertTriangle size={20} className="text-danger flex-shrink-0" />}
                    <div>
                      <p className={`text-sm font-bold ${isHealthy ? 'text-success' : 'text-danger'}`}>
                        {isHealthy
                          ? `You saved ₨${Math.abs(netSavings).toLocaleString()} this month!`
                          : `₨${Math.abs(netSavings).toLocaleString()} deficit — expenses exceed income`}
                      </p>
                      <p className="text-white/35 text-xs mt-0.5">
                        {isHealthy
                          ? savingsRate >= 20 ? 'Excellent financial discipline! 🎉' : 'Good job! Aim for 20%+ savings rate.'
                          : 'Review expenses and cut non-essential spending.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </ChartCard>

            {/* ── Period Stats ── */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.33 }}
              className="glass-card p-5">
              <h2 className="font-bold mb-4 flex items-center gap-2">
                <Wallet size={16} className="text-primary" /> Period Summary
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                {[
                  { label: 'Income Records',   value: report.income_transactions,                                             cls: 'text-success', border: 'border-success/15 bg-success/5',  icon: '📈' },
                  { label: 'Expense Records',  value: report.expense_transactions,                                            cls: 'text-danger',  border: 'border-danger/15 bg-danger/5',    icon: '📉' },
                  { label: 'Avg Daily Expense',value: `₨${Math.round(report.total_expenses / 30).toLocaleString()}`,          cls: 'text-warning', border: 'border-warning/15 bg-warning/5',  icon: '📅' },
                  { label: 'Budget Health',    value: isHealthy ? '✅ Healthy' : '⚠️ Deficit', cls: isHealthy ? 'text-success' : 'text-danger', border: isHealthy ? 'border-success/15 bg-success/5' : 'border-danger/15 bg-danger/5', icon: isHealthy ? '🏆' : '🚨' },
                ].map((s, i) => (
                  <div key={i} className={`glass p-4 rounded-xl border ${s.border}`}>
                    <p className="text-2xl mb-1.5">{s.icon}</p>
                    <p className="text-white/35 text-[11px] mb-1">{s.label}</p>
                    <p className={`text-lg font-black ${s.cls}`}>{s.value}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* ── Export CTA ── */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38 }}
              className="glass-card p-5 flex items-center justify-between flex-wrap gap-4"
              style={{ background: 'linear-gradient(135deg,rgba(99,102,241,0.12),rgba(139,92,246,0.08))' }}>
              <div>
                <p className="font-bold text-base">Export this Report</p>
                <p className="text-white/40 text-sm">Download as PDF or Excel for records &amp; sharing</p>
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
