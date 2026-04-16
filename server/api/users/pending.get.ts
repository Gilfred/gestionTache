import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  if (!event.context.auth || event.context.auth.role !== 'SUPER_ADMIN') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Accès interdit'
    })
  }

  const users = await prisma.user.findMany({
    where: {
      isValidated: false
    },
    include: {
      permissions: true
    },
    orderBy: {
      created_at: 'desc'
    }
  })

  return users
})
