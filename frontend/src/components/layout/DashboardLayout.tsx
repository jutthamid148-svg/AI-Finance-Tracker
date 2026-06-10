import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, TrendingUp, TrendingDown, PieChart,
  Target, Brain, FileText, User, LogOut, Menu, X,
  Bell, Wallet, ChevronRight, Shield, AlertTriangle,
  Trophy, Info, CheckCheck, Clock,
} from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authAPI } from '../../services/api'
import { useAuthStore } from '../../store/authStore'
import toast from 'react-hot-toast'
import AIChatBot from '../AIChatBot'
import ThemeToggle from '../ui/ThemeToggle'

const TYPE_ICON: Record<string, { icon: any; color: string; bg: string }> = {
  budget_exceeded: { icon: AlertTriangle, color: '#EF4444', bg: 'rgba(239,68,68,0.12)' },
  goal_reached:    { icon: Trophy,        color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
  overspending:    { icon: TrendingDown,  color: '#F97316', bg: 'rgba(249,115,22,0.12)' },
  report_ready:    { icon: FileText,      color: '#6366F1', bg: 'rgba(99,102,241,0.12)' },
  info:            { icon: Info,          color: '#06B6D4', bg: 'rgba(6,182,212,0.12)'  },
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function NotificationPanel({ onClose: _onClose }: { onClose: () => void }) {
  const qc = useQueryClient()

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => authAPI.notifications().then(r => r.data.results || r.data),
    refetchInterval: 30000,
  })

  const markOneMutation = useMutation({
    mutationFn: (id: string) => authAPI.markOneRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  })

  const markAllMutation = useMutation({
    mutationFn: () => authAPI.markAllRead(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] })
      toast.success('All notifications marked as read')
    },
  })

  const unread = (notifications as any[]).filter((n: any) => !n.is_read).length

  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.97 }}
      transition={{ duration: 0.18 }}
      className="fixed right-4 top-[60px] w-80 rounded-2xl border border-white/10 shadow-2xl shadow-black/50 overflow-hidden z-[999]"
      style={{ background: 'var(--bg-card)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/8">
        <div className="flex items-center gap-2">
          <Bell size={14} className="text-primary" />
          <span className="font-semibold text-sm text-white">Notifications</span>
          {unread > 0 && (
            <span className="bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{unread}</span>
          )}
        </div>
        {unread > 0 && (
          <button
            onClick={() => markAllMutation.mutate()}
            disabled={markAllMutation.isPending}
            className="flex items-center gap-1 text-[11px] text-white/40 hover:text-primary transition-colors"
          >
            <CheckCheck size={12} /> Mark all read
          </button>
        )}
      </div>

      {/* List */}
      <div className="max-h-80 overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center py-8"><div className="spinner" /></div>
        ) : (notifications as any[]).length === 0 ? (
          <div className="flex flex-col items-center py-10 gap-2">
            <Bell size={28} className="text-white/15" />
            <p className="text-white/30 text-sm">No notifications yet</p>
          </div>
        ) : (
          (notifications as any[]).map((n: any) => {
            const meta = TYPE_ICON[n.notification_type] || TYPE_ICON.info
            const Icon = meta.icon
            return (
              <div
                key={n.id}
                onClick={() => !n.is_read && markOneMutation.mutate(n.id)}
                className={`flex gap-3 px-4 py-3 border-b border-white/5 cursor-pointer transition-colors hover:bg-white/5 ${!n.is_read ? 'bg-white/[0.03]' : ''}`}
              >
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: meta.bg }}>
                  <Icon size={14} style={{ color: meta.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-xs font-semibold leading-snug ${n.is_read ? 'text-white/50' : 'text-white'}`}>{n.title}</p>
                    {!n.is_read && <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 mt-1" />}
                  </div>
                  <p className="text-[11px] text-white/35 mt-0.5 leading-snug line-clamp-2">{n.message}</p>
                  <div className="flex items-center gap-1 mt-1 text-white/25 text-[10px]">
                    <Clock size={9} />{timeAgo(n.created_at)}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </motion.div>
  )
}

const navSections = [
  {
    label: 'MAIN',
    items: [
      { to: '/dashboard',          icon: LayoutDashboard, label: 'Dashboard', end: true,  color: '#6366F1' },
      { to: '/dashboard/income',   icon: TrendingUp,      label: 'Income',    end: false, color: '#10B981' },
      { to: '/dashboard/expenses', icon: TrendingDown,    label: 'Expenses',  end: false, color: '#EF4444' },
      { to: '/dashboard/budget',   icon: PieChart,        label: 'Budget',    end: false, color: '#F59E0B' },
      { to: '/dashboard/savings',  icon: Target,          label: 'Goals',     end: false, color: '#06B6D4' },
    ],
  },
  {
    label: 'INTELLIGENCE',
    items: [
      { to: '/dashboard/ai-insights', icon: Brain,        label: 'AI Insights', end: false, color: '#8B5CF6' },
      { to: '/dashboard/reports',     icon: FileText,     label: 'Reports',     end: false, color: '#EC4899' },
      { to: '/dashboard/reminders',   icon: Bell,         label: 'Reminders',   end: false, color: '#F59E0B' },
      { to: '/dashboard/net-worth',   icon: Info,         label: 'Net Worth',   end: false, color: '#10B981' },
      { to: '/dashboard/recurring',   icon: CheckCheck,   label: 'Recurring',   end: false, color: '#06B6D4' },
      { to: '/dashboard/calendar',    icon: Clock,        label: 'Calendar',    end: false, color: '#EC4899' },
    ],
  },
]

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    toast.success('Signed out successfully')
    navigate('/')
  }

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg shadow-primary/25">
            <Wallet size={17} className="text-white" />
          </div>
          <div>
            <div className="font-bold text-sm text-white">AI Finance</div>
            <div className="text-[10px] text-white/35 leading-none mt-0.5">Personal Finance Tracker</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 overflow-y-auto">
        {navSections.map((section) => (
          <div key={section.label} className="mb-4">
            <p className="text-[10px] text-white/25 font-semibold tracking-widest uppercase px-4 mb-2">{section.label}</p>
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={onClose}
                  className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                >
                  {({ isActive }) => (
                    <>
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all"
                        style={{ background: isActive ? item.color + '25' : 'transparent' }}
                      >
                        <item.icon size={15} style={{ color: isActive ? item.color : 'rgba(255,255,255,0.4)' }} />
                      </div>
                      <span className="flex-1 text-sm">{item.label}</span>
                      {isActive && <ChevronRight size={13} className="text-white/30" />}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}

        {user?.is_staff && (
          <div className="mb-4">
            <p className="text-[10px] text-white/25 font-semibold tracking-widest uppercase px-4 mb-2">ADMIN</p>
            <div className="space-y-0.5">
              <a
                href="/admin"
                className="sidebar-link"
              >
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield size={15} style={{ color: 'rgba(99,102,241,0.7)' }} />
                </div>
                <span className="flex-1 text-sm">Admin Panel</span>
              </a>
            </div>
          </div>
        )}
      </nav>

      {/* Account section */}
      <div className="px-3 pb-4 pt-2 border-t border-white/5">
        <p className="text-[10px] text-white/25 font-semibold tracking-widest uppercase px-4 mb-2">ACCOUNT</p>
        <div className="space-y-1">
        <NavLink
          to="/dashboard/profile"
          onClick={onClose}
          className={({ isActive }) => `
            flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer
            ${isActive ? 'bg-white/8 border border-white/10' : 'hover:bg-white/5'}
          `}
        >
          <div className="w-8 h-8 rounded-full flex-shrink-0 overflow-hidden shadow-md shadow-primary/20">
            {user?.avatar
              ? <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
              : <div className="w-full h-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-xs font-bold">{user?.first_name?.[0]?.toUpperCase()}{user?.last_name?.[0]?.toUpperCase()}</div>
            }
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate text-white/85">{user?.full_name || `${user?.first_name} ${user?.last_name}`}</div>
            <div className="text-[11px] text-white/35 truncate">{user?.email}</div>
          </div>
        </NavLink>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl w-full text-sm font-medium text-white/40 hover:text-danger hover:bg-danger/8 transition-all"
        >
          <LogOut size={15} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
    </div>
  )
}

export default function DashboardLayout() {
  const { user } = useAuthStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)

  // Check every 15s — if user is deactivated backend returns 401
  // axios interceptor clears tokens and redirects to /login automatically
  useEffect(() => {
    const interval = setInterval(() => {
      authAPI.profile().catch(() => {})
    }, 15000)
    return () => clearInterval(interval)
  }, [])

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => authAPI.notifications().then(r => r.data.results || r.data),
    refetchInterval: 60000,
    enabled: !!user,
  })
  const unreadCount = (notifications as any[]).filter((n: any) => !n.is_read).length

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-app)' }}>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-60 flex-shrink-0 border-r border-white/5" style={{ background: 'var(--bg-sidebar)' }}>
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="md:hidden fixed inset-0 bg-black/70 z-40 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="md:hidden fixed left-0 top-0 bottom-0 w-64 z-50 border-r border-white/5 flex flex-col"
              style={{ background: 'var(--bg-sidebar)' }}
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
                <span className="font-bold text-sm text-white/80">Menu</span>
                <button onClick={() => setSidebarOpen(false)} className="text-white/40 hover:text-white p-1">
                  <X size={18} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <SidebarContent onClose={() => setSidebarOpen(false)} />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top bar */}
        <header className="flex-shrink-0 border-b border-white/5 px-5 py-3.5 flex items-center justify-between" style={{ background: 'var(--bg-header)', backdropFilter: 'blur(20px)' }}>
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden text-white/50 hover:text-white p-1 transition-colors"
          >
            <Menu size={20} />
          </button>

          {/* Page breadcrumb hint */}
          <div className="hidden md:flex items-center gap-2 text-sm text-white/30">
            <Wallet size={14} />
            <span>AI Finance Tracker</span>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2 ml-auto">
            <ThemeToggle size="sm" />
            <div className="relative">
              <button
                onClick={() => setNotifOpen(o => !o)}
                className="relative p-2 rounded-lg hover:bg-white/6 transition-colors group"
              >
                <Bell size={16} className={`transition-colors ${notifOpen ? 'text-primary' : 'text-white/45 group-hover:text-white/70'}`} />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-danger text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              {createPortal(
                <AnimatePresence>
                  {notifOpen && (
                    <>
                      <motion.div
                        key="notif-backdrop"
                        className="fixed inset-0 z-[998]"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setNotifOpen(false)}
                      />
                      <NotificationPanel key="notif-panel" onClose={() => setNotifOpen(false)} />
                    </>
                  )}
                </AnimatePresence>,
                document.body
              )}
            </div>
            <NavLink
              to="/dashboard/profile"
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
            >
              <div className="w-7 h-7 rounded-full overflow-hidden shadow-sm shadow-primary/20 flex-shrink-0">
                {user?.avatar
                  ? <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  : <div className="w-full h-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-[11px] font-bold">{user?.first_name?.[0]?.toUpperCase()}{user?.last_name?.[0]?.toUpperCase()}</div>
                }
              </div>
              <span className="hidden md:block text-sm font-medium text-white/75">{user?.first_name}</span>
            </NavLink>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto" style={{ background: 'var(--bg-app)' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={window.location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* ── AI Chatbot floating button (har page pr) ── */}
      <AIChatBot />
    </div>
  )
}
