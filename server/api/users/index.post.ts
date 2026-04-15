import prisma from '../../utils/prisma'
import { hashPassword } from '../../utils/auth'
import { sendRegistrationEmail } from '../../utils/email'

export default defineEventHandler(async (event) => {
  const userCount = await prisma.user.count()
  
  const body = await readBody(event)
  const { name, email, password, role } = body

  // First user is automatically validated and becomes ADMIN
  const isFirstUser = userCount === 0
  const userRole = isFirstUser ? 'ADMIN' : (role || 'USER')
  const isValidated = isFirstUser

  const hashedPassword = await hashPassword(password || 'password123')

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password_hash: hashedPassword,
      role: userRole,
      isValidated
    }
  })

  await sendRegistrationEmail(user.email, user.name)

  const { password_hash, ...userWithoutPassword } = user
  return userWithoutPassword
})
