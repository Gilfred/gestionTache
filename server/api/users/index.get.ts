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

  const selectFields: any = {
    id: true,
    name: true,
    email: true,
    role: true,
  }

  if (isAdmin) {
    selectFields.isValidated = true
    selectFields.created_at = true
    selectFields.permissions = {
      select: {
        id: true,
        name: true
      }
    }
  }

  const users = await prisma.user.findMany({
    where: isSuperAdmin ? {} : { isValidated: true },
    select: selectFields
  })
  return users
})
