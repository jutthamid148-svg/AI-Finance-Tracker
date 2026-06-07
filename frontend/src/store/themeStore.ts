import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ThemeState {
  isDark: boolean
  toggle: () => void
}

function applyTheme(isDark: boolean) {
  document.documentElement.classList.toggle('dark', isDark)
  document.documentElement.style.background = isDark ? '#070e1a' : '#f1f5f9'
  document.body.style.background = isDark ? '#070e1a' : '#f1f5f9'
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      isDark: true,
      toggle: () => {
        const next = !get().isDark
        set({ isDark: next })
        applyTheme(next)
      },
    }),
    { name: 'theme' }
  )
)

export function applyStoredTheme() {
  const stored = localStorage.getItem('theme')
  const isDark = stored ? JSON.parse(stored)?.state?.isDark !== false : true
  applyTheme(isDark)
}
