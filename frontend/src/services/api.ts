import axios from 'axios'

const rawApiUrl = import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? 'http://localhost:8000/api' : 'https://backend-jade-eight-14.vercel.app/api')

const API_BASE_URL = rawApiUrl.replace(/^\uFEFF/, '').trim()

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,   // 30s — Vercel cold start ke liye
})

// Single in-flight refresh promise — prevents N concurrent 401s from spawning N refresh calls
let _refreshPromise: Promise<string> | null = null

// Request interceptor — attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor — token refresh + clear error messages
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Network / timeout error — server se response nahi aaya
    if (!error.response) {
      const networkErr = new Error(
        error.code === 'ECONNABORTED'
          ? 'Server is starting up, please try again in a moment.'
          : 'Unable to connect to server. Check your internet connection.'
      )
      return Promise.reject(networkErr)
    }

    // 401 — token expired, try refresh (with in-flight dedup lock)
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      const refreshToken = localStorage.getItem('refresh_token')

      if (refreshToken) {
        try {
          if (!_refreshPromise) {
            _refreshPromise = axios.post(
              `${API_BASE_URL}/auth/token/refresh/`,
              { refresh: refreshToken },
              { timeout: 15000 }
            ).then(r => r.data.access).finally(() => { _refreshPromise = null })
          }
          const newAccessToken = await _refreshPromise
          localStorage.setItem('access_token', newAccessToken)
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
          return api(originalRequest)
        } catch {
          _refreshPromise = null
          localStorage.clear()
          window.location.href = '/login'
        }
      } else {
        localStorage.clear()
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
)

// Auth endpoints
export const authAPI = {
  register: (data: any) => api.post('/auth/register/', data),
  login: (data: any) => api.post('/auth/login/', data),
  logout: (refresh: string) => api.post('/auth/logout/', { refresh }),
  profile: () => api.get('/auth/profile/'),
  updateProfile: (data: any) => api.patch('/auth/profile/', data),
  changePassword: (data: any) => api.post('/auth/change-password/', data),
  forgotPassword: (email: string) => api.post('/auth/forgot-password/', { email }),
  resetPassword: (data: any) => api.post('/auth/reset-password/', data),
  verifyEmail: (token: string) => api.post('/auth/verify-email/', { token }),
  dashboardStats: () => api.get('/auth/dashboard/stats/'),
  resetData: () => api.post('/auth/reset-data/', { confirm: 'RESET' }),
  notifications: () => api.get('/auth/notifications/'),
  markAllRead: () => api.post('/auth/notifications/mark-read/'),
  markOneRead: (id: string) => api.post(`/auth/notifications/${id}/mark-read/`),
}

// Transaction endpoints
export const transactionAPI = {
  incomeList: (params?: any) => api.get('/transactions/income/', { params }),
  addIncome: (data: any) => api.post('/transactions/income/', data),
  updateIncome: (id: string, data: any) => api.put(`/transactions/income/${id}/`, data),
  deleteIncome: (id: string) => api.delete(`/transactions/income/${id}/`),

  expenseList: (params?: any) => api.get('/transactions/expenses/', { params }),
  addExpense: (data: any) => api.post('/transactions/expenses/', data),
  updateExpense: (id: string, data: any) => api.put(`/transactions/expenses/${id}/`, data),
  deleteExpense: (id: string) => api.delete(`/transactions/expenses/${id}/`),

  monthlyChart: () => api.get('/transactions/charts/monthly/'),
  categoryChart: (params?: any) => api.get('/transactions/charts/categories/', { params }),
}

// Budget endpoints
export const budgetAPI = {
  list: (params?: any) => api.get('/budgets/', { params }),
  create: (data: any) => api.post('/budgets/', data),
  update: (id: string, data: any) => api.put(`/budgets/${id}/`, data),
  delete: (id: string) => api.delete(`/budgets/${id}/`),
  summary: (params?: any) => api.get('/budgets/summary/', { params }),
}

// Savings endpoints
export const savingsAPI = {
  list: () => api.get('/savings/'),
  create: (data: any) => api.post('/savings/', data),
  update: (id: string, data: any) => api.put(`/savings/${id}/`, data),
  delete: (id: string) => api.delete(`/savings/${id}/`),
  addAmount: (id: string, amount: number) => api.post(`/savings/${id}/add/`, { amount }),
}

// AI endpoints
export const aiAPI = {
  insights: () => api.get('/ai/insights/'),
  spendingAnalysis: () => api.get('/ai/spending-analysis/'),
  overspending: () => api.get('/ai/overspending/'),
  recommendations: () => api.get('/ai/recommendations/'),
  predictions: () => api.get('/ai/predictions/'),
  chat: (message: string) => api.post('/ai/chat/', { message }),
}

// Reports endpoints
export const reportAPI = {
  monthly: (params?: any) => api.get('/reports/monthly/', { params }),
  exportPDF: (params?: any) =>
    api.get('/reports/export/pdf/', { params, responseType: 'blob' }),
  exportExcel: (params?: any) =>
    api.get('/reports/export/excel/', { params, responseType: 'blob' }),
}

// Admin endpoints (staff only)
export const adminAPI = {
  stats: () => api.get('/auth/admin/stats/'),
  users: (params?: any) => api.get('/auth/admin/users/', { params }),
  toggleActive: (userId: string) => api.post(`/auth/admin/users/${userId}/toggle-active/`),
  verifyUser:   (userId: string) => api.post(`/auth/admin/users/${userId}/verify/`),
  togglePro:    (userId: string) => api.post(`/auth/admin/users/${userId}/toggle-pro/`),
}

export default api
