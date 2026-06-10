import { create } from 'zustand'
import api, { authAPI } from '../services/api'
import { googleSignIn, firebaseSignOut } from '../services/firebase'
import { queryClient } from '../queryClient'

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
  is_pro: boolean
  is_active?: boolean
  pro_since?: string
  created_at?: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: any) => Promise<void>
  loginWithGoogle: () => Promise<void>
  logout: () => void
  loadUser: () => Promise<void>
  updateUser: (user: User) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: !!localStorage.getItem('access_token'),
  isLoading: false,

  login: async (email, password) => {
    set({ isLoading: true })
    try {
      const { data } = await authAPI.login({ email, password })
      queryClient.clear()
      localStorage.setItem('access_token', data.access)
      localStorage.setItem('refresh_token', data.refresh)
      set({ user: data.user, isAuthenticated: true, isLoading: false })
    } catch (err) {
      set({ isLoading: false })
      throw err
    }
  },

  register: async (formData) => {
    set({ isLoading: true })
    try {
      const { data } = await authAPI.register(formData)
      queryClient.clear()
      localStorage.setItem('access_token', data.tokens.access)
      localStorage.setItem('refresh_token', data.tokens.refresh)
      set({ user: data.user, isAuthenticated: true, isLoading: false })
    } catch (err) {
      set({ isLoading: false })
      throw err
    }
  },

  loginWithGoogle: async () => {
    set({ isLoading: true })
    try {
      const { idToken, displayName, photoURL } = await googleSignIn()
      const { data } = await api.post('/auth/google/', {
        id_token: idToken,
        display_name: displayName,
        photo_url: photoURL,
      })
      queryClient.clear()
      localStorage.setItem('access_token', data.tokens.access)
      localStorage.setItem('refresh_token', data.tokens.refresh)
      set({ user: data.user, isAuthenticated: true, isLoading: false })
    } catch (err) {
      set({ isLoading: false })
      throw err
    }
  },

  logout: () => {
    const refresh = localStorage.getItem('refresh_token')
    if (refresh) authAPI.logout(refresh).catch(() => {})
    firebaseSignOut().catch(() => {})
    queryClient.clear()
    localStorage.clear()
    set({ user: null, isAuthenticated: false, isLoading: false })
  },

  loadUser: async () => {
    if (!localStorage.getItem('access_token')) return
    set({ isLoading: true })
    try {
      const { data } = await authAPI.profile()
      set({ user: data, isAuthenticated: true, isLoading: false })
    } catch {
      localStorage.clear()
      set({ user: null, isAuthenticated: false, isLoading: false })
    }
  },

  updateUser: (user) => set({ user }),
}))
