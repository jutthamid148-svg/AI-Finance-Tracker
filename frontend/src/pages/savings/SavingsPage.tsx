import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Plus, Trash2, Target, X, CheckCircle, PlusCircle } from 'lucide-react'
import { savingsAPI } from '../../services/api'

function GoalModal({ onClose, editData }: { onClose: () => void; editData?: any }) {
  const queryClient = useQueryClient()
  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues: editData || {} })

  const mutation = useMutation({
    mutationFn: (data: any) => editData ? savingsAPI.update(editData.id, data) : savingsAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savings'] })
      toast.success(editData ? 'Goal updated!' : 'Goal created! 🎯')
      onClose()
    },
    onError: (err: any) => toast.error(err?.response?.data?.detail || 'Failed to save goal'),
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
          <h2 className="font-bold text-lg">{editData ? 'Edit Goal' : 'Create Savings Goal'}</h2>
          <button onClick={onClose}><X size={20} className="text-white/40" /></button>
        </div>
        <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-4">
          <div>
            <label className="label">Goal Name</label>
            <input className="input" placeholder="New Laptop, Car, Vacation..."
              {...register('name', { required: 'Name is required' })} />
          </div>
          <div>
            <label className="label">Description (Optional)</label>
            <input className="input" placeholder="Brief description..."
              {...register('description')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Target Amount (PKR)</label>
              <input type="number" className="input" placeholder="150000"
                {...register('target_amount', { required: 'Required', min: 1 })} />
            </div>
            <div>
              <label className="label">Current Amount</label>
              <input type="number" className="input" placeholder="0"
                {...register('current_amount', { min: 0 })} />
            </div>
          </div>
          <div>
            <label className="label">Target Date (Optional)</label>
            <input type="date" className="input" {...register('target_date')} />
          </div>
          <div>
            <label className="label">Icon (Emoji)</label>
            <input className="input" placeholder="🎯" maxLength={2} {...register('icon')} />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={mutation.isPending} className="btn-primary flex-1">
              {mutation.isPending ? <div className="spinner w-4 h-4 border-2 mx-auto" /> : 'Save Goal'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

function AddAmountModal({ goal, onClose }: { goal: any; onClose: () => void }) {
  const queryClient = useQueryClient()
  const [amount, setAmount] = useState('')

  const mutation = useMutation({
    mutationFn: () => savingsAPI.addAmount(goal.id, parseFloat(amount)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savings'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      toast.success(`₨${parseFloat(amount).toLocaleString()} added to "${goal.name}"!`)
      onClose()
    },
    onError: () => toast.error('Failed to add savings'),
  })

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
        className="card w-full max-w-sm" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold">Add to {goal.name}</h2>
          <button onClick={onClose}><X size={20} className="text-white/40" /></button>
        </div>
        <p className="text-white/50 text-sm mb-4">
          Current: ₨{Number(goal.current_amount).toLocaleString()} / ₨{Number(goal.target_amount).toLocaleString()}
        </p>
        <input
          type="number"
          className="input mb-4"
          placeholder="Amount to add..."
          value={amount}
          onChange={e => setAmount(e.target.value)}
          autoFocus
        />
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button
            onClick={() => mutation.mutate()}
            disabled={!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0 || mutation.isPending}
            className="btn-primary flex-1"
          >
            {mutation.isPending ? <div className="spinner w-4 h-4 border-2 mx-auto" /> : 'Add Savings'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function SavingsPage() {
  const [showModal, setShowModal] = useState(false)
  const [editData, setEditData] = useState<any>(null)
  const [addAmountGoal, setAddAmountGoal] = useState<any>(null)
  const queryClient = useQueryClient()

  const { data: goals, isLoading } = useQuery({
    queryKey: ['savings'],
    queryFn: () => savingsAPI.list().then(r => r.data.results || r.data),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => savingsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savings'] })
      toast.success('Goal deleted')
    },
  })

  const totalSaved = goals?.reduce((s: number, g: any) => s + parseFloat(g.current_amount ?? 0), 0) || 0
  const completedGoals = goals?.filter((g: any) => g.is_completed).length || 0

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1">Savings Goals</h1>
          <p className="text-white/50 text-sm">Track your financial milestones</p>
        </div>
        <button onClick={() => { setEditData(null); setShowModal(true) }} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> New Goal
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Saved', value: `₨${totalSaved.toLocaleString()}`, color: 'text-success' },
          { label: 'Active Goals', value: goals?.filter((g: any) => !g.is_completed).length || 0, color: 'text-primary' },
          { label: 'Completed', value: completedGoals, color: 'text-warning' },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }} className="card text-center">
            <p className="text-white/50 text-xs mb-1">{s.label}</p>
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Goals Grid */}
      {isLoading ? (
        <div className="flex justify-center py-16"><div className="spinner" /></div>
      ) : goals?.length === 0 ? (
        <div className="card text-center py-12">
          <Target size={40} className="text-white/20 mx-auto mb-3" />
          <p className="text-white/50">No savings goals yet. Create your first goal!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals?.map((goal: any, i: number) => (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`card ${goal.is_completed ? 'border-success/40' : ''}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{goal.icon || '🎯'}</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold">{goal.name}</h3>
                      {goal.is_completed && (
                        <CheckCircle size={16} className="text-success" />
                      )}
                    </div>
                    {goal.description && (
                      <p className="text-white/40 text-xs">{goal.description}</p>
                    )}
                    {goal.target_date && (
                      <p className="text-white/30 text-xs">Target: {goal.target_date}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => setAddAmountGoal(goal)}
                    className="p-1.5 rounded-lg hover:bg-success/10 text-white/30 hover:text-success transition-colors"
                    title="Add savings">
                    <PlusCircle size={16} />
                  </button>
                  <button onClick={() => { if (confirm('Delete goal?')) deleteMutation.mutate(goal.id) }}
                    className="p-1.5 rounded-lg hover:bg-danger/10 text-white/30 hover:text-danger transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="mb-2">
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-success font-medium">₨{Number(goal.current_amount).toLocaleString()}</span>
                  <span className="text-white/40">₨{Number(goal.target_amount).toLocaleString()}</span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-3 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${goal.progress_percentage ?? 0}%` }}
                    transition={{ duration: 1, ease: 'easeOut', delay: i * 0.1 }}
                    className="h-full rounded-full bg-gradient-to-r from-success to-emerald-400"
                  />
                </div>
                <div className="flex justify-between text-xs text-white/40 mt-1">
                  <span>{goal.progress_percentage ?? 0}% saved</span>
                  <span>₨{Number(goal.remaining_amount).toLocaleString()} to go</span>
                </div>
              </div>

              {!goal.is_completed && (
                <button onClick={() => setAddAmountGoal(goal)}
                  className="w-full mt-2 py-2 text-sm text-center rounded-lg glass hover:bg-success/10 text-white/50 hover:text-success transition-colors border border-white/5 hover:border-success/30">
                  + Add Savings
                </button>
              )}
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showModal && <GoalModal onClose={() => setShowModal(false)} editData={editData} />}
        {addAmountGoal && <AddAmountModal goal={addAmountGoal} onClose={() => setAddAmountGoal(null)} />}
      </AnimatePresence>
    </div>
  )
}
