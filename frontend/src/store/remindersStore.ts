import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface BillReminder {
  id: string
  name: string
  amount: number
  dueDay: number       // 1–28
  category: string
  color: string
  active: boolean
  createdAt: string
}

interface RemindersState {
  reminders: BillReminder[]
  add:    (r: Omit<BillReminder, 'id' | 'createdAt'>) => void
  update: (id: string, r: Partial<BillReminder>) => void
  remove: (id: string) => void
  toggle: (id: string) => void
}

export const REMINDER_CATEGORIES = [
  { value: 'electricity', label: '⚡ Electricity',  color: '#F59E0B' },
  { value: 'gas',         label: '🔥 Gas',          color: '#F97316' },
  { value: 'water',       label: '💧 Water',         color: '#06B6D4' },
  { value: 'internet',    label: '🌐 Internet',      color: '#6366F1' },
  { value: 'rent',        label: '🏠 Rent',          color: '#EF4444' },
  { value: 'phone',       label: '📱 Phone Bill',    color: '#8B5CF6' },
  { value: 'insurance',   label: '🛡️ Insurance',    color: '#10B981' },
  { value: 'loan',        label: '🏦 Loan/EMI',      color: '#EC4899' },
  { value: 'subscription',label: '📺 Subscription',  color: '#3B82F6' },
  { value: 'other',       label: '📄 Other',         color: '#64748B' },
]

export function getDaysUntilDue(dueDay: number): number {
  const today = new Date()
  const thisMonth = new Date(today.getFullYear(), today.getMonth(), dueDay)
  if (thisMonth <= today) {
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, dueDay)
    return Math.ceil((nextMonth.getTime() - today.getTime()) / 86400000)
  }
  return Math.ceil((thisMonth.getTime() - today.getTime()) / 86400000)
}

export function getDueStatus(dueDay: number): 'overdue' | 'today' | 'soon' | 'upcoming' {
  const days = getDaysUntilDue(dueDay)
  if (days === 0) return 'today'
  if (days <= 3) return 'soon'
  if (days <= 7) return 'upcoming'
  return 'upcoming'
}

export const useRemindersStore = create<RemindersState>()(
  persist(
    (set) => ({
      reminders: [],
      add: (r) => set((s) => ({
        reminders: [...s.reminders, {
          ...r,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
        }],
      })),
      update: (id, r) => set((s) => ({
        reminders: s.reminders.map((x) => x.id === id ? { ...x, ...r } : x),
      })),
      remove: (id) => set((s) => ({
        reminders: s.reminders.filter((x) => x.id !== id),
      })),
      toggle: (id) => set((s) => ({
        reminders: s.reminders.map((x) => x.id === id ? { ...x, active: !x.active } : x),
      })),
    }),
    { name: 'bill-reminders' }
  )
)
