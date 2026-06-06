import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import {
  Plus, Edit2, Trash2, TrendingUp, X, Filter, Search,
  Calculator, Hash, ArrowUpRight, BarChart2,
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { transactionAPI } from '../../services/api'

const INCOME_SOURCES = [
  { value: 'salary', label: '💼 Salary', color: '#10B981' },
  { value: 'freelance', label: '💻 Freelance', color: '#6366F1' },
  { value: 'business', label: '🏢 Business', color: '#F59E0B' },
  { value: 'investment', label: '📈 Investment', color: '#06B6D4' },
  { value: 'gift', label: '🎁 Gift', color: '#EC4899' },
  { value: 'other', label: '💰 Other', color: '#64748B' },
]

function getSrc(value: string) {
  return INCOME_SOURCES.find(s => s.value === value) || INCOME_SOURCES[5]
}

function IncomeModal({ onClose, editData }: { onClose: () => void; editData?: any }) {
  const qc = useQueryClient()
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: editData ? { ...editData } : { date: new Date().toISOString().split('T')[0] },
  })
  const mutation = useMutation({
    mutationFn: (data: any) => editData ? transactionAPI.updateIncome(editData.id, data) : transactionAPI.addIncome(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['income'], exact: false })
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] })
      qc.invalidateQueries({ queryKey: ['month-incomes'], exact: false })
      toast.success(editData ? 'Income updated!' : 'Income added! 💰')
      onClose()
    },
    onError: () => toast.error('Failed to save income'),
  })
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 20 }}
        className="card w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-success to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-success/25">
              <TrendingUp size={16} className="text-white" />
            </div>
            <h2 className="font-bold text-base">{editData ? 'Edit Income' : 'Add Income'}</h2>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-4">
          <div>
            <label className="label">Amount (PKR)</label>
            <input type="number" step="0.01" className="input" placeholder="50000"
              {...register('amount', { required: 'Required', min: { value: 1, message: 'Must be > 0' } })} />
            {errors.amount && <p className="text-danger text-xs mt-1">{errors.amount.message as string}</p>}
          </div>
          <div>
            <label className="label">Source</label>
            <select className="input" {...register('source', { required: 'Source required' })}>
              <option value="">Select source</option>
              {INCOME_SOURCES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            {errors.source && <p className="text-danger text-xs mt-1">{errors.source.message as string}</p>}
          </div>
          <div>
            <label className="label">Description (Optional)</label>
            <textarea className="input resize-none" rows={2} placeholder="Monthly salary from XYZ..."
              {...register('description')} />
          </div>
          <div>
            <label className="label">Date</label>
            <input type="date" className="input" {...register('date', { required: 'Date required' })} />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 py-2.5 text-sm">Cancel</button>
            <button type="submit" disabled={mutation.isPending}
              className="flex-1 py-2.5 text-sm rounded-xl font-semibold text-white bg-gradient-to-r from-success to-emerald-600 hover:opacity-90 transition-opacity">
              {mutation.isPending ? <div className="spinner w-4 h-4 border-2 mx-auto" /> : editData ? 'Update' : 'Add Income'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

type SortKey = 'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc'

export default function IncomePage() {
  const [showModal, setShowModal] = useState(false)
  const [editData, setEditData] = useState<any>(null)
  const [filterSource, setFilterSource] = useState('')
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('date_desc')
  const [showChart, setShowChart] = useState(false)
  const now = new Date()
  const [filterMonth, setFilterMonth] = useState(now.getMonth() + 1)
  const [filterYear, setFilterYear] = useState(now.getFullYear())
  const qc = useQueryClient()

  const { data: incomes, isLoading } = useQuery({
    queryKey: ['income', filterSource, filterMonth, filterYear],
    queryFn: () => transactionAPI.incomeList({
      source: filterSource || undefined,
      month: filterMonth || undefined,
      year: filterYear || undefined,
    }).then(r => r.data.results || r.data),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => transactionAPI.deleteIncome(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['income'], exact: false })
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] })
      qc.invalidateQueries({ queryKey: ['month-incomes'], exact: false })
      toast.success('Income deleted')
    },
  })

  const filtered = useMemo(() => {
    let list = (incomes || []) as any[]
    if (search.trim()) {
      const s = search.toLowerCase()
      list = list.filter((i: any) =>
        (i.description || '').toLowerCase().includes(s) ||
        i.source.toLowerCase().includes(s)
      )
    }
    return [...list].sort((a: any, b: any) => {
      if (sortKey === 'date_desc') return new Date(b.date).getTime() - new Date(a.date).getTime()
      if (sortKey === 'date_asc') return new Date(a.date).getTime() - new Date(b.date).getTime()
      if (sortKey === 'amount_desc') return parseFloat(b.amount) - parseFloat(a.amount)
      if (sortKey === 'amount_asc') return parseFloat(a.amount) - parseFloat(b.amount)
      return 0
    })
  }, [incomes, search, sortKey])

  const total = filtered.reduce((s: number, i: any) => s + parseFloat(i.amount), 0)
  const avg = filtered.length > 0 ? total / filtered.length : 0
  const biggest = filtered.length > 0 ? Math.max(...filtered.map((i: any) => parseFloat(i.amount))) : 0

  const chartData = useMemo(() => {
    const grouped: Record<string, number> = {}
    ;(incomes || []).forEach((i: any) => {
      grouped[i.source] = (grouped[i.source] || 0) + parseFloat(i.amount)
    })
    return Object.entries(grouped)
      .map(([src, amt]) => ({ name: src, value: amt, color: getSrc(src).color }))
      .sort((a, b) => b.value - a.value)
  }, [incomes])

  const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - i)
  const months = [
    { v: 1, l: 'January' }, { v: 2, l: 'February' }, { v: 3, l: 'March' },
    { v: 4, l: 'April' }, { v: 5, l: 'May' }, { v: 6, l: 'June' },
    { v: 7, l: 'July' }, { v: 8, l: 'August' }, { v: 9, l: 'September' },
    { v: 10, l: 'October' }, { v: 11, l: 'November' }, { v: 12, l: 'December' },
  ]

  return (
    <div className="p-5 md:p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold mb-0.5">Income</h1>
          <p className="text-white/40 text-sm">Track all your income sources</p>
        </div>
        <button onClick={() => { setEditData(null); setShowModal(true) }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-success to-emerald-600 hover:shadow-lg hover:shadow-success/25 transition-all hover:-translate-y-0.5">
          <Plus size={15} /> Add Income
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {[
          { icon: TrendingUp, label: 'Total Income', value: `₨${Math.round(total).toLocaleString()}`, color: '#10B981' },
          { icon: Hash, label: 'Count', value: filtered.length, color: '#6366F1' },
          { icon: Calculator, label: 'Average', value: `₨${Math.round(avg).toLocaleString()}`, color: '#F59E0B' },
          { icon: ArrowUpRight, label: 'Biggest', value: `₨${Math.round(biggest).toLocaleString()}`, color: '#06B6D4' },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="glass p-3.5 rounded-xl border border-white/5">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: s.color + '20' }}>
                <s.icon size={12} style={{ color: s.color }} />
              </div>
              <span className="text-white/35 text-[10px]">{s.label}</span>
            </div>
            <p className="text-base font-black" style={{ color: s.color }}>{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="card mb-5 space-y-3">
        {/* Row 1: Search + Month/Year + Chart */}
        <div className="flex gap-2 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input className="input pl-9 text-sm py-2" placeholder="Search by description or source..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="input text-sm py-2 w-auto pr-8" value={filterMonth}
            onChange={e => setFilterMonth(Number(e.target.value))}>
            {months.map(m => <option key={m.v} value={m.v}>{m.l}</option>)}
          </select>
          <select className="input text-sm py-2 w-auto pr-8" value={filterYear}
            onChange={e => setFilterYear(Number(e.target.value))}>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <button onClick={() => setShowChart(!showChart)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-colors ${showChart ? 'bg-success/15 border-success/30 text-success' : 'border-white/10 text-white/40 hover:text-white'}`}>
            <BarChart2 size={13} /> Chart
          </button>
        </div>

        {/* Row 2: Source filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <Filter size={13} className="text-white/30 flex-shrink-0" />
          <button onClick={() => setFilterSource('')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${!filterSource ? 'bg-success/20 text-success border border-success/30' : 'text-white/40 hover:text-white border border-transparent'}`}>
            All Sources
          </button>
          {INCOME_SOURCES.map(s => (
            <button key={s.value} onClick={() => setFilterSource(filterSource === s.value ? '' : s.value)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors border ${filterSource === s.value ? '' : 'border-transparent text-white/40 hover:text-white'}`}
              style={filterSource === s.value ? { background: s.color + '20', color: s.color, borderColor: s.color + '40' } : {}}>
              {s.label}
            </button>
          ))}
        </div>

        {/* Row 3: Sort */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-white/30 text-xs">Sort:</span>
          {[
            { key: 'date_desc' as SortKey, label: 'Date ↓' },
            { key: 'date_asc' as SortKey, label: 'Date ↑' },
            { key: 'amount_desc' as SortKey, label: 'Amount ↓' },
            { key: 'amount_asc' as SortKey, label: 'Amount ↑' },
          ].map(s => (
            <button key={s.key} onClick={() => setSortKey(s.key)}
              className={`px-2.5 py-1 rounded-lg text-xs transition-colors ${sortKey === s.key ? 'bg-white/10 text-white font-medium' : 'text-white/35 hover:text-white'}`}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Source Breakdown Chart */}
      <AnimatePresence>
        {showChart && chartData.length > 0 && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="card mb-5 overflow-hidden">
            <h3 className="font-bold text-sm mb-3">Income by Source</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `₨${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: any) => `₨${Number(v).toLocaleString()}`}
                    contentStyle={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', fontSize: '11px' }} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={40}>
                    {chartData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {chartData.map((d, i) => {
                  const pct = total > 0 ? ((d.value / total) * 100).toFixed(1) : '0'
                  return (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
                      <span className="text-xs capitalize text-white/60 flex-1">{d.name}</span>
                      <span className="text-xs font-bold">₨{Number(d.value).toLocaleString()}</span>
                      <span className="text-[10px] text-white/30 w-9 text-right">{pct}%</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Income list */}
      {isLoading ? (
        <div className="flex justify-center py-16"><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-12">
          <TrendingUp size={36} className="text-white/15 mx-auto mb-3" />
          <p className="text-white/40 text-sm">{search ? 'No income matches your search.' : 'No income for this period.'}</p>
          {!search && <button onClick={() => { setEditData(null); setShowModal(true) }}
            className="mt-4 text-xs text-success hover:underline">Add your first income</button>}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((income: any, i: number) => {
            const src = getSrc(income.source)
            return (
              <motion.div key={income.id}
                initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                className="card flex items-center gap-3 hover:border-success/20 transition-all">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-base border border-white/5"
                  style={{ background: src.color + '20' }}>
                  {src.label.split(' ')[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white/85 truncate capitalize">
                    {income.source}
                    {income.description && <span className="text-white/40 font-normal"> — {income.description}</span>}
                  </p>
                  <p className="text-[10px] text-white/25 mt-0.5">{income.date}</p>
                </div>
                <span className="text-sm font-bold flex-shrink-0" style={{ color: src.color }}>
                  +₨{Number(income.amount).toLocaleString()}
                </span>
                <div className="flex gap-0.5 flex-shrink-0">
                  <button onClick={() => { setEditData(income); setShowModal(true) }}
                    className="p-1.5 rounded-lg hover:bg-white/5 text-white/30 hover:text-white transition-colors">
                    <Edit2 size={13} />
                  </button>
                  <button onClick={() => { if (confirm('Delete this income?')) deleteMutation.mutate(income.id) }}
                    className="p-1.5 rounded-lg hover:bg-danger/10 text-white/30 hover:text-danger transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      <AnimatePresence>
        {showModal && <IncomeModal onClose={() => setShowModal(false)} editData={editData} />}
      </AnimatePresence>
    </div>
  )
}
