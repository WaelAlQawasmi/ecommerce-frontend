<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { productsApi, categoriesApi } from '@/api/products.api'
import type { Product, Category } from '@/types'
import ProductCard from '@/components/products/ProductCard.vue'
import Pagination from '@/components/common/Pagination.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import AlertMessage from '@/components/common/AlertMessage.vue'
import { extractErrorMessage } from '@/utils/helpers'

const products = ref<Product[]>([])
const categories = ref<Category[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const searchQuery = ref('')
const selectedCategory = ref<number | null>(null)
const page = ref(1)
const totalPages = ref(1)
const isSearching = ref(false)

let searchTimeout: ReturnType<typeof setTimeout> | null = null

async function fetchProducts() {
  loading.value = true
  error.value = null
  try {
    let response
    if (searchQuery.value.trim()) {
      response = await productsApi.search(searchQuery.value.trim(), page.value)
      isSearching.value = true
    } else if (selectedCategory.value) {
      response = await productsApi.byCategory(selectedCategory.value, page.value)
      isSearching.value = false
    } else {
      response = await productsApi.list(page.value)
      isSearching.value = false
    }
    products.value = response.data.data
    totalPages.value = response.data.meta.totalPages ?? 1
  } catch (err) {
    error.value = extractErrorMessage(err)
  } finally {
    loading.value = false
  }
}

async function fetchCategories() {
  try {
    const { data } = await categoriesApi.list(1, 100)
    categories.value = data.data
  } catch {
    // Categories are optional for filtering
  }
}

watch(searchQuery, () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    page.value = 1
    fetchProducts()
  }, 400)
})

watch([selectedCategory, page], () => fetchProducts())

onMounted(async () => {
  await fetchCategories()
  await fetchProducts()
})

function clearFilters() {
  searchQuery.value = ''
  selectedCategory.value = null
  page.value = 1
  fetchProducts()
}
</script>

<template>
  <div class="animate-fade-up">
    <section class="shop-hero mb-10">
      <div class="relative z-10">
        <p class="text-sm font-semibold uppercase tracking-widest text-brand-200">Curated collection</p>
        <h1 class="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">Discover products you'll love</h1>
        <p class="mt-3 max-w-xl text-brand-100/90">
          Browse our catalog, filter by category, or search instantly with Elasticsearch-powered results.
        </p>
      </div>
    </section>

    <div class="search-bar mb-8">
      <svg class="ml-3 h-5 w-5 shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        v-model="searchQuery"
        type="search"
        placeholder="Search products…"
        class="input flex-1"
      />
      <select
        v-model="selectedCategory"
        class="select hidden border-l border-slate-200 bg-transparent sm:block sm:w-48"
        @change="page = 1"
      >
        <option :value="null">All categories</option>
        <option v-for="cat in categories" :key="cat.id" :value="cat.id">
          {{ cat.name }}
        </option>
      </select>
      <button
        v-if="searchQuery || selectedCategory"
        class="btn btn-ghost shrink-0 text-sm"
        @click="clearFilters"
      >
        Clear
      </button>
    </div>

    <select
      v-model="selectedCategory"
      class="select mb-6 w-full sm:hidden"
      @change="page = 1"
    >
      <option :value="null">All categories</option>
      <option v-for="cat in categories" :key="cat.id" :value="cat.id">
        {{ cat.name }}
      </option>
    </select>

    <AlertMessage v-if="error" :message="error" class="mb-6" />

    <LoadingSpinner v-if="loading" message="Loading products…" />

    <template v-else>
      <p v-if="isSearching && products.length" class="mb-5 text-sm font-medium text-slate-500">
        Results for <span class="text-slate-900">"{{ searchQuery }}"</span>
        <span class="ml-1 text-slate-400">({{ products.length }} items)</span>
      </p>

      <div v-if="products.length" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <ProductCard
          v-for="(product, i) in products"
          :key="product.id"
          :product="product"
          :style="{ animationDelay: `${i * 0.04}s` }"
          class="animate-fade-up"
        />
      </div>

      <div v-else class="empty-state">
        <span class="mb-4 text-5xl opacity-40">🔍</span>
        <p class="text-lg font-semibold text-slate-700">No products found</p>
        <p class="mt-1 text-sm text-slate-500">Try adjusting your search or filters</p>
        <button class="btn btn-secondary mt-6" @click="clearFilters">Clear filters</button>
      </div>

      <div v-if="products.length" class="mt-10">
        <Pagination v-model:page="page" :total-pages="totalPages" />
      </div>
    </template>
  </div>
</template>
