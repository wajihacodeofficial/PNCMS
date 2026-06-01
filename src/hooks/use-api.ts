import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useEffect } from 'react'

export function usePersonnel() {
  return useQuery({
    queryKey: ['personnel'],
    queryFn: api.getPersonnel,
  })
}

export function useEmployee(svc: string) {
  return useQuery({
    queryKey: ['employee', svc],
    queryFn: () => api.getEmployeeBySvc(svc),
    enabled: !!svc,
  })
}

export function useSanctions() {
  return useQuery({
    queryKey: ['sanctions'],
    queryFn: api.getSanctions,
  })
}

export function useCreateSanction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.createSanction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sanctions'] })
    },
  })
}

export function useUpdateSanction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => api.updateSanction(data), // Fixed: was incorrectly calling createSanction
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sanctions'] })
    },
  })
}

export function useDisciplinaryActions() {
  return useQuery({
    queryKey: ['disciplinary-actions'],
    queryFn: api.getDisciplinaryActions,
  })
}

export function useUpsertDisciplinaryAction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.upsertDisciplinaryAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['disciplinary-actions'] })
    },
  })
}

export function useLeaves() {
  return useQuery({
    queryKey: ['leaves'],
    queryFn: api.getLeaves,
    refetchInterval: 5000, // refresh every 5 seconds for up‑to‑date on‑leave list
  })
}
export function useCreateLeave() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.createLeave,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaves'] })
    },
  })
}

export function usePayments() {
  return useQuery({
    queryKey: ['payments'],
    queryFn: api.getPayments,
  })
}

export function useAttendance(date: string) {
  return useQuery({
    queryKey: ['attendance', date],
    queryFn: () => api.getAttendance(date),
  })
}
export function useAttendanceRange(start: string, end: string) {
  return useQuery({
    queryKey: ['attendance', 'range', start, end],
    queryFn: () => api.getAttendanceRange(start, end),
    enabled: !!start && !!end
  })
}

export function useMusterLock(date: string) {
  return useQuery({
    queryKey: ['attendance', 'lock', date],
    queryFn: () => api.getMusterLock(date),
    enabled: !!date
  })
}

export function useAllMusterLocks() {
  return useQuery({
    queryKey: ['attendance', 'locks'],
    queryFn: api.getAllMusterLocks,
  })
}

export function useLockMuster() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.lockMuster,
    onSuccess: (_, { date }) => {
      queryClient.invalidateQueries({ queryKey: ['attendance', 'lock', date] })
      queryClient.invalidateQueries({ queryKey: ['attendance', 'locks'] })
    }
  })
}

export function useUnlockMuster() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.unlockMuster,
    onSuccess: (_, { date }) => {
      queryClient.invalidateQueries({ queryKey: ['attendance', 'lock', date] })
      queryClient.invalidateQueries({ queryKey: ['attendance', 'locks'] })
    }
  })
}

export function useDeleteMuster() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.deleteMuster,
    onSuccess: (_, { date }) => {
      queryClient.invalidateQueries({ queryKey: ['attendance', date] })
      queryClient.invalidateQueries({ queryKey: ['attendance', 'lock', date] })
      queryClient.invalidateQueries({ queryKey: ['attendance', 'locks'] })
    }
  })
}

export function useBatchUpdateAttendance() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.batchUpdateAttendance,
    onSuccess: (_, { date }) => {
      queryClient.invalidateQueries({ queryKey: ['attendance', date] })
    }
  })
}

export function useRanks() {
  return useQuery({
    queryKey: ['ranks'],
    queryFn: api.getRanks,
  })
}

export function useUpsertRank() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.upsertRank,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ranks'] })
    },
  })
}

export function useDeleteRank() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.deleteRank,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ranks'] })
    },
  })
}

export function useDepartments() {
  return useQuery({
    queryKey: ['departments'],
    queryFn: api.getDepartments,
  })
}

export function useUpsertDepartment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.upsertDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] })
    },
  })
}

export function useDeleteDepartment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.deleteDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] })
    },
  })
}

export function useUpsertEmployee() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.upsertEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personnel'] })
    },
  })
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.deleteEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personnel'] })
    },
  })
}

export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      return await api.getSettings();
    },
  })
}

export function useUpsertSetting() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { key: string; value: string }) => api.upsertSetting(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] })
    },
  })
}
export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: api.getDashboardStats,
  })
}

export function useLogs() {
  return useQuery({
    queryKey: ['logs'],
    queryFn: api.getLogs,
    refetchInterval: 5000, // Reduced to 5s for better realtime feel
  })
}

export function useExportBackup() {
  return useMutation({
    mutationFn: api.exportBackup,
  })
}

export function useImportBackup() {
  return useMutation({
    mutationFn: api.importBackup,
  })
}

export function useCreateLog() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => api.createLog(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['logs'] })
    },
  })
}

export function useRealtimeSync() {
  const queryClient = useQueryClient()

  useEffect(() => {
    const ipc = (window as any).ipcRenderer
    if (!ipc) return

    const listener = (_: any, topic: string) => {
      queryClient.invalidateQueries({ queryKey: [topic] })
      
      // Invalidate dashboard stats if personnel, sanctions or attendance change
      if (['personnel', 'sanctions', 'attendance'].includes(topic)) {
        queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      }
    }

    ipc.on('db-changed', listener)
    return () => {
      ipc.off('db-changed', listener)
    }
  }, [queryClient])
}
