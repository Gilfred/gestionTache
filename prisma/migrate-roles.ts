
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting data migration: ADMIN -> SUPER_ADMIN')

  try {
    // 0. Ensure SUPER_ADMIN exists in the enum Role in the database
    console.log('Ensuring SUPER_ADMIN exists in Role enum...')
    await prisma.$executeRawUnsafe(`ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'SUPER_ADMIN'`)
    await prisma.$executeRawUnsafe(`ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'RESPONSABLE'`)

    // 1. Check if the table "User" exists and if there are users with role 'ADMIN'
    // We use raw queries because 'ADMIN' might not be in the Prisma-generated types anymore
    const count: any = await prisma.$queryRaw`SELECT count(*) FROM "User" WHERE role::text = 'ADMIN'`
    const adminCount = Number(count[0].count)

    if (adminCount === 0) {
      console.log('No users with role "ADMIN" found.')

      // Double check current Super Admins
      const superAdminCount = await prisma.user.count({ where: { role: 'SUPER_ADMIN' } })
      console.log(`Current SUPER_ADMIN count: ${superAdminCount}`)

      if (superAdminCount === 0) {
        console.warn('WARNING: No SUPER_ADMIN found in the database. You might want to run the seed script.')
      }
    } else {
      console.log(`Found ${adminCount} users with role "ADMIN". Updating to "SUPER_ADMIN"...`)

      // 2. Update roles using raw SQL to bypass Prisma enum validation
      const result = await prisma.$executeRawUnsafe(`
        UPDATE "User"
        SET role = 'SUPER_ADMIN'
        WHERE role::text = 'ADMIN'
      `)

      console.log(`Successfully updated ${result} users.`)
    }

    // 3. Update any other table that might have 'ADMIN' if needed (Task is likely fine as it uses other enums)

  } catch (error) {
    console.error('Error during migration:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
