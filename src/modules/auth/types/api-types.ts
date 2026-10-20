import type { AuthCredentials } from '@/lib/auth/auth-credentials.schema'

export type AuthFailure = {
  success: false
  status: number
  message: string
  retryAfter?: string
}

export type AuthResult = { success: true; data: AuthCredentials } | AuthFailure
