const ACCESS_TOKEN_KEY = 'ec_access_token'
const REFRESH_TOKEN_KEY = 'ec_refresh_token'
const TOKEN_EXPIRY_KEY = 'ec_token_expiry'

export function getAccessToken(): string | null {
  return sessionStorage.getItem(ACCESS_TOKEN_KEY)
}

export function getRefreshToken(): string | null {
  return sessionStorage.getItem(REFRESH_TOKEN_KEY)
}

export function setTokens(accessToken: string, refreshToken: string, expiresIn: string | null): void {
  sessionStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
  sessionStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)

  if (expiresIn) {
    const expiryMs = Date.now() + Number(expiresIn) * 1000
    sessionStorage.setItem(TOKEN_EXPIRY_KEY, String(expiryMs))
  }
}

export function clearTokens(): void {
  sessionStorage.removeItem(ACCESS_TOKEN_KEY)
  sessionStorage.removeItem(REFRESH_TOKEN_KEY)
  sessionStorage.removeItem(TOKEN_EXPIRY_KEY)
}

export function isTokenExpired(): boolean {
  const expiry = sessionStorage.getItem(TOKEN_EXPIRY_KEY)
  if (!expiry) return false
  return Date.now() >= Number(expiry) - 60_000
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price)
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(date))
}

export function extractErrorMessage(error: unknown): string {
  if (typeof error === 'object' && error !== null) {
    const err = error as {
      response?: { data?: { message?: string; error?: { message?: string } } }
      message?: string
    }
    return (
      err.response?.data?.message ??
      err.response?.data?.error?.message ??
      err.message ??
      'An unexpected error occurred'
    )
  }
  return 'An unexpected error occurred'
}

export function extractValidationErrors(error: unknown): Record<string, string[]> {
  if (typeof error === 'object' && error !== null) {
    const err = error as { response?: { data?: { errors?: Record<string, string[]> } } }
    return err.response?.data?.errors ?? {}
  }
  return {}
}
