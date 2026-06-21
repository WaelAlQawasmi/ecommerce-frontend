<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  page: number
  totalPages: number
}>()

const emit = defineEmits<{
  'update:page': [page: number]
}>()

const pages = computed(() => {
  const result: number[] = []
  const start = Math.max(1, props.page - 2)
  const end = Math.min(props.totalPages, props.page + 2)
  for (let i = start; i <= end; i++) result.push(i)
  return result
})

function goTo(page: number) {
  if (page >= 1 && page <= props.totalPages) emit('update:page', page)
}
</script>

<template>
  <nav v-if="totalPages > 1" class="flex items-center justify-center gap-1.5" aria-label="Pagination">
    <button
      class="btn btn-secondary px-3.5 py-2"
      :disabled="page <= 1"
      @click="goTo(page - 1)"
    >
      ← Prev
    </button>
    <button
      v-for="p in pages"
      :key="p"
      class="btn min-w-[2.5rem] px-3 py-2"
      :class="p === page ? 'btn-primary' : 'btn-secondary'"
      @click="goTo(p)"
    >
      {{ p }}
    </button>
    <button
      class="btn btn-secondary px-3.5 py-2"
      :disabled="page >= totalPages"
      @click="goTo(page + 1)"
    >
      Next →
    </button>
  </nav>
</template>
