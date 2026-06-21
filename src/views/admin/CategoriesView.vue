<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { categoriesApi } from '@/api/products.api'
import type { Category, CreateCategoryPayload } from '@/types'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import AlertMessage from '@/components/common/AlertMessage.vue'
import AppModal from '@/components/common/AppModal.vue'
import { extractErrorMessage } from '@/utils/helpers'

const categories = ref<Category[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const showForm = ref(false)
const editingId = ref<number | null>(null)
const submitting = ref(false)
const formError = ref<string | null>(null)

const form = reactive<CreateCategoryPayload>({ name: '', description: '' })

async function loadData() {
  loading.value = true
  error.value = null
  try {
    const { data } = await categoriesApi.list(1, 100)
    categories.value = data.data
  } catch (err) {
    error.value = extractErrorMessage(err)
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editingId.value = null
  Object.assign(form, { name: '', description: '' })
  showForm.value = true
  formError.value = null
}

function openEdit(category: Category) {
  editingId.value = category.id
  Object.assign(form, { name: category.name, description: category.description ?? '' })
  showForm.value = true
  formError.value = null
}

async function handleSubmit() {
  submitting.value = true
  formError.value = null
  try {
    if (editingId.value) {
      await categoriesApi.update(editingId.value, form)
    } else {
      await categoriesApi.create(form)
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
  if (!confirm('Delete this category?')) return
  try {
    await categoriesApi.remove(id)
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
        <h1 class="page-title">Categories</h1>
        <p class="page-subtitle">Organize your product catalog</p>
      </div>
      <button class="btn btn-primary shrink-0" @click="openCreate">+ Add category</button>
    </div>

    <AlertMessage v-if="error" :message="error" class="mt-6" />
    <LoadingSpinner v-if="loading" />

    <div v-else class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div v-for="cat in categories" :key="cat.id" class="stat-card">
        <h3 class="font-semibold tracking-tight text-slate-900">{{ cat.name }}</h3>
        <p v-if="cat.description" class="mt-2 text-sm leading-relaxed text-slate-500">{{ cat.description }}</p>
        <p class="mt-3 text-xs font-medium uppercase tracking-wider text-slate-400">{{ cat.slug }}</p>
        <div class="mt-5 flex gap-2 border-t border-slate-100 pt-4">
          <button class="btn btn-secondary text-xs" @click="openEdit(cat)">Edit</button>
          <button class="btn btn-danger text-xs" @click="handleDelete(cat.id)">Delete</button>
        </div>
      </div>
    </div>

    <AppModal
      v-model="showForm"
      size="sm"
      :title="editingId ? 'Edit category' : 'New category'"
      :subtitle="editingId ? 'Update category details' : 'Create a new product category'"
    >
      <AlertMessage v-if="formError" :message="formError" class="mb-5" />

      <form id="category-form" class="space-y-5" @submit.prevent="handleSubmit">
        <div>
          <label for="category-name" class="label">Category name</label>
          <input id="category-name" v-model="form.name" required class="input" placeholder="e.g. Electronics" />
        </div>
        <div>
          <label for="category-description" class="label">Description</label>
          <textarea
            id="category-description"
            v-model="form.description"
            rows="3"
            class="input resize-none"
            placeholder="Optional description"
          />
        </div>
      </form>

      <template #footer>
        <button type="button" class="btn btn-secondary" @click="showForm = false">Cancel</button>
        <button type="submit" form="category-form" class="btn btn-primary" :disabled="submitting">
          {{ submitting ? 'Saving…' : 'Save category' }}
        </button>
      </template>
    </AppModal>
  </div>
</template>
