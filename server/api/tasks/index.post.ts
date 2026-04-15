import prisma from '../../utils/prisma'
import { sendTaskAssignedEmail } from '~~/server/utils/email'

export default defineEventHandler(async (event) => {
  const userRole = event.context.auth?.role

  if (!event.context.auth || (userRole !== 'SUPER_ADMIN' && userRole !== 'RESPONSABLE')) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Seul un Super Admin ou un Responsable peut créer des tâches'
    })
  }

  const body = await readBody(event)
  const { title, description, status, priority, due_date, assigned_to } = body

  const task = await prisma.task.create({
    data: {
      title,
      description,
      status: status || 'TODO',
      priority: priority || 'MEDIUM',
      due_date: due_date ? new Date(due_date) : null,
      assigned_to: assigned_to ? parseInt(assigned_to) : null,
      created_by: event.context.auth.userId
    },
    include: {
      assignedUser: true
    }
  })

  if (task.assignedUser && task.due_date) {
    await sendTaskAssignedEmail(
      task.assignedUser.email,
      task.title,
      task.due_date.toLocaleDateString()
    )
  }

  return task
})
