import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from 'recharts'
import {
  Users, UserCheck, UserX, Shield, TrendingUp, TrendingDown,
  Search, ToggleLeft, ToggleRight, RefreshCw, LogOut,
  Activity, DollarSign, UserPlus, AlertCircle, X, ChevronDown
} from 'lucide-react'
import { adminAPI, authAPI } from '../../services/api'
import { useAuthStore } from '../../store/authStore'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

function StatCard({ label, value, icon: Icon, color, sub }: {
  label: string; value: string | number; icon: any; color: string; sub?: string
}) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="card relative overflow-hidden"
    >
      <div className={`absolute inset-0 opacity-[0.05] bg-gradient-to-br ${color}`} />
      <div className="relative flex items-center gap-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br ${color} shadow-lg flex-shrink-0`}>
          <Icon size={22} className="text-white" />
        </div>
        <div>
          <p className="text-white/45 text-xs font-medium">{label}</p>
          <p className="text-2xl font-black text-white">{value}</p>
          {sub && <p className="text-white/30 text-xs">{sub}</p>}
        </div>
      </div>
    </motion.div>
  )
}

function ConfirmModal({ user, onConfirm, onClose }: {
  user: any; onConfirm: () => void; onClose: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}
        className="card w-full max-w-sm"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-base">Confirm Action</h3>
          <button onClick={onClose} className="text-white/30 hover:text-white">
            <X size={18} />
          </button>
        </div>
        <div className="glass p-4 rounded-xl mb-5 border border-white/8">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${user.is_active ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'}`}>
              {user.first_name?.[0]}{user.last_name?.[0]}
            </div>
            <div>
              <p className="font-semibold text-sm">{user.full_name}</p>
              <p className="text-white/40 text-xs">{user.email}</p>
            </div>
          </div>
        </div>
        <p className="text-white/60 text-sm mb-6">
          Are you sure you want to{' '}
          <span className={user.is_active ? 'text-danger font-semibold' : 'text-success font-semibold'}>
            {user.is_active ? 'deactivate' : 'activate'}
          </span>{' '}
          this user? {user.is_active ? 'They will not be able to log in.' : 'They will be able to log in again.'}
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1 text-sm py-2.5">Cancel</button>
          <button
            onClick={onConfirm}
            className={`flex-1 text-sm py-2.5 rounded-xl font-semibold text-white transition-all ${user.is_active
              ? 'bg-gradient-to-r from-danger to-rose-600 hover:shadow-lg hover:shadow-danger/30'
              : 'bg-gradient-to-r from-success to-emerald-600 hover:shadow-lg hover:shadow-success/30'
              }`}
          >
            {user.is_active ? 'Deactivate User' : 'Activate User'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function AdminPanel() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [confirmUser, setConfirmUser] = useState<any>(null)
  const [expandedUser, setExpandedUser] = useState<string | null>(null)

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => adminAPI.stats().then(r => r.data),
  })

  const { data: usersData, isLoading: usersLoading, refetch } = useQuery({
    queryKey: ['admin-users', search, statusFilter],
    queryFn: () => adminAPI.users({ search: search || undefined, status: statusFilter || undefined })
      .then(r => r.data.results || r.data),
  })

  const toggleMutation = useMutation({
    mutationFn: (userId: string) => adminAPI.toggleActive(userId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
      const action = data.data.is_active ? 'activated' : 'deactivated'
      toast.success(`User ${action} successfully`)
      setConfirmUser(null)
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error || 'Action failed')
      setConfirmUser(null)
    },
  })

  const handleLogout = () => {
    logout()
    toast.success('Signed out')
    navigate('/')
  }

  const users: any[] = usersData || []

  return (
    <div className="min-h-screen" style={{ background: '#060d18' }}>

      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-white/5 px-6 py-4 flex items-center justify-between"
        style={{ background: 'rgba(6,13,24,0.95)', backdropFilter: 'blur(20px)' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg shadow-primary/30">
            <Shield size={18} className="text-white" />
          </div>
          <div>
            <h1 className="font-bold text-base leading-none text-white">Admin Panel</h1>
            <p className="text-[11px] text-white/35 mt-0.5">AI Finance Tracker — User Management</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 glass px-3 py-1.5 rounded-lg border border-white/8">
            <div className="w-6 h-6 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-[10px] font-bold">
              {user?.first_name?.[0]}{user?.last_name?.[0]}
            </div>
            <span className="text-sm text-white/60">{user?.first_name}</span>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="btn-secondary text-sm py-2 px-4 gap-2"
          >
            Dashboard
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-white/40 hover:text-danger hover:bg-danger/10 transition-all text-sm"
          >
            <LogOut size={15} />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-5 py-8">

        {/* Stats */}
        {statsLoading ? (
          <div className="flex justify-center py-10">
            <div className="spinner" />
          </div>
        ) : stats && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <StatCard
                label="Total Users"
                value={stats.total_users}
                icon={Users}
                color="from-primary to-secondary"
                sub="All registered"
              />
              <StatCard
                label="Active Users"
                value={stats.active_users}
                icon={UserCheck}
                color="from-success to-emerald-600"
                sub="Can login"
              />
              <StatCard
                label="Inactive Users"
                value={stats.inactive_users}
                icon={UserX}
                color="from-danger to-rose-600"
                sub="Blocked"
              />
              <StatCard
                label="New This Month"
                value={stats.new_users_this_month}
                icon={UserPlus}
                color="from-warning to-amber-500"
                sub="Registrations"
              />
            </div>

            {/* Finance stats + chart */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
              <div className="card lg:col-span-2">
                <h2 className="font-bold text-base mb-5">Monthly User Registrations</h2>
                {stats.monthly_registrations?.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={stats.monthly_registrations}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                      <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                        formatter={(v: any) => [v, 'New Users']}
                      />
                      <Bar dataKey="users" radius={[6, 6, 0, 0]} maxBarSize={40}>
                        {stats.monthly_registrations.map((_: any, i: number) => (
                          <Cell key={i} fill={i === stats.monthly_registrations.length - 1 ? '#6366F1' : 'rgba(99,102,241,0.4)'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-48 flex items-center justify-center text-white/25 text-sm">No registration data</div>
                )}
              </div>

              <div className="card space-y-4">
                <h2 className="font-bold text-base">Platform Finance</h2>
                <div className="glass p-4 rounded-xl border border-success/15">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp size={14} className="text-success" />
                    <span className="text-white/50 text-xs">Total Income Tracked</span>
                  </div>
                  <p className="text-xl font-bold text-success">₨{Number(stats.total_income).toLocaleString()}</p>
                </div>
                <div className="glass p-4 rounded-xl border border-danger/15">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingDown size={14} className="text-danger" />
                    <span className="text-white/50 text-xs">Total Expenses Tracked</span>
                  </div>
                  <p className="text-xl font-bold text-danger">₨{Number(stats.total_expenses).toLocaleString()}</p>
                </div>
                <div className="glass p-4 rounded-xl border border-primary/15">
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign size={14} className="text-primary" />
                    <span className="text-white/50 text-xs">Net Platform Savings</span>
                  </div>
                  <p className="text-xl font-bold text-primary">
                    ₨{Math.max(stats.total_income - stats.total_expenses, 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Users table */}
        <div className="card">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <div>
              <h2 className="font-bold text-base">User Management</h2>
              <p className="text-white/35 text-xs mt-0.5">Activate or deactivate user accounts</p>
            </div>
            <button
              onClick={() => refetch()}
              className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white px-3 py-1.5 rounded-lg glass border border-white/8 transition-colors"
            >
              <RefreshCw size={13} />
              Refresh
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-5">
            <div className="flex items-center gap-2 glass border border-white/8 rounded-xl px-3 py-2 flex-1 min-w-[200px]">
              <Search size={14} className="text-white/30 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="bg-transparent text-sm text-white placeholder-white/25 outline-none flex-1"
              />
              {search && (
                <button onClick={() => setSearch('')} className="text-white/30 hover:text-white">
                  <X size={13} />
                </button>
              )}
            </div>
            <div className="flex gap-2">
              {[
                { label: 'All', value: '' },
                { label: 'Active', value: 'active' },
                { label: 'Inactive', value: 'inactive' },
              ].map(f => (
                <button
                  key={f.value}
                  onClick={() => setStatusFilter(f.value)}
                  className={`text-xs px-3.5 py-2 rounded-xl font-medium transition-all border ${statusFilter === f.value
                    ? 'bg-primary/20 border-primary/40 text-primary'
                    : 'glass border-white/8 text-white/45 hover:text-white'
                    }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          {usersLoading ? (
            <div className="flex justify-center py-16">
              <div className="spinner" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-14">
              <Users size={36} className="text-white/15 mx-auto mb-3" />
              <p className="text-white/35 text-sm">No users found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {users.map((u: any, i: number) => (
                <motion.div
                  key={u.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={`glass rounded-xl border transition-colors ${u.is_active ? 'border-white/6' : 'border-danger/15 bg-danger/[0.02]'}`}
                >
                  {/* Main row */}
                  <div className="flex items-center gap-4 px-4 py-3">
                    {/* Avatar */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${u.is_active
                      ? 'bg-gradient-to-br from-primary/30 to-secondary/30 text-white'
                      : 'bg-white/5 text-white/30'
                      }`}>
                      {u.first_name?.[0]?.toUpperCase()}{u.last_name?.[0]?.toUpperCase()}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`font-semibold text-sm ${u.is_active ? 'text-white' : 'text-white/40'}`}>
                          {u.full_name}
                        </span>
                        {u.is_staff && (
                          <span className="badge badge-primary text-[10px] py-0.5 px-2">Admin</span>
                        )}
                        {!u.is_verified && (
                          <span className="badge badge-warning text-[10px] py-0.5 px-2">Unverified</span>
                        )}
                      </div>
                      <p className="text-white/35 text-xs truncate">{u.email}</p>
                    </div>

                    {/* Status badge */}
                    <div className="hidden sm:flex items-center">
                      <span className={`badge text-xs ${u.is_active ? 'badge-success' : 'badge-danger'}`}>
                        {u.is_active ? (
                          <><Activity size={10} /> Active</>
                        ) : (
                          <><AlertCircle size={10} /> Inactive</>
                        )}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => setExpandedUser(expandedUser === u.id ? null : u.id)}
                        className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/8 transition-colors"
                      >
                        <ChevronDown
                          size={15}
                          className={`transition-transform ${expandedUser === u.id ? 'rotate-180' : ''}`}
                        />
                      </button>

                      {!u.is_staff && (
                        <button
                          onClick={() => setConfirmUser(u)}
                          disabled={toggleMutation.isPending}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${u.is_active
                            ? 'bg-danger/10 text-danger hover:bg-danger/20 border border-danger/20'
                            : 'bg-success/10 text-success hover:bg-success/20 border border-success/20'
                            }`}
                        >
                          {u.is_active
                            ? <><ToggleLeft size={13} /> Deactivate</>
                            : <><ToggleRight size={13} /> Activate</>
                          }
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expanded details */}
                  <AnimatePresence>
                    {expandedUser === u.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="border-t border-white/5 px-4 py-3"
                      >
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                          <div className="glass p-2.5 rounded-lg border border-white/6">
                            <p className="text-white/35 mb-0.5">Joined</p>
                            <p className="font-semibold text-white/80">
                              {new Date(u.created_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                          </div>
                          <div className="glass p-2.5 rounded-lg border border-white/6">
                            <p className="text-white/35 mb-0.5">Currency</p>
                            <p className="font-semibold text-white/80">{u.currency || 'PKR'}</p>
                          </div>
                          <div className="glass p-2.5 rounded-lg border border-success/15">
                            <p className="text-white/35 mb-0.5">Total Income</p>
                            <p className="font-semibold text-success">₨{Number(u.total_income || 0).toLocaleString()}</p>
                          </div>
                          <div className="glass p-2.5 rounded-lg border border-danger/15">
                            <p className="text-white/35 mb-0.5">Total Expenses</p>
                            <p className="font-semibold text-danger">₨{Number(u.total_expenses || 0).toLocaleString()}</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          )}

          {users.length > 0 && (
            <p className="text-white/25 text-xs text-center mt-4">
              {users.length} user{users.length !== 1 ? 's' : ''} found
            </p>
          )}
        </div>
      </main>

      {/* Confirm Modal */}
      <AnimatePresence>
        {confirmUser && (
          <ConfirmModal
            user={confirmUser}
            onConfirm={() => toggleMutation.mutate(confirmUser.id)}
            onClose={() => setConfirmUser(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
