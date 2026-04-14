import { verifyToken } from "../utils/auth"
import prisma from "../utils/prisma"

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'auth_token')
  
  if (token) {
    const decoded = verifyToken(token) as any
    if (decoded) {
      event.context.auth = decoded
    }
  }

  const path = getRequestURL(event).pathname
  const isUserApi = path.startsWith('/api/users')
  const isTaskApi = path.startsWith('/api/tasks')
  
  if (isUserApi || isTaskApi) {
    if (!event.context.auth) {

      if (isUserApi && event.method === 'POST') {
        const userCount = await prisma.user.count()
        if (userCount === 0) return
      }
      
      throw createError({
        statusCode: 401,
        statusMessage: 'Non authentifié'
      })
    }
  }
})