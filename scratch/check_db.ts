import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const employees = await prisma.employee.findMany({
    select: {
      serviceNo: true,
      name: true,
      rank: { select: { name: true } },
      department: { select: { name: true } }
    }
  })
  console.log(JSON.stringify(employees, null, 2))
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
