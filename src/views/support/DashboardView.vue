<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { authApi } from '@/api/auth.api'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import { extractErrorMessage } from '@/utils/helpers'

const userCount = ref(0)
const loading = ref(true)
const error = ref<string | null>(null)

onMounted(async () => {
  try {
    const { data } = await authApi.getUserCount()
    userCount.value = data.data.count
  } catch (err) {
    error.value = extractErrorMessage(err)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="animate-fade-up">
    <h1 class="page-title">Support Dashboard</h1>
    <p class="page-subtitle">Customer support overview</p>

    <LoadingSpinner v-if="loading" />
    <p v-else-if="error" class="mt-6 text-red-500">{{ error }}</p>

    <div v-else class="mt-8 grid gap-6 sm:grid-cols-2">
      <div class="stat-card">
        <div class="flex items-center gap-4">
          <div class="stat-icon bg-amber-100 text-amber-700">👥</div>
          <div>
            <p class="text-sm font-medium text-slate-500">Total Users</p>
            <p class="text-3xl font-extrabold tracking-tight text-slate-900">{{ userCount }}</p>
          </div>
        </div>
      </div>
      <RouterLink to="/support/users" class="stat-card group block">
        <h3 class="font-semibold text-slate-900 group-hover:text-brand-700">Search Users</h3>
        <p class="mt-2 text-sm text-slate-500">Find customer accounts by email address</p>
        <span class="mt-4 inline-flex text-sm font-semibold text-brand-600 group-hover:text-brand-700">
          Open search →
        </span>
      </RouterLink>
    </div>
  </div>
</template>
