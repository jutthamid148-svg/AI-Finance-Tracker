import { create } from 'zustand'
import { authAPI } from '../services/api'
import { googleSignIn, firebaseSignOut } from '../services/firebase'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

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
      const { data } = await axios.post(`${API_BASE}/auth/google/`, {
        id_token: idToken,
        display_name: displayName,
        photo_url: photoURL,
      })
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
