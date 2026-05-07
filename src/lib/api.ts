/* eslint-disable @typescript-eslint/no-explicit-any */
const { ipcRenderer } = (window as any)

export const api = {
  // Personnel
  getPersonnel: () => ipcRenderer.invoke('get-personnel'),
  getEmployeeBySvc: (svc: string) => ipcRenderer.invoke('get-employee-by-svc', svc),
  upsertEmployee: (data: any) => ipcRenderer.invoke('upsert-employee', data),

  // Sanctions
  getSanctions: () => ipcRenderer.invoke('get-sanctions'),
  createSanction: (data: any) => ipcRenderer.invoke('create-sanction', data),
  updateSanction: (data: any) => ipcRenderer.invoke('update-sanction', data),

  // Discipline
  getDisciplinaryActions: () => ipcRenderer.invoke('get-disciplinary-actions'),
  upsertDisciplinaryAction: (data: any) => ipcRenderer.invoke('upsert-disciplinary-action', data),

  // Leaves
  getLeaves: () => ipcRenderer.invoke('get-leaves'),

  // Payments
  getPayments: () => ipcRenderer.invoke('get-payments'),

  // Attendance
  getAttendance: (date: string) => ipcRenderer.invoke('get-attendance', date),
  getAttendanceRange: (start: string, end: string) => ipcRenderer.invoke('get-attendance-range', { start, end }),
  updateAttendance: (date: string, employeeId: string, status: string) => 
    ipcRenderer.invoke('update-attendance', { date, employeeId, status }),

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
}
