export default defineEventHandler(async (event) => {
  if (!event.context.auth) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Non authentifié'
    })
  }

  const query = getQuery(event)
  const { status, priority, assigned_to, search } = query

  const where: any = {}

  if (status) where.status = status
  if (priority) where.priority = priority
  if (assigned_to) where.assigned_to = parseInt(assigned_to as string)
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
      creator: {
        select: { id: true, name: true }
      }
    },
    orderBy: {
      created_at: 'desc'
    }
  })

  return tasks
})
