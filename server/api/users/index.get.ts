import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  if (!event.context.auth) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Non authentifié'
    })
  }

  const user = await prisma.user.findUnique({
    where: { id: event.context.auth.userId }
  })

  const isSuperAdmin = user?.role === 'SUPER_ADMIN'
  const isValidated = user?.isValidated

  const users = await prisma.user.findMany({
    where: isSuperAdmin ? {} : { isValidated: true },
    select: {
      id: true,
      name: true,
      email: (isSuperAdmin || isValidated) ? true : false,
      role: true,
      isValidated: true,
      created_at: true
    }
  })
  return users
})
