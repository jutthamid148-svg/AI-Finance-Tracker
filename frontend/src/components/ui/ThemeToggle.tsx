import { motion, AnimatePresence } from 'framer-motion'
import { Sun, Moon } from 'lucide-react'
import { useThemeStore } from '../../store/themeStore'

export default function ThemeToggle({ size = 'md' }: { size?: 'sm' | 'md' }) {
  const { isDark, toggle } = useThemeStore()
  const s = size === 'sm' ? 'w-8 h-8' : 'w-9 h-9'
  const iconSize = size === 'sm' ? 14 : 16

  return (
    <motion.button
      onClick={toggle}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.92 }}
      className={`${s} rounded-xl glass border border-white/10 flex items-center justify-center transition-all hover:border-primary/30`}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      <AnimatePresence mode="wait">
        {isDark ? (
          <motion.div key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.18 }}>
            <Sun size={iconSize} className="text-warning" />
          </motion.div>
        ) : (
          <motion.div key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.18 }}>
            <Moon size={iconSize} className="text-primary" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  )
}
