/* eslint-disable @typescript-eslint/no-explicit-any */
const { ipcRenderer } = (window as any)

export const api = {
  // Personnel
  getPersonnel: () => ipcRenderer.invoke('get-personnel'),
  getEmployeeBySvc: (svc: string) => ipcRenderer.invoke('get-employee-by-svc', svc),
  upsertEmployee: (data: any) => ipcRenderer.invoke('upsert-employee', data),
  deleteEmployee: (id: string) => ipcRenderer.invoke('delete-employee', id),

  // Sanctions
  getSanctions: () => ipcRenderer.invoke('get-sanctions'),
  createSanction: (data: any) => ipcRenderer.invoke('create-sanction', data),
  updateSanction: (data: any) => ipcRenderer.invoke('update-sanction', data),

  // Discipline
  getDisciplinaryActions: () => ipcRenderer.invoke('get-disciplinary-actions'),
  upsertDisciplinaryAction: (data: any) => ipcRenderer.invoke('upsert-disciplinary-action', data),

  // Leaves
  getLeaves: () => ipcRenderer.invoke('get-leaves'),
  createLeave: (data: any) => ipcRenderer.invoke('create-leave', data),

  // Payments
  getPayments: () => ipcRenderer.invoke('get-payments'),

  // Attendance
  getAttendance: (date: string) => ipcRenderer.invoke('get-attendance', date),
  getAttendanceRange: (start: string, end: string) => ipcRenderer.invoke('get-attendance-range', { start, end }),
  updateAttendance: (date: string, employeeId: string, status: string, overridePassword?: string) => 
    ipcRenderer.invoke('update-attendance', { date, employeeId, status, overridePassword }),
  getMusterLock: (date: string) => ipcRenderer.invoke('get-muster-lock', date),
  getAllMusterLocks: () => ipcRenderer.invoke('get-all-muster-locks'),
  lockMuster: (data: { date: string; lockedBy: string }) => ipcRenderer.invoke('lock-muster', data),
  unlockMuster: (data: { date: string; password?: string }) => ipcRenderer.invoke('unlock-muster', data),
  deleteMuster: (data: { date: string; password?: string }) => ipcRenderer.invoke('delete-muster', data),
  batchUpdateAttendance: (data: { date: string; updates: any[]; overridePassword?: string }) => 
    ipcRenderer.invoke('batch-update-attendance', data),

  // Master Data
  getRanks: () => ipcRenderer.invoke('get-ranks'),
  upsertRank: (data: any) => ipcRenderer.invoke('upsert-rank', data),
  deleteRank: (id: string) => ipcRenderer.invoke('delete-rank', id),
  getDepartments: () => ipcRenderer.invoke('get-departments'),
  upsertDepartment: (data: any) => ipcRenderer.invoke('upsert-department', data),
  deleteDepartment: (id: string) => ipcRenderer.invoke('delete-department', id),

  // Auth
  login: (credentials: any) => ipcRenderer.invoke('login', credentials),

  // Settings
  getSettings: () => ipcRenderer.invoke('get-settings'),
  upsertSetting: (data: { key: string; value: string }) => ipcRenderer.invoke('upsert-setting', data),

  // Dashboard
  getDashboardStats: () => ipcRenderer.invoke('get-dashboard-stats'),

  // Logs
  getLogs: () => ipcRenderer.invoke('get-logs'),
  createLog: (data: any) => ipcRenderer.invoke('create-log', data),
  
  // Backup
  exportBackup: (tag: string) => ipcRenderer.invoke('export-backup', tag),
  importBackup: () => ipcRenderer.invoke('import-backup'),
}
