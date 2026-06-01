import { ipcMain, dialog, BrowserWindow, app } from 'electron'
import { prisma } from './db'
import bcrypt from 'bcryptjs'
import fs from 'fs'
import path from 'path'

function notifyChange(topic: string) {
  BrowserWindow.getAllWindows().forEach(win => {
    win.webContents.send('db-changed', topic)
  })
}

async function updateStrengths(tx: any) {
  const departments = await tx.department.findMany({ select: { id: true } })
  const ranks = await tx.rank.findMany({ select: { id: true } })

  for (const dept of departments) {
    const count = await tx.employee.count({
      where: { departmentId: dept.id }
    })
    await tx.department.update({
      where: { id: dept.id },
      data: { bornStrength: count }
    })
  }

  for (const r of ranks) {
    const count = await tx.employee.count({
      where: { rankId: r.id }
    })
    await tx.rank.update({
      where: { id: r.id },
      data: { bornStrength: count }
    })
  }
}

export function setupHandlers() {
  // Sync strengths on startup
  updateStrengths(prisma).catch(err => {
    console.error('[Startup] Failed to sync rank & department strengths:', err)
  })

  // Employee Handlers
  ipcMain.handle('get-personnel', async () => {
    console.log('[IPC] Fetching personnel registry...');
    try {
      const result = await prisma.employee.findMany({
        include: {
          rank: true,
          department: true,
          phones: true,
          letters: true,
        },
      })
      console.log(`[IPC] Successfully retrieved ${result.length} personnel records`);
      return result;
    } catch (err) {
      console.error('[IPC] Critical Error in get-personnel:', err);
      throw err;
    }
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
        phones: true,
        letters: true,
      },
    })
  })

  ipcMain.handle('upsert-employee', async (_, data: any) => {
    const { 
      id, rankId, departmentId, rankName, deptName, phones, letters, 
      accountNo, joiningDate, 
      updatedAt, createdAt, rank, department,
      ...rest 
    } = data
    
    const employeeData: any = {
      ...rest,
      bankAccount: accountNo,
      joiningCurrentUnitDate: joiningDate,
    }

    if (rankId) {
      employeeData.rank = { connect: { id: rankId } }
    } else if (rankName) {
      const trimmedRankName = rankName.trim()
      employeeData.rank = {
        connectOrCreate: {
          where: { name: trimmedRankName },
          create: { name: trimmedRankName }
        }
      }
    }

    if (departmentId) {
      employeeData.department = { connect: { id: departmentId } }
    } else if (deptName) {
      const trimmedDeptName = deptName.trim()
      employeeData.department = {
        connectOrCreate: {
          where: { name: trimmedDeptName },
          create: { name: trimmedDeptName }
        }
      }
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

    // Use serviceNo as the primary key for upsert
    const result = await prisma.$transaction(async (tx) => {
      await tx.employeePhone.deleteMany({ where: { serviceNo: data.serviceNo } })
      await tx.employeeLetter.deleteMany({ where: { serviceNo: data.serviceNo } })

      const emp = await tx.employee.upsert({
        where: { serviceNo: data.serviceNo },
        update: {
          ...employeeData,
          phones: { create: phoneCreate },
          letters: { create: letterCreate }
        },
        create: {
          ...employeeData,
          phones: { create: phoneCreate },
          letters: { create: letterCreate }
        }
      })

      await updateStrengths(tx)
      return emp
    })
    notifyChange('personnel')
    notifyChange('ranks')
    notifyChange('departments')
    return result
  })

  ipcMain.handle('delete-employee', async (_, serviceNo: string) => {
    const result = await prisma.$transaction(async (tx) => {
      const deletedEmp = await tx.employee.delete({
        where: { serviceNo }
      })
      await updateStrengths(tx)
      return deletedEmp
    })
    notifyChange('personnel')
    notifyChange('ranks')
    notifyChange('departments')
    return result
  })

  // Sanction Handlers
  ipcMain.handle('get-sanctions', async () => {
    return await prisma.sanction.findMany({
      include: {
        employee: {
          include: {
            department: true,
            rank: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
  })

  ipcMain.handle('create-sanction', async (_, data: any) => {
    try {
      const { employeeId, svc, timeline, ...rest } = data;
      const targetSvc = svc || employeeId;

      if (!targetSvc) throw new Error('Service number is required');

      // Verify employee exists before attempting to connect
      const employee = await prisma.employee.findUnique({ where: { serviceNo: targetSvc } });
      if (!employee) throw new Error(`No employee found with service number "${targetSvc}"`);

      const initialTimeline = timeline || JSON.stringify([
        { event: 'Sanction Initiated', time: new Date().toISOString(), user: 'Admin Clerk' }
      ]);

      const result = await prisma.sanction.create({
        data: {
          ...rest,
          timeline: initialTimeline,
          employee: { connect: { serviceNo: targetSvc } }
        }
      });
      notifyChange('sanctions');
      return result;
    } catch (err: any) {
      console.error('[IPC] create-sanction error:', err);
      throw new Error(err?.message || 'Failed to create sanction');
    }
  })

  ipcMain.handle('update-sanction', async (_, { id, ...data }: any) => {
    try {
      if (!id) throw new Error('Sanction ID is required for update');
      const result = await prisma.sanction.update({
        where: { id },
        data
      });
      notifyChange('sanctions');
      return result;
    } catch (err: any) {
      console.error('[IPC] update-sanction error:', err);
      throw new Error(err?.message || 'Failed to update sanction');
    }
  })

  // Disciplinary Handlers
  ipcMain.handle('get-disciplinary-actions', async () => {
    return await prisma.disciplinaryAction.findMany({
      include: {
        employee: true
      },
      orderBy: { date: 'desc' }
    })
  })

  ipcMain.handle('upsert-disciplinary-action', async (_, data: any) => {
    const { id, svc, employeeId, ...rest } = data
    const targetSvc = svc || employeeId;
    
    if (!targetSvc) throw new Error("Service Number is required to identify personnel");

    if (id) {
      return await prisma.disciplinaryAction.update({
        where: { id },
        data: { ...rest, employee: { connect: { serviceNo: targetSvc } } }
      })
    } else {
      return await prisma.disciplinaryAction.create({
        data: { ...rest, employee: { connect: { serviceNo: targetSvc } } }
      })
    }
  })

  // Leave Handlers
  ipcMain.handle('get-leaves', async () => {
    return await prisma.leaveRecord.findMany({
      include: {
        employee: true
      }
    })
  })

  ipcMain.handle('create-leave', async (_, data: any) => {
    const { employeeId, svc, timeline, ...rest } = data
    const targetSvc = svc || employeeId;

    if (!targetSvc) throw new Error("Service Number is required to resolve personnel");

    const initialTimeline = timeline || JSON.stringify([
      { event: "Leave Request Submitted", time: new Date().toISOString(), user: "Admin Clerk" }
    ]);

    const result = await prisma.leaveRecord.create({ 
      data: {
        ...rest,
        timeline: initialTimeline,
        employee: { connect: { serviceNo: targetSvc } }
      }
    })

    // Automatically record attendance for approved leaves
    if (result.status === 'Approved') {
      try {
        const start = new Date(result.startDate + 'T00:00:00Z')
        const end = new Date(result.endDate + 'T00:00:00Z')
        
        const dates: string[] = []
        let current = new Date(start)
        while (current <= end) {
          dates.push(current.toISOString().split('T')[0])
          current.setDate(current.getDate() + 1)
        }
        
        const txs = dates.map(date => {
          return prisma.attendance.upsert({
            where: { date_serviceNo: { date, serviceNo: targetSvc } },
            update: { status: result.type },
            create: { date, serviceNo: targetSvc, status: result.type }
          })
        })
        await prisma.$transaction(txs)
        notifyChange('attendance')
      } catch (err) {
        console.error('Error auto-marking leave attendance on create:', err)
      }
    }

    notifyChange('leaves')
    return result
  })

  ipcMain.handle('delete-leave', async (_, id: string) => {
    const leave = await prisma.leaveRecord.findUnique({ where: { id } })
    if (leave) {
      const start = new Date(leave.startDate + 'T00:00:00Z')
      const end = new Date(leave.endDate + 'T00:00:00Z')
      
      const dates: string[] = []
      let current = new Date(start)
      while (current <= end) {
        dates.push(current.toISOString().split('T')[0])
        current.setDate(current.getDate() + 1)
      }
      
      await prisma.attendance.deleteMany({
        where: {
          serviceNo: leave.serviceNo,
          date: { in: dates },
          status: leave.type
        }
      })
    }
    const result = await prisma.leaveRecord.delete({
      where: { id }
    })
    notifyChange('leaves')
    notifyChange('attendance')
    return result
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
    console.log(`[IPC] Fetching attendance for date: ${date}`);
    try {
      const result = await prisma.attendance.findMany({
        where: { date }
      })

      // Fetch all approved leave records overlapping with this date
      const activeLeaves = await prisma.leaveRecord.findMany({
        where: {
          status: 'Approved',
          startDate: { lte: date },
          endDate: { gte: date }
        }
      })

      const finalResult = [...result]
      let changed = false

      for (const leave of activeLeaves) {
        const hasRecord = result.some(r => r.serviceNo === leave.serviceNo)
        if (!hasRecord) {
          const newRecord = await prisma.attendance.create({
            data: {
              date,
              serviceNo: leave.serviceNo,
              status: leave.type
            }
          })
          finalResult.push(newRecord)
          changed = true
        }
      }

      if (changed) {
        notifyChange('attendance')
      }

      console.log(`[IPC] Found ${finalResult.length} attendance records`);
      return finalResult;
    } catch (err) {
      console.error(`[IPC] Error fetching attendance:`, err);
      throw err;
    }
  })

  ipcMain.handle('get-muster-lock', async (_, date: string) => {
    return await prisma.musterLock.findUnique({
      where: { date }
    })
  })

  ipcMain.handle('get-all-muster-locks', async () => {
    return await prisma.musterLock.findMany({
      orderBy: { date: 'desc' }
    })
  })

  ipcMain.handle('lock-muster', async (_, { date, lockedBy }: any) => {
    const result = await prisma.musterLock.create({
      data: { date, lockedBy }
    })
    notifyChange('attendance')
    return result
  })

  async function verifyAdmin(username?: string, password?: string) {
    const savedUser = await prisma.setting.findUnique({ where: { key: 'admin_username' } })
    const savedPass = await prisma.setting.findUnique({ where: { key: 'admin_password' } })
    const expectedUser = savedUser ? savedUser.value : 'PNCMS'
    const expectedPass = savedPass ? savedPass.value : '14081947'
    return username === expectedUser && password === expectedPass
  }

  ipcMain.handle('unlock-muster', async (_, { date, username, password }: any) => {
    const isValid = await verifyAdmin(username, password)
    if (!isValid) {
      throw new Error('Invalid Admin Username or Password')
    }
    const result = await prisma.musterLock.delete({
      where: { date }
    })
    notifyChange('attendance')
    return result
  })

  ipcMain.handle('delete-muster', async (_, { date, username, password }: any) => {
    const isValid = await verifyAdmin(username, password)
    if (!isValid) {
      throw new Error('Invalid Admin Username or Password')
    }
    
    // Use transaction to ensure both or neither are deleted
    const result = await prisma.$transaction([
      prisma.attendance.deleteMany({ where: { date } }),
      prisma.musterLock.deleteMany({ where: { date } })
    ]);
    
    notifyChange('attendance')
    return result
  })

  ipcMain.handle('batch-update-attendance', async (_, { date, updates, username, password }: any) => {
    const lock = await prisma.musterLock.findUnique({ where: { date } })
    if (lock) {
      const isValid = await verifyAdmin(username, password)
      if (!isValid) {
        throw new Error('This muster is locked. Invalid Admin credentials.')
      }
    }

    const txs = updates.map((update: any) => {
      return prisma.attendance.upsert({
        where: { date_serviceNo: { date, serviceNo: update.serviceNo } },
        update: { status: update.status },
        create: { date, serviceNo: update.serviceNo, status: update.status }
      })
    })

    const result = await prisma.$transaction(txs)
    notifyChange('attendance')
    return result
  })

  ipcMain.handle('update-attendance', async (_, { date, employeeId, svc, status, username, password }: any) => {
    const targetSvc = svc || employeeId;
    const lock = await prisma.musterLock.findUnique({ where: { date } })
    if (lock) {
      const isValid = await verifyAdmin(username, password)
      if (!isValid) {
        throw new Error('This muster is locked. Invalid Admin credentials.')
      }
    }

    const existing = await prisma.attendance.findFirst({
      where: { date, serviceNo: targetSvc }
    })

    let result
    if (existing) {
      result = await prisma.attendance.update({
        where: { id: existing.id },
        data: { status }
      })
    } else {
      result = await prisma.attendance.create({
        data: { date, serviceNo: targetSvc, status }
      })
    }
    notifyChange('attendance')
    return result
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

  // Master Data Handlers
  ipcMain.handle('get-ranks', async () => {
    return await prisma.rank.findMany({
      orderBy: { bps: 'desc' }
    })
  })

  ipcMain.handle('upsert-rank', async (_, { id, ...rest }: any) => {
    let result
    if (id) {
      result = await prisma.rank.update({
        where: { id },
        data: rest
      })
    } else {
      result = await prisma.rank.create({
        data: rest
      })
    }
    notifyChange('ranks')
    return result
  })

  ipcMain.handle('delete-rank', async (_, id: string) => {
    const result = await prisma.rank.delete({
      where: { id }
    })
    notifyChange('ranks')
    return result
  })

  ipcMain.handle('get-departments', async () => {
    return await prisma.department.findMany()
  })

  ipcMain.handle('upsert-department', async (_, { id, ...rest }: any) => {
    let result
    if (id) {
      result = await prisma.department.update({
        where: { id },
        data: rest
      })
    } else {
      result = await prisma.department.create({
        data: rest
      })
    }
    notifyChange('departments')
    return result
  })

  ipcMain.handle('delete-department', async (_, id: string) => {
    const result = await prisma.department.delete({
      where: { id }
    })
    notifyChange('departments')
    return result
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

  // Settings Handlers
  ipcMain.handle('get-settings', async () => {
    const settings = await prisma.setting.findMany()
    const map: any = {}
    settings.forEach(s => map[s.key] = s.value)
    return map
  })

  ipcMain.handle('upsert-setting', async (_, { key, value }: any) => {
    const result = await prisma.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value }
    })
    notifyChange('settings')
    return result
  })

  // Dashboard Stats
  ipcMain.handle('get-dashboard-stats', async () => {
    const personnelCount = await prisma.employee.count()
    const leaveCount = await prisma.leaveRecord.count({ where: { status: 'Approved' } })
    const pendingSanctions = await prisma.sanction.count({ where: { status: 'Pending' } })
    
    // Cadre distribution
    const ministerial = await prisma.employee.count({ where: { cardType: 'Ministerial' } })
    const industrial = await prisma.employee.count({ where: { cardType: 'Industrial' } })

    return {
      personnelCount,
      leaveCount,
      pendingSanctions,
      cadre: { ministerial, industrial }
    }
  })

  // Logs
  ipcMain.handle('get-logs', async () => {
    return await prisma.log.findMany({
      orderBy: { time: 'desc' },
      take: 50
    })
  })

  ipcMain.handle('create-log', async (_, data: any) => {
    return await prisma.log.create({
      data: {
        ...data,
        ip: '127.0.0.1'
      }
    })
  })

  // Backup/Restore Handlers
  ipcMain.handle('export-backup', async (_, tag: string) => {
    const dbPath = path.join(process.cwd(), 'prisma/dev.db')
    const fileName = `backup_${tag || Date.now()}.db`
    const { filePath } = await dialog.showSaveDialog({
      defaultPath: fileName,
      filters: [{ name: 'SQLite Database', extensions: ['db'] }]
    })

    if (filePath) {
      fs.copyFileSync(dbPath, filePath)
      return { success: true, path: filePath }
    }
    return { success: false }
  })

  ipcMain.handle('import-backup', async () => {
    const { filePaths } = await dialog.showOpenDialog({
      filters: [{ name: 'SQLite Database', extensions: ['db'] }]
    })

    if (filePaths && filePaths.length > 0) {
      const dbPath = path.join(process.cwd(), 'prisma/dev.db')
      fs.copyFileSync(filePaths[0], dbPath)
      app.relaunch()
      app.exit()
      return { success: true }
    }
    return { success: false }
  })
}