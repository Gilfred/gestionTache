import prisma from '~~/server/utils/prisma'
import { sendTaskRatedEmail } from '~~/server/utils/email'

export default defineEventHandler(async (event) => {
  const id = parseInt(event.context.params?.id as string)
  const userId = event.context.auth.userId
  const body = await readBody(event)
  const { rating, feedback } = body

  const task = await prisma.task.findUnique({
    where: { id },
    include: {
      assignedUser: true
    }
  })

  if (!task) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Tâche non trouvée'
    })
  }

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (user?.role !== 'SUPER_ADMIN') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Seul le Super Admin peut noter les tâches'
    })
  }

  const updatedTask = await prisma.task.update({
    where: { id },
    data: {
      status: 'DONE',
      rating: parseInt(rating),
      feedback
    }
  })

  if (task.assignedUser) {
    await sendTaskRatedEmail(task.assignedUser.email, task.title, rating, feedback)
  }

  return updatedTask
})
