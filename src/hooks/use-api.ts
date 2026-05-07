import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

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

export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const data = await api.getSettings();
      const settings: Record<string, string> = {};
      data.forEach((s: any) => {
        settings[s.key] = s.value;
      });
      return settings;
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
    refetchInterval: 30000, // auto-refresh every 30s
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
