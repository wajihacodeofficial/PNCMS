import { create } from 'zustand'
import { api } from '@/lib/api'

interface AppState {
  personnel: any[]
  sanctions: any[]
  leaves: any[]
  ranks: any[]
  departments: any[]
  payments: any[]
  dashboardStats: any
  logs: any[]
  disciplinaryActions: any[]
  attendanceLocks: any[]
  settings: any

  // Map of query keys to their loading states
  isLoading: Record<string, boolean>
  setLoading: (key: string, isLoading: boolean) => void

  fetchPersonnel: () => Promise<void>
  fetchSanctions: () => Promise<void>
  fetchLeaves: () => Promise<void>
  fetchRanks: () => Promise<void>
  fetchDepartments: () => Promise<void>
  fetchPayments: () => Promise<void>
  fetchDashboardStats: () => Promise<void>
  fetchLogs: () => Promise<void>
  fetchDisciplinaryActions: () => Promise<void>
  fetchAttendanceLocks: () => Promise<void>
  fetchSettings: () => Promise<void>

  invalidateQueries: (keys: string[]) => Promise<void>
}

export const useStore = create<AppState>((set, get) => ({
  personnel: [],
  sanctions: [],
  leaves: [],
  ranks: [],
  departments: [],
  payments: [],
  dashboardStats: null,
  logs: [],
  disciplinaryActions: [],
  attendanceLocks: [],
  settings: null,

  isLoading: {},
  setLoading: (key, isLoading) => set((state) => ({ isLoading: { ...state.isLoading, [key]: isLoading } })),

  fetchPersonnel: async () => {
    set((state) => ({ isLoading: { ...state.isLoading, personnel: true } }))
    try {
      const data = await api.getPersonnel()
      set({ personnel: data })
    } finally {
      set((state) => ({ isLoading: { ...state.isLoading, personnel: false } }))
    }
  },

  fetchSanctions: async () => {
    set((state) => ({ isLoading: { ...state.isLoading, sanctions: true } }))
    try {
      const data = await api.getSanctions()
      set({ sanctions: data })
    } finally {
      set((state) => ({ isLoading: { ...state.isLoading, sanctions: false } }))
    }
  },

  fetchLeaves: async () => {
    set((state) => ({ isLoading: { ...state.isLoading, leaves: true } }))
    try {
      const data = await api.getLeaves()
      set({ leaves: data })
    } finally {
      set((state) => ({ isLoading: { ...state.isLoading, leaves: false } }))
    }
  },

  fetchRanks: async () => {
    set((state) => ({ isLoading: { ...state.isLoading, ranks: true } }))
    try {
      const data = await api.getRanks()
      set({ ranks: data })
    } finally {
      set((state) => ({ isLoading: { ...state.isLoading, ranks: false } }))
    }
  },

  fetchDepartments: async () => {
    set((state) => ({ isLoading: { ...state.isLoading, departments: true } }))
    try {
      const data = await api.getDepartments()
      set({ departments: data })
    } finally {
      set((state) => ({ isLoading: { ...state.isLoading, departments: false } }))
    }
  },

  fetchPayments: async () => {
    set((state) => ({ isLoading: { ...state.isLoading, payments: true } }))
    try {
      const data = await api.getPayments()
      set({ payments: data })
    } finally {
      set((state) => ({ isLoading: { ...state.isLoading, payments: false } }))
    }
  },

  fetchDashboardStats: async () => {
    set((state) => ({ isLoading: { ...state.isLoading, 'dashboard-stats': true } }))
    try {
      const data = await api.getDashboardStats()
      set({ dashboardStats: data })
    } finally {
      set((state) => ({ isLoading: { ...state.isLoading, 'dashboard-stats': false } }))
    }
  },

  fetchLogs: async () => {
    set((state) => ({ isLoading: { ...state.isLoading, logs: true } }))
    try {
      const data = await api.getLogs()
      set({ logs: data })
    } finally {
      set((state) => ({ isLoading: { ...state.isLoading, logs: false } }))
    }
  },

  fetchDisciplinaryActions: async () => {
    set((state) => ({ isLoading: { ...state.isLoading, 'disciplinary-actions': true } }))
    try {
      const data = await api.getDisciplinaryActions()
      set({ disciplinaryActions: data })
    } finally {
      set((state) => ({ isLoading: { ...state.isLoading, 'disciplinary-actions': false } }))
    }
  },

  fetchAttendanceLocks: async () => {
    set((state) => ({ isLoading: { ...state.isLoading, 'attendance-locks': true } }))
    try {
      const data = await api.getAllMusterLocks()
      set({ attendanceLocks: data })
    } finally {
      set((state) => ({ isLoading: { ...state.isLoading, 'attendance-locks': false } }))
    }
  },

  fetchSettings: async () => {
    set((state) => ({ isLoading: { ...state.isLoading, settings: true } }))
    try {
      const data = await api.getSettings()
      set({ settings: data })
    } finally {
      set((state) => ({ isLoading: { ...state.isLoading, settings: false } }))
    }
  },

  invalidateQueries: async (keys: string[]) => {
    const state = get()
    const promises: Promise<void>[] = []
    
    if (keys.includes('personnel')) promises.push(state.fetchPersonnel())
    if (keys.includes('sanctions')) promises.push(state.fetchSanctions())
    if (keys.includes('leaves')) promises.push(state.fetchLeaves())
    if (keys.includes('ranks')) promises.push(state.fetchRanks())
    if (keys.includes('departments')) promises.push(state.fetchDepartments())
    if (keys.includes('payments')) promises.push(state.fetchPayments())
    if (keys.includes('dashboard-stats')) promises.push(state.fetchDashboardStats())
    if (keys.includes('logs')) promises.push(state.fetchLogs())
    if (keys.includes('disciplinary-actions')) promises.push(state.fetchDisciplinaryActions())
    if (keys.includes('attendance') || keys.includes('attendance-locks') || keys.includes('attendance-lock')) {
       // Note: attendance data for specific dates is handled separately in the hook itself.
       promises.push(state.fetchAttendanceLocks())
    }
    if (keys.includes('settings')) promises.push(state.fetchSettings())

    await Promise.all(promises)
  }
}))
