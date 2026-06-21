<script setup lang="ts">
defineProps<{
  message?: string
}>()
</script>

<template>
  <div class="flex flex-col items-center justify-center py-20">
    <div class="relative h-10 w-10">
      <div class="absolute inset-0 rounded-full border-2 border-brand-100" />
      <div class="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-brand-600" />
    </div>
    <span v-if="message" class="mt-4 text-sm font-medium text-slate-500">{{ message }}</span>
  </div>
</template>

<style scoped>
@keyframes spin {
  to { transform: rotate(360deg); }
}
.animate-spin {
  animation: spin 0.7s linear infinite;
}
</style>
