import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Plus, Trash2, PieChart, X, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { budgetAPI } from '../../services/api'

const CATEGORIES = [
  { value: 'food', label: '🍔 Food & Dining', color: '#F59E0B' },
  { value: 'transport', label: '🚗 Transport', color: '#6366F1' },
  { value: 'shopping', label: '🛍️ Shopping', color: '#EC4899' },
  { value: 'bills', label: '📄 Bills', color: '#EF4444' },
  { value: 'health', label: '🏥 Health', color: '#10B981' },
  { value: 'education', label: '📚 Education', color: '#06B6D4' },
  { value: 'entertainment', label: '🎮 Entertainment', color: '#8B5CF6' },
  { value: 'other', label: '💼 Other', color: '#64748B' },
]

function BudgetModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient()
  const { register, handleSubmit, formState: { errors } } = useForm()
  const now = new Date()

  const mutation = useMutation({
    mutationFn: (data: any) => budgetAPI.create({
      ...data,
      month: now.getMonth() + 1,
      year: now.getFullYear(),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] })
      toast.success('Budget created!')
      onClose()
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.non_field_errors?.[0] || 'Budget for this category already exists!')
    },
  })

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
        className="card w-full max-w-md"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bold text-lg">Set Monthly Budget</h2>
          <button onClick={onClose}><X size={20} className="text-white/40" /></button>
        </div>
        <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-4">
          <div>
            <label className="label">Category</label>
            <select className="input" {...register('category', { required: 'Category is required' })}>
              <option value="">Select category</option>
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
            {errors.category && <p className="text-danger text-xs mt-1">{errors.category.message as string}</p>}
          </div>
          <div>
            <label className="label">Budget Amount (PKR)</label>
            <input type="number" className="input" placeholder="20000"
              {...register('amount', { required: 'Required', min: 1 })} />
            {errors.amount && <p className="text-danger text-xs mt-1">Valid amount required</p>}
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={mutation.isPending} className="btn-primary flex-1">
              {mutation.isPending ? <div className="spinner w-4 h-4 border-2 mx-auto" /> : 'Set Budget'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

export default function BudgetPage() {
  const [showModal, setShowModal] = useState(false)
  const queryClient = useQueryClient()
  const now = new Date()

  const { data: budgets, isLoading } = useQuery({
    queryKey: ['budgets'],
    queryFn: () => budgetAPI.list({
      month: now.getMonth() + 1,
      year: now.getFullYear()
    }).then(r => r.data.results || r.data),
  })

  const { data: summary } = useQuery({
    queryKey: ['budget-summary'],
    queryFn: () => budgetAPI.summary().then(r => r.data),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => budgetAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] })
      queryClient.invalidateQueries({ queryKey: ['budget-summary'] })
      toast.success('Budget removed')
    },
  })

  const getCatInfo = (value: string) => CATEGORIES.find(c => c.value === value) || CATEGORIES[7]

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1">Budget Planning</h1>
          <p className="text-white/50 text-sm">
            {now.toLocaleString('default', { month: 'long' })} {now.getFullYear()}
          </p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Add Budget
        </button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Budget', value: summary.total_budget, color: 'text-primary' },
            { label: 'Total Spent', value: summary.total_spent, color: 'text-danger' },
            { label: 'Remaining', value: summary.total_remaining, color: 'text-success' },
            { label: 'Success Rate', value: `${summary.success_rate}%`, color: 'text-warning', noFormat: true },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }} className="card text-center">
              <p className="text-white/50 text-xs mb-1">{s.label}</p>
              <p className={`text-xl font-bold ${s.color}`}>
                {s.noFormat ? s.value : `₨${Number(s.value).toLocaleString()}`}
              </p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Budget Progress Cards */}
      {isLoading ? (
        <div className="flex justify-center py-16"><div className="spinner" /></div>
      ) : budgets?.length === 0 ? (
        <div className="card text-center py-12">
          <PieChart size={40} className="text-white/20 mx-auto mb-3" />
          <p className="text-white/50">No budgets set for this month. Create your first budget!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {budgets?.map((budget: any, i: number) => {
            const catInfo = getCatInfo(budget.category)
            const exceeded = budget.is_exceeded
            const pct = budget.percentage_used ?? 0

            return (
              <motion.div
                key={budget.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className={`card ${exceeded ? 'border-danger/40' : ''}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                      style={{ background: catInfo.color + '20' }}>
                      {catInfo.label.split(' ')[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold capitalize">{budget.category}</p>
                        {exceeded ? (
                          <span className="badge badge-danger flex items-center gap-1">
                            <AlertTriangle size={10} /> Exceeded
                          </span>
                        ) : pct >= 80 ? (
                          <span className="badge badge-warning">Near Limit</span>
                        ) : (
                          <span className="badge badge-success flex items-center gap-1">
                            <CheckCircle2 size={10} /> On Track
                          </span>
                        )}
                      </div>
                      <p className="text-white/40 text-xs">
                        ₨{Number(budget.spent).toLocaleString()} / ₨{Number(budget.amount).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => { if (confirm('Remove budget?')) deleteMutation.mutate(budget.id) }}
                    className="text-white/20 hover:text-danger transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-white/5 rounded-full h-2.5 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(pct, 100)}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{
                      background: exceeded
                        ? '#EF4444'
                        : pct >= 80
                          ? '#F59E0B'
                          : catInfo.color
                    }}
                  />
                </div>

                <div className="flex items-center justify-between mt-2 text-xs text-white/40">
                  <span>{pct}% used</span>
                  <span>₨{Number(budget.remaining).toLocaleString()} left</span>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      <AnimatePresence>
        {showModal && <BudgetModal onClose={() => setShowModal(false)} />}
      </AnimatePresence>
    </div>
  )
}
