import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '@/api/auth.api'
import type { User, LoginCredentials, RegisterCredentials, RoleSlug } from '@/types'
import { setTokens, clearTokens, getAccessToken, extractErrorMessage } from '@/utils/helpers'
import { getPrimaryRole, getDashboardPath } from '@/utils/roles'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const initialized = ref(false)

  const isAuthenticated = computed(() => !!user.value && !!getAccessToken())
  const roleSlugs = computed<RoleSlug[]>(() => user.value?.roles.map((r) => r.slug) ?? [])
  const primaryRole = computed(() => getPrimaryRole(roleSlugs.value))
  const dashboardPath = computed(() => getDashboardPath(roleSlugs.value))

  async function initialize(): Promise<void> {
    if (initialized.value) return
    initialized.value = true

    if (!getAccessToken()) return

    try {
      const { data } = await authApi.me()
      user.value = data.data
    } catch {
      clearTokens()
      user.value = null
    }
  }

  async function login(credentials: LoginCredentials): Promise<void> {
    loading.value = true
    error.value = null
    try {
      const { data } = await authApi.login(credentials)
      const { user: authUser, token } = data.data
      if (token.access_token && token.refresh_token) {
        setTokens(token.access_token, token.refresh_token, token.expires_in)
      }
      user.value = authUser
    } catch (err) {
      error.value = extractErrorMessage(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function register(credentials: RegisterCredentials): Promise<void> {
    loading.value = true
    error.value = null
    try {
      const { data } = await authApi.register(credentials)
      const { user: authUser, token } = data.data
      if (token.access_token && token.refresh_token) {
        setTokens(token.access_token, token.refresh_token, token.expires_in)
      }
      user.value = authUser
    } catch (err) {
      error.value = extractErrorMessage(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function logout(): Promise<void> {
    try {
      await authApi.logout()
    } catch {
      // Clear local session even if server logout fails
    } finally {
      user.value = null
      clearTokens()
    }
  }

  function clearError(): void {
    error.value = null
  }

  return {
    user,
    loading,
    error,
    initialized,
    isAuthenticated,
    roleSlugs,
    primaryRole,
    dashboardPath,
    initialize,
    login,
    register,
    logout,
    clearError,
  }
})
