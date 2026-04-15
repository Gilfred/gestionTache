import prisma from '../../utils/prisma'
import { hashPassword } from '../../utils/auth'
import { sendRegistrationEmail, sendAdminNotificationEmail } from '../../utils/email'
import { Prisma } from '@prisma/client'

export default defineEventHandler(async (event) => {

  //Récupération des données envoyées par le client
  const body = await readBody(event)
  const { name, email, password, role } = body

  // Vérifier si l'utilisateur existe déjà avant de compter
  const existingUser = await prisma.user.findUnique({
    where: { email }
  })

  if (existingUser) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Cet email existe déjà'
    })
  }

  // Compter le nombre d'utilisateurs existants
  // (le premier utilisateur sera automatiquement SUPER_ADMIN)
  const userCount = await prisma.user.count()

  //Définir le rôle du premier utilisateur comme SUPER_ADMIN
  const isFirstUser = userCount === 0
  
  // Seul un super admin authentifié peut choisir un rôle ou valider un compte
  const isSuperAdminRequest = event.context.auth?.role === 'SUPER_ADMIN'
  const userRole = isFirstUser ? 'SUPER_ADMIN' : (isSuperAdminRequest ? (role || 'USER') : 'USER')

  //Le premier utilisateur est automatiquement validé
  const isValidated = isFirstUser || (isSuperAdminRequest ? (body.isValidated || false) : false)

  // Hachage du mot de passe pour la sécurité
  const hashedPassword = await hashPassword(password || 'password123')

  try {

    // Création de l'utilisateur dans la base de données
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password_hash: hashedPassword,
        role: userRole,
        isValidated
      }
    })

    // Envoi d'un email de confirmation après création réussie
    await sendRegistrationEmail(user.email, user.name)

    // Notifier le Super Admin s'il ne s'agit pas du premier utilisateur (qui est déjà admin)
    if (!isFirstUser && !isValidated) {
      const superAdmins = await prisma.user.findMany({
        where: { role: 'SUPER_ADMIN' }
      })
      for (const admin of superAdmins) {
        await sendAdminNotificationEmail(admin.email, user.email, user.name)
      }
    }

    // On enlève le mot de passe avant de renvoyer les données
    const { password_hash, ...userWithoutPassword } = user
    return userWithoutPassword
  }

  catch (error) {

    // Gestion des erreurs Prisma
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      // Email déjà utilisé
      throw createError({
        statusCode: 409,
        statusMessage: 'Cet email existe déjà'
      })
    }

    // Autres erreurs serveur
    throw createError({
      statusCode: 500,
      statusMessage: 'Erreur lors de la création de l’utilisateur'
    })
  }
})