export default defineEventHandler(async (event) => {
  const id = parseInt(event.context.params?.id || '')
  if (isNaN(id)) {
    throw createError({ statusCode: 400, statusMessage: 'ID invalide' })
  }

  await prisma.task.delete({
    where: { id }
  })

  return { message: 'Tâche supprimée' }
})
