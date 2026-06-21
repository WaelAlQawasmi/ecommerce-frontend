<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { isAdmin, isSupport } from '@/utils/roles'

const route = useRoute()
const auth = useAuthStore()

const navItems = computed(() => {
  const items: { label: string; to: string; icon: string }[] = []

  if (isAdmin(auth.roleSlugs)) {
    items.push(
      { label: 'Dashboard', to: '/admin', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
      { label: 'Products', to: '/admin/products', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
      { label: 'Categories', to: '/admin/categories', icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z' },
      { label: 'Users', to: '/admin/users', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    )
  } else if (isSupport(auth.roleSlugs)) {
    items.push(
      { label: 'Dashboard', to: '/support', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
      { label: 'Users', to: '/support/users', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    )
  }

  items.push({ label: 'Shop', to: '/shop', icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' })
  return items
})

function isActive(path: string): boolean {
  if (path === '/admin' || path === '/support') {
    return route.path === path
  }
  return route.path.startsWith(path)
}
</script>

<template>
  <div class="min-h-screen lg:flex">
    <aside class="sidebar relative min-h-screen">
      <div class="flex h-16 items-center gap-2.5 border-b border-slate-800/60 px-6">
        <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-indigo-600 text-xs font-bold text-white">
          E
        </span>
        <RouterLink to="/" class="text-lg font-bold tracking-tight text-white">
          Commerce<span class="text-brand-400">Hub</span>
        </RouterLink>
      </div>

      <nav class="space-y-1 p-4 pb-28">
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="sidebar-link"
          :class="isActive(item.to) ? 'sidebar-link-active' : 'sidebar-link-inactive'"
        >
          <svg class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
            <path stroke-linecap="round" stroke-linejoin="round" :d="item.icon" />
          </svg>
          {{ item.label }}
        </RouterLink>
      </nav>

      <div class="absolute bottom-0 w-72 border-t border-slate-800/60 p-4">
        <div class="flex items-center gap-3 rounded-xl bg-slate-800/50 p-3">
          <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-indigo-500 text-xs font-bold text-white">
            {{ auth.user?.name?.charAt(0) }}
          </div>
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-medium text-white">{{ auth.user?.name }}</p>
            <p class="truncate text-xs text-slate-400">{{ auth.user?.email }}</p>
          </div>
        </div>
      </div>
    </aside>

    <div class="flex min-h-screen flex-1 flex-col">
      <header class="glass-nav flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div class="lg:hidden">
          <RouterLink to="/" class="text-lg font-bold text-slate-900">
            Commerce<span class="gradient-text">Hub</span>
          </RouterLink>
        </div>
        <div class="ml-auto flex items-center gap-3">
          <span class="hidden text-sm font-medium text-slate-600 sm:block">{{ auth.user?.name }}</span>
          <button class="btn btn-secondary text-sm" @click="auth.logout(); $router.push('/login')">
            Sign out
          </button>
        </div>
      </header>

      <main class="flex-1 p-4 sm:p-6 lg:p-8">
        <RouterView />
      </main>
    </div>
  </div>
</template>
