<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Gestion des Tâches</h1>
      <button v-if="isAdmin" @click="showCreateModal = true" class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
        Nouvelle Tâche
      </button>
    </div>

    <!-- Filtres -->
    <div class="bg-white p-4 rounded-lg shadow mb-6 flex flex-wrap gap-4">
      <div class="flex-1 min-w-[200px]">
        <input v-model="filters.search" type="text" placeholder="Rechercher par titre..." class="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
      </div>
      <select v-model="filters.status" class="border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
        <option value="">Tous les statuts</option>
        <option value="TODO">À faire</option>
        <option value="IN_PROGRESS">En cours</option>
        <option value="SUBMITTED">Soumis (A noter)</option>
        <option value="DONE">Terminé</option>
      </select>
      <select v-model="filters.priority" class="border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
        <option value="">Toutes les priorités</option>
        <option value="LOW">Basse</option>
        <option value="MEDIUM">Moyenne</option>
        <option value="HIGH">Haute</option>
      </select>
      <select v-model="filters.assigned_to" class="border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
        <option value="">Tous les utilisateurs</option>
        <option v-for="u in users" :key="u.id" :value="u.id">{{ u.name }}</option>
      </select>
    </div>

    <!-- Liste des tâches -->
    <div class="bg-white shadow overflow-hidden sm:rounded-md">
      <ul class="divide-y divide-gray-200">
        <li v-for="task in filteredTasks" :key="task.id" class="px-4 py-4 sm:px-6 hover:bg-gray-50">
          <div class="flex items-center justify-between">
            <div class="flex-1 min-w-0">
              <h3 class="text-lg font-medium text-indigo-600 truncate">{{ task.title }}</h3>
              <p class="text-sm text-gray-500">{{ task.description }}</p>
              <div class="mt-2 flex items-center gap-4 text-xs">
                <span :class="statusClass(task.status)" class="px-2 py-1 rounded-full font-semibold">
                  {{ statusLabel(task.status) }}
                </span>
                <span :class="priorityClass(task.priority)" class="px-2 py-1 rounded-full font-semibold">
                  {{ priorityLabel(task.priority) }}
                </span>
                <span class="text-gray-400">Assigné à: {{ task.assignedUser?.name || 'Personne' }}</span>
                <span v-if="task.due_date" :class="{'text-red-500': isOverdue(task)}" class="text-gray-400">
                  Échéance: {{ formatDate(task.due_date) }}
                </span>
                <span v-if="task.rating" class="text-yellow-600 font-bold">
                  Note: {{ task.rating }}/5
                </span>
                <span v-if="task.submittedAt" class="text-gray-400">
                  Durée: {{ calculateDuration(task.created_at, task.submittedAt) }}
                </span>
                <span v-if="task.submittedAt && task.due_date" :class="new Date(task.submittedAt) > new Date(task.due_date) ? 'text-red-600 font-bold' : 'text-green-600 font-bold'">
                  {{ new Date(task.submittedAt) > new Date(task.due_date) ? '(En retard)' : '(À temps)' }}
                </span>
              </div>
              <div v-if="task.feedback" class="mt-1 text-xs text-gray-400 italic">
                "{{ task.feedback }}"
              </div>
            </div>
            <div class="ml-4 flex-shrink-0 flex items-center gap-2">
              <button v-if="canSubmit(task)" @click="submitTask(task.id)" class="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700">Tâche terminée</button>
              <button v-if="canRate(task)" @click="openRateModal(task)" class="bg-yellow-600 text-white px-3 py-1 rounded text-xs hover:bg-yellow-700">Noter</button>
              <button v-if="isAdmin || task.created_by === user.id" @click="editTask(task)" class="text-indigo-600 hover:text-indigo-900">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
              </button>
              <button v-if="isAdmin || task.created_by === user.id" @click="deleteTask(task.id)" class="text-red-600 hover:text-red-900">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>
              </button>
            </div>
          </div>
        </li>
      </ul>
      <div v-if="filteredTasks.length === 0" class="p-10 text-center text-gray-500">
        Aucune tâche trouvée.
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showCreateModal || editingTaskData" class="fixed z-50 inset-0 overflow-y-auto">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 transition-opacity" aria-hidden="true">
          <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form @submit.prevent="saveTask">
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
                {{ editingTaskData ? 'Modifier la tâche' : 'Nouvelle tâche' }}
              </h3>
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700">Titre</label>
                  <input v-model="form.title" type="text" required class="mt-1 block w-full border-gray-300 rounded-md shadow-sm sm:text-sm p-2 border">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Description</label>
                  <textarea v-model="form.description" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm sm:text-sm p-2 border"></textarea>
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Statut</label>
                    <select v-model="form.status" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm sm:text-sm p-2 border">
                      <option value="TODO">À faire</option>
                      <option value="IN_PROGRESS">En cours</option>
                      <option value="SUBMITTED">Soumis</option>
                      <option value="DONE">Terminé</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Priorité</label>
                    <select v-model="form.priority" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm sm:text-sm p-2 border">
                      <option value="LOW">Basse</option>
                      <option value="MEDIUM">Moyenne</option>
                      <option value="HIGH">Haute</option>
                    </select>
                  </div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Échéance</label>
                    <input v-model="form.due_date" type="date" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm sm:text-sm p-2 border">
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Assigné à</label>
                    <select v-model="form.assigned_to" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm sm:text-sm p-2 border">
                      <option :value="null">Non assigné</option>
                      <option v-for="u in validatedUsers" :key="u.id" :value="u.id">{{ u.name }}</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button type="submit" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm">
                Enregistrer
              </button>
              <button @click="closeModal" type="button" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                Annuler
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Rating Modal -->
    <div v-if="ratingTask" class="fixed z-50 inset-0 overflow-y-auto">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 transition-opacity" aria-hidden="true">
          <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form @submit.prevent="saveRating">
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Noter la tâche: {{ ratingTask.title }}</h3>
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700">Note (1-5)</label>
                  <select v-model="ratingForm.rating" required class="mt-1 block w-full border-gray-300 rounded-md shadow-sm sm:text-sm p-2 border">
                    <option value="1">1 - Insuffisant</option>
                    <option value="2">2 - Passable</option>
                    <option value="3">3 - Bien</option>
                    <option value="4">4 - Très bien</option>
                    <option value="5">5 - Excellent</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Appréciation</label>
                  <textarea v-model="ratingForm.feedback" required class="mt-1 block w-full border-gray-300 rounded-md shadow-sm sm:text-sm p-2 border" rows="3"></textarea>
                </div>
              </div>
            </div>
            <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button type="submit" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-yellow-600 text-base font-medium text-white hover:bg-yellow-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm">
                Valider la note
              </button>
              <button @click="ratingTask = null" type="button" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
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

const { user, isAdmin, isSuperAdmin, isResponsable } = useAuth()
const { data: tasks, refresh: refreshTasks } = await useFetch('/api/tasks')
const { data: users } = await useFetch('/api/users')
const validatedUsers = computed(() => users.value?.filter(u => u.isValidated) || [])

const filters = reactive({
  search: '',
  status: '',
  priority: '',
  assigned_to: ''
})

const filteredTasks = computed(() => {
  if (!tasks.value) return []
  return tasks.value.filter(task => {
    const matchSearch = !filters.search || task.title.toLowerCase().includes(filters.search.toLowerCase())
    const matchStatus = !filters.status || task.status === filters.status
    const matchPriority = !filters.priority || task.priority === filters.priority
    const matchUser = !filters.assigned_to || task.assigned_to === parseInt(filters.assigned_to)
    return matchSearch && matchStatus && matchPriority && matchUser
  })
})

const showCreateModal = ref(false)
const editingTaskData = ref(null)
const ratingTask = ref(null)

const ratingForm = reactive({
  rating: 5,
  feedback: ''
})

const form = reactive({
  title: '',
  description: '',
  status: 'TODO',
  priority: 'MEDIUM',
  due_date: '',
  assigned_to: null
})

const editTask = (task) => {
  editingTaskData.value = task
  form.title = task.title
  form.description = task.description
  form.status = task.status
  form.priority = task.priority
  form.due_date = task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : ''
  form.assigned_to = task.assigned_to
}

const closeModal = () => {
  showCreateModal.value = false
  editingTaskData.value = null
  resetForm()
}

const resetForm = () => {
  form.title = ''
  form.description = ''
  form.status = 'TODO'
  form.priority = 'MEDIUM'
  form.due_date = ''
  form.assigned_to = null
}

const saveTask = async () => {
  const url = editingTaskData.value ? `/api/tasks/${editingTaskData.value.id}` : '/api/tasks'
  const method = editingTaskData.value ? 'PUT' : 'POST'
  
  try {
    await $fetch(url, {
      method,
      body: form
    })
    await refreshTasks()
    closeModal()
  } catch (e) {
    alert(e.data?.statusMessage || 'Une erreur est survenue')
  }
}

const deleteTask = async (id) => {
  if (confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
    try {
      await $fetch(`/api/tasks/${id}`, { method: 'DELETE' })
      await refreshTasks()
    } catch (e) {
      alert(e.data?.statusMessage || 'Une erreur est survenue')
    }
  }
}

const canSubmit = (task) => task.assigned_to === user.value.id && task.status !== 'SUBMITTED' && task.status !== 'DONE'
const canRate = (task) => (isSuperAdmin.value || (isResponsable.value && task.created_by === user.value.id)) && task.status === 'SUBMITTED'

const submitTask = async (id) => {
  try {
    await $fetch(`/api/tasks/${id}/submit`, { method: 'POST' })
    await refreshTasks()
  } catch (e) {
    alert(e.data?.statusMessage || 'Une erreur est survenue')
  }
}

const openRateModal = (task) => {
  ratingTask.value = task
  ratingForm.rating = 5
  ratingForm.feedback = ''
}

const saveRating = async () => {
  try {
    await $fetch(`/api/tasks/${ratingTask.value.id}/rate`, {
      method: 'POST',
      body: ratingForm
    })
    ratingTask.value = null
    await refreshTasks()
  } catch (e) {
    alert(e.data?.statusMessage || 'Une erreur est survenue')
  }
}

const statusLabel = (s) => ({ TODO: 'À faire', IN_PROGRESS: 'En cours', SUBMITTED: 'Soumis', DONE: 'Terminé' }[s])
const priorityLabel = (p) => ({ LOW: 'Basse', MEDIUM: 'Moyenne', HIGH: 'Haute' }[p])

const statusClass = (s) => ({
  TODO: 'bg-gray-100 text-gray-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  SUBMITTED: 'bg-yellow-100 text-yellow-800',
  DONE: 'bg-green-100 text-green-800'
}[s])

const priorityClass = (p) => ({
  LOW: 'bg-green-50 text-green-700',
  MEDIUM: 'bg-yellow-50 text-yellow-700',
  HIGH: 'bg-red-50 text-red-700'
}[p])

const formatDate = (d) => new Date(d).toLocaleDateString()
const isOverdue = (t) => t.status !== 'DONE' && t.due_date && new Date(t.due_date) < new Date()

const calculateDuration = (start, end) => {
  const startDate = new Date(start)
  const endDate = new Date(end)
  const diffInMs = endDate - startDate
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
  const diffInDays = Math.floor(diffInHours / 24)
  
  if (diffInDays > 0) {
    return `${diffInDays}j ${diffInHours % 24}h`
  }
  return `${diffInHours}h`
}
</script>
