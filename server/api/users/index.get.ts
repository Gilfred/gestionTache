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
  const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'RESPONSABLE'

  const users = await prisma.user.findMany({
    where: isSuperAdmin ? {} : { isValidated: true },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isValidated: isAdmin,
      created_at: isAdmin,
      permissions: isAdmin ? {
        select: {
          id: true,
          name: true
        }
      } : false
    }
  })
  return users
})
