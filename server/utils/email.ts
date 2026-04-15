import nodemailer from 'nodemailer'

// Mock transport for development - in a real app, use SMTP credentials from .env
const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER || 'mock-user',
    pass: process.env.EMAIL_PASS || 'mock-pass',
  },
})

export const sendEmail = async (to: string, subject: string, text: string, html?: string) => {
  console.log(`Sending email to ${to} with subject: ${subject}`)

  // For development purposes, we just log it.
  // If credentials are provided, it will try to send.
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    try {
      await transporter.sendMail({
        from: '"Task Manager" <noreply@taskmanager.com>',
        to,
        subject,
        text,
        html,
      })
    } catch (error) {
      console.error('Error sending email:', error)
    }
  } else {
    console.log('--- EMAIL CONTENT ---')
    console.log(`TO: ${to}`)
    console.log(`SUBJECT: ${subject}`)
    console.log(`TEXT: ${text}`)
    console.log('----------------------')
  }
}

export const sendRegistrationEmail = async (userEmail: string, userName: string) => {
  const subject = 'Bienvenue - Création de compte réussie'
  const text = `Bonjour ${userName},\n\nVotre compte a été créé avec succès. Un administrateur doit maintenant valider votre inscription avant que vous puissiez accéder à toutes les fonctionnalités.\n\nCordialement,\nL'équipe de gestion de tâches.`
  await sendEmail(userEmail, subject, text)
}

export const sendLoginNotificationEmail = async (userEmail: string) => {
  const subject = 'Nouvelle connexion à votre compte'
  const text = `Bonjour,\n\nVous venez de vous connecter à votre compte. Si ce n'est pas vous, veuillez contacter l'administrateur.\n\nDate: ${new Date().toLocaleString()}`
  await sendEmail(userEmail, subject, text)
}

export const sendTaskRatedEmail = async (userEmail: string, taskTitle: string, rating: number, feedback: string) => {
  const subject = 'Votre tâche a été notée'
  const text = `Bonjour,\n\nVotre tâche "${taskTitle}" a été notée.\n\nNote: ${rating}/5\nAppréciation: ${feedback}\n\nConnectez-vous pour voir les détails.`
  await sendEmail(userEmail, subject, text)
}

export const sendTaskAssignedEmail = async (userEmail: string, taskTitle: string, dueDate: string) => {
  const subject = 'Nouvelle tâche attribuée'
  const text = `Bonjour,\n\nUne nouvelle tâche vous a été attribuée : "${taskTitle}".\n\nDate d'échéance : ${dueDate}\n\nVeuillez vous connecter pour voir les détails.`
  await sendEmail(userEmail, subject, text)
}
