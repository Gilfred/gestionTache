export default defineEventHandler(async (event) => {
  const id = parseInt(event.context.params?.id || '')
  if (isNaN(id)) {
    throw createError({ statusCode: 400, statusMessage: 'ID invalide' })
  }

  const body = await readBody(event)
  const { title, description, status, priority, due_date, assigned_to } = body

  const task = await prisma.task.update({
    where: { id },
    data: {
      title,
      description,
      status,
      priority,
      due_date: due_date ? new Date(due_date) : null,
      assigned_to: assigned_to ? parseInt(assigned_to) : null
    }
  })

  return task
})
