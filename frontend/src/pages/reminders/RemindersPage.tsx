import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell, Plus, Edit2, Trash2, X, CheckCircle,
  Calendar, AlertTriangle, Clock, ToggleLeft, ToggleRight,
  BellOff, Zap,
} from 'lucide-react'
import {
  useRemindersStore, REMINDER_CATEGORIES,
  getDaysUntilDue, getDueStatus, type BillReminder,
} from '../../store/remindersStore'
import toast from 'react-hot-toast'

const STATUS_CONFIG = {
  today:    { label: 'Due Today',   bg: 'bg-danger/15',  border: 'border-danger/40',  text: 'text-danger',   icon: AlertTriangle },
  soon:     { label: 'Due in 3d',   bg: 'bg-warning/15', border: 'border-warning/40', text: 'text-warning',  icon: Clock },
  upcoming: { label: 'Upcoming',    bg: 'bg-primary/15', border: 'border-primary/40', text: 'text-primary',  icon: Calendar },
  overdue:  { label: 'Overdue',     bg: 'bg-danger/15',  border: 'border-danger/40',  text: 'text-danger',   icon: AlertTriangle },
}

function ReminderModal({
  onClose, editData,
}: { onClose: () => void; editData?: BillReminder }) {
  const { add, update } = useRemindersStore()
  const [form, setForm] = useState({
    name:     editData?.name     ?? '',
    amount:   editData?.amount   ?? '' as any,
    dueDay:   editData?.dueDay   ?? 1,
    category: editData?.category ?? 'other',
    color:    editData?.color    ?? '#6366F1',
    active:   editData?.active   ?? true,
  })

  const cat = REMINDER_CATEGORIES.find(c => c.value === form.category)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return toast.error('Name required')
    if (!form.amount || Number(form.amount) <= 0) return toast.error('Enter valid amount')
    const payload = { ...form, amount: Number(form.amount), color: cat?.color ?? form.color }
    if (editData) {
      update(editData.id, payload)
      toast.success('Reminder updated!')
    } else {
      add(payload)
      toast.success('Reminder added!')
    }
    onClose()
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={onClose}>
      <motion.div initial={{ scale: 0.93, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.93, y: 20 }}
        className="glass-card w-full max-w-md p-6" onClick={e => e.stopPropagation()}>

        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg"
              style={{ background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', boxShadow: '0 4px 14px rgba(99,102,241,0.3)' }}>
              <Bell size={16} className="text-white" />
            </div>
            <h2 className="font-bold text-base">{editData ? 'Edit Reminder' : 'Add Bill Reminder'}</h2>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white transition-colors"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="text-xs font-semibold text-white/50 uppercase tracking-wide mb-1.5 block">Bill Name</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. PTCL Internet"
              className="w-full glass rounded-xl px-3.5 py-2.5 text-sm border border-white/10 focus:border-primary/50 outline-none bg-transparent placeholder:text-white/20" />
          </div>

          {/* Category */}
          <div>
            <label className="text-xs font-semibold text-white/50 uppercase tracking-wide mb-1.5 block">Category</label>
            <div className="grid grid-cols-5 gap-1.5">
              {REMINDER_CATEGORIES.map(c => (
                <button key={c.value} type="button"
                  onClick={() => setForm(f => ({ ...f, category: c.value, color: c.color }))}
                  className={`px-2 py-2 rounded-xl text-[11px] font-medium transition-all border ${form.category === c.value ? 'border-opacity-60' : 'border-white/8 text-white/40 hover:text-white hover:border-white/15'}`}
                  style={form.category === c.value ? { background: c.color + '20', color: c.color, borderColor: c.color + '60' } : {}}>
                  {c.label.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Amount */}
            <div>
              <label className="text-xs font-semibold text-white/50 uppercase tracking-wide mb-1.5 block">Est. Amount (₨)</label>
              <input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                placeholder="0"
                className="w-full glass rounded-xl px-3.5 py-2.5 text-sm border border-white/10 focus:border-primary/50 outline-none bg-transparent placeholder:text-white/20" />
            </div>
            {/* Due Day */}
            <div>
              <label className="text-xs font-semibold text-white/50 uppercase tracking-wide mb-1.5 block">Due Day of Month</label>
              <input type="number" min={1} max={28} value={form.dueDay}
                onChange={e => setForm(f => ({ ...f, dueDay: Math.min(28, Math.max(1, Number(e.target.value))) }))}
                className="w-full glass rounded-xl px-3.5 py-2.5 text-sm border border-white/10 focus:border-primary/50 outline-none bg-transparent" />
            </div>
          </div>

          <div className="flex gap-2.5 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold glass border border-white/10 text-white/60 hover:text-white transition-colors">
              Cancel
            </button>
            <button type="submit"
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
              style={{ background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', boxShadow: '0 4px 14px rgba(99,102,241,0.35)' }}>
              {editData ? 'Update' : 'Add Reminder'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

export default function RemindersPage() {
  const { reminders, remove, toggle } = useRemindersStore()
  const [showModal, setShowModal] = useState(false)
  const [editData, setEditData]   = useState<BillReminder | undefined>()

  const active   = reminders.filter(r => r.active)
  const inactive = reminders.filter(r => !r.active)

  const sorted = [...active].sort((a, b) => getDaysUntilDue(a.dueDay) - getDaysUntilDue(b.dueDay))
  const totalMonthly = active.reduce((s, r) => s + r.amount, 0)
  const dueSoon = active.filter(r => getDaysUntilDue(r.dueDay) <= 3).length

  const openEdit = (r: BillReminder) => { setEditData(r); setShowModal(true) }
  const openAdd  = () => { setEditData(undefined); setShowModal(true) }

  return (
    <div className="p-5 md:p-6 max-w-4xl mx-auto">

      <AnimatePresence>
        {showModal && (
          <ReminderModal onClose={() => setShowModal(false)} editData={editData} />
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/25"
              style={{ background: 'linear-gradient(135deg,#6366F1,#8B5CF6)' }}>
              <Bell size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black">Bill Reminders</h1>
              <p className="text-white/40 text-sm">Monthly bills aur payments track karo</p>
            </div>
          </div>
          <button onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', boxShadow: '0 4px 14px rgba(99,102,241,0.35)' }}>
            <Plus size={16} /> Add Reminder
          </button>
        </div>
      </motion.div>

      {/* Stats */}
      {active.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Total Bills',      value: active.length,              suffix: '',     color: '#6366F1', icon: Bell },
            { label: 'Monthly Total',    value: `₨${(totalMonthly/1000).toFixed(1)}k`, suffix: '', color: '#EF4444', icon: Calendar },
            { label: 'Due Soon (3 days)',value: dueSoon,                    suffix: '',     color: dueSoon > 0 ? '#F59E0B' : '#10B981', icon: dueSoon > 0 ? AlertTriangle : CheckCircle },
          ].map((stat, i) => (
            <div key={i} className="glass-card p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: stat.color + '20' }}>
                <stat.icon size={16} style={{ color: stat.color }} />
              </div>
              <div>
                <div className="text-lg font-black">{stat.value}{stat.suffix}</div>
                <div className="text-[11px] text-white/40">{stat.label}</div>
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Empty state */}
      {reminders.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="glass-card p-12 flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Bell size={32} className="text-primary/50" />
          </div>
          <div>
            <p className="font-bold text-lg mb-1">Koi Bill Reminder Nahi</p>
            <p className="text-white/40 text-sm">Monthly bills add karo taake due date pe yaad rahe</p>
          </div>
          <button onClick={openAdd}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{ background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', boxShadow: '0 4px 14px rgba(99,102,241,0.35)' }}>
            <Plus size={15} /> Pehla Reminder Add Karo
          </button>
        </motion.div>
      )}

      {/* Active reminders */}
      {sorted.length > 0 && (
        <div className="space-y-3 mb-6">
          <p className="text-xs font-semibold text-white/30 uppercase tracking-widest px-1">Active Bills</p>
          {sorted.map((r, i) => {
            const days    = getDaysUntilDue(r.dueDay)
            const status  = getDueStatus(r.dueDay)
            const cfg     = STATUS_CONFIG[status]
            const StatusIcon = cfg.icon
            const cat     = REMINDER_CATEGORIES.find(c => c.value === r.category)

            return (
              <motion.div key={r.id}
                initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`glass-card p-4 border ${days <= 3 ? cfg.border : 'border-white/5'} transition-all`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xl"
                    style={{ background: r.color + '20' }}>
                    {cat?.label.split(' ')[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-bold text-sm truncate">{r.name}</span>
                      {days <= 3 && (
                        <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text} border ${cfg.border}`}>
                          <StatusIcon size={9} /> {days === 0 ? 'TODAY' : `${days}d`}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-white/40">
                      <span>₨{r.amount.toLocaleString()}</span>
                      <span>•</span>
                      <span>Due: {r.dueDay}{r.dueDay === 1 ? 'st' : r.dueDay === 2 ? 'nd' : r.dueDay === 3 ? 'rd' : 'th'} of month</span>
                      {days > 3 && <span>• {days} days left</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => toggle(r.id)} title="Disable"
                      className="p-2 rounded-lg text-white/30 hover:text-warning hover:bg-warning/10 transition-all">
                      <ToggleRight size={16} className="text-success" />
                    </button>
                    <button onClick={() => openEdit(r)}
                      className="p-2 rounded-lg text-white/30 hover:text-primary hover:bg-primary/10 transition-all">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => { remove(r.id); toast.success('Reminder deleted') }}
                      className="p-2 rounded-lg text-white/30 hover:text-danger hover:bg-danger/10 transition-all">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Inactive reminders */}
      {inactive.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-white/20 uppercase tracking-widest px-1">Paused</p>
          {inactive.map((r, i) => {
            const cat = REMINDER_CATEGORIES.find(c => c.value === r.category)
            return (
              <motion.div key={r.id}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                className="glass-card p-3.5 opacity-50 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-base"
                  style={{ background: r.color + '15' }}>
                  {cat?.label.split(' ')[0]}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-white/50">{r.name}</div>
                  <div className="text-xs text-white/25">₨{r.amount.toLocaleString()} • {r.dueDay}th</div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => toggle(r.id)} title="Enable"
                    className="p-2 rounded-lg text-white/20 hover:text-success hover:bg-success/10 transition-all">
                    <ToggleLeft size={16} />
                  </button>
                  <button onClick={() => { remove(r.id); toast.success('Deleted') }}
                    className="p-2 rounded-lg text-white/20 hover:text-danger hover:bg-danger/10 transition-all">
                    <Trash2 size={14} />
                  </button>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Tip */}
      {reminders.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="mt-6 glass rounded-2xl p-4 border border-primary/15 flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
            <Zap size={14} className="text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white/70 mb-0.5">Pro Tip</p>
            <p className="text-xs text-white/40 leading-relaxed">
              Dashboard pe "Upcoming Bills" widget mein top 3 bills dikhte hain. Due date se pehle payment plan karo.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  )
}
