<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import AlertMessage from '@/components/common/AlertMessage.vue'
import { extractValidationErrors } from '@/utils/helpers'

const router = useRouter()
const auth = useAuthStore()

const form = reactive({
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
})
const fieldErrors = ref<Record<string, string[]>>({})
const submitting = ref(false)

async function handleSubmit() {
  fieldErrors.value = {}
  submitting.value = true
  try {
    await auth.register(form)
    router.push(auth.dashboardPath)
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
        <span class="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
          Free customer account
        </span>
        <h1 class="mt-6 text-5xl font-extrabold tracking-tight text-slate-900">
          Start your journey with <span class="gradient-text">CommerceHub</span>
        </h1>
        <p class="mt-4 text-lg leading-relaxed text-slate-500">
          Create an account to explore products, save preferences, and enjoy a seamless shopping experience.
        </p>
      </div>
    </div>

    <div class="flex w-full flex-1 items-center justify-center lg:w-1/2">
      <div class="auth-card animate-fade-up animate-delay-1">
        <div class="mb-8 text-center">
          <div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-indigo-600 text-lg font-bold text-white shadow-lg shadow-brand-500/30">
            E
          </div>
          <h2 class="text-2xl font-bold tracking-tight text-slate-900">Create account</h2>
          <p class="mt-2 text-sm text-slate-500">Join thousands of happy shoppers</p>
        </div>

        <AlertMessage v-if="auth.error" :message="auth.error" type="error" class="mb-6" />

        <form class="space-y-4" @submit.prevent="handleSubmit">
          <div>
            <label for="name" class="label">Full name</label>
            <input
              id="name"
              v-model="form.name"
              type="text"
              required
              autocomplete="name"
              class="input"
              :class="{ 'input-error': fieldErrors.name }"
              placeholder="Jane Doe"
            />
            <p v-if="fieldErrors.name" class="mt-1.5 text-xs text-red-500">{{ fieldErrors.name[0] }}</p>
          </div>

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
              minlength="8"
              autocomplete="new-password"
              class="input"
              :class="{ 'input-error': fieldErrors.password }"
              placeholder="Min. 8 characters"
            />
            <p v-if="fieldErrors.password" class="mt-1.5 text-xs text-red-500">{{ fieldErrors.password[0] }}</p>
          </div>

          <div>
            <label for="password_confirmation" class="label">Confirm password</label>
            <input
              id="password_confirmation"
              v-model="form.password_confirmation"
              type="password"
              required
              autocomplete="new-password"
              class="input"
              :class="{ 'input-error': fieldErrors.password_confirmation }"
              placeholder="Repeat password"
            />
            <p v-if="fieldErrors.password_confirmation" class="mt-1.5 text-xs text-red-500">
              {{ fieldErrors.password_confirmation[0] }}
            </p>
          </div>

          <button type="submit" class="btn btn-primary w-full py-3" :disabled="submitting">
            {{ submitting ? 'Creating account…' : 'Create account' }}
          </button>
        </form>

        <p class="mt-8 text-center text-sm text-slate-500">
          Already have an account?
          <RouterLink to="/login" class="link">Sign in</RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>
