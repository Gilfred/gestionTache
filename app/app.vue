<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup>
const { fetchUser } = useAuth()
onMounted(() => {
  fetchUser()
})
</script>
