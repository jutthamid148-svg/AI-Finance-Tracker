import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ThemeState {
  isDark: boolean
  toggle: () => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      isDark: true,
      toggle: () => {
        const next = !get().isDark
        set({ isDark: next })
        document.documentElement.classList.toggle('dark', next)
        document.documentElement.style.background = next ? '#060d18' : '#f1f5f9'
      },
    }),
    { name: 'theme' }
  )
)

export function applyStoredTheme() {
  const stored = localStorage.getItem('theme')
  const isDark = stored ? JSON.parse(stored)?.state?.isDark !== false : true
  document.documentElement.classList.toggle('dark', isDark)
  document.documentElement.style.background = isDark ? '#060d18' : '#f1f5f9'
}
