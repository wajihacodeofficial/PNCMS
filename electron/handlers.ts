import { ipcMain, dialog } from 'electron'
import { prisma } from './db'
import bcrypt from 'bcryptjs'
import fs from 'fs'
import path from 'path'

export function setupHandlers() {
  // Employee Handlers
  ipcMain.handle('get-personnel', async () => {
    return await prisma.employee.findMany({
      include: {
        rank: true,
        department: true,
      },
    })
  })

  ipcMain.handle('get-employee-by-svc', async (_, svc: string) => {
    return await prisma.employee.findUnique({
      where: { serviceNo: svc },
      include: {
        rank: true,
        department: true,
        sanctions: true,
        leaves: true,
        disciplinaryActions: true,
        payments: true,
        attendance: true,
      },
    })
  })

  ipcMain.handle('upsert-employee', async (_, data: any) => {
    const { 
      id, rankId, departmentId, phones, letters, 
      accountNo, joiningDate, nokAddress, 
      updatedAt, createdAt, rank, department,
      ...rest 
    } = data
    
    const employeeData: any = {
      ...rest,
      bankAccount: accountNo,
      joiningCurrentUnitDate: joiningDate,
      rank: rankId ? { connect: { id: rankId } } : undefined,
      department: departmentId ? { connect: { id: departmentId } } : undefined,
    }

    const phoneCreate = (phones || []).filter((p: any) => p.number).map((p: any) => ({
      phoneNumber: p.number,
      brand: p.brand,
      model: p.model,
      imei1: p.imei1,
      imei2: p.imei2
    }))

    const letterCreate = (letters || []).filter((l: any) => l.refNo).map((l: any) => ({
      referenceNumber: l.refNo,
      referenceDate: new Date(l.refDate || new Date()),
      fileName: l.fileName,
      fileNumber: l.fileNo
    }))

    if (id) {
      return await prisma.$transaction(async (tx) => {
        await tx.employeePhone.deleteMany({ where: { employeeId: id } })
        await tx.employeeLetter.deleteMany({ where: { employeeId: id } })

        return await tx.employee.update({
          where: { id },
          data: {
            ...employeeData,
            phones: { create: phoneCreate },
            letters: { create: letterCreate }
          }
        })
      })
    } else {
      return await prisma.employee.create({
        data: {
          ...employeeData,
          phones: { create: phoneCreate },
          letters: { create: letterCreate }
        }
      })
    }
  })

  // Sanction Handlers
  ipcMain.handle('get-sanctions', async () => {
    return await prisma.sanction.findMany({
      include: {
        employee: {
          include: {
            department: true,
          }
        }
      }
    })
  })

  ipcMain.handle('create-sanction', async (_, data: any) => {
    return await prisma.sanction.create({ data })
  })

  ipcMain.handle('update-sanction', async (_, { id, ...data }: any) => {
    return await prisma.sanction.update({
      where: { id },
      data
    })
  })

  // Disciplinary Handlers
  ipcMain.handle('get-disciplinary-actions', async () => {
    return await prisma.disciplinaryAction.findMany({
      include: {
        employee: true
      }
    })
  })

  // Leave Handlers
  ipcMain.handle('get-leaves', async () => {
    return await prisma.leaveRecord.findMany({
      include: {
        employee: true
      }
    })
  })

  // Payment Handlers
  ipcMain.handle('get-payments', async () => {
    return await prisma.payment.findMany({
      include: {
        employee: true
      }
    })
  })

  // Attendance Handlers
  ipcMain.handle('get-attendance', async (_, date: string) => {
    return await prisma.attendance.findMany({
      where: { date }
    })
  })

  ipcMain.handle('update-attendance', async (_, { date, employeeId, status }: any) => {
    return await prisma.attendance.upsert({
      where: {
        date_employeeId: {
          date,
          employeeId
        }
      },
      update: { status },
      create: { date, employeeId, status }
    })
  })

  // Master Data Handlers
  ipcMain.handle('get-ranks', async () => {
    return await prisma.rank.findMany({
      orderBy: { name: 'asc' }
    })
  })

  ipcMain.handle('upsert-rank', async (_, data: any) => {
    const { id, ...rest } = data
    if (id) {
      return await prisma.rank.update({
        where: { id },
        data: rest
      })
    } else {
      return await prisma.rank.create({
        data: rest
      })
    }
  })

  ipcMain.handle('delete-rank', async (_, id: string) => {
    return await prisma.rank.delete({
      where: { id }
    })
  })

  ipcMain.handle('get-departments', async () => {
    return await prisma.department.findMany({
      orderBy: { name: 'asc' }
    })
  })

  ipcMain.handle('upsert-department', async (_, data: any) => {
    const { id, ...rest } = data
    if (id) {
      return await prisma.department.update({
        where: { id },
        data: rest
      })
    } else {
      return await prisma.department.create({
        data: rest
      })
    }
  })

  ipcMain.handle('delete-department', async (_, id: string) => {
    return await prisma.department.delete({
      where: { id }
    })
  })

  // Auth Handlers
  ipcMain.handle('login', async (_, { username, password }: any) => {
    const user = await prisma.user.findUnique({
      where: { username }
    })

    if (!user) {
      throw new Error('User not found')
    }

    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
      throw new Error('Invalid password')
    }

    return {
      username: user.username,
      role: user.role
    }
  })

  // Discipline Handlers
  ipcMain.handle('get-disciplinary-actions', async () => {
    return await prisma.disciplinaryAction.findMany({
      include: {
        employee: true
      },
      orderBy: { date: 'desc' }
    })
  })

  ipcMain.handle('upsert-disciplinary-action', async (_, data: any) => {
    const { id, svc, ...rest } = data
    
    // Find employee by service number
    const employee = await prisma.employee.findUnique({
      where: { serviceNo: svc }
    })

    if (!employee) throw new Error(`Personnel with Svc No ${svc} not found`)

    if (id) {
      return await prisma.disciplinaryAction.update({
        where: { id },
        data: {
          ...rest,
          employeeId: employee.id
        }
      })
    } else {
      return await prisma.disciplinaryAction.create({
        data: {
          ...rest,
          employeeId: employee.id
        }
      })
    }
  })

  // Settings Handlers
  ipcMain.handle('get-settings', async () => {
    return await prisma.setting.findMany()
  })

  ipcMain.handle('upsert-setting', async (_, { key, value }: any) => {
    return await prisma.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value }
    })
  })

  ipcMain.handle('get-attendance-range', async (_, { start, end }: { start: string; end: string }) => {
    return await prisma.attendance.findMany({
      where: {
        date: {
          gte: start,
          lte: end
        }
      }
    })
  })

  ipcMain.handle('get-dashboard-stats', async () => {
    const totalPersonnel = await prisma.employee.count()
    const openLogs = await prisma.sanction.count({ where: { status: 'Pending' } })
    
    // For "On Leave", we'd check active leave records for today
    const today = new Date().toISOString().split('T')[0]
    const onLeave = await prisma.leaveRecord.count({
      where: {
        startDate: { lte: today },
        endDate: { gte: today },
        status: 'Approved'
      }
    })

    return {
      totalPersonnel,
      openLogs,
      onLeave,
    }
  })

  // Audit Log Handlers
  ipcMain.handle('get-logs', async () => {
    return await prisma.log.findMany({
      orderBy: { time: 'desc' },
      take: 500
    })
  })

  ipcMain.handle('create-log', async (_, logData: any) => {
    return await prisma.log.create({
      data: {
        user: logData.user,
        action: logData.action,
        entity: logData.entity,
        ip: logData.ip || '127.0.0.1',
        result: logData.result || 'Success'
      }
    })
  })

  // Backup & Restore Handlers
  ipcMain.handle('export-backup', async (_, tag: string) => {
    const { filePath } = await dialog.showSaveDialog({
      title: 'Export Database Backup',
      defaultPath: `pncms_backup_${tag || Date.now()}.pnbak`,
      filters: [{ name: 'PNCMS Backup', extensions: ['pnbak'] }]
    })

    if (filePath) {
      const dbPath = path.join(process.cwd(), 'prisma', 'dev.db')
      fs.copyFileSync(dbPath, filePath)
      return { success: true, path: filePath }
    }
    return { success: false }
  })

  ipcMain.handle('import-backup', async () => {
    const { filePaths } = await dialog.showOpenDialog({
      title: 'Import Database Backup',
      filters: [{ name: 'PNCMS Backup', extensions: ['pnbak'] }],
      properties: ['openFile']
    })

    if (filePaths && filePaths[0]) {
      const dbPath = path.join(process.cwd(), 'prisma', 'dev.db')
      // Backup current before overwrite
      fs.copyFileSync(dbPath, `${dbPath}.bak`)
      fs.copyFileSync(filePaths[0], dbPath)
      return { success: true }
    }
    return { success: false }
  })
}
