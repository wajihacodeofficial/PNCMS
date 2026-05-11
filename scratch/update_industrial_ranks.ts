import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const industrialRanks = [
  { name: 'Leading Man', bps: 'BPS-12' },
  { name: 'Assistant Leading Man', bps: 'BPS-11' },
  { name: 'Chargeman', bps: 'BPS-11/12' },
  { name: 'Civil Apprentice', bps: 'BPS-07' },
  { name: 'Skilled Labor / Technician', bps: 'BPS-05' },
  { name: 'Semi-Skilled Worker', bps: 'BPS-03/04' },
  { name: 'Laborer / Helper', bps: 'BPS-01' },
]

async function main() {
  console.log('Updating Industrial Ranks...')
  for (const r of industrialRanks) {
    await prisma.rank.upsert({
      where: { name: r.name },
      update: { bps: r.bps, cadre: 'Industrial' },
      create: { name: r.name, bps: r.bps, cadre: 'Industrial' }
    })
    console.log(`Upserted: ${r.name} (${r.bps})`)
  }
  console.log('Done.')
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect())
