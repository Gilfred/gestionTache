import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  if (!event.context.auth) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Non authentifié'
    })
  }

  const query = getQuery(event)
  const { status, priority, assigned_to, search } = query

  const user = await prisma.user.findUnique({
    where: { id: event.context.auth.userId }
  })

  if (!user?.isValidated && user?.role !== 'SUPER_ADMIN') {
    return [] // Non-validated users see no tasks
  }

  const where: any = {}

  // Restriction for regular users
  if (user?.role === 'USER') {
    where.assigned_to = user.id
  }

  if (status) where.status = status
  if (priority) where.priority = priority

  if (user?.role === 'USER') {
    where.assigned_to = user.id
  } else if (assigned_to) {
    where.assigned_to = parseInt(assigned_to as string)
  }
  if (search) {
    where.title = {
      contains: search as string
    }
  }

  const tasks = await prisma.task.findMany({
    where,
    include: {
      assignedUser: {
        select: { id: true, name: true }
      },
      createdUser: {
        select: { id: true, name: true }
      }
    },
    orderBy: {
      created_at: 'desc'
    }
  })

  return tasks
})
