import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import {
  Eye, EyeOff, TrendingUp, LogIn,
  Shield, Brain, BarChart3, Target, ArrowRight,
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'

const features = [
  { icon: BarChart3, text: 'Smart Expense Tracking', color: '#6366F1' },
  { icon: Brain, text: 'AI-Powered Insights', color: '#8B5CF6' },
  { icon: Target, text: 'Savings Goal Planning', color: '#10B981' },
  { icon: Shield, text: 'Secure & Private', color: '#06B6D4' },
]

const floatingCards = [
  { label: 'Monthly Savings', value: '₨45,000', change: '+12%', color: '#10B981', icon: '💰', delay: 0 },
  { label: 'AI Score', value: '87/100', change: 'Excellent', color: '#6366F1', icon: '🧠', delay: 1.5 },
  { label: 'Budget Used', value: '68%', change: 'On Track', color: '#F59E0B', icon: '🎯', delay: 3 },
]

export default function LoginPage() {
  const { login, loginWithGoogle, isLoading } = useAuthStore()
  const navigate = useNavigate()
  const [showPass, setShowPass] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      email: '',
      password: '',
    }
  })

  const onSubmit = async (data: any) => {
    try {
      await login(data.email, data.password)
      toast.success('Welcome back! 🎉')
      navigate('/dashboard')
    } catch (err: any) {
      const msg =
        err?.message ||
        err?.response?.data?.detail ||
        err?.response?.data?.non_field_errors?.[0] ||
        'Invalid email or password'
      toast.error(msg, { duration: 5000 })
    }
  }

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle()
      toast.success('Google se login ho gaya! 🎉')
      navigate('/dashboard')
    } catch (err: any) {
      toast.error(err?.message || 'Google login failed. Try again.', { duration: 5000 })
    }
  }

  return (
    <div className="min-h-screen flex overflow-hidden" style={{ background: '#060d18' }}>

      {/* ── Left Panel (hidden on mobile) ── */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative flex-col justify-between p-12 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(135deg, #0a0f1e 0%, #0d1526 40%, #111b35 100%)',
        }} />
        {/* Glow blobs */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/15 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-secondary/12 rounded-full blur-[90px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-accent/8 rounded-full blur-[80px]" />

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.025]" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '28px 28px',
        }} />

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10"
        >
          <Link to="/" className="inline-flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-xl shadow-primary/30">
              <TrendingUp size={20} className="text-white" />
            </div>
            <div>
              <div className="font-bold text-base leading-none">AI Finance Tracker</div>
              <div className="text-[10px] text-white/35 mt-0.5">Smart Money Management</div>
            </div>
          </Link>
        </motion.div>

        {/* Center content */}
        <div className="relative z-10 flex-1 flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <h2 className="text-4xl xl:text-5xl font-black leading-tight mb-4">
              Your AI-Powered
              <br />
              <span className="gradient-text">Finance Dashboard</span>
            </h2>
            <p className="text-white/45 text-base mb-10 max-w-md leading-relaxed">
              Track every rupee, predict future spending, and get personalized savings recommendations — all powered by machine learning.
            </p>

            {/* Feature list */}
            <div className="space-y-3 mb-10">
              {features.map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 + i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: f.color + '20' }}>
                    <f.icon size={14} style={{ color: f.color }} />
                  </div>
                  <span className="text-white/60 text-sm font-medium">{f.text}</span>
                </motion.div>
              ))}
            </div>

            {/* Social proof */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="flex items-center gap-3"
            >
              <div className="flex -space-x-2">
                {['WA', 'MH', 'ZG', 'AR'].map((init, i) => (
                  <div key={i}
                    className="w-7 h-7 rounded-full border-2 flex items-center justify-center text-[9px] font-bold"
                    style={{
                      borderColor: '#060d18',
                      background: ['#6366F1', '#10B981', '#F59E0B', '#EF4444'][i],
                    }}
                  >{init}</div>
                ))}
              </div>
              <p className="text-white/35 text-xs">
                <span className="text-white/60 font-semibold">12,500+</span> users managing finances smarter
              </p>
            </motion.div>
          </motion.div>
        </div>

        {/* Floating stat cards */}
        <div className="relative z-10 flex gap-3 flex-wrap">
          {floatingCards.map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + i * 0.15 }}
              className="glass px-4 py-3 rounded-xl border border-white/8 flex items-center gap-3"
            >
              <span className="text-xl">{card.icon}</span>
              <div>
                <p className="text-[10px] text-white/35">{card.label}</p>
                <p className="text-sm font-bold text-white">{card.value}</p>
              </div>
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md"
                style={{ background: card.color + '20', color: card.color }}>
                {card.change}
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Right Panel (form) ── */}
      <div className="w-full lg:w-1/2 xl:w-[45%] flex items-center justify-center px-5 py-10"
        style={{ background: 'rgba(10,15,28,0.98)' }}>

        {/* Mobile logo */}
        <div className="absolute top-6 left-5 lg:hidden">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
              <TrendingUp size={16} className="text-white" />
            </div>
            <span className="font-bold text-sm">AI Finance</span>
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Heading */}
          <div className="mb-8">
            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-3xl font-black mb-2"
            >
              Welcome back 👋
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-white/45 text-sm"
            >
              Sign in to your account to continue
            </motion.p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
              <label className="label text-xs font-semibold tracking-wide uppercase text-white/40">Email Address</label>
              <input
                type="email"
                className="input mt-1"
                placeholder="you@example.com"
                {...register('email', { required: 'Email is required' })}
                autoComplete="email"
              />
              {errors.email && (
                <p className="text-danger text-xs mt-1.5 flex items-center gap-1">
                  ⚠ {errors.email.message as string}
                </p>
              )}
            </motion.div>

            {/* Password */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <div className="flex items-center justify-between mb-1">
                <label className="label text-xs font-semibold tracking-wide uppercase text-white/40 mb-0">Password</label>
                <Link to="/forgot-password" className="text-xs text-primary hover:text-secondary transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative mt-1">
                <input
                  type={showPass ? 'text' : 'password'}
                  className="input pr-11"
                  placeholder="Enter your password"
                  {...register('password', { required: 'Password is required' })}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
                >
                  {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-danger text-xs mt-1.5">⚠ {errors.password.message as string}</p>
              )}
            </motion.div>

            {/* Submit */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
                style={{
                  background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                  boxShadow: '0 8px 24px rgba(99,102,241,0.35)',
                }}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <LogIn size={17} />
                    Sign In to Dashboard
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </motion.div>
          </form>

          {/* Google Login */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38 }} className="mt-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-white/8" />
              <span className="text-white/25 text-xs font-medium">OR CONTINUE WITH</span>
              <div className="flex-1 h-px bg-white/8" />
            </div>
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-3 transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed border border-white/10 hover:border-white/20"
              style={{ background: 'rgba(255,255,255,0.04)' }}
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                  </svg>
                  <span className="text-white/80">Continue with Google</span>
                </>
              )}
            </button>
          </motion.div>

          {/* Divider */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.42 }}
            className="flex items-center gap-3 my-5"
          >
            <div className="flex-1 h-px bg-white/8" />
            <span className="text-white/25 text-xs">New to AI Finance?</span>
            <div className="flex-1 h-px bg-white/8" />
          </motion.div>

          {/* Register link */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}>
            <Link
              to="/register"
              className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'rgba(248,250,252,0.7)',
              }}
            >
              Create Free Account
            </Link>
          </motion.div>

          {/* Footer */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center text-white/20 text-xs mt-8"
          >
            By signing in, you agree to our{' '}
            <a href="#" className="text-white/35 hover:text-white transition-colors">Terms</a>
            {' & '}
            <a href="#" className="text-white/35 hover:text-white transition-colors">Privacy Policy</a>
          </motion.p>
        </motion.div>
      </div>
    </div>
  )
}
