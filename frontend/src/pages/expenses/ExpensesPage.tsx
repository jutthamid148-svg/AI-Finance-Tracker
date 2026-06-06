import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { SkeletonExpenses } from '../../components/ui/Skeleton'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import {
  Plus, Edit2, Trash2, TrendingDown, X, Filter, Search,
  ChevronUp, ChevronDown, Trash, Calculator, Hash, ArrowUpRight,
  PieChart, CheckSquare, Square,
} from 'lucide-react'
import { PieChart as RechartsPie, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { transactionAPI } from '../../services/api'

const EXPENSE_CATEGORIES = [
  { value: 'food', label: '🍔 Food & Dining', color: '#F59E0B', bg: 'bg-yellow-500/15 text-yellow-400' },
  { value: 'transport', label: '🚗 Transport', color: '#6366F1', bg: 'bg-indigo-500/15 text-indigo-400' },
  { value: 'shopping', label: '🛍️ Shopping', color: '#EC4899', bg: 'bg-pink-500/15 text-pink-400' },
  { value: 'bills', label: '📄 Bills & Utilities', color: '#EF4444', bg: 'bg-red-500/15 text-red-400' },
  { value: 'health', label: '🏥 Health', color: '#10B981', bg: 'bg-green-500/15 text-green-400' },
  { value: 'education', label: '📚 Education', color: '#06B6D4', bg: 'bg-cyan-500/15 text-cyan-400' },
  { value: 'entertainment', label: '🎮 Entertainment', color: '#8B5CF6', bg: 'bg-purple-500/15 text-purple-400' },
  { value: 'other', label: '💼 Other', color: '#64748B', bg: 'bg-slate-500/15 text-slate-400' },
]

function getCat(value: string) {
  return EXPENSE_CATEGORIES.find(c => c.value === value) || EXPENSE_CATEGORIES[7]
}

function ExpenseModal({ onClose, editData }: { onClose: () => void; editData?: any }) {
  const qc = useQueryClient()
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: editData ? { ...editData } : { date: new Date().toISOString().split('T')[0] },
  })
  const mutation = useMutation({
    mutationFn: (data: any) => editData ? transactionAPI.updateExpense(editData.id, data) : transactionAPI.addExpense(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses'], exact: false })
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] })
      qc.invalidateQueries({ queryKey: ['category-chart'] })
      qc.invalidateQueries({ queryKey: ['month-expenses'], exact: false })
      qc.invalidateQueries({ queryKey: ['top-expenses'], exact: false })
      toast.success(editData ? 'Expense updated!' : 'Expense added!')
      onClose()
    },
    onError: () => toast.error('Failed to save expense'),
  })
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 20 }}
        className="card w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-danger to-rose-600 rounded-xl flex items-center justify-center shadow-lg shadow-danger/25">
              <TrendingDown size={16} className="text-white" />
            </div>
            <h2 className="font-bold text-base">{editData ? 'Edit Expense' : 'Add Expense'}</h2>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-4">
          <div>
            <label className="label">Amount (PKR)</label>
            <input type="number" step="0.01" className="input" placeholder="5000"
              {...register('amount', { required: 'Required', min: { value: 1, message: 'Must be > 0' } })} />
            {errors.amount && <p className="text-danger text-xs mt-1">{errors.amount.message as string}</p>}
          </div>
          <div>
            <label className="label">Category</label>
            <select className="input" {...register('category', { required: 'Category required' })}>
              <option value="">Select category</option>
              {EXPENSE_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
            {errors.category && <p className="text-danger text-xs mt-1">{errors.category.message as string}</p>}
          </div>
          <div>
            <label className="label">Description (Optional)</label>
            <textarea className="input resize-none" rows={2} placeholder="Lunch at restaurant..."
              {...register('description')} />
          </div>
          <div>
            <label className="label">Date</label>
            <input type="date" className="input" {...register('date', { required: 'Date required' })} />
            {errors.date && <p className="text-danger text-xs mt-1">{errors.date.message as string}</p>}
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 py-2.5 text-sm">Cancel</button>
            <button type="submit" disabled={mutation.isPending}
              className="flex-1 py-2.5 text-sm rounded-xl font-semibold text-white bg-gradient-to-r from-danger to-rose-600 hover:opacity-90 transition-opacity">
              {mutation.isPending ? <div className="spinner w-4 h-4 border-2 mx-auto" /> : editData ? 'Update' : 'Add Expense'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

type SortKey = 'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc'

export default function ExpensesPage() {
  const [showModal, setShowModal] = useState(false)
  const [editData, setEditData] = useState<any>(null)
  const [filterCategory, setFilterCategory] = useState('')
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('date_desc')
  const [showChart, setShowChart] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const now = new Date()
  const [filterMonth, setFilterMonth] = useState(now.getMonth() + 1)
  const [filterYear, setFilterYear] = useState(now.getFullYear())
  const qc = useQueryClient()

  const { data: expenses, isLoading } = useQuery({
    queryKey: ['expenses', filterCategory, filterMonth, filterYear],
    queryFn: () => transactionAPI.expenseList({
      category: filterCategory || undefined,
      month: filterMonth || undefined,
      year: filterYear || undefined,
    }).then(r => r.data.results || r.data),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => transactionAPI.deleteExpense(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses'], exact: false })
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] })
      qc.invalidateQueries({ queryKey: ['category-chart'] })
      qc.invalidateQueries({ queryKey: ['month-expenses'], exact: false })
      qc.invalidateQueries({ queryKey: ['top-expenses'], exact: false })
      toast.success('Expense deleted')
    },
  })

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      await Promise.all(ids.map(id => transactionAPI.deleteExpense(id)))
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses'], exact: false })
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] })
      setSelected(new Set())
      toast.success('Selected expenses deleted')
    },
    onError: () => toast.error('Some deletions failed'),
  })

  const filtered = useMemo(() => {
    let list = (expenses || []) as any[]
    if (search.trim()) {
      const s = search.toLowerCase()
      list = list.filter((e: any) =>
        (e.description || '').toLowerCase().includes(s) ||
        e.category.toLowerCase().includes(s)
      )
    }
    return [...list].sort((a: any, b: any) => {
      if (sortKey === 'date_desc') return new Date(b.date).getTime() - new Date(a.date).getTime()
      if (sortKey === 'date_asc') return new Date(a.date).getTime() - new Date(b.date).getTime()
      if (sortKey === 'amount_desc') return parseFloat(b.amount) - parseFloat(a.amount)
      if (sortKey === 'amount_asc') return parseFloat(a.amount) - parseFloat(b.amount)
      return 0
    })
  }, [expenses, search, sortKey])

  const total = filtered.reduce((s: number, e: any) => s + parseFloat(e.amount), 0)
  const avg = filtered.length > 0 ? total / filtered.length : 0
  const biggest = filtered.length > 0 ? Math.max(...filtered.map((e: any) => parseFloat(e.amount))) : 0

  const chartData = useMemo(() => {
    const grouped: Record<string, number> = {}
    ;(expenses || []).forEach((e: any) => {
      grouped[e.category] = (grouped[e.category] || 0) + parseFloat(e.amount)
    })
    return Object.entries(grouped).map(([cat, amt]) => ({ name: cat, value: amt, color: getCat(cat).color }))
  }, [expenses])

  const allSelected = filtered.length > 0 && filtered.every((e: any) => selected.has(e.id))
  const toggleAll = () => {
    if (allSelected) setSelected(new Set())
    else setSelected(new Set(filtered.map((e: any) => e.id)))
  }
  const toggleOne = (id: string) => {
    const next = new Set(selected)
    next.has(id) ? next.delete(id) : next.add(id)
    setSelected(next)
  }

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
          <h1 className="text-2xl font-bold mb-0.5">Expenses</h1>
          <p className="text-white/40 text-sm">Track and manage your spending</p>
        </div>
        <button onClick={() => { setEditData(null); setShowModal(true) }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-danger to-rose-600 hover:shadow-lg hover:shadow-danger/25 transition-all hover:-translate-y-0.5">
          <Plus size={15} /> Add Expense
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {[
          { icon: TrendingDown, label: 'Total', value: `₨${Math.round(total).toLocaleString()}`, color: '#EF4444' },
          { icon: Hash, label: 'Count', value: filtered.length, color: '#6366F1' },
          { icon: Calculator, label: 'Average', value: `₨${Math.round(avg).toLocaleString()}`, color: '#F59E0B' },
          { icon: ArrowUpRight, label: 'Biggest', value: `₨${Math.round(biggest).toLocaleString()}`, color: '#8B5CF6' },
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
        {/* Row 1: Search + Sort + Chart toggle */}
        <div className="flex gap-2 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input className="input pl-9 text-sm py-2" placeholder="Search by description or category..."
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
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-colors ${showChart ? 'bg-primary/15 border-primary/30 text-primary' : 'border-white/10 text-white/40 hover:text-white'}`}>
            <PieChart size={13} /> Chart
          </button>
        </div>

        {/* Row 2: Category filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <Filter size={13} className="text-white/30 flex-shrink-0" />
          <button onClick={() => setFilterCategory('')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${!filterCategory ? 'bg-primary/20 text-primary border border-primary/30' : 'text-white/40 hover:text-white border border-transparent'}`}>
            All
          </button>
          {EXPENSE_CATEGORIES.map(c => (
            <button key={c.value} onClick={() => setFilterCategory(filterCategory === c.value ? '' : c.value)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${filterCategory === c.value ? 'border' : 'text-white/40 hover:text-white border border-transparent'}`}
              style={filterCategory === c.value ? { background: c.color + '20', color: c.color, borderColor: c.color + '40' } : {}}>
              {c.label}
            </button>
          ))}
        </div>

        {/* Row 3: Sort + Bulk delete */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1.5">
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
          {selected.size > 0 && (
            <motion.button initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              onClick={() => {
                if (confirm(`Delete ${selected.size} selected expenses?`))
                  bulkDeleteMutation.mutate([...selected])
              }}
              disabled={bulkDeleteMutation.isPending}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-danger/20 text-danger border border-danger/30 hover:bg-danger/30 transition-colors">
              {bulkDeleteMutation.isPending ? <div className="spinner w-3 h-3 border-2" /> : <Trash size={12} />}
              Delete {selected.size} selected
            </motion.button>
          )}
        </div>
      </div>

      {/* Category Chart */}
      <AnimatePresence>
        {showChart && chartData.length > 0 && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="card mb-5 overflow-hidden">
            <h3 className="font-bold text-sm mb-3">Spending by Category</h3>
            <ResponsiveContainer width="100%" height={200}>
              <RechartsPie>
                <Pie data={chartData} cx="50%" cy="50%" outerRadius={80} innerRadius={45} paddingAngle={3} dataKey="value">
                  {chartData.map((entry, i) => <Cell key={i} fill={entry.color} stroke="transparent" />)}
                </Pie>
                <Tooltip formatter={(v: any) => `₨${Number(v).toLocaleString()}`}
                  contentStyle={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', fontSize: '11px' }} />
                <Legend wrapperStyle={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }} />
              </RechartsPie>
            </ResponsiveContainer>
          </motion.div>
        )}
      </AnimatePresence>

      {/* List */}
      {isLoading ? (
        <SkeletonExpenses />
      ) : filtered.length === 0 ? (
        <div className="card text-center py-12">
          <TrendingDown size={36} className="text-white/15 mx-auto mb-3" />
          <p className="text-white/40 text-sm">{search ? 'No expenses match your search.' : 'No expenses for this period.'}</p>
          {!search && <button onClick={() => { setEditData(null); setShowModal(true) }}
            className="mt-4 text-xs text-primary hover:underline">Add your first expense</button>}
        </div>
      ) : (
        <div className="space-y-2">
          {/* Select all bar */}
          <div className="flex items-center gap-2 px-3 py-1.5">
            <button onClick={toggleAll} className="flex items-center gap-1.5 text-xs text-white/35 hover:text-white transition-colors">
              {allSelected ? <CheckSquare size={13} className="text-primary" /> : <Square size={13} />}
              {allSelected ? 'Deselect all' : `Select all (${filtered.length})`}
            </button>
            {selected.size > 0 && <span className="text-white/25 text-xs">· {selected.size} selected</span>}
          </div>

          {filtered.map((expense: any, i: number) => {
            const cat = getCat(expense.category)
            const isSelected = selected.has(expense.id)
            return (
              <motion.div key={expense.id}
                initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                className={`card flex items-center gap-3 transition-all cursor-default ${isSelected ? 'border-danger/30 bg-danger/3' : 'hover:border-white/10'}`}>
                <button onClick={() => toggleOne(expense.id)} className="flex-shrink-0 text-white/30 hover:text-white transition-colors">
                  {isSelected ? <CheckSquare size={14} className="text-danger" /> : <Square size={14} />}
                </button>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-base border border-white/5"
                  style={{ background: cat.color + '20' }}>
                  {cat.label.split(' ')[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white/85 truncate">
                    {expense.description || cat.label.split(' ').slice(1).join(' ')}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md capitalize"
                      style={{ background: cat.color + '18', color: cat.color }}>
                      {expense.category}
                    </span>
                    <span className="text-white/25 text-[10px]">{expense.date}</span>
                  </div>
                </div>
                <span className="text-sm font-bold text-danger flex-shrink-0">-₨{Number(expense.amount).toLocaleString()}</span>
                <div className="flex gap-0.5 flex-shrink-0">
                  <button onClick={() => { setEditData(expense); setShowModal(true) }}
                    className="p-1.5 rounded-lg hover:bg-white/5 text-white/30 hover:text-white transition-colors">
                    <Edit2 size={13} />
                  </button>
                  <button onClick={() => { if (confirm('Delete this expense?')) deleteMutation.mutate(expense.id) }}
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
        {showModal && <ExpenseModal onClose={() => setShowModal(false)} editData={editData} />}
      </AnimatePresence>
    </div>
  )
}
