import { PrismaClient } from '@prisma/client'
import path from 'node:path'
import { app } from 'electron'
import fs from 'node:fs'
import { logger } from './logger'

const isDev = !app.isPackaged

// Ensure database directory exists
const dbDir = isDev ? path.join(process.cwd(), 'prisma') : path.join(app.getPath('userData'), 'database')
if (!isDev && !fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true })
}

export const dbPath = isDev 
  ? path.join(dbDir, 'dev.db')
  : path.join(dbDir, 'app.db')

// Fix SQLite connection string backslashes on Windows!
// Prisma SQLite connection strings fail if backslashes are used
const formattedDbPath = dbPath.replace(/\\/g, '/')

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: `file:${formattedDbPath}?connection_limit=1`,
    },
  },
})

export async function initDb() {
  try {
    logger.info(`Initializing database at ${formattedDbPath}`);
    if (!isDev) {
      if (!fs.existsSync(dbPath)) {
        logger.warn('Database not found in userData. Copying from resources...');
        const sourceDb = path.join(process.resourcesPath, 'prisma', 'dev.db')
        if (fs.existsSync(sourceDb)) {
          fs.copyFileSync(sourceDb, dbPath)
          logger.info('Database successfully copied to userData.');
        } else {
          logger.error('CRITICAL ERROR: Source DB not found at:', sourceDb)
          throw new Error('Missing bundled database from resources.');
        }
      }
    }
    
    await prisma.$connect()
    
    // Test the connection with a fast raw query to verify sanity
    await prisma.$queryRaw`SELECT 1`;
    
    const count = await prisma.employee.count()
    logger.info(`Database connected successfully. Personnel count: ${count}`)
  } catch (error: any) {
    logger.error('DATABASE CRITICAL ERROR:', error.message || error)
    throw error;
  }
}
