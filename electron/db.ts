import { PrismaClient } from '@prisma/client'
import path from 'node:path'
import { app } from 'electron'

const isDev = !app.isPackaged
const dbPath = isDev 
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
    await prisma.$connect()
    console.log('Database connected at:', dbPath)
  } catch (error) {
    console.error('Failed to connect to database:', error)
  }
}
