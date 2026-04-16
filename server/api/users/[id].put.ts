import prisma from '~~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const id = parseInt(event.context.params?.id as string)
  const body = await readBody(event)
  const { role, permissions } = body

  // Only SUPER_ADMIN can edit roles and permissions
  const currentUser = await prisma.user.findUnique({
    where: { id: event.context.auth.userId }
  })

  if (currentUser?.role !== 'SUPER_ADMIN') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Interdit : Seul le Super Admin peut modifier les rôles et permissions'
    })
  }

  // Update user role and permissions
  const updatedUser = await prisma.user.update({
    where: { id },
    data: {
      role: role,
      permissions: {
        set: permissions?.map((pId: number) => ({ id: pId })) || []
      }
    },
    include: {
      permissions: true
    }
  })

  return updatedUser
})
