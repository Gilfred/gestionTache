<template>
  <div>
    <h1 class="text-2xl font-bold mb-6">Tableau de Bord</h1>

    <div v-if="pending" class="text-center py-10">Chargement...</div>

    <div v-else-if="stats" class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
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
  </div>
</template>

<script setup>
definePageMeta({
  middleware: 'auth'
})

const { data: tasks, pending } = await useFetch('/api/tasks')

const stats = computed(() => {
  if (!tasks.value) return null

  const now = new Date()
  return {
    total: tasks.value.length,
    inProgress: tasks.value.filter(t => t.status === 'IN_PROGRESS').length,
    done: tasks.value.filter(t => t.status === 'DONE').length,
    overdue: tasks.value.filter(t => t.status !== 'DONE' && t.due_date && new Date(t.due_date) < now).length
  }
})
</script>
