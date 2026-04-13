export default defineEventHandler(async (event) => {
  if (!event.context.auth) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Non authentifié'
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
    }
  })

  return task
})
