import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const requestedRanks = [
  { name: 'Assistant', bps: 'BPS-15' },
  { name: 'Data Entry Operator', bps: 'BPS-14' },
  { name: 'UDC (Upper Division Clerk)', bps: 'BPS-13' },
  { name: 'Junior Proof Reader', bps: 'BPS-13' },
  { name: 'LDC (Lower Division Clerk)', bps: 'BPS-11' },
  { name: 'Draftsman-I', bps: 'BPS-11' },
  { name: 'Draftsman-II', bps: 'BPS-11' },
  { name: 'Assistant Examiner', bps: 'BPS-11' },
  { name: 'Civilian Workshop Supervisor', bps: 'BPS-11' },
  { name: 'Draftsman-III', bps: 'BPS-07' },
  { name: 'Engine Driver-II', bps: 'BPS-07' },
  { name: 'Police Constable', bps: 'BPS-05' },
  { name: 'Lady Police Constable', bps: 'BPS-05' },
  { name: 'Crane Driver-I', bps: 'BPS-05' },
  { name: 'MT Driver Civil', bps: 'BPS-04' },
  { name: 'Naib Qasid', bps: 'BPS-01' },
  { name: 'Sanitary Worker', bps: 'BPS-01' },
]

async function main() {
  console.log('Updating Ministerial Ranks...')
  for (const r of requestedRanks) {
    await prisma.rank.upsert({
      where: { name: r.name },
      update: { bps: r.bps, cadre: 'Ministerial' },
      create: { name: r.name, bps: r.bps, cadre: 'Ministerial' }
    })
    console.log(`Upserted: ${r.name} (${r.bps})`)
  }
  console.log('Done.')
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect())
