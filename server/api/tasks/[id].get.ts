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

  return task
})
