<template>
  <div class="max-w-4xl mx-auto">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Gestion des Utilisateurs</h1>
      <button @click="showModal = true" class="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-all shadow-md">
        Nouvel Utilisateur
      </button>
    </div>

    <div class="bg-white shadow-md rounded-xl overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rôle</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
            <th v-if="isAdmin" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50 transition-colors">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ user.name }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ user.email }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              <span :class="user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'" class="px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                {{ user.role }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              <span :class="user.isValidated ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'" class="px-2 py-1 rounded-full text-xs font-bold">
                {{ user.isValidated ? 'Validé' : 'En attente' }}
              </span>
            </td>
            <td v-if="isAdmin" class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              <button v-if="!user.isValidated" @click="validateUser(user.id)" class="text-indigo-600 hover:text-indigo-900 font-bold">Valider</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="fixed z-50 inset-0 overflow-y-auto">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 transition-opacity" aria-hidden="true">
          <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        <div class="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form @submit.prevent="createUser">
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <h3 class="text-xl leading-6 font-bold text-gray-900 mb-6">Nouvel Utilisateur</h3>
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
                  <input v-model="form.name" type="text" required class="mt-1 block w-full border-gray-300 rounded-lg shadow-sm sm:text-sm p-3 border focus:ring-indigo-500 focus:border-indigo-500">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input v-model="form.email" type="email" required class="mt-1 block w-full border-gray-300 rounded-lg shadow-sm sm:text-sm p-3 border focus:ring-indigo-500 focus:border-indigo-500">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
                  <select v-model="form.role" class="mt-1 block w-full border-gray-300 rounded-lg shadow-sm sm:text-sm p-3 border focus:ring-indigo-500 focus:border-indigo-500 bg-white">
                    <option value="USER">Utilisateur</option>
                    <option value="ADMIN">Administrateur</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Mot de passe provisoire</label>
                  <input v-model="form.password" type="password" required class="mt-1 block w-full border-gray-300 rounded-lg shadow-sm sm:text-sm p-3 border focus:ring-indigo-500 focus:border-indigo-500">
                </div>
              </div>
            </div>
            <div class="bg-gray-50 px-4 py-4 sm:px-6 sm:flex sm:flex-row-reverse">
              <button type="submit" class="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-6 py-2 bg-indigo-600 text-base font-bold text-white hover:bg-indigo-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm">
                Créer l'utilisateur
              </button>
              <button @click="showModal = false" type="button" class="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-6 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                Annuler
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: 'auth'
})

const { isAdmin } = useAuth()

const { data: users, refresh } = await useFetch('/api/users')

const showModal = ref(false)
const form = reactive({
  name: '',
  email: '',
  role: 'USER',
  password: 'password123'
})

const createUser = async () => {
  try {
    await $fetch('/api/users', {
      method: 'POST',
      body: form
    })
    await refresh()
    showModal.value = false
    form.name = ''
    form.email = ''
    form.role = 'USER'
    form.password = 'password123'
  } catch (e) {
    alert(e.data?.statusMessage || 'Une erreur est survenue')
  }
}

const validateUser = async (userId) => {
  try {
    await $fetch(`/api/users/${userId}.validate`, {
      method: 'POST',
      body: { isValidated: true }
    })
    await refresh()
  } catch (e) {
    alert(e.data?.statusMessage || 'Une erreur est survenue')
  }
}
</script>
