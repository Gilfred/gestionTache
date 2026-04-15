import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const id = parseInt(event.context.params?.id || '')
  if (isNaN(id)) {
    throw createError({ statusCode: 400, statusMessage: 'ID invalide' })
  }

  const task = await prisma.task.findUnique({
    where: { id },
    include: {
      assignedUser: { select: { id: true, name: true } },
      creator: { select: { id: true, name: true } }
    }
  })

  if (!task) {
    throw createError({ statusCode: 404, statusMessage: 'Tâche non trouvée' })
  }

  // If task is DONE, and user is not the assignee or creator/admin, hide rating/feedback
  const userId = event.context.auth?.userId
  const isAdmin = event.context.auth?.role === 'ADMIN'

  if (task.status === 'DONE' && !isAdmin && task.assigned_to !== userId && task.created_by !== userId) {
    const { rating, feedback, ...taskWithoutRating } = task
    return taskWithoutRating
  }

  return task
})
