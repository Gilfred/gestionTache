import prisma from '../../utils/prisma'
import { hashPassword } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  // Allow initial admin creation if no users exist, or require ADMIN role
  const userCount = await prisma.user.count()
  
  if (userCount > 0 && (!event.context.auth || event.context.auth.role !== 'ADMIN')) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Accès interdit'
    })
  }

  const body = await readBody(event)
  const { name, email, password, role } = body

  const hashedPassword = await hashPassword(password || 'password123')

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password_hash: hashedPassword,
      role: role || 'USER'
    }
  })

  const { password_hash, ...userWithoutPassword } = user
  return userWithoutPassword
})
