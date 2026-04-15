
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting data migration: ADMIN -> SUPER_ADMIN')

  try {
    // 1. Check if the table "User" exists and if there are users with role 'ADMIN'
    // We use raw queries because 'ADMIN' might not be in the Prisma-generated types anymore
    const count: any = await prisma.$queryRaw`SELECT count(*) FROM "User" WHERE role::text = 'ADMIN'`
    const adminCount = Number(count[0].count)

    if (adminCount === 0) {
      console.log('No users with role "ADMIN" found.')
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
