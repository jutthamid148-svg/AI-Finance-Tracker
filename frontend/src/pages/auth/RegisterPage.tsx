import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import {
  Eye, EyeOff, TrendingUp, UserPlus,
  Check, ArrowRight, Sparkles,
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'

const steps = [
  { label: 'Track Expenses', desc: 'Add, edit, delete with categories', emoji: '📊' },
  { label: 'Set Budgets', desc: 'Monthly limits with alerts', emoji: '💰' },
  { label: 'AI Insights', desc: 'ML-powered spending analysis', emoji: '🧠' },
  { label: 'Predict Future', desc: 'Linear regression forecasts', emoji: '🔮' },
  { label: 'Export Reports', desc: 'PDF & Excel downloads', emoji: '📄' },
]

export default function RegisterPage() {
  const { register: registerUser, loginWithGoogle, isLoading } = useAuthStore()
  const navigate = useNavigate()
  const [showPass, setShowPass] = useState(false)
  const { register, handleSubmit, watch, formState: { errors } } = useForm()
  const password = watch('password')

  const onSubmit = async (data: any) => {
    try {
      await registerUser(data)
      toast.success('Account created! Welcome to AI Finance Tracker 🎉')
      navigate('/dashboard')
    } catch (err: any) {
      const d = err?.response?.data
      const msg = d
        ? (typeof d === 'object'
            ? (Object.values(d).flat()[0] as string)
            : String(d))
        : (err?.message || 'Registration failed')
      toast.error(msg, { duration: 5000 })
    }
  }

  const handleGoogleSignup = async () => {
    try {
      await loginWithGoogle()
      toast.success('Google se account ban gaya! 🎉')
      navigate('/dashboard')
    } catch (err: any) {
      toast.error(err?.message || 'Google signup failed. Try again.', { duration: 5000 })
    }
  }

  return (
    <div className="min-h-screen flex overflow-hidden" style={{ background: '#060d18' }}>

      {/* ── Left Panel ── */}
      <div className="hidden lg:flex lg:w-[42%] xl:w-[40%] relative flex-col p-12 overflow-hidden">
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(135deg, #0a0f1e 0%, #0d1526 50%, #111b35 100%)',
        }} />
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-success/12 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-primary/12 rounded-full blur-[90px]" />
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '28px 28px',
        }} />

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative z-10 mb-auto"
        >
          <Link to="/" className="inline-flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-xl shadow-primary/30">
              <TrendingUp size={20} className="text-white" />
            </div>
            <div>
              <div className="font-bold text-base leading-none">AI Finance Tracker</div>
              <div className="text-[10px] text-white/35 mt-0.5">FYP — Riphah University</div>
            </div>
          </Link>
        </motion.div>

        {/* Center */}
        <div className="relative z-10 flex-1 flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={16} className="text-primary" />
              <span className="text-primary text-xs font-semibold tracking-wide uppercase">Free Forever</span>
            </div>
            <h2 className="text-3xl xl:text-4xl font-black leading-tight mb-4">
              Everything you need to
              <br />
              <span className="gradient-text">master your money</span>
            </h2>
            <p className="text-white/40 text-sm mb-8 leading-relaxed">
              Join thousands of Pakistanis who track smarter, save more, and achieve their financial goals with AI.
            </p>

            {/* Feature steps */}
            <div className="space-y-3">
              {steps.map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 + i * 0.08 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-xl glass border border-white/8 flex items-center justify-center text-sm flex-shrink-0">
                    {s.emoji}
                  </div>
                  <div>
                    <p className="text-white/75 text-sm font-medium leading-none">{s.label}</p>
                    <p className="text-white/30 text-xs mt-0.5">{s.desc}</p>
                  </div>
                  <Check size={13} className="text-success ml-auto flex-shrink-0" />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Bottom badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="relative z-10 glass px-4 py-3 rounded-xl border border-white/8 flex items-center gap-3"
        >
          <div className="w-8 h-8 bg-success/20 rounded-lg flex items-center justify-center">
            <Check size={14} className="text-success" />
          </div>
          <div>
            <p className="text-white/60 text-xs font-medium">100% Free · No Credit Card</p>
            <p className="text-white/30 text-[10px]">Secure with JWT + bcrypt encryption</p>
          </div>
        </motion.div>
      </div>

      {/* ── Right Panel (form) ── */}
      <div className="w-full lg:w-[58%] xl:w-[60%] flex items-center justify-center px-5 py-10"
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
          className="w-full max-w-lg"
        >
          <div className="mb-7">
            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-3xl font-black mb-2"
            >
              Create your account ✨
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-white/40 text-sm"
            >
              Start tracking smarter today — completely free!
            </motion.p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            {/* Name row */}
            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}
              className="grid grid-cols-2 gap-3"
            >
              <div>
                <label className="label text-xs font-semibold uppercase tracking-wide text-white/40">First Name</label>
                <input className="input mt-1" placeholder="Muhammad"
                  {...register('first_name', { required: 'Required' })} />
                {errors.first_name && <p className="text-danger text-xs mt-1">⚠ {errors.first_name.message as string}</p>}
              </div>
              <div>
                <label className="label text-xs font-semibold uppercase tracking-wide text-white/40">Last Name</label>
                <input className="input mt-1" placeholder="Hamid"
                  {...register('last_name', { required: 'Required' })} />
                {errors.last_name && <p className="text-danger text-xs mt-1">⚠ {errors.last_name.message as string}</p>}
              </div>
            </motion.div>

            {/* Email */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.27 }}>
              <label className="label text-xs font-semibold uppercase tracking-wide text-white/40">Email Address</label>
              <input type="email" className="input mt-1" placeholder="you@example.com"
                {...register('email', { required: 'Email is required' })} autoComplete="email" />
              {errors.email && <p className="text-danger text-xs mt-1">⚠ {errors.email.message as string}</p>}
            </motion.div>

            {/* Phone */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.31 }}>
              <label className="label text-xs font-semibold uppercase tracking-wide text-white/40">
                Phone <span className="text-white/20 normal-case font-normal">(optional)</span>
              </label>
              <input className="input mt-1" placeholder="03XX-XXXXXXX" {...register('phone')} />
            </motion.div>

            {/* Password */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
              <label className="label text-xs font-semibold uppercase tracking-wide text-white/40">Password</label>
              <div className="relative mt-1">
                <input
                  type={showPass ? 'text' : 'password'}
                  className="input pr-11"
                  placeholder="Min 8 characters"
                  {...register('password', {
                    required: 'Password required',
                    minLength: { value: 8, message: 'Min 8 characters' },
                  })}
                  autoComplete="new-password"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors">
                  {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {errors.password && <p className="text-danger text-xs mt-1">⚠ {errors.password.message as string}</p>}
            </motion.div>

            {/* Confirm Password */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.39 }}>
              <label className="label text-xs font-semibold uppercase tracking-wide text-white/40">Confirm Password</label>
              <input
                type="password"
                className="input mt-1"
                placeholder="Re-enter password"
                {...register('password2', {
                  required: 'Please confirm password',
                  validate: v => v === password || 'Passwords do not match',
                })}
                autoComplete="new-password"
              />
              {errors.password2 && <p className="text-danger text-xs mt-1">⚠ {errors.password2.message as string}</p>}
            </motion.div>

            {/* Submit */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.43 }}
              className="pt-1">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
                style={{
                  background: 'linear-gradient(135deg, #10B981, #059669)',
                  boxShadow: '0 8px 24px rgba(16,185,129,0.3)',
                }}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <UserPlus size={17} />
                    Create Free Account
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </motion.div>
          </form>

          {/* Google Signup */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.46 }} className="mt-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-white/8" />
              <span className="text-white/25 text-xs font-medium">OR SIGN UP WITH</span>
              <div className="flex-1 h-px bg-white/8" />
            </div>
            <button
              type="button"
              onClick={handleGoogleSignup}
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
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            className="flex items-center gap-3 my-5"
          >
            <div className="flex-1 h-px bg-white/8" />
            <span className="text-white/25 text-xs">Already have an account?</span>
            <div className="flex-1 h-px bg-white/8" />
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.52 }}>
            <Link
              to="/login"
              className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'rgba(248,250,252,0.65)',
              }}
            >
              Sign In Instead
            </Link>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}
            className="text-center text-white/20 text-xs mt-6"
          >
            By creating an account you agree to our{' '}
            <a href="#" className="text-white/35 hover:text-white transition-colors">Terms</a>
            {' & '}
            <a href="#" className="text-white/35 hover:text-white transition-colors">Privacy Policy</a>
          </motion.p>
        </motion.div>
      </div>
    </div>
  )
}
