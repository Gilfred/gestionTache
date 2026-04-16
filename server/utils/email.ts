import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT),
  secure: process.env.MAIL_SECURE === 'true',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
})

export const sendEmail = async (to: string, subject: string, text: string, html?: string) => {
  await transporter.sendMail({
    from: `"Task Manager" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
    html,
  })
}

// LOGIN
export const sendLoginNotificationEmail = async (userEmail: string) => {
  await sendEmail(
    userEmail,
    'Nouvelle connexion à votre compte',
    `Vous venez de vous connecter le ${new Date().toLocaleString()}`
  )
}

// TASK RATED
export const sendTaskRatedEmail = async (
  userEmail: string,
  taskTitle: string,
  rating: number,
  feedback: string
) => {
  await sendEmail(
    userEmail,
    'Votre tâche a été notée',
    `Tâche: ${taskTitle}\nNote: ${rating}/5\nFeedback: ${feedback}`
  )
}

export const sendTaskAssignedEmail = async (
    userEmail: string,
    taskTitle: string,
    dueDate: string
  ) => {
    await sendEmail(
      userEmail,
      'Nouvelle tâche attribuée',
      `Bonjour,

  Une nouvelle tâche vous a été attribuée : "${taskTitle}".

  Date d'échéance : ${dueDate}

  Veuillez vous connecter pour voir les détails.`
    )
}

export const sendRegistrationEmail = async (
    userEmail: string,
    userName: string
  ) => {
    await sendEmail(
      userEmail,
      'Bienvenue - Création de compte réussie',
      `Bonjour ${userName},

  Votre compte a été créé avec succès.

  Un administrateur doit valider votre inscription avant accès complet.

  Cordialement,
  L'équipe Task Manager`
    )
}

export const sendAdminNotificationEmail = async (
  adminEmail: string,
  newUserEmail: string,
  newUserName: string
) => {
  await sendEmail(
    adminEmail,
    'Nouvelle inscription à valider',
    `Bonjour,

  Un nouvel utilisateur s'est inscrit : ${newUserName} (${newUserEmail}).

  Veuillez vous connecter au tableau de bord pour valider son compte afin qu'il puisse recevoir des tâches.

  Cordialement,
  L'équipe Task Manager`
  )
}

export const sendTaskSubmittedEmail = async (
  email: string,
  taskTitle: string,
  userName: string,
  timeliness: string
) => {
  await sendEmail(
    email,
    'Tâche terminée et soumise',
    `Bonjour,

  La tâche "${taskTitle}" a été marquée comme terminée par ${userName} (${timeliness}).

  Veuillez vous connecter pour l'évaluer et lui attribuer une note.

  Cordialement,
  L'équipe Task Manager`
  )
}