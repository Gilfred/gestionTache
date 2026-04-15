<template>
  <div>
    <h1 class="text-2xl font-bold mb-2">Tableau de Bord</h1>
    <div v-if="user" class="mb-6 flex items-center gap-2">
      <span class="text-gray-600">Bienvenue, <span class="font-bold">{{ user.name }}</span></span>
      <span :class="user.isValidated ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'" class="px-2 py-0.5 rounded text-xs font-bold">
        {{ user.isValidated ? 'Compte Validé' : 'Compte en attente de validation' }}
      </span>
    </div>

    <div v-if="user && !user.isValidated && !isAdmin" class="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm text-yellow-700">
            Votre compte n'est pas encore validé par l'administrateur. Vous ne pouvez pas voir vos tâches pour le moment.
          </p>
        </div>
      </div>
    </div>

    <div v-if="pending" class="text-center py-10">Chargement...</div>
    
    <div v-else-if="stats" class="space-y-6">
      <h2 class="text-lg font-medium text-gray-900">
        {{ isAdmin ? 'Statistiques Globales' : 'Mes Statistiques' }}
      </h2>
      <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <dt class="text-sm font-medium text-gray-500 truncate">Total des tâches</dt>
            <dd class="mt-1 text-3xl font-semibold text-gray-900">{{ stats.total }}</dd>
          </div>
        </div>
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <dt class="text-sm font-medium text-gray-500 truncate">En cours</dt>
            <dd class="mt-1 text-3xl font-semibold text-blue-600">{{ stats.inProgress }}</dd>
          </div>
        </div>
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <dt class="text-sm font-medium text-gray-500 truncate">Terminées</dt>
            <dd class="mt-1 text-3xl font-semibold text-green-600">{{ stats.done }}</dd>
          </div>
        </div>
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <dt class="text-sm font-medium text-gray-500 truncate">En retard</dt>
            <dd class="mt-1 text-3xl font-semibold text-red-600">{{ stats.overdue }}</dd>
          </div>
        </div>
      </div>

      <div v-if="!isAdmin && filteredTasks.length > 0" class="mt-8">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Mes tâches récentes</h3>
        <div class="bg-white shadow overflow-hidden sm:rounded-md">
          <ul class="divide-y divide-gray-200">
            <li v-for="task in filteredTasks.slice(0, 5)" :key="task.id">
              <div class="px-4 py-4 sm:px-6">
                <div class="flex items-center justify-between">
                  <p class="text-sm font-medium text-indigo-600 truncate">{{ task.title }}</p>
                  <div class="ml-2 flex-shrink-0 flex">
                    <p class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full" :class="task.status === 'DONE' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'">
                      {{ task.status }}
                    </p>
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: 'auth'
})

const { user, isAdmin } = useAuth()
const { data: tasks, pending } = await useFetch('/api/tasks')

const filteredTasks = computed(() => {
  if (!tasks.value) return []
  if (isAdmin.value) return tasks.value
  return tasks.value.filter(t => t.assigned_to === user.value?.id)
})

const stats = computed(() => {
  if (!tasks.value) return null
  
  const relevantTasks = filteredTasks.value
  const now = new Date()

  return {
    total: relevantTasks.length,
    inProgress: relevantTasks.filter(t => t.status === 'IN_PROGRESS').length,
    done: relevantTasks.filter(t => t.status === 'DONE').length,
    overdue: relevantTasks.filter(t => t.status !== 'DONE' && t.due_date && new Date(t.due_date) < now).length
  }
})
</script>
