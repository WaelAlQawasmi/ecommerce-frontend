<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import { getRoleLabel } from '@/utils/roles'
import type { RoleSlug } from '@/types'

const auth = useAuthStore()

const roleBadgeClass = computed(() => {
  const slug = auth.primaryRole
  const map: Record<RoleSlug, string> = {
    admin: 'badge-admin',
    support: 'badge-support',
    customer: 'badge-customer',
  }
  return map[slug]
})

const initials = computed(() => {
  const name = auth.user?.name ?? ''
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
})
</script>

<template>
  <header class="glass-nav">
    <div class="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
      <RouterLink to="/shop" class="group flex items-center gap-2.5">
        <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-indigo-600 text-sm font-bold text-white shadow-lg shadow-brand-500/30 transition-transform group-hover:scale-105">
          E
        </span>
        <span class="text-lg font-bold tracking-tight text-slate-900">
          Commerce<span class="gradient-text">Hub</span>
        </span>
      </RouterLink>

      <nav class="flex items-center gap-1 sm:gap-2">
        <RouterLink
          to="/shop"
          class="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100/80 hover:text-slate-900"
          active-class="!bg-brand-50 !text-brand-700"
        >
          Shop
        </RouterLink>

        <template v-if="auth.isAuthenticated">
          <RouterLink
            v-if="auth.primaryRole === 'admin'"
            to="/admin"
            class="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100/80 hover:text-slate-900"
            active-class="!bg-brand-50 !text-brand-700"
          >
            Admin
          </RouterLink>
          <RouterLink
            v-if="auth.primaryRole === 'support' || auth.primaryRole === 'admin'"
            to="/support"
            class="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100/80 hover:text-slate-900"
            active-class="!bg-brand-50 !text-brand-700"
          >
            Support
          </RouterLink>

          <div class="ml-2 flex items-center gap-3 border-l border-slate-200/80 pl-3 sm:ml-3 sm:pl-4">
            <div class="hidden items-center gap-3 sm:flex">
              <div class="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-indigo-500 text-xs font-bold text-white ring-2 ring-white">
                {{ initials }}
              </div>
              <div class="text-right">
                <p class="text-sm font-semibold text-slate-900">{{ auth.user?.name }}</p>
                <span class="badge mt-0.5" :class="roleBadgeClass">{{ getRoleLabel(auth.primaryRole) }}</span>
              </div>
            </div>
            <button class="btn btn-ghost text-sm" @click="auth.logout(); $router.push('/login')">
              Sign out
            </button>
          </div>
        </template>

        <template v-else>
          <RouterLink to="/login" class="btn btn-ghost text-sm">Sign in</RouterLink>
          <RouterLink to="/register" class="btn btn-primary text-sm">Get started</RouterLink>
        </template>
      </nav>
    </div>
  </header>
</template>
