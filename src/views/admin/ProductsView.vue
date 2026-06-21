<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { productsApi, categoriesApi } from '@/api/products.api'
import type { Product, Category, CreateProductPayload } from '@/types'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import AlertMessage from '@/components/common/AlertMessage.vue'
import AppModal from '@/components/common/AppModal.vue'
import { formatPrice, extractErrorMessage } from '@/utils/helpers'

const products = ref<Product[]>([])
const categories = ref<Category[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const showForm = ref(false)
const editingId = ref<number | null>(null)
const submitting = ref(false)
const formError = ref<string | null>(null)

const form = reactive<CreateProductPayload>({
  name: '',
  description: '',
  price: 0,
  stock: 0,
  categoryId: 0,
  isActive: true,
})

async function loadData() {
  loading.value = true
  error.value = null
  try {
    const [prodRes, catRes] = await Promise.all([
      productsApi.list(1, 100),
      categoriesApi.list(1, 100),
    ])
    products.value = prodRes.data.data
    categories.value = catRes.data.data
  } catch (err) {
    error.value = extractErrorMessage(err)
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editingId.value = null
  Object.assign(form, { name: '', description: '', price: 0, stock: 0, categoryId: categories.value[0]?.id ?? 0, isActive: true })
  showForm.value = true
  formError.value = null
}

function openEdit(product: Product) {
  editingId.value = product.id
  Object.assign(form, {
    name: product.name,
    description: product.description ?? '',
    price: product.price,
    stock: product.stock,
    categoryId: product.categoryId,
    isActive: product.isActive,
  })
  showForm.value = true
  formError.value = null
}

async function handleSubmit() {
  submitting.value = true
  formError.value = null
  try {
    if (editingId.value) {
      await productsApi.update(editingId.value, form)
    } else {
      await productsApi.create(form)
    }
    showForm.value = false
    await loadData()
  } catch (err) {
    formError.value = extractErrorMessage(err)
  } finally {
    submitting.value = false
  }
}

async function handleDelete(id: number) {
  if (!confirm('Delete this product?')) return
  try {
    await productsApi.remove(id)
    await loadData()
  } catch (err) {
    error.value = extractErrorMessage(err)
  }
}

onMounted(loadData)
</script>

<template>
  <div class="animate-fade-up">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="page-title">Products</h1>
        <p class="page-subtitle">Manage your product catalog</p>
      </div>
      <button class="btn btn-primary shrink-0" @click="openCreate">+ Add product</button>
    </div>

    <AlertMessage v-if="error" :message="error" class="mt-6" />
    <LoadingSpinner v-if="loading" />

    <div v-else class="table-wrap mt-6">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Status</th>
            <th class="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="product in products" :key="product.id">
            <td class="font-semibold text-slate-900">{{ product.name }}</td>
            <td>{{ formatPrice(product.price) }}</td>
            <td>{{ product.stock }}</td>
            <td>
              <span class="badge" :class="product.isActive ? 'badge-customer' : 'bg-slate-100 text-slate-600'">
                {{ product.isActive ? 'Active' : 'Inactive' }}
              </span>
            </td>
            <td class="text-right">
              <button class="btn btn-ghost px-2 py-1 text-xs" @click="openEdit(product)">Edit</button>
              <button class="btn btn-ghost px-2 py-1 text-xs text-red-500" @click="handleDelete(product.id)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <AppModal
      v-model="showForm"
      :title="editingId ? 'Edit product' : 'New product'"
      :subtitle="editingId ? 'Update product details below' : 'Fill in the details to add a product'"
    >
      <AlertMessage v-if="formError" :message="formError" class="mb-5" />

      <form id="product-form" class="space-y-5" @submit.prevent="handleSubmit">
        <div>
          <label for="product-name" class="label">Product name</label>
          <input id="product-name" v-model="form.name" required class="input" placeholder="e.g. Wireless Headphones" />
        </div>

        <div>
          <label for="product-description" class="label">Description</label>
          <textarea
            id="product-description"
            v-model="form.description"
            rows="3"
            class="input resize-none"
            placeholder="Short product description (optional)"
          />
        </div>

        <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label for="product-price" class="label">Price ($)</label>
            <input id="product-price" v-model.number="form.price" type="number" step="0.01" min="0" required class="input" />
          </div>
          <div>
            <label for="product-stock" class="label">Stock quantity</label>
            <input id="product-stock" v-model.number="form.stock" type="number" min="0" required class="input" />
          </div>
        </div>

        <div>
          <label for="product-category" class="label">Category</label>
          <select id="product-category" v-model.number="form.categoryId" required class="select">
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
          </select>
        </div>

        <label class="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
          <input
            v-model="form.isActive"
            type="checkbox"
            class="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
          />
          <span class="text-sm font-medium text-slate-700">Product is active and visible in the shop</span>
        </label>
      </form>

      <template #footer>
        <button type="button" class="btn btn-secondary" @click="showForm = false">Cancel</button>
        <button type="submit" form="product-form" class="btn btn-primary" :disabled="submitting">
          {{ submitting ? 'Saving…' : 'Save product' }}
        </button>
      </template>
    </AppModal>
  </div>
</template>
