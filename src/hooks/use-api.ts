import { useEffect, useState, useCallback } from 'react'
import { api } from '@/lib/api'
import { useStore } from '@/store'

// Helper for local queries
function useLocalQuery<T>(queryFn: () => Promise<T>, deps: any[], enabled: boolean = true) {
  const [data, setData] = useState<T | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const refetch = useCallback(async () => {
    if (!enabled) return
    setIsLoading(true)
    setError(null)
    try {
      const res = await queryFn()
      setData(res)
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)))
    } finally {
      setIsLoading(false)
    }
  }, [...deps, enabled])

  useEffect(() => {
    refetch()
  }, [refetch])

  return { data, isLoading, error, refetch }
}

// Global query helper
function useGlobalQuery<T>(
  dataSelector: (state: any) => T,
  loadingKey: string,
  fetchActionName: keyof ReturnType<typeof useStore.getState>
) {
  const rawData = useStore(dataSelector)
  const data = rawData === null ? undefined : rawData
  const isLoading = useStore((state) => state.isLoading[loadingKey] || false)
  const fetchAction = useStore((state) => state[fetchActionName] as () => Promise<void>)

  useEffect(() => {
    fetchAction()
  }, [fetchAction])

  // Global queries surface errors via toast in the store; expose null for API compatibility
  const error: Error | null = null

  return { data, isLoading, error, refetch: fetchAction }
}

// Mutation Helper
function useMutationFacade<TVariables, TData>(
  mutationFn: (vars: TVariables) => Promise<TData>,
  onSuccessGlobal?: (vars: TVariables, data: TData) => void
) {
  const [isPending, setIsPending] = useState(false)

  const mutateAsync = async (vars: TVariables) => {
    setIsPending(true)
    try {
      const res = await mutationFn(vars)
      if (onSuccessGlobal) {
        onSuccessGlobal(vars, res)
      }
      return res
    } finally {
      setIsPending(false)
    }
  }

  const mutate = (vars: TVariables, options?: { onSuccess?: (data: TData, vars: TVariables) => void, onError?: (err: any) => void }) => {
    mutateAsync(vars)
      .then(res => {
        if (options?.onSuccess) options.onSuccess(res, vars)
      })
      .catch(err => {
        if (options?.onError) options.onError(err)
      })
  }

  return { mutate, mutateAsync, isPending }
}

// Queries
export function usePersonnel() {
  return useGlobalQuery(state => state.personnel, 'personnel', 'fetchPersonnel')
}

export function useEmployee(svc: string) {
  return useLocalQuery(() => api.getEmployeeBySvc(svc), [svc], !!svc)
}

export function useSanctions() {
  return useGlobalQuery(state => state.sanctions, 'sanctions', 'fetchSanctions')
}

export function useDisciplinaryActions() {
  return useGlobalQuery(state => state.disciplinaryActions, 'disciplinary-actions', 'fetchDisciplinaryActions')
}

export function useLeaves() {
  // Using an interval to fetch leaves every 5 seconds like before
  const { data, isLoading, refetch } = useGlobalQuery(state => state.leaves, 'leaves', 'fetchLeaves')
  useEffect(() => {
    const interval = setInterval(() => {
      refetch()
    }, 5000)
    return () => clearInterval(interval)
  }, [refetch])
  return { data, isLoading, refetch }
}

export function usePayments() {
  return useGlobalQuery(state => state.payments, 'payments', 'fetchPayments')
}

export function useAttendance(date: string) {
  return useLocalQuery(() => api.getAttendance(date), [date], !!date)
}

export function useAttendanceRange(start: string, end: string) {
  return useLocalQuery(() => api.getAttendanceRange(start, end), [start, end], !!start && !!end)
}

export function useMusterLock(date: string) {
  return useLocalQuery(() => api.getMusterLock(date), [date], !!date)
}

export function useAllMusterLocks() {
  return useGlobalQuery(state => state.attendanceLocks, 'attendance-locks', 'fetchAttendanceLocks')
}

export function useRanks() {
  return useGlobalQuery(state => state.ranks, 'ranks', 'fetchRanks')
}

export function useDepartments() {
  return useGlobalQuery(state => state.departments, 'departments', 'fetchDepartments')
}

export function useSettings() {
  return useGlobalQuery(state => state.settings, 'settings', 'fetchSettings')
}

export function useDashboardStats() {
  return useGlobalQuery(state => state.dashboardStats, 'dashboard-stats', 'fetchDashboardStats')
}

export function useLogs() {
  const { data, isLoading, refetch } = useGlobalQuery(state => state.logs, 'logs', 'fetchLogs')
  useEffect(() => {
    const interval = setInterval(() => {
      refetch()
    }, 5000)
    return () => clearInterval(interval)
  }, [refetch])
  return { data, isLoading, refetch }
}

// Mutations
export function useCreateSanction() {
  const invalidateQueries = useStore(state => state.invalidateQueries)
  return useMutationFacade(api.createSanction, () => {
    invalidateQueries(['sanctions'])
  })
}

export function useUpdateSanction() {
  const invalidateQueries = useStore(state => state.invalidateQueries)
  return useMutationFacade((data: any) => api.updateSanction(data), () => {
    invalidateQueries(['sanctions'])
  })
}

export function useUpsertDisciplinaryAction() {
  const invalidateQueries = useStore(state => state.invalidateQueries)
  return useMutationFacade(api.upsertDisciplinaryAction, () => {
    invalidateQueries(['disciplinary-actions'])
  })
}

export function useCreateLeave() {
  const invalidateQueries = useStore(state => state.invalidateQueries)
  return useMutationFacade(api.createLeave, () => {
    invalidateQueries(['leaves'])
  })
}

export function useDeleteLeave() {
  const invalidateQueries = useStore(state => state.invalidateQueries)
  return useMutationFacade((data: { id: string; username?: string; password?: string }) => 
    api.deleteLeave(data.id, data.username, data.password), 
  () => {
    invalidateQueries(['leaves', 'attendance'])
  })
}

export function useLockMuster() {
  const invalidateQueries = useStore(state => state.invalidateQueries)
  return useMutationFacade(api.lockMuster, () => {
    invalidateQueries(['attendance', 'attendance-locks'])
  })
}

export function useUnlockMuster() {
  const invalidateQueries = useStore(state => state.invalidateQueries)
  return useMutationFacade(api.unlockMuster, () => {
    invalidateQueries(['attendance', 'attendance-locks'])
  })
}

export function useDeleteMuster() {
  const invalidateQueries = useStore(state => state.invalidateQueries)
  return useMutationFacade(api.deleteMuster, () => {
    invalidateQueries(['attendance', 'attendance-locks'])
  })
}

export function useBatchUpdateAttendance() {
  const invalidateQueries = useStore(state => state.invalidateQueries)
  return useMutationFacade(api.batchUpdateAttendance, () => {
    invalidateQueries(['attendance'])
  })
}

export function useUpsertRank() {
  const invalidateQueries = useStore(state => state.invalidateQueries)
  return useMutationFacade(api.upsertRank, () => {
    invalidateQueries(['ranks'])
  })
}

export function useDeleteRank() {
  const invalidateQueries = useStore(state => state.invalidateQueries)
  return useMutationFacade(api.deleteRank, () => {
    invalidateQueries(['ranks'])
  })
}

export function useUpsertDepartment() {
  const invalidateQueries = useStore(state => state.invalidateQueries)
  return useMutationFacade(api.upsertDepartment, () => {
    invalidateQueries(['departments'])
  })
}

export function useDeleteDepartment() {
  const invalidateQueries = useStore(state => state.invalidateQueries)
  return useMutationFacade(api.deleteDepartment, () => {
    invalidateQueries(['departments'])
  })
}

export function useUpsertEmployee() {
  const invalidateQueries = useStore(state => state.invalidateQueries)
  return useMutationFacade(api.upsertEmployee, () => {
    invalidateQueries(['personnel'])
  })
}

export function useDeleteEmployee() {
  const invalidateQueries = useStore(state => state.invalidateQueries)
  return useMutationFacade(api.deleteEmployee, () => {
    invalidateQueries(['personnel'])
  })
}

export function useUpsertSetting() {
  const invalidateQueries = useStore(state => state.invalidateQueries)
  return useMutationFacade((data: { key: string; value: string }) => api.upsertSetting(data), () => {
    invalidateQueries(['settings'])
  })
}

export function useCreateLog() {
  const invalidateQueries = useStore(state => state.invalidateQueries)
  return useMutationFacade((data: any) => api.createLog(data), () => {
    invalidateQueries(['logs'])
  })
}

export function useExportBackup() {
  return useMutationFacade(api.exportBackup)
}

export function useImportBackup() {
  return useMutationFacade(api.importBackup)
}

export function useRealtimeSync() {
  const invalidateQueries = useStore(state => state.invalidateQueries)

  useEffect(() => {
    const ipc = (window as any).ipcRenderer
    if (!ipc) return

    const listener = (_: any, topic: string) => {
      invalidateQueries([topic])
      
      if (['personnel', 'sanctions', 'attendance'].includes(topic)) {
        invalidateQueries(['dashboard-stats'])
      }
    }

    ipc.on('db-changed', listener)
    return () => {
      ipc.off('db-changed', listener)
    }
  }, [invalidateQueries])
}
