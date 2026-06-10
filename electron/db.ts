import { PrismaClient } from '@prisma/client'
import path from 'node:path'
import { app } from 'electron'
import fs from 'node:fs'

const isDev = !app.isPackaged

export const dbPath = isDev 
  ? path.join(process.cwd(), 'prisma', 'dev.db')
  : path.join(app.getPath('userData'), 'pncms.db')

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: `file:${dbPath}?connection_limit=1`,
    },
  },
})

export async function initDb() {
  try {
    if (!isDev) {
      if (!fs.existsSync(dbPath)) {
        console.log('Database not found in userData. Copying from resources...');
        const sourceDb = path.join(process.resourcesPath, 'prisma', 'dev.db')
        if (fs.existsSync(sourceDb)) {
          fs.copyFileSync(sourceDb, dbPath)
          console.log('Database successfully copied to userData.');
        } else {
          console.error('CRITICAL ERROR: Source DB not found at:', sourceDb)
        }
      }
    }
    
    await prisma.$connect()
    const count = await prisma.employee.count()
    console.log('Database connected. Personnel count:', count)
  } catch (error) {
    console.error('DATABASE CRITICAL ERROR:', error)
  }
}
