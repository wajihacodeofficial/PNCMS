import { prisma } from '../electron/db';

async function truncateAll() {
  // Delete all data from each table. Order respects foreign key constraints.
  try {
    await prisma.$transaction([
      // Leaf tables first
      prisma.attendance.deleteMany(),
      prisma.disciplinaryAction.deleteMany(),
      prisma.payment.deleteMany(),
      prisma.workLog.deleteMany(),
      prisma.leaveRecord.deleteMany(),
      prisma.sanction.deleteMany(),
      prisma.employeePhone.deleteMany(),
      prisma.employeeLetter.deleteMany(),
      // Then main entities
      prisma.employee.deleteMany(),
      prisma.rank.deleteMany(),
      prisma.department.deleteMany(),
      prisma.user.deleteMany(),
      prisma.setting.deleteMany(),
      prisma.log.deleteMany(),
      prisma.musterLock.deleteMany()
    ]);
    console.log('✅ All records deleted successfully.');
  } catch (err) {
    console.error('❌ Error during truncation:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

truncateAll();
