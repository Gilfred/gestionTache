<template>
  <div class="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
    <div class="text-center">
      <h1 class="text-9xl font-black text-indigo-200">404</h1>
      <p class="text-2xl font-bold text-gray-800 mt-4">Page non trouvée</p>
      <NuxtLink to="/" class="mt-6 inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-indigo-700 transition-all shadow-lg">
        Retour au tableau de bord
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: false
})
</script>
