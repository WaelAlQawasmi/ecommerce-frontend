<script setup lang="ts">
import { ref } from 'vue'
import { authApi } from '@/api/auth.api'
import type { User, RoleSlug } from '@/types'
import AlertMessage from '@/components/common/AlertMessage.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import { formatDate, extractErrorMessage } from '@/utils/helpers'
import { getRoleLabel } from '@/utils/roles'

const searchEmail = ref('')
const users = ref<User[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const searched = ref(false)

async function search() {
  if (searchEmail.value.trim().length < 3) {
    error.value = 'Enter at least 3 characters to search'
    return
  }
  loading.value = true
  error.value = null
  searched.value = true
  try {
    const { data } = await authApi.searchUsers(searchEmail.value.trim())
    users.value = data.data
  } catch (err) {
    error.value = extractErrorMessage(err)
    users.value = []
  } finally {
    loading.value = false
  }
}

function roleBadgeClass(slug: RoleSlug): string {
  const map: Record<RoleSlug, string> = {
    admin: 'badge-admin',
    support: 'badge-support',
    customer: 'badge-customer',
  }
  return map[slug]
}
</script>

<template>
  <div class="animate-fade-up">
    <h1 class="page-title">User Search</h1>
    <p class="page-subtitle">Find customer accounts by email</p>

    <div class="search-bar mt-6 max-w-xl">
      <svg class="ml-1 h-5 w-5 shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        v-model="searchEmail"
        type="search"
        placeholder="Search by email (min. 3 chars)…"
        class="input flex-1"
        @keyup.enter="search"
      />
      <button class="btn btn-primary shrink-0" @click="search">Search</button>
    </div>

    <AlertMessage v-if="error" :message="error" class="mt-6" />
    <LoadingSpinner v-if="loading" />

    <div v-else-if="searched && users.length" class="table-wrap mt-6">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Roles</th>
            <th>Joined</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td class="font-semibold text-slate-900">{{ user.name }}</td>
            <td>{{ user.email }}</td>
            <td>
              <span
                v-for="role in user.roles"
                :key="role.id"
                class="badge mr-1"
                :class="roleBadgeClass(role.slug)"
              >
                {{ getRoleLabel(role.slug) }}
              </span>
            </td>
            <td class="text-slate-500">{{ formatDate(user.created_at) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else-if="searched && !users.length" class="empty-state mt-6">
      <span class="mb-3 text-4xl opacity-40">👤</span>
      <p class="font-semibold text-slate-700">No users found</p>
      <p class="mt-1 text-sm text-slate-500">Try a different email address</p>
    </div>
  </div>
</template>
