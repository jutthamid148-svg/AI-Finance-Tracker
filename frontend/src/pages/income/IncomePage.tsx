import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Plus, Edit2, Trash2, TrendingUp, X, DollarSign } from 'lucide-react'
import { transactionAPI } from '../../services/api'

const INCOME_SOURCES = [
  { value: 'salary', label: '💼 Salary' },
  { value: 'freelance', label: '💻 Freelance' },
  { value: 'business', label: '🏢 Business' },
  { value: 'investment', label: '📈 Investment' },
  { value: 'gift', label: '🎁 Gift' },
  { value: 'other', label: '💰 Other' },
]

function IncomeModal({ onClose, editData }: { onClose: () => void; editData?: any }) {
  const queryClient = useQueryClient()
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: editData || {}
  })

  const mutation = useMutation({
    mutationFn: (data: any) =>
      editData
        ? transactionAPI.updateIncome(editData.id, data)
        : transactionAPI.addIncome(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['income'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      toast.success(editData ? 'Income updated!' : 'Income added! 💰')
      onClose()
    },
    onError: () => toast.error('Failed to save income'),
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
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="card w-full max-w-md"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold">{editData ? 'Edit Income' : 'Add Income'}</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-4">
          <div>
            <label className="label">Amount (PKR)</label>
            <input
              type="number"
              step="0.01"
              className="input"
              placeholder="50000"
              {...register('amount', { required: 'Amount is required', min: { value: 1, message: 'Must be positive' } })}
            />
            {errors.amount && <p className="text-danger text-xs mt-1">{errors.amount.message as string}</p>}
          </div>

          <div>
            <label className="label">Source</label>
            <select className="input" {...register('source', { required: 'Source is required' })}>
              <option value="">Select source</option>
              {INCOME_SOURCES.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            {errors.source && <p className="text-danger text-xs mt-1">{errors.source.message as string}</p>}
          </div>

          <div>
            <label className="label">Description (Optional)</label>
            <textarea
              className="input resize-none"
              rows={2}
              placeholder="Monthly salary from XYZ company..."
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

          <div className="flex gap-3 mt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={mutation.isPending} className="btn-primary flex-1">
              {mutation.isPending ? <div className="spinner w-4 h-4 border-2 mx-auto" /> : editData ? 'Update' : 'Add Income'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

export default function IncomePage() {
  const [showModal, setShowModal] = useState(false)
  const [editData, setEditData] = useState<any>(null)
  const queryClient = useQueryClient()

  const { data: incomes, isLoading } = useQuery({
    queryKey: ['income'],
    queryFn: () => transactionAPI.incomeList().then(r => r.data.results || r.data),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => transactionAPI.deleteIncome(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['income'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      toast.success('Income deleted')
    },
  })

  const totalIncome = incomes?.reduce((sum: number, i: any) => sum + parseFloat(i.amount), 0) || 0

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1">Income</h1>
          <p className="text-white/50 text-sm">Track all your income sources</p>
        </div>
        <button
          onClick={() => { setEditData(null); setShowModal(true) }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} /> Add Income
        </button>
      </div>

      {/* Summary card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card flex items-center gap-4 mb-6"
      >
        <div className="w-12 h-12 bg-gradient-to-br from-success to-emerald-600 rounded-xl flex items-center justify-center">
          <TrendingUp size={22} className="text-white" />
        </div>
        <div>
          <p className="text-white/50 text-sm">Total Income Recorded</p>
          <p className="text-3xl font-bold text-success">₨{totalIncome.toLocaleString()}</p>
        </div>
      </motion.div>

      {/* Income list */}
      {isLoading ? (
        <div className="flex justify-center py-16"><div className="spinner" /></div>
      ) : incomes?.length === 0 ? (
        <div className="card text-center py-12">
          <DollarSign size={40} className="text-white/20 mx-auto mb-3" />
          <p className="text-white/50">No income records yet. Add your first income!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {incomes?.map((income: any, i: number) => (
            <motion.div
              key={income.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="card flex items-center justify-between hover:border-success/30"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-success/20 rounded-xl flex items-center justify-center">
                  <TrendingUp size={18} className="text-success" />
                </div>
                <div>
                  <p className="font-semibold capitalize">{income.source}</p>
                  <p className="text-white/50 text-sm">{income.description || 'No description'}</p>
                  <p className="text-white/30 text-xs mt-0.5">{income.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-success font-bold text-lg">+₨{Number(income.amount).toLocaleString()}</span>
                <div className="flex gap-1">
                  <button
                    onClick={() => { setEditData(income); setShowModal(true) }}
                    className="p-2 rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-colors"
                  >
                    <Edit2 size={15} />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Delete this income?')) deleteMutation.mutate(income.id)
                    }}
                    className="p-2 rounded-lg hover:bg-danger/10 text-white/40 hover:text-danger transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showModal && (
          <IncomeModal
            onClose={() => setShowModal(false)}
            editData={editData}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
