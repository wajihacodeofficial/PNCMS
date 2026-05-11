import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Clearing database for fresh start...')

  await prisma.attendance.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.disciplinaryAction.deleteMany()
  await prisma.leaveRecord.deleteMany()
  await prisma.sanction.deleteMany()
  await prisma.employeePhone.deleteMany()
  await prisma.employeeLetter.deleteMany()
  await prisma.employee.deleteMany()
  await prisma.rank.deleteMany()
  await prisma.department.deleteMany()
  await prisma.user.deleteMany()
  await prisma.setting.deleteMany()
  await prisma.log.deleteMany()

  console.log('Seeding administrative data...')

  const adminPassword = await bcrypt.hash('pncms@2026', 10)
  await prisma.user.create({
    data: { username: 'Administrator', password: adminPassword, role: 'Admin' }
  })

  await prisma.setting.createMany({
    data: [
      { key: 'clerk_name', value: 'Wajiha Zehra' },
      { key: 'sec_question', value: 'What is the secret code?' },
      { key: 'sec_answer', value: '14081947' },
      { key: 'admin_password', value: 'pncms@2026' },
      { key: 'secret_password', value: '99887766' },
      { key: 'rate_ministerial', value: '380' },
      { key: 'rate_industrial', value: '420' },
    ]
  })

  const departments = [
    'CO Secretariat', 'EXO Secretariat', 'SO Secretariat', 'IT', '1st LT', 'Imprest',
    'Pay Office', 'Ships Office', 'Mail Office', 'A & R Section', 'Civil Admin Office',
    'SRB Section', 'Transport', 'Audit Cell', 'Store Office', 'GO', 'Regulating Office', 'Sick Bay'
  ]

  await prisma.department.createMany({
    data: departments.map(name => ({ name, location: 'PNS DILAWAR' }))
  })

  const ranks = [
    { cadre: 'Ministerial', name: 'Assistant', bps: 'BPS-15' },
    { cadre: 'Ministerial', name: 'Data Entry Operator', bps: 'BPS-14' },
    { cadre: 'Ministerial', name: 'UDC (Upper Division Clerk)', bps: 'BPS-13' },
    { cadre: 'Ministerial', name: 'Junior Proof Reader', bps: 'BPS-13' },
    { cadre: 'Ministerial', name: 'LDC (Lower Division Clerk)', bps: 'BPS-11' },
    { cadre: 'Ministerial', name: 'Draftsman-I', bps: 'BPS-11' },
    { cadre: 'Ministerial', name: 'Draftsman-II', bps: 'BPS-11' },
    { cadre: 'Ministerial', name: 'Assistant Examiner', bps: 'BPS-11' },
    { cadre: 'Ministerial', name: 'Civilian Workshop Supervisor', bps: 'BPS-11' },
    { cadre: 'Ministerial', name: 'Draftsman-III', bps: 'BPS-07' },
    { cadre: 'Ministerial', name: 'Engine Driver-II', bps: 'BPS-07' },
    { cadre: 'Ministerial', name: 'Police Constable', bps: 'BPS-05' },
    { cadre: 'Ministerial', name: 'Lady Police Constable', bps: 'BPS-05' },
    { cadre: 'Ministerial', name: 'Crane Driver-I', bps: 'BPS-05' },
    { cadre: 'Ministerial', name: 'MT Driver Civil', bps: 'BPS-04' },
    { cadre: 'Ministerial', name: 'Naib Qasid', bps: 'BPS-01' },
    { cadre: 'Ministerial', name: 'Sanitary Worker', bps: 'BPS-01' },
    { cadre: 'Industrial', name: 'Leading Man', bps: 'BPS-12' },
    { cadre: 'Industrial', name: 'Assistant Leading Man', bps: 'BPS-11' },
    { cadre: 'Industrial', name: 'Chargeman', bps: 'BPS-11/12' },
    { cadre: 'Industrial', name: 'Civil Apprentice', bps: 'BPS-07' },
    { cadre: 'Industrial', name: 'Skilled Labor / Technician', bps: 'BPS-05' },
    { cadre: 'Industrial', name: 'Semi-Skilled Worker', bps: 'BPS-03/04' },
    { cadre: 'Industrial', name: 'Laborer / Helper', bps: 'BPS-01' },
    { cadre: 'Industrial', name: 'Technical Officer', bps: 'BPS-17' },
    { cadre: 'Industrial', name: 'Senior Technical Officer', bps: 'BPS-18' },
    { cadre: 'Industrial', name: 'Chief Engineer / Director Technical', bps: 'BPS-19 / 20' },
  ]

  await prisma.rank.createMany({ data: ranks })

  console.log(`Database initialized with ${ranks.length} ranks and ${departments.length} departments.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
