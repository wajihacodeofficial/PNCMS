import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log("=== EMPLOYEES ===")
  const employees = await prisma.employee.findMany({
    select: {
      serviceNo: true,
      name: true,
      rankId: true,
      rank: { select: { id: true, name: true } },
      departmentId: true,
      department: { select: { id: true, name: true } }
    }
  })
  console.dir(employees, { depth: null })

  console.log("\n=== RANKS ===")
  const ranks = await prisma.rank.findMany({
    select: {
      id: true,
      name: true,
      bps: true,
      bornStrength: true
    }
  })
  console.dir(ranks, { depth: null })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
