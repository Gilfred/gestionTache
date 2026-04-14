import { verifyToken } from '~~/server/utils/auth'
import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'auth_token')

  if (!token) {
    return null
  }

  const decoded = verifyToken(token) as any

  if (!decoded || !decoded.userId) {
    return null
  }

  const user = await prisma.user.findUnique({
    where: { id: decoded.userId }
  })

  if (!user) {
    return null
  }

  const { password_hash, ...userWithoutPassword } = user
  return userWithoutPassword
})
