import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, TrendingUp, TrendingDown, PieChart,
  Target, Brain, FileText, User, LogOut, Menu, X,
  Bell, Wallet, ChevronRight, Shield,
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import toast from 'react-hot-toast'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', end: true, color: '#6366F1' },
  { to: '/dashboard/income', icon: TrendingUp, label: 'Income', end: false, color: '#10B981' },
  { to: '/dashboard/expenses', icon: TrendingDown, label: 'Expenses', end: false, color: '#EF4444' },
  { to: '/dashboard/budget', icon: PieChart, label: 'Budget', end: false, color: '#F59E0B' },
  { to: '/dashboard/savings', icon: Target, label: 'Savings Goals', end: false, color: '#06B6D4' },
  { to: '/dashboard/ai-insights', icon: Brain, label: 'AI Insights', end: false, color: '#8B5CF6' },
  { to: '/dashboard/reports', icon: FileText, label: 'Reports', end: false, color: '#EC4899' },
  { to: '/dashboard/profile', icon: User, label: 'Profile', end: false, color: '#64748B' },
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
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="text-[10px] text-white/25 font-semibold tracking-widest uppercase px-4 mb-3">Navigation</p>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onClose}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            {({ isActive }) => (
              <>
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all"
                  style={{
                    background: isActive ? item.color + '25' : 'transparent',
                  }}
                >
                  <item.icon
                    size={15}
                    style={{ color: isActive ? item.color : 'rgba(255,255,255,0.4)' }}
                  />
                </div>
                <span className="flex-1 text-sm">{item.label}</span>
                {isActive && <ChevronRight size={13} className="text-white/30" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Admin Panel link (staff only) */}
      {user?.is_staff && (
        <div className="px-3 pb-2">
          <a
            href="/admin"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer bg-primary/10 border border-primary/25 text-primary hover:bg-primary/20"
          >
            <Shield size={15} />
            <span>Admin Panel</span>
          </a>
        </div>
      )}

      {/* User & Logout */}
      <div className="px-3 pb-4 pt-2 border-t border-white/5 space-y-2">
        <NavLink
          to="/dashboard/profile"
          onClick={onClose}
          className={({ isActive }) => `
            flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer
            ${isActive ? 'bg-white/8 border border-white/10' : 'hover:bg-white/5'}
          `}
        >
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-xs font-bold shadow-md shadow-primary/20 flex-shrink-0">
            {user?.first_name?.[0]?.toUpperCase()}{user?.last_name?.[0]?.toUpperCase()}
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
  )
}

export default function DashboardLayout() {
  const { user } = useAuthStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#070e1a' }}>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-60 flex-shrink-0 border-r border-white/5" style={{ background: 'rgba(8,14,24,0.95)' }}>
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
              style={{ background: 'rgba(8,14,24,0.98)' }}
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
        <header className="flex-shrink-0 border-b border-white/5 px-5 py-3.5 flex items-center justify-between" style={{ background: 'rgba(8,14,24,0.9)', backdropFilter: 'blur(20px)' }}>
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
            <button className="relative p-2 rounded-lg hover:bg-white/6 transition-colors group">
              <Bell size={16} className="text-white/45 group-hover:text-white/70 transition-colors" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-primary rounded-full" />
            </button>
            <NavLink
              to="/dashboard/profile"
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
            >
              <div className="w-7 h-7 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-[11px] font-bold shadow-sm shadow-primary/20">
                {user?.first_name?.[0]?.toUpperCase()}{user?.last_name?.[0]?.toUpperCase()}
              </div>
              <span className="hidden md:block text-sm font-medium text-white/75">{user?.first_name}</span>
            </NavLink>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
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
    </div>
  )
}
