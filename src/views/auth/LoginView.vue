<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import AlertMessage from '@/components/common/AlertMessage.vue'
import { extractValidationErrors } from '@/utils/helpers'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const form = reactive({ email: '', password: '' })
const fieldErrors = ref<Record<string, string[]>>({})
const submitting = ref(false)

async function handleSubmit() {
  fieldErrors.value = {}
  submitting.value = true
  try {
    await auth.login(form)
    const redirect = (route.query.redirect as string) || auth.dashboardPath
    router.push(redirect)
  } catch (err) {
    fieldErrors.value = extractValidationErrors(err)
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-panel-left">
      <div class="animate-fade-up max-w-lg">
        <span class="inline-flex items-center gap-2 rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700">
          Secure microservices platform
        </span>
        <h1 class="mt-6 text-5xl font-extrabold tracking-tight text-slate-900">
          Shop smarter with <span class="gradient-text">CommerceHub</span>
        </h1>
        <p class="mt-4 text-lg leading-relaxed text-slate-500">
          Sign in to browse products, manage your account, and access role-based dashboards.
        </p>
      </div>
    </div>

    <div class="flex w-full flex-1 items-center justify-center lg:w-1/2">
      <div class="auth-card animate-fade-up animate-delay-1">
        <div class="mb-8 text-center">
          <div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-indigo-600 text-lg font-bold text-white shadow-lg shadow-brand-500/30">
            E
          </div>
          <h2 class="text-2xl font-bold tracking-tight text-slate-900">Welcome back</h2>
          <p class="mt-2 text-sm text-slate-500">Sign in to continue to your account</p>
        </div>

        <AlertMessage v-if="auth.error" :message="auth.error" type="error" class="mb-6" />

        <form class="space-y-5" @submit.prevent="handleSubmit">
          <div>
            <label for="email" class="label">Email address</label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              required
              autocomplete="email"
              class="input"
              :class="{ 'input-error': fieldErrors.email }"
              placeholder="you@example.com"
            />
            <p v-if="fieldErrors.email" class="mt-1.5 text-xs text-red-500">{{ fieldErrors.email[0] }}</p>
          </div>

          <div>
            <label for="password" class="label">Password</label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              required
              autocomplete="current-password"
              class="input"
              :class="{ 'input-error': fieldErrors.password }"
              placeholder="••••••••"
            />
            <p v-if="fieldErrors.password" class="mt-1.5 text-xs text-red-500">{{ fieldErrors.password[0] }}</p>
          </div>

          <button type="submit" class="btn btn-primary w-full py-3" :disabled="submitting">
            {{ submitting ? 'Signing in…' : 'Sign in' }}
          </button>
        </form>

        <p class="mt-8 text-center text-sm text-slate-500">
          Don't have an account?
          <RouterLink to="/register" class="link">Create one free</RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>
