import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'
import { getAccessToken, clearTokens } from '@/utils/helpers'

const authBaseURL = import.meta.env.VITE_AUTH_API_URL as string
const productsBaseURL = import.meta.env.VITE_PRODUCTS_API_URL as string

function attachAuthInterceptor(client: AxiosInstance): void {
  client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = getAccessToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  })

  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        clearTokens()
        if (!window.location.pathname.startsWith('/login')) {
          window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`
        }
      }
      return Promise.reject(error)
    },
  )
}

export const authClient = axios.create({
  baseURL: authBaseURL,
  headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
  timeout: 15_000,
})

export const productsClient = axios.create({
  baseURL: productsBaseURL,
  headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
  timeout: 15_000,
})

attachAuthInterceptor(authClient)
attachAuthInterceptor(productsClient)
