import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Plus, Edit2, Trash2, TrendingDown, X, Filter } from 'lucide-react'
import { transactionAPI } from '../../services/api'

const EXPENSE_CATEGORIES = [
  { value: 'food', label: '🍔 Food & Dining', color: 'bg-yellow-500/20 text-yellow-400' },
  { value: 'transport', label: '🚗 Transport', color: 'bg-blue-500/20 text-blue-400' },
  { value: 'shopping', label: '🛍️ Shopping', color: 'bg-pink-500/20 text-pink-400' },
  { value: 'bills', label: '📄 Bills & Utilities', color: 'bg-red-500/20 text-red-400' },
  { value: 'health', label: '🏥 Health', color: 'bg-green-500/20 text-green-400' },
  { value: 'education', label: '📚 Education', color: 'bg-cyan-500/20 text-cyan-400' },
  { value: 'entertainment', label: '🎮 Entertainment', color: 'bg-purple-500/20 text-purple-400' },
  { value: 'other', label: '💼 Other', color: 'bg-gray-500/20 text-gray-400' },
]

function getCategoryInfo(value: string) {
  return EXPENSE_CATEGORIES.find(c => c.value === value) || EXPENSE_CATEGORIES[7]
}

function ExpenseModal({ onClose, editData }: { onClose: () => void; editData?: any }) {
  const queryClient = useQueryClient()
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: editData || {}
  })

  const mutation = useMutation({
    mutationFn: (data: any) =>
      editData
        ? transactionAPI.updateExpense(editData.id, data)
        : transactionAPI.addExpense(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      queryClient.invalidateQueries({ queryKey: ['category-chart'] })
      toast.success(editData ? 'Expense updated!' : 'Expense added!')
      onClose()
    },
    onError: () => toast.error('Failed to save expense'),
  })

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        className="card w-full max-w-md"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold">{editData ? 'Edit Expense' : 'Add Expense'}</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-4">
          <div>
            <label className="label">Amount (PKR)</label>
            <input
              type="number"
              step="0.01"
              className="input"
              placeholder="5000"
              {...register('amount', { required: 'Required', min: { value: 1, message: 'Must be positive' } })}
            />
            {errors.amount && <p className="text-danger text-xs mt-1">{errors.amount.message as string}</p>}
          </div>

          <div>
            <label className="label">Category</label>
            <select className="input" {...register('category', { required: 'Category is required' })}>
              <option value="">Select category</option>
              {EXPENSE_CATEGORIES.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
            {errors.category && <p className="text-danger text-xs mt-1">{errors.category.message as string}</p>}
          </div>

          <div>
            <label className="label">Description (Optional)</label>
            <textarea
              className="input resize-none"
              rows={2}
              placeholder="Lunch at restaurant..."
              {...register('description')}
            />
          </div>

          <div>
            <label className="label">Date</label>
            <input
              type="date"
              className="input"
              defaultValue={new Date().toISOString().split('T')[0]}
              {...register('date', { required: 'Date is required' })}
            />
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={mutation.isPending} className="btn-primary flex-1">
              {mutation.isPending ? <div className="spinner w-4 h-4 border-2 mx-auto" /> : editData ? 'Update' : 'Add Expense'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

export default function ExpensesPage() {
  const [showModal, setShowModal] = useState(false)
  const [editData, setEditData] = useState<any>(null)
  const [filterCategory, setFilterCategory] = useState('')
  const queryClient = useQueryClient()

  const { data: expenses, isLoading } = useQuery({
    queryKey: ['expenses', filterCategory],
    queryFn: () => transactionAPI.expenseList({ category: filterCategory || undefined })
      .then(r => r.data.results || r.data),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => transactionAPI.deleteExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      toast.success('Expense deleted')
    },
  })

  const total = expenses?.reduce((s: number, e: any) => s + parseFloat(e.amount), 0) || 0

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1">Expenses</h1>
          <p className="text-white/50 text-sm">Manage and categorize your spending</p>
        </div>
        <button onClick={() => { setEditData(null); setShowModal(true) }} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Add Expense
        </button>
      </div>

      {/* Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card flex items-center gap-4 mb-6"
      >
        <div className="w-12 h-12 bg-gradient-to-br from-danger to-rose-600 rounded-xl flex items-center justify-center">
          <TrendingDown size={22} className="text-white" />
        </div>
        <div>
          <p className="text-white/50 text-sm">Total Expenses Recorded</p>
          <p className="text-3xl font-bold text-danger">₨{total.toLocaleString()}</p>
        </div>
      </motion.div>

      {/* Filter */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <Filter size={16} className="text-white/40" />
        <button
          onClick={() => setFilterCategory('')}
          className={`badge cursor-pointer ${!filterCategory ? 'badge-primary' : 'glass'}`}
        >
          All
        </button>
        {EXPENSE_CATEGORIES.map(c => (
          <button
            key={c.value}
            onClick={() => setFilterCategory(c.value)}
            className={`badge cursor-pointer ${filterCategory === c.value ? 'badge-primary' : 'glass'}`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Expense list */}
      {isLoading ? (
        <div className="flex justify-center py-16"><div className="spinner" /></div>
      ) : expenses?.length === 0 ? (
        <div className="card text-center py-12">
          <TrendingDown size={40} className="text-white/20 mx-auto mb-3" />
          <p className="text-white/50">No expenses found. Start tracking your spending!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {expenses?.map((expense: any, i: number) => {
            const catInfo = getCategoryInfo(expense.category)
            return (
              <motion.div
                key={expense.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="card flex items-center justify-between hover:border-danger/20"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${catInfo.color} border border-white/10`}>
                    <span className="text-lg">{catInfo.label.split(' ')[0]}</span>
                  </div>
                  <div>
                    <p className="font-semibold">{expense.description || catInfo.label.split(' ').slice(1).join(' ')}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`badge text-xs ${catInfo.color}`}>{expense.category}</span>
                      <span className="text-white/30 text-xs">{expense.date}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-danger font-bold">-₨{Number(expense.amount).toLocaleString()}</span>
                  <div className="flex gap-1">
                    <button onClick={() => { setEditData(expense); setShowModal(true) }}
                      className="p-2 rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-colors">
                      <Edit2 size={15} />
                    </button>
                    <button onClick={() => { if (confirm('Delete?')) deleteMutation.mutate(expense.id) }}
                      className="p-2 rounded-lg hover:bg-danger/10 text-white/40 hover:text-danger transition-colors">
                      <Trash2 size={15} />
                    </button>
                  </div>
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
