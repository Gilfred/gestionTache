export default defineEventHandler(async (event) => {
  if (!event.context.auth || event.context.auth.role !== 'ADMIN') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Accès interdit'
    })
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      created_at: true
    }
  })
  return users
})
