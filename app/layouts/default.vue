<template>
  <div class="min-h-screen bg-gray-100">
    <nav class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex">
            <NuxtLink to="/" class="flex-shrink-0 flex items-center font-bold text-xl text-indigo-600">
              TaskManager
            </NuxtLink>
            <div class="hidden sm:-my-px sm:ml-6 sm:flex sm:space-x-8">
              <NuxtLink to="/" class="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                Dashboard
              </NuxtLink>
              <NuxtLink to="/tasks" class="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                Tâches
              </NuxtLink>
              <NuxtLink to="/users" class="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                Utilisateurs
              </NuxtLink>
            </div>
          </div>
          <div class="flex items-center">
            <div v-if="user" class="flex items-center space-x-4">
              <span class="text-sm text-gray-700">{{ user.name }} ({{ user.role }})</span>
              <button @click="logout" class="text-sm font-medium text-red-600 hover:text-red-500">
                Déconnexion
              </button>
            </div>
            <NuxtLink v-else to="/login" class="text-sm font-medium text-indigo-600 hover:text-indigo-500">
              Connexion
            </NuxtLink>
          </div>
        </div>
      </div>
    </nav>

    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <slot />
    </main>
  </div>
</template>

<script setup>
const { user, isAdmin, logout } = useAuth()
</script>

<style>
.router-link-active {
  border-color: #4f46e5 !important;
  color: #111827 !important;
}
</style>
