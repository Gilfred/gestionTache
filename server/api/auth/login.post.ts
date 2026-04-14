
import { comparePassword } from '~~/server/utils/auth'
import prisma from '../../utils/prisma'
import { signToken } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { email, password } = body

  const user = await prisma.user.findUnique({
    where: { email }
  })

  if (!user || !(await comparePassword(password, user.password_hash))) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Email ou mot de passe incorrect'
    })
  }

  const token = signToken({ userId: user.id, role: user.role })

  setCookie(event, 'auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7 // 1 week
  })

  const { password_hash, ...userWithoutPassword } = user
  return userWithoutPassword
})
