import prisma from '~~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const id = parseInt(event.context.params?.id as string)
  const userId = event.context.auth.userId

  const task = await prisma.task.findUnique({
    where: { id }
  })

  if (!task) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Tâche non trouvée'
    })
  }

  if (task.assigned_to !== userId) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Vous ne pouvez soumettre que les tâches qui vous sont attribuées'
    })
  }

  const updatedTask = await prisma.task.update({
    where: { id },
    data: {
      status: 'SUBMITTED',
      submittedAt: new Date()
    }
  })

  return updatedTask
})
