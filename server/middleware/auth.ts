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
    // Allow user registration (POST /api/users) without auth
    if (isUserApi && event.method === 'POST') {
      return
    }

    if (!event.context.auth) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Non authentifié'
      })
    }
  }
})