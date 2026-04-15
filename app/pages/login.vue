<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
      <div>
        <h1 class="text-indigo-600 text-4xl font-black text-center mb-2">TaskManager</h1>
        <h2 class="mt-6 text-center text-2xl font-bold text-gray-900">
          Connexion à votre compte
        </h2>
      </div>
      <div v-if="isLogin">
        <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
          <div class="rounded-md shadow-sm space-y-4">
            <div>
              <label for="email-address" class="block text-sm font-medium text-gray-700 mb-1">Adresse email</label>
              <input v-model="form.email" id="email-address" name="email" type="email" required class="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" placeholder="votre@email.com">
            </div>
            <div>
              <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
              <input v-model="form.password" id="password" name="password" type="password" required class="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" placeholder="••••••••">
            </div>
          </div>

          <div v-if="error" class="mt-4 text-red-600 text-sm text-center bg-red-50 p-3 rounded-lg border border-red-200">
            {{ error }}
          </div>

          <div class="mt-6">
            <button type="submit" :disabled="loading" class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all shadow-md">
              {{ loading ? 'Connexion en cours...' : 'Se connecter' }}
            </button>
          </div>
        </form>
      </div>

      <div v-else>
        <form class="mt-8 space-y-6" @submit.prevent="handleRegister">
          <div class="rounded-md shadow-sm space-y-4">
            <div>
              <label for="reg-name" class="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
              <input v-model="form.name" id="reg-name" name="name" type="text" required class="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" placeholder="Jean Dupont">
            </div>
            <div>
              <label for="reg-email" class="block text-sm font-medium text-gray-700 mb-1">Adresse email</label>
              <input v-model="form.email" id="reg-email" name="email" type="email" required class="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" placeholder="votre@email.com">
            </div>
            <div>
              <label for="reg-password" class="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
              <input v-model="form.password" id="reg-password" name="password" type="password" required class="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" placeholder="••••••••">
            </div>
          </div>

          <div v-if="error" class="mt-4 text-red-600 text-sm text-center bg-red-50 p-3 rounded-lg border border-red-200">
            {{ error }}
          </div>

          <div v-if="success" class="mt-4 text-green-600 text-sm text-center bg-green-50 p-3 rounded-lg border border-green-200">
            {{ success }}
          </div>

          <div class="mt-6">
            <button type="submit" :disabled="loading" class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all shadow-md">
              {{ loading ? 'Création en cours...' : 'Créer un compte' }}
            </button>
          </div>
        </form>
      </div>

      <div class="mt-6 text-center">
        <button @click="isLogin = !isLogin; error = ''; success = ''" class="text-indigo-600 hover:text-indigo-500 font-medium">
          {{ isLogin ? "Pas de compte ? Créer un compte" : "Déjà un compte ? Se connecter" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: false,
  middleware: 'auth'
})

const { login } = useAuth()
const isLogin = ref(true)
const form = reactive({
  name: '',
  email: '',
  password: ''
})
const loading = ref(false)
const error = ref('')
const success = ref('')

const handleLogin = async () => {
  loading.value = true
  error.value = ''
  try {
    await login({
      email: form.email,
      password: form.password
    })
    navigateTo('/')
  } catch (e) {
    error.value = e.data?.statusMessage || 'Email ou mot de passe incorrect'
  } finally {
    loading.value = false
  }
}

const handleRegister = async () => {
  loading.value = true
  error.value = ''
  success.value = ''
  try {
    await $fetch('/api/users', {
      method: 'POST',
      body: {
        name: form.name,
        email: form.email,
        password: form.password
      }
    })
    success.value = 'Compte créé avec succès ! Un mail vous a été envoyé. Vous pouvez maintenant vous connecter.'
    isLogin.value = true
  } catch (e) {
    error.value = e.data?.statusMessage || 'Une erreur est survenue lors de la création du compte'
  } finally {
    loading.value = false
  }
}
</script>
