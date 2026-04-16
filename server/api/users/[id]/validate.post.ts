import prisma from '../../../utils/prisma'

export default defineEventHandler(async (event) => {
  if (!event.context.auth || event.context.auth.role !== 'SUPER_ADMIN') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Accès interdit'
    })
  }

  const id = parseInt(event.context.params?.id as string)
  const body = await readBody(event)
  const { isValidated } = body

  const user = await prisma.user.update({
    where: { id },
    data: { isValidated }
  })

  const { password_hash, ...userWithoutPassword } = user
  return userWithoutPassword
})
