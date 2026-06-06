import { motion } from 'framer-motion'
import { AlertTriangle, RefreshCw, WifiOff, ServerCrash } from 'lucide-react'

interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
  type?: 'network' | 'server' | 'generic'
}

export default function ErrorState({
  title,
  message,
  onRetry,
  type = 'generic',
}: ErrorStateProps) {
  const config = {
    network: {
      icon: WifiOff,
      defaultTitle: 'No Connection',
      defaultMsg: 'Cannot reach the server. Check your internet connection or the backend may be starting up (this can take ~30 seconds on free tier).',
      color: 'text-warning',
      bg: 'rgba(234,179,8,0.08)',
      border: 'border-warning/20',
    },
    server: {
      icon: ServerCrash,
      defaultTitle: 'Server Error',
      defaultMsg: 'The server returned an error. Please try again in a moment.',
      color: 'text-danger',
      bg: 'rgba(239,68,68,0.08)',
      border: 'border-danger/20',
    },
    generic: {
      icon: AlertTriangle,
      defaultTitle: 'Something went wrong',
      defaultMsg: 'An unexpected error occurred. Please try again.',
      color: 'text-primary',
      bg: 'rgba(99,102,241,0.08)',
      border: 'border-primary/20',
    },
  }[type]

  const Icon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border ${config.border} p-8 text-center`}
      style={{ background: config.bg }}
    >
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className={`w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center`}
        style={{ background: 'rgba(255,255,255,0.05)' }}
      >
        <Icon size={26} className={config.color} />
      </motion.div>

      <h3 className="font-bold text-base mb-2">{title || config.defaultTitle}</h3>
      <p className="text-white/40 text-sm max-w-sm mx-auto leading-relaxed mb-6">
        {message || config.defaultMsg}
      </p>

      {onRetry && (
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
          style={{ background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', boxShadow: '0 4px 14px rgba(99,102,241,0.35)' }}
        >
          <RefreshCw size={14} /> Try Again
        </motion.button>
      )}
    </motion.div>
  )
}
