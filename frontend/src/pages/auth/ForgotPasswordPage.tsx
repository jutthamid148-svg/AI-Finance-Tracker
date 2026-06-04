import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { TrendingUp, Mail, ArrowLeft } from 'lucide-react'
import { authAPI } from '../../services/api'

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async (data: any) => {
    setLoading(true)
    try {
      await authAPI.forgotPassword(data.email)
      setSent(true)
      toast.success('Reset link sent to your email!')
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-animated flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
              <TrendingUp size={20} className="text-white" />
            </div>
            <span className="font-bold text-xl">AI Finance Tracker</span>
          </Link>
          <h1 className="text-3xl font-bold mb-2">Reset Password</h1>
          <p className="text-white/50">We'll send a reset link to your email</p>
        </div>

        <div className="card">
          {sent ? (
            <div className="text-center py-4">
              <div className="text-5xl mb-4">📧</div>
              <h2 className="text-xl font-bold mb-2">Check your inbox!</h2>
              <p className="text-white/60 text-sm mb-6">If your email exists in our system, you'll receive a password reset link shortly.</p>
              <Link to="/login" className="btn-primary w-full flex items-center justify-center gap-2">
                <ArrowLeft size={18} /> Back to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="label">Email Address</label>
                <input
                  type="email"
                  className="input"
                  placeholder="you@example.com"
                  {...register('email', { required: 'Email is required' })}
                />
                {errors.email && <p className="text-danger text-xs mt-1">{errors.email.message as string}</p>}
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                {loading ? <div className="spinner w-5 h-5 border-2" /> : <><Mail size={18} /> Send Reset Link</>}
              </button>
              <Link to="/login" className="flex items-center justify-center gap-2 text-sm text-white/50 hover:text-white transition-colors mt-2">
                <ArrowLeft size={14} /> Back to Login
              </Link>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  )
}
