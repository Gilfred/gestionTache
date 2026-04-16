import prisma from '~~/server/utils/prisma'
import { sendTaskSubmittedEmail } from '~~/server/utils/email'

export default defineEventHandler(async (event) => {
  const id = parseInt(event.context.params?.id as string)
  const userId = event.context.auth.userId

  const task = await prisma.task.findUnique({
    where: { id },
    include: {
      createdUser: true,
      assignedUser: true
    }
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

  const now = new Date()
  let status: 'SUBMITTED' = 'SUBMITTED'

  const updatedTask = await prisma.task.update({
    where: { id },
    data: {
      status,
      submittedAt: now
    }
  })

  const timeliness = task.due_date && now > new Date(task.due_date) ? 'rendu en retard' : 'rendu dans le temps imparti'

  // Notify creator (Admin/Responsable)
  if (task.createdUser) {
    await sendTaskSubmittedEmail(task.createdUser.email, task.title, task.assignedUser?.name || 'Un utilisateur', timeliness)
  }

  // Also notify all SUPER_ADMINs if the creator is not a SUPER_ADMIN
  if (task.createdUser.role !== 'SUPER_ADMIN') {
    const superAdmins = await prisma.user.findMany({
      where: { role: 'SUPER_ADMIN' }
    })
    for (const admin of superAdmins) {
      if (admin.id !== task.created_by) {
        await sendTaskSubmittedEmail(admin.email, task.title, task.assignedUser?.name || 'Un utilisateur', timeliness)
      }
    }
  }

  return updatedTask
})
