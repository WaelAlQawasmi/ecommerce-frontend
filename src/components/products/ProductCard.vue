<script setup lang="ts">
import { computed } from 'vue'
import type { Product } from '@/types'
import { formatPrice } from '@/utils/helpers'

const props = defineProps<{
  product: Product
}>()

const inStock = computed(() => props.product.stock > 0)
</script>

<template>
  <RouterLink
    :to="{ name: 'product-detail', params: { id: product.id } }"
    class="product-card group"
  >
    <div class="product-card-image">
      <span class="product-card-icon">📦</span>
      <div
        v-if="!inStock"
        class="absolute inset-0 flex items-center justify-center bg-slate-900/40 backdrop-blur-[2px]"
      >
        <span class="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700">Sold out</span>
      </div>
    </div>
    <div class="flex flex-1 flex-col p-5">
      <h3 class="font-semibold tracking-tight text-slate-900 transition-colors group-hover:text-brand-700 line-clamp-1">
        {{ product.name }}
      </h3>
      <p v-if="product.description" class="mt-1.5 text-sm leading-relaxed text-slate-500 line-clamp-2">
        {{ product.description }}
      </p>
      <div class="mt-auto flex items-end justify-between pt-5">
        <div>
          <p class="text-xs font-medium uppercase tracking-wider text-slate-400">Price</p>
          <span class="text-xl font-bold tracking-tight text-slate-900">{{ formatPrice(product.price) }}</span>
        </div>
        <span
          class="rounded-full px-2.5 py-1 text-xs font-semibold"
          :class="inStock ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/60' : 'bg-red-50 text-red-600 ring-1 ring-red-200/60'"
        >
          {{ inStock ? `${product.stock} left` : 'Out of stock' }}
        </span>
      </div>
    </div>
  </RouterLink>
</template>
