import prisma from '../../utils/prisma'
import { hashPassword } from '../../utils/auth'
import { sendRegistrationEmail } from '../../utils/email'
import { Prisma } from '@prisma/client'

export default defineEventHandler(async (event) => {

  // Compter le nombre d'utilisateurs existants
  // (le premier utilisateur sera automatiquement ADMIN)
  const userCount = await prisma.user.count()

  //Récupération des données envoyées par le client
  const body = await readBody(event)
  const { name, email, password, role } = body

  //Définir le rôle du premier utilisateur comme ADMIN
  const isFirstUser = userCount === 0
  const userRole = isFirstUser ? 'ADMIN' : (role || 'USER')

  //Le premier utilisateur est automatiquement validé
  const isValidated = isFirstUser

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