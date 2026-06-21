<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { authApi } from '@/api/auth.api'
import { productsApi, categoriesApi } from '@/api/products.api'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import { extractErrorMessage } from '@/utils/helpers'

const userCount = ref(0)
const productCount = ref(0)
const categoryCount = ref(0)
const loading = ref(true)
const error = ref<string | null>(null)

onMounted(async () => {
  try {
    const [usersRes, productsRes, categoriesRes] = await Promise.all([
      authApi.getUserCount(),
      productsApi.list(1, 1),
      categoriesApi.list(1, 1),
    ])
    userCount.value = usersRes.data.data.count
    productCount.value = productsRes.data.meta.total ?? 0
    categoryCount.value = categoriesRes.data.meta.total ?? 0
  } catch (err) {
    error.value = extractErrorMessage(err)
  } finally {
    loading.value = false
  }
})

const stats = [
  { label: 'Total Users', value: userCount, icon: '👥', color: 'bg-violet-100 text-violet-700' },
  { label: 'Products', value: productCount, icon: '📦', color: 'bg-brand-100 text-brand-700' },
  { label: 'Categories', value: categoryCount, icon: '🏷️', color: 'bg-emerald-100 text-emerald-700' },
]
</script>

<template>
  <div class="animate-fade-up">
    <h1 class="page-title">Admin Dashboard</h1>
    <p class="page-subtitle">Overview of your e-commerce platform</p>

    <LoadingSpinner v-if="loading" />

    <p v-else-if="error" class="mt-6 text-red-500">{{ error }}</p>

    <div v-else class="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <div v-for="stat in stats" :key="stat.label" class="stat-card">
        <div class="flex items-center gap-4">
          <div class="stat-icon" :class="stat.color">
            {{ stat.icon }}
          </div>
          <div>
            <p class="text-sm font-medium text-slate-500">{{ stat.label }}</p>
            <p class="text-3xl font-extrabold tracking-tight text-slate-900">{{ stat.value }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-8 grid gap-4 sm:grid-cols-3">
      <RouterLink to="/admin/products" class="stat-card group block">
        <h3 class="font-semibold text-slate-900 group-hover:text-brand-700">Manage Products</h3>
        <p class="mt-1 text-sm text-slate-500">Create, edit, and delete products</p>
      </RouterLink>
      <RouterLink to="/admin/categories" class="stat-card group block">
        <h3 class="font-semibold text-slate-900 group-hover:text-brand-700">Manage Categories</h3>
        <p class="mt-1 text-sm text-slate-500">Organize your product catalog</p>
      </RouterLink>
      <RouterLink to="/admin/users" class="stat-card group block">
        <h3 class="font-semibold text-slate-900 group-hover:text-brand-700">Manage Users</h3>
        <p class="mt-1 text-sm text-slate-500">View users and assign roles</p>
      </RouterLink>
    </div>
  </div>
</template>
