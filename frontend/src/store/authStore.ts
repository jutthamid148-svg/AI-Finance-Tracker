import { create } from 'zustand'
import { authAPI } from '../services/api'

interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  full_name: string
  avatar?: string
  phone?: string
  currency: string
  is_verified: boolean
  is_staff: boolean
  created_at?: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: any) => Promise<void>
  logout: () => void
  loadUser: () => Promise<void>
  updateUser: (user: User) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: !!localStorage.getItem('access_token'),
  isLoading: false,

  login: async (email: string, password: string) => {
    set({ isLoading: true })
    try {
      const { data } = await authAPI.login({ email, password })
      localStorage.setItem('access_token', data.access)
      localStorage.setItem('refresh_token', data.refresh)
      set({ user: data.user, isAuthenticated: true, isLoading: false })
    } catch (err) {
      set({ isLoading: false })   // always reset — yahi bug tha
      throw err
    }
  },

  register: async (formData: any) => {
    set({ isLoading: true })
    try {
      const { data } = await authAPI.register(formData)
      localStorage.setItem('access_token', data.tokens.access)
      localStorage.setItem('refresh_token', data.tokens.refresh)
      set({ user: data.user, isAuthenticated: true, isLoading: false })
    } catch (err) {
      set({ isLoading: false })   // always reset
      throw err
    }
  },

  logout: () => {
    const refresh = localStorage.getItem('refresh_token')
    if (refresh) authAPI.logout(refresh).catch(() => {})
    localStorage.clear()
    set({ user: null, isAuthenticated: false, isLoading: false })
  },

  loadUser: async () => {
    if (!localStorage.getItem('access_token')) return
    try {
      const { data } = await authAPI.profile()
      set({ user: data, isAuthenticated: true })
    } catch {
      localStorage.clear()
      set({ user: null, isAuthenticated: false })
    }
  },

  updateUser: (user: User) => set({ user }),
}))
