<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { productsApi, categoriesApi } from '@/api/products.api'
import type { Product, Category } from '@/types'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import AlertMessage from '@/components/common/AlertMessage.vue'
import { formatPrice, extractErrorMessage } from '@/utils/helpers'

const props = defineProps<{ id: string }>()

const product = ref<Product | null>(null)
const category = ref<Category | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

onMounted(async () => {
  try {
    const { data } = await productsApi.getById(Number(props.id))
    product.value = data.data

    if (product.value.categoryId) {
      try {
        const catRes = await categoriesApi.getById(product.value.categoryId)
        category.value = catRes.data.data
      } catch {
        // Category fetch is optional
      }
    }
  } catch (err) {
    error.value = extractErrorMessage(err)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="animate-fade-up">
    <RouterLink
      to="/shop"
      class="mb-8 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-white/80 hover:text-brand-700"
    >
      <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
      Back to shop
    </RouterLink>

    <LoadingSpinner v-if="loading" />

    <AlertMessage v-else-if="error" :message="error" />

    <div v-else-if="product" class="card overflow-hidden lg:flex">
      <div class="product-card-image lg:h-auto lg:min-h-[28rem] lg:w-1/2">
        <span class="text-8xl transition-transform duration-500 hover:scale-110">📦</span>
      </div>
      <div class="flex flex-1 flex-col p-8 sm:p-10">
        <div v-if="category" class="mb-4">
          <span class="badge badge-customer">{{ category.name }}</span>
        </div>
        <h1 class="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">{{ product.name }}</h1>

        <div class="mt-6 flex items-baseline gap-3">
          <span class="text-4xl font-extrabold tracking-tight text-slate-900">{{ formatPrice(product.price) }}</span>
        </div>

        <p v-if="product.description" class="mt-6 text-base leading-relaxed text-slate-500">
          {{ product.description }}
        </p>

        <div class="mt-auto space-y-4 pt-10">
          <div class="flex flex-wrap items-center gap-3">
            <span
              class="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold"
              :class="product.stock > 0
                ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/60'
                : 'bg-red-50 text-red-600 ring-1 ring-red-200/60'"
            >
              <span class="h-2 w-2 rounded-full" :class="product.stock > 0 ? 'bg-emerald-500' : 'bg-red-500'" />
              {{ product.stock > 0 ? `${product.stock} in stock` : 'Out of stock' }}
            </span>
            <span v-if="!product.isActive" class="badge bg-slate-100 text-slate-600">Inactive</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
