import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts'
import { FileText, Download, FileSpreadsheet, Calendar, TrendingUp, TrendingDown, PiggyBank } from 'lucide-react'
import { reportAPI } from '../../services/api'
import toast from 'react-hot-toast'

const CATEGORY_COLORS: Record<string, string> = {
  food: '#F59E0B', transport: '#6366F1', shopping: '#EC4899',
  bills: '#EF4444', health: '#10B981', education: '#06B6D4',
  entertainment: '#8B5CF6', other: '#64748B',
}

export default function ReportsPage() {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [exporting, setExporting] = useState<string | null>(null)

  const { data: report, isLoading, refetch } = useQuery({
    queryKey: ['report', month, year],
    queryFn: () => reportAPI.monthly({ month, year }).then(r => r.data),
  })

  const handleExport = async (type: 'pdf' | 'excel') => {
    setExporting(type)
    try {
      const response = type === 'pdf'
        ? await reportAPI.exportPDF({ month, year })
        : await reportAPI.exportExcel({ month, year })

      const blob = new Blob([response.data], {
        type: type === 'pdf'
          ? 'application/pdf'
          : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `finance_report_${year}_${String(month).padStart(2, '0')}.${type === 'pdf' ? 'pdf' : 'xlsx'}`
      a.click()
      window.URL.revokeObjectURL(url)
      toast.success(`${type.toUpperCase()} exported successfully!`)
    } catch (err: any) {
      // Server returns errors as blob when responseType:'blob' — parse it
      if (err?.response?.data instanceof Blob) {
        try {
          const text = await err.response.data.text()
          const json = JSON.parse(text)
          toast.error(json.error || 'Export failed.')
        } catch {
          toast.error(`Export failed (HTTP ${err?.response?.status ?? 'unknown'})`)
        }
      } else {
        toast.error(err?.message || 'Export failed. Please try again.')
      }
    } finally {
      setExporting(null)
    }
  }

  const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long' })

  const months = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: new Date(2024, i).toLocaleString('default', { month: 'long' })
  }))

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1 flex items-center gap-3">
          <FileText className="text-primary" size={26} />
          Financial Reports
        </h1>
        <p className="text-white/50 text-sm">View and export your financial summaries</p>
      </div>

      {/* Controls */}
      <div className="card mb-6">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="label">Month</label>
            <select
              className="input w-40"
              value={month}
              onChange={e => setMonth(parseInt(e.target.value))}
            >
              {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Year</label>
            <select
              className="input w-28"
              value={year}
              onChange={e => setYear(parseInt(e.target.value))}
            >
              {[2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <button onClick={() => refetch()} className="btn-secondary flex items-center gap-2">
            <Calendar size={16} /> Generate
          </button>
          <div className="flex gap-2 ml-auto">
            <button
              onClick={() => handleExport('pdf')}
              disabled={!!exporting}
              className="btn-primary flex items-center gap-2 text-sm py-2.5"
            >
              {exporting === 'pdf' ? <div className="spinner w-4 h-4 border-2" /> : <Download size={16} />}
              Export PDF
            </button>
            <button
              onClick={() => handleExport('excel')}
              disabled={!!exporting}
              className="glass text-white px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-white/10 transition-all flex items-center gap-2"
            >
              {exporting === 'excel' ? <div className="spinner w-4 h-4 border-2" /> : <FileSpreadsheet size={16} />}
              Export Excel
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><div className="spinner" /></div>
      ) : report ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total Income', value: report.total_income, icon: TrendingUp, color: 'from-success to-emerald-600', textColor: 'text-success' },
              { label: 'Total Expenses', value: report.total_expenses, icon: TrendingDown, color: 'from-danger to-rose-600', textColor: 'text-danger' },
              { label: 'Net Savings', value: report.net_savings, icon: PiggyBank, color: 'from-primary to-secondary', textColor: 'text-primary' },
              { label: 'Savings Rate', value: `${report.savings_rate}%`, icon: TrendingUp, color: 'from-warning to-amber-600', textColor: 'text-warning', noFormat: true },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }} className="card">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-3`}>
                  <s.icon size={18} className="text-white" />
                </div>
                <p className="text-white/50 text-xs mb-1">{s.label}</p>
                <p className={`text-xl font-bold ${s.textColor}`}>
                  {s.noFormat ? s.value : `₨${Number(s.value).toLocaleString()}`}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Period Info */}
          <div className="card mb-6">
            <h2 className="font-bold mb-4">{monthName} {year} — Report Summary</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="glass p-3 rounded-xl">
                <p className="text-white/40 text-xs">Income Records</p>
                <p className="text-2xl font-bold mt-1">{report.income_transactions}</p>
              </div>
              <div className="glass p-3 rounded-xl">
                <p className="text-white/40 text-xs">Expense Records</p>
                <p className="text-2xl font-bold mt-1">{report.expense_transactions}</p>
              </div>
              <div className="glass p-3 rounded-xl">
                <p className="text-white/40 text-xs">Avg Daily Expense</p>
                <p className="text-2xl font-bold mt-1 text-danger">
                  ₨{Math.round(report.total_expenses / 30).toLocaleString()}
                </p>
              </div>
              <div className="glass p-3 rounded-xl">
                <p className="text-white/40 text-xs">Budget Health</p>
                <p className={`text-2xl font-bold mt-1 ${report.net_savings >= 0 ? 'text-success' : 'text-danger'}`}>
                  {report.net_savings >= 0 ? '✅ Good' : '⚠️ Deficit'}
                </p>
              </div>
            </div>
          </div>

          {/* Category Breakdown */}
          {report.category_breakdown?.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card">
              <h2 className="font-bold text-lg mb-6">Expense Breakdown by Category</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={report.category_breakdown} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis type="number" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
                      tickFormatter={v => `₨${(v / 1000).toFixed(0)}k`} />
                    <YAxis type="category" dataKey="category" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} width={80} />
                    <Tooltip
                      formatter={(v: any) => `₨${Number(v).toLocaleString()}`}
                      contentStyle={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                    />
                    <Bar dataKey="amount" radius={[0, 6, 6, 0]}>
                      {report.category_breakdown.map((entry: any, i: number) => (
                        <Cell key={i} fill={CATEGORY_COLORS[entry.category] || '#6366F1'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>

                <div className="space-y-3">
                  {report.category_breakdown.map((cat: any, i: number) => {
                    const pct = report.total_expenses > 0
                      ? ((cat.amount / report.total_expenses) * 100).toFixed(1)
                      : 0
                    return (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ background: CATEGORY_COLORS[cat.category] || '#6366F1' }} />
                        <div className="flex-1">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="capitalize text-white/70">{cat.category}</span>
                            <span className="font-medium">₨{Number(cat.amount).toLocaleString()}</span>
                          </div>
                          <div className="w-full bg-white/5 rounded-full h-1.5">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.8, delay: i * 0.1 }}
                              className="h-full rounded-full"
                              style={{ background: CATEGORY_COLORS[cat.category] || '#6366F1' }}
                            />
                          </div>
                        </div>
                        <span className="text-xs text-white/40 w-10 text-right">{pct}%</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </>
      ) : (
        <div className="card text-center py-12">
          <FileText size={40} className="text-white/20 mx-auto mb-3" />
          <p className="text-white/50">No data found for this period.</p>
        </div>
      )}
    </div>
  )
}
