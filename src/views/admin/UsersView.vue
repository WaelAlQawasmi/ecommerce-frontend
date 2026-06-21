<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { authApi } from '@/api/auth.api'
import type { User, Role, RoleSlug } from '@/types'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import AlertMessage from '@/components/common/AlertMessage.vue'
import Pagination from '@/components/common/Pagination.vue'
import { formatDate, extractErrorMessage } from '@/utils/helpers'
import { getRoleLabel } from '@/utils/roles'

const users = ref<User[]>([])
const roles = ref<Role[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const page = ref(1)
const totalPages = ref(1)
const searchEmail = ref('')
const assigningUserId = ref<number | null>(null)
const selectedRole = ref<RoleSlug>('customer')

async function loadUsers() {
  loading.value = true
  error.value = null
  try {
    const { data } = searchEmail.value.trim()
      ? await authApi.searchUsers(searchEmail.value.trim())
      : await authApi.listUsers(page.value)
    users.value = data.data
    const pagination = (data.meta as { pagination?: { last_page: number } })?.pagination
    totalPages.value = pagination?.last_page ?? 1
  } catch (err) {
    error.value = extractErrorMessage(err)
  } finally {
    loading.value = false
  }
}

async function loadRoles() {
  try {
    const { data } = await authApi.listRoles()
    roles.value = data.data
  } catch {
    // Roles list is admin-only; fallback to known roles
    roles.value = [
      { id: 1, name: 'Admin', slug: 'admin', description: null },
      { id: 2, name: 'Support', slug: 'support', description: null },
      { id: 3, name: 'Customer', slug: 'customer', description: null },
    ]
  }
}

async function assignRole(userId: number) {
  try {
    await authApi.assignRole(userId, { role: selectedRole.value })
    assigningUserId.value = null
    await loadUsers()
  } catch (err) {
    error.value = extractErrorMessage(err)
  }
}

async function deleteUser(userId: number) {
  if (!confirm('Delete this user account?')) return
  try {
    await authApi.deleteUser(userId)
    await loadUsers()
  } catch (err) {
    error.value = extractErrorMessage(err)
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

onMounted(async () => {
  await loadRoles()
  await loadUsers()
})
</script>

<template>
  <div class="animate-fade-up">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="page-title">Users</h1>
        <p class="page-subtitle">Manage user accounts and roles</p>
      </div>
      <div class="search-bar shrink-0 sm:w-auto">
        <input
          v-model="searchEmail"
          type="search"
          placeholder="Search by email…"
          class="input sm:w-56"
          @keyup.enter="page = 1; loadUsers()"
        />
        <button class="btn btn-primary shrink-0 text-sm" @click="page = 1; loadUsers()">Search</button>
      </div>
    </div>

    <AlertMessage v-if="error" :message="error" class="mt-6" />
    <LoadingSpinner v-if="loading" />

    <div v-else class="table-wrap mt-6">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Roles</th>
            <th>Joined</th>
            <th class="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td class="font-semibold text-slate-900">{{ user.name }}</td>
            <td class="text-slate-600">{{ user.email }}</td>
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
            <td class="text-right">
              <button
                class="btn btn-ghost px-2 py-1 text-xs"
                @click="assigningUserId = user.id; selectedRole = user.roles[0]?.slug ?? 'customer'"
              >
                Assign role
              </button>
              <button class="btn btn-ghost px-2 py-1 text-xs text-red-500" @click="deleteUser(user.id)">
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="!searchEmail && users.length" class="mt-8">
      <Pagination v-model:page="page" :total-pages="totalPages" @update:page="loadUsers()" />
    </div>

    <div v-if="assigningUserId" class="modal-overlay" @click.self="assigningUserId = null">
      <div class="modal-content max-w-sm">
        <h2 class="text-xl font-bold tracking-tight">Assign role</h2>
        <select v-model="selectedRole" class="select mt-5">
          <option v-for="role in roles" :key="role.id" :value="role.slug">
            {{ role.name }}
          </option>
        </select>
        <div class="mt-6 flex justify-end gap-3">
          <button class="btn btn-secondary" @click="assigningUserId = null">Cancel</button>
          <button class="btn btn-primary" @click="assignRole(assigningUserId!)">Assign</button>
        </div>
      </div>
    </div>
  </div>
</template>
