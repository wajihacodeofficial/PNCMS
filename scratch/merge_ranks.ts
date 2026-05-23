import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log("Starting Rank and Department cleanup...")

  await prisma.$transaction(async (tx) => {
    // 1. Process Ranks
    const ranks = await tx.rank.findMany()
    const rankMap = new Map<string, typeof ranks[0]>()

    for (const rank of ranks) {
      const trimmedName = rank.name.trim()
      const existing = rankMap.get(trimmedName)

      if (existing) {
        // We found a duplicate! Determine which one to keep as primary.
        // Prefer the one that has a BPS level set.
        let primary = existing
        let duplicate = rank

        if (!existing.bps && rank.bps) {
          primary = rank
          duplicate = existing
          // Update the map to point to the better primary
          rankMap.set(trimmedName, rank)
        }

        console.log(`Duplicate Rank found: "${rank.name}" vs "${existing.name}". Merging into primary: "${primary.name}" (ID: ${primary.id})`)

        // Move employees from duplicate to primary
        const employeeUpdate = await tx.employee.updateMany({
          where: { rankId: duplicate.id },
          data: { rankId: primary.id }
        })
        console.log(`Moved ${employeeUpdate.count} employees to primary rank.`)

        // Delete duplicate rank
        await tx.rank.delete({ where: { id: duplicate.id } })
        console.log(`Deleted duplicate rank ID: ${duplicate.id}`)
      } else {
        rankMap.set(trimmedName, rank)
      }
    }

    // Now update all rank names to their trimmed versions
    for (const [trimmedName, rank] of rankMap.entries()) {
      if (rank.name !== trimmedName) {
        console.log(`Trimming Rank name: "${rank.name}" -> "${trimmedName}"`)
        await tx.rank.update({
          where: { id: rank.id },
          data: { name: trimmedName }
        })
      }
    }

    // 2. Process Departments
    const depts = await tx.department.findMany()
    const deptMap = new Map<string, typeof depts[0]>()

    for (const dept of depts) {
      const trimmedName = dept.name.trim()
      const existing = deptMap.get(trimmedName)

      if (existing) {
        console.log(`Duplicate Department found: "${dept.name}" vs "${existing.name}". Merging into primary: "${existing.name}" (ID: ${existing.id})`)

        // Move employees
        const employeeUpdate = await tx.employee.updateMany({
          where: { departmentId: dept.id },
          data: { departmentId: existing.id }
        })
        console.log(`Moved ${employeeUpdate.count} employees to primary department.`)

        // Delete duplicate
        await tx.department.delete({ where: { id: dept.id } })
      } else {
        deptMap.set(trimmedName, dept)
      }
    }

    // Trim department names
    for (const [trimmedName, dept] of deptMap.entries()) {
      if (dept.name !== trimmedName) {
        console.log(`Trimming Department name: "${dept.name}" -> "${trimmedName}"`)
        await tx.department.update({
          where: { id: dept.id },
          data: { name: trimmedName }
        })
      }
    }
  })

  // 3. Recalculate strengths using our new logic (via global client)
  console.log("Recalculating strengths...")
  const departments = await prisma.department.findMany({ select: { id: true } })
  const ranks = await prisma.rank.findMany({ select: { id: true } })

  for (const dept of departments) {
    const count = await prisma.employee.count({ where: { departmentId: dept.id } })
    await prisma.department.update({
      where: { id: dept.id },
      data: { bornStrength: count }
    })
  }

  for (const r of ranks) {
    const count = await prisma.employee.count({ where: { rankId: r.id } })
    await prisma.rank.update({
      where: { id: r.id },
      data: { bornStrength: count }
    })
  }

  console.log("Cleanup and synchronization completed successfully!")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
