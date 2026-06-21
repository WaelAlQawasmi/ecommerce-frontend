<script setup lang="ts">
defineProps<{
  message: string
  type?: 'error' | 'success' | 'info'
}>()
</script>

<template>
  <div
    class="flex items-start gap-3 rounded-xl px-4 py-3.5 text-sm"
    :class="{
      'bg-red-50 text-red-800 ring-1 ring-red-200/60': type === 'error' || !type,
      'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200/60': type === 'success',
      'bg-blue-50 text-blue-800 ring-1 ring-blue-200/60': type === 'info',
    }"
    role="alert"
  >
    <svg
      v-if="type === 'error' || !type"
      class="mt-0.5 h-4 w-4 shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    <svg
      v-else-if="type === 'success'"
      class="mt-0.5 h-4 w-4 shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    <span>{{ message }}</span>
  </div>
</template>
