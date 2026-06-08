import { useState, useRef } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import {
  User, Lock, Camera, Save, Eye, EyeOff, Loader2, Crown,
  BarChart2, Download, TrendingUp, TrendingDown, Target,
  Calendar, Hash, DollarSign, Shield, Activity,
  AlertTriangle, Trash2, X, CheckCircle,
} from 'lucide-react'
import { authAPI, transactionAPI, savingsAPI, reportAPI } from '../../services/api'
import { useAuthStore } from '../../store/authStore'

type Tab = 'profile' | 'password' | 'stats'

// ── Reset Confirmation Modal ──────────────────────────────────────────────────
function ResetModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: (deleted: any) => void }) {
  const [confirmText, setConfirmText] = useState('')
  const [resetting, setResetting]     = useState(false)
  const confirmed = confirmText === 'RESET'

  const handleReset = async () => {
    if (!confirmed) return
    setResetting(true)
    try {
      const res = await authAPI.resetData()
      onSuccess(res.data.deleted)
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Reset failed — try again')
      setResetting(false)
    }
  }

  const WHAT_GETS_DELETED = [
    { icon: '💸', label: 'All expense transactions' },
    { icon: '💵', label: 'All income records' },
    { icon: '📊', label: 'All budget plans' },
    { icon: '🎯', label: 'All savings goals & progress' },
    { icon: '🔔', label: 'All notifications' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.80)', backdropFilter: 'blur(8px)' }}
      onClick={e => e.target === e.currentTarget && !resetting && onClose()}
    >
      <motion.div
        initial={{ scale: 0.88, y: 24 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.88, y: 24 }}
        className="w-full max-w-md rounded-2xl border border-danger/30 overflow-hidden shadow-2xl"
        style={{ background: 'linear-gradient(135deg, #130a0a 0%, #0d0808 100%)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/6"
          style={{ background: 'rgba(239,68,68,0.08)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-danger/20 flex items-center justify-center border border-danger/30">
              <AlertTriangle size={18} className="text-danger" />
            </div>
            <div>
              <p className="font-black text-sm text-white">Reset All Financial Data</p>
              <p className="text-danger/60 text-[10px]">This action cannot be undone</p>
            </div>
          </div>
          {!resetting && (
            <button onClick={onClose} className="w-7 h-7 rounded-lg bg-white/6 hover:bg-white/12 flex items-center justify-center transition-colors">
              <X size={14} className="text-white/50" />
            </button>
          )}
        </div>

        <div className="p-5 space-y-4">
          {/* Warning */}
          <div className="glass px-4 py-3 rounded-xl border border-danger/20">
            <p className="text-xs text-white/60 leading-relaxed">
              ⚠️ Yeh action aapka <span className="text-white font-semibold">poora financial data</span> permanently delete kar dega.
              Account safe rahega — sirf data delete hoga.
            </p>
          </div>

          {/* What gets deleted */}
          <div>
            <p className="text-white/30 text-[10px] font-semibold uppercase tracking-wider mb-2">Jo Delete Hoga:</p>
            <div className="space-y-1.5">
              {WHAT_GETS_DELETED.map((item, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="flex items-center gap-2.5 glass px-3 py-2 rounded-xl border border-danger/10">
                  <span className="text-sm">{item.icon}</span>
                  <span className="text-xs text-white/60">{item.label}</span>
                  <Trash2 size={10} className="text-danger/40 ml-auto" />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Confirm input */}
          <div>
            <p className="text-white/40 text-xs mb-2">
              Confirm karne ke liye <span className="text-danger font-bold font-mono">RESET</span> type karein:
            </p>
            <input
              value={confirmText}
              onChange={e => setConfirmText(e.target.value.toUpperCase())}
              disabled={resetting}
              placeholder="Type RESET here..."
              className={`w-full rounded-xl px-4 py-2.5 text-sm font-mono border outline-none transition-all
                ${confirmed
                  ? 'border-danger/60 bg-danger/10 text-danger placeholder-danger/30'
                  : 'border-white/10 bg-white/[0.04] text-white placeholder-white/20'
                } disabled:opacity-50`}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button onClick={onClose} disabled={resetting}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-white/10 text-white/60 hover:bg-white/5 transition-all disabled:opacity-40">
              Cancel
            </button>
            <button
              onClick={handleReset}
              disabled={!confirmed || resetting}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-40"
              style={{ background: confirmed ? 'linear-gradient(135deg,#EF4444,#DC2626)' : 'rgba(239,68,68,0.15)', boxShadow: confirmed ? '0 4px 16px rgba(239,68,68,0.4)' : 'none' }}
            >
              {resetting
                ? <><Loader2 size={14} className="animate-spin" /> Resetting...</>
                : <><Trash2 size={14} /> Reset Data</>
              }
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── Reset Success Modal ───────────────────────────────────────────────────────
function ResetSuccessModal({ deleted, onClose }: { deleted: any; onClose: () => void }) {
  const stats = [
    { icon: '💸', label: 'Expenses',      count: deleted?.expenses      || 0 },
    { icon: '💵', label: 'Income',         count: deleted?.income        || 0 },
    { icon: '📊', label: 'Budgets',        count: deleted?.budgets       || 0 },
    { icon: '🎯', label: 'Savings Goals',  count: deleted?.goals         || 0 },
    { icon: '🔔', label: 'Notifications',  count: deleted?.notifications || 0 },
  ]
  const total = stats.reduce((s, x) => s + x.count, 0)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.80)', backdropFilter: 'blur(8px)' }}
    >
      <motion.div
        initial={{ scale: 0.88, y: 24 }}
        animate={{ scale: 1, y: 0 }}
        className="w-full max-w-sm rounded-2xl border border-success/30 overflow-hidden shadow-2xl"
        style={{ background: 'linear-gradient(135deg, #060d10 0%, #040a08 100%)' }}
      >
        <div className="p-6 text-center space-y-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
            className="w-16 h-16 rounded-2xl bg-success/15 border border-success/30 flex items-center justify-center mx-auto"
          >
            <CheckCircle size={30} className="text-success" />
          </motion.div>

          <div>
            <p className="font-black text-lg text-white">Data Reset Complete</p>
            <p className="text-white/40 text-sm mt-1">{total} records deleted successfully</p>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {stats.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.07 }}
                className="glass rounded-xl p-2 border border-white/5 text-center">
                <div className="text-lg mb-0.5">{s.icon}</div>
                <p className="text-success font-black text-sm">{s.count}</p>
                <p className="text-white/25 text-[8px]">{s.label}</p>
              </motion.div>
            ))}
          </div>

          <p className="text-white/30 text-xs">
            Aapka account active hai. Fresh start ke liye naya data add karein.
          </p>

          <button onClick={onClose}
            className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg,#10B981,#059669)' }}>
            Done
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab]         = useState<Tab>('profile')
  const [showOld, setShowOld]             = useState(false)
  const [showNew, setShowNew]             = useState(false)
  const [saving, setSaving]               = useState(false)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [exporting, setExporting]         = useState(false)
  const [showResetModal, setShowResetModal]   = useState(false)
  const [resetDeleted, setResetDeleted]       = useState<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleResetSuccess = (deleted: any) => {
    setShowResetModal(false)
    setResetDeleted(deleted)
    queryClient.clear()
    toast.success('All data reset successfully!')
    setTimeout(() => { window.location.href = '/dashboard' }, 2000)
  }

  const profileForm = useForm({
    defaultValues: {
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      phone: user?.phone || '',
      currency: user?.currency || 'PKR',
    }
  })
  const passwordForm = useForm()

  // Lifetime stats queries (no month/year filter)
  const { data: allExpenses } = useQuery({
    queryKey: ['all-expenses-count'],
    queryFn: () => transactionAPI.expenseList().then(r => r.data),
    enabled: activeTab === 'stats',
  })
  const { data: allIncomes } = useQuery({
    queryKey: ['all-incomes-count'],
    queryFn: () => transactionAPI.incomeList().then(r => r.data),
    enabled: activeTab === 'stats',
  })
  const { data: allSavings } = useQuery({
    queryKey: ['all-savings-count'],
    queryFn: () => savingsAPI.list().then(r => r.data.results || r.data),
    enabled: activeTab === 'stats',
  })
  const { data: dashStats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => authAPI.dashboardStats().then(r => r.data),
    enabled: activeTab === 'stats',
  })

  const expenseCount = allExpenses?.count ?? (allExpenses?.results || allExpenses)?.length ?? 0
  const incomeCount = allIncomes?.count ?? (allIncomes?.results || allIncomes)?.length ?? 0
  const savingsGoalCount = (allSavings as any[])?.length ?? 0
  const completedGoals = (allSavings as any[])?.filter((g: any) => g.is_completed)?.length ?? 0

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file'); return }
    if (file.size > 2 * 1024 * 1024) { toast.error('Image must be under 2MB'); return }
    setAvatarUploading(true)
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(file)
      })
      setAvatarPreview(base64)
      const res = await authAPI.updateProfile({ avatar: base64 })
      updateUser(res.data)
      toast.success('Profile picture updated!')
    } catch {
      toast.error('Failed to upload image')
      setAvatarPreview(null)
    } finally {
      setAvatarUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleRemoveAvatar = async () => {
    setAvatarUploading(true)
    try {
      const res = await authAPI.updateProfile({ avatar: '' })
      updateUser(res.data)
      setAvatarPreview(null)
      toast.success('Profile picture removed')
    } catch {
      toast.error('Failed to remove image')
    } finally {
      setAvatarUploading(false)
    }
  }

  const onSaveProfile = async (data: any) => {
    setSaving(true)
    try {
      const res = await authAPI.updateProfile(data)
      updateUser(res.data)
      toast.success('Profile updated!')
    } catch {
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const onChangePassword = async (data: any) => {
    setSaving(true)
    try {
      await authAPI.changePassword(data)
      toast.success('Password changed successfully!')
      passwordForm.reset()
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to change password')
    } finally {
      setSaving(false)
    }
  }

  const handleExportExcel = async () => {
    setExporting(true)
    try {
      const now = new Date()
      const res = await reportAPI.exportExcel({ month: now.getMonth() + 1, year: now.getFullYear() })
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }))
      const a = document.createElement('a')
      a.href = url
      a.download = `finance-report-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}.xlsx`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Report downloaded!')
    } catch {
      toast.error('Export failed — try again')
    } finally {
      setExporting(false)
    }
  }

  const currentAvatar = avatarPreview || user?.avatar

  const tabs: { key: Tab; label: string; icon: any }[] = [
    { key: 'profile', label: 'Profile Info', icon: User },
    { key: 'password', label: 'Change Password', icon: Lock },
    { key: 'stats', label: 'Account Stats', icon: BarChart2 },
  ]

  return (
    <div className="p-5 md:p-6 max-w-2xl mx-auto">

      {/* ── Modals ── */}
      <AnimatePresence>
        {showResetModal && (
          <ResetModal
            onClose={() => setShowResetModal(false)}
            onSuccess={handleResetSuccess}
          />
        )}
        {resetDeleted && (
          <ResetSuccessModal
            deleted={resetDeleted}
            onClose={() => setResetDeleted(null)}
          />
        )}
      </AnimatePresence>

      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-0.5">Profile Settings</h1>
        <p className="text-white/40 text-sm">Manage your account and view statistics</p>
      </div>

      {/* Avatar card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card mb-5">
        <div className="flex items-center gap-5">
          <div className="relative">
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp"
              className="hidden" onChange={handleAvatarChange} />
            <div className="w-20 h-20 rounded-2xl overflow-hidden cursor-pointer group relative border border-white/8"
              onClick={() => fileInputRef.current?.click()} title="Click to change photo">
              {currentAvatar ? (
                <img src={currentAvatar} alt="Profile" className="w-full h-full object-cover group-hover:opacity-70 transition-opacity" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-3xl font-bold group-hover:opacity-70 transition-opacity">
                  {user?.first_name?.[0]}{user?.last_name?.[0]}
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                <Camera size={20} className="text-white" />
              </div>
            </div>
            <button type="button" onClick={() => fileInputRef.current?.click()} disabled={avatarUploading}
              className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary rounded-full flex items-center justify-center shadow-lg hover:bg-secondary transition-colors disabled:opacity-50">
              {avatarUploading ? <Loader2 size={12} className="text-white animate-spin" /> : <Camera size={13} className="text-white" />}
            </button>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
              <h2 className="text-xl font-bold">{user?.full_name}</h2>
              {user?.is_pro && (
                <span className="flex items-center gap-1 bg-amber-500/20 text-amber-400 text-xs px-2 py-0.5 rounded-full border border-amber-500/30">
                  <Crown size={10} /> Pro
                </span>
              )}
              {user?.is_staff && (
                <span className="flex items-center gap-1 bg-primary/20 text-primary text-xs px-2 py-0.5 rounded-full border border-primary/30">
                  <Shield size={10} /> Staff
                </span>
              )}
            </div>
            <p className="text-white/50 text-sm truncate">{user?.email}</p>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className={`badge text-xs ${user?.is_verified ? 'badge-success' : 'badge-warning'}`}>
                {user?.is_verified ? '✅ Verified' : '⚠️ Unverified'}
              </span>
              {currentAvatar && (
                <button type="button" onClick={handleRemoveAvatar} disabled={avatarUploading}
                  className="text-xs text-white/30 hover:text-danger transition-colors">
                  Remove photo
                </button>
              )}
            </div>
            <p className="text-white/20 text-xs mt-1.5">Click photo to upload · JPG/PNG/GIF · Max 2MB</p>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === tab.key ? 'btn-primary' : 'btn-secondary'}`}>
            <tab.icon size={14} /> {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Profile Form */}
        {activeTab === 'profile' && (
          <motion.div key="profile" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="card">
            <h2 className="font-bold text-base mb-5">Personal Information</h2>
            <form onSubmit={profileForm.handleSubmit(onSaveProfile)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">First Name</label>
                  <input className="input" {...profileForm.register('first_name', { required: true })} />
                </div>
                <div>
                  <label className="label">Last Name</label>
                  <input className="input" {...profileForm.register('last_name', { required: true })} />
                </div>
              </div>
              <div>
                <label className="label">Email Address</label>
                <input className="input opacity-50 cursor-not-allowed" value={user?.email} disabled />
                <p className="text-white/25 text-xs mt-1">Email cannot be changed</p>
              </div>
              <div>
                <label className="label">Phone Number</label>
                <input className="input" placeholder="03XX-XXXXXXX" {...profileForm.register('phone')} />
              </div>
              <div>
                <label className="label">Currency</label>
                <select className="input" {...profileForm.register('currency')}>
                  <option value="PKR">🇵🇰 PKR — Pakistani Rupee</option>
                  <option value="USD">🇺🇸 USD — US Dollar</option>
                  <option value="EUR">🇪🇺 EUR — Euro</option>
                  <option value="GBP">🇬🇧 GBP — British Pound</option>
                </select>
              </div>
              <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
                {saving ? <div className="spinner w-4 h-4 border-2" /> : <Save size={15} />}
                Save Changes
              </button>
            </form>
          </motion.div>
        )}

        {/* Password Form */}
        {activeTab === 'password' && (
          <motion.div key="password" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="card">
            <h2 className="font-bold text-base mb-5">Change Password</h2>
            <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="space-y-4">
              <div>
                <label className="label">Current Password</label>
                <div className="relative">
                  <input type={showOld ? 'text' : 'password'} className="input pr-12" placeholder="Enter current password"
                    {...passwordForm.register('old_password', { required: true })} />
                  <button type="button" onClick={() => setShowOld(!showOld)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white">
                    {showOld ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="label">New Password</label>
                <div className="relative">
                  <input type={showNew ? 'text' : 'password'} className="input pr-12" placeholder="Min 8 characters"
                    {...passwordForm.register('new_password', { required: true, minLength: 8 })} />
                  <button type="button" onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white">
                    {showNew ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="label">Confirm New Password</label>
                <input type="password" className="input" placeholder="Repeat new password"
                  {...passwordForm.register('new_password2', {
                    required: true,
                    validate: v => v === passwordForm.watch('new_password') || 'Passwords do not match',
                  })} />
                {passwordForm.formState.errors.new_password2 && (
                  <p className="text-danger text-xs mt-1">Passwords do not match</p>
                )}
              </div>
              <div className="glass p-3.5 rounded-xl border border-primary/15">
                <p className="text-xs text-white/40 font-medium mb-2">Requirements:</p>
                <ul className="text-xs text-white/30 space-y-1">
                  <li>• At least 8 characters long</li>
                  <li>• Mix of letters and numbers recommended</li>
                  <li>• Avoid common passwords</li>
                </ul>
              </div>
              <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
                {saving ? <div className="spinner w-4 h-4 border-2" /> : <Lock size={15} />}
                Change Password
              </button>
            </form>
          </motion.div>
        )}

        {/* Account Stats */}
        {activeTab === 'stats' && (
          <motion.div key="stats" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-4">
            {/* Account info */}
            <div className="card">
              <h2 className="font-bold text-base mb-4">Account Information</h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: User, label: 'Account ID', value: user?.id ? `${user.id.slice(0, 12)}...` : 'N/A', mono: true },
                  { icon: Calendar, label: 'Member Since', value: user?.created_at ? new Date(user.created_at).toLocaleDateString('en-PK', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A', mono: false },
                  { icon: Activity, label: 'Account Status', value: user?.is_active ? 'Active' : 'Inactive', mono: false },
                  { icon: Shield, label: 'Account Type', value: user?.is_staff ? 'Staff / Admin' : user?.is_pro ? 'Pro User' : 'Standard', mono: false },
                ].map((item, i) => (
                  <div key={i} className="glass p-3 rounded-xl border border-white/5">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <item.icon size={12} className="text-white/30" />
                      <p className="text-white/30 text-[10px]">{item.label}</p>
                    </div>
                    <p className={`text-sm font-medium text-white/75 ${item.mono ? 'font-mono text-xs' : ''}`}>{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial stats */}
            <div className="card">
              <h2 className="font-bold text-base mb-4">Financial Overview</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                {[
                  { icon: TrendingDown, label: 'Expense Records', value: expenseCount, color: '#EF4444', sub: 'transactions' },
                  { icon: TrendingUp, label: 'Income Records', value: incomeCount, color: '#10B981', sub: 'transactions' },
                  { icon: Hash, label: 'Total Transactions', value: expenseCount + incomeCount, color: '#6366F1', sub: 'ever recorded' },
                  { icon: Target, label: 'Savings Goals', value: savingsGoalCount, color: '#F59E0B', sub: 'goals created' },
                  { icon: DollarSign, label: 'Goals Completed', value: completedGoals, color: '#10B981', sub: 'of total goals' },
                  { icon: BarChart2, label: 'Current Balance', value: `₨${Number(dashStats?.current_balance || 0).toLocaleString()}`, color: '#06B6D4', sub: 'net balance' },
                ].map((s, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className="glass p-3.5 rounded-xl border border-white/5">
                    <div className="flex items-center gap-1.5 mb-2">
                      <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: s.color + '20' }}>
                        <s.icon size={10} style={{ color: s.color }} />
                      </div>
                      <span className="text-white/30 text-[10px]">{s.label}</span>
                    </div>
                    <p className="text-lg font-black" style={{ color: s.color }}>{s.value}</p>
                    <p className="text-white/20 text-[10px] mt-0.5">{s.sub}</p>
                  </motion.div>
                ))}
              </div>

              {/* Savings goals breakdown */}
              {savingsGoalCount > 0 && (
                <div className="glass p-3.5 rounded-xl border border-white/5">
                  <p className="text-xs font-semibold text-white/50 mb-3">Savings Goals Progress</p>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }}
                          animate={{ width: savingsGoalCount > 0 ? `${(completedGoals / savingsGoalCount) * 100}%` : '0%' }}
                          transition={{ duration: 1, ease: 'easeOut' }}
                          className="h-full bg-gradient-to-r from-success to-emerald-400 rounded-full" />
                      </div>
                    </div>
                    <span className="text-xs font-bold text-success">
                      {completedGoals}/{savingsGoalCount} completed
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Export data */}
            <div className="card">
              <h2 className="font-bold text-base mb-1.5">Export Your Data</h2>
              <p className="text-white/35 text-xs mb-4">Download this month's financial report as an Excel spreadsheet with income, expenses, and summary.</p>
              <div className="flex gap-3 flex-wrap">
                <button onClick={handleExportExcel} disabled={exporting}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-success to-emerald-600 hover:shadow-lg hover:shadow-success/25 transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:translate-y-0">
                  {exporting ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
                  {exporting ? 'Preparing...' : 'Download Excel Report'}
                </button>
              </div>
              <p className="text-white/20 text-[10px] mt-3">Exports current month data · More date ranges available in Reports page</p>
            </div>

            {/* ── Danger Zone ── */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="rounded-2xl border border-danger/25 overflow-hidden"
              style={{ background: 'rgba(239,68,68,0.04)' }}
            >
              {/* Header */}
              <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-danger/15"
                style={{ background: 'rgba(239,68,68,0.07)' }}>
                <AlertTriangle size={15} className="text-danger" />
                <h2 className="font-black text-sm text-danger">Danger Zone</h2>
              </div>

              <div className="p-5 space-y-4">
                {/* Reset data row */}
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-white/80 flex items-center gap-2">
                      <Trash2 size={14} className="text-danger flex-shrink-0" />
                      Reset All Financial Data
                    </p>
                    <p className="text-white/35 text-xs mt-1 leading-relaxed">
                      Sabhi expenses, income, budgets, savings goals aur notifications delete ho jayenge.
                      Account aur profile safe rahega.
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {['Expenses', 'Income', 'Budgets', 'Goals', 'Notifications'].map(tag => (
                        <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full border border-danger/20 text-danger/60"
                          style={{ background: 'rgba(239,68,68,0.07)' }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setShowResetModal(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white border border-danger/40 hover:border-danger transition-all flex-shrink-0"
                    style={{ background: 'rgba(239,68,68,0.12)' }}
                  >
                    <Trash2 size={14} className="text-danger" />
                    <span className="text-danger">Reset Data</span>
                  </motion.button>
                </div>

                <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-warning/20"
                  style={{ background: 'rgba(245,158,11,0.05)' }}>
                  <AlertTriangle size={11} className="text-warning flex-shrink-0" />
                  <p className="text-[10px] text-warning/70">
                    Yeh action permanent hai — delete hone ke baad data wapas nahi aa sakta.
                    Pehle Excel export kar lein.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
