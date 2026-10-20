import { authCredentialsSchema } from '@/lib/auth/auth-credentials.schema'
import type { AuthResult } from '../types/api-types'

export function parseAuthCredentials(data: unknown): AuthResult {
  const credentials = authCredentialsSchema.safeParse(data)

  const expiresAt = credentials.success
    ? Date.parse(credentials.data.sessionExpiresAt)
    : Number.NaN

  if (
    !credentials.success ||
    !Number.isFinite(expiresAt) ||
    expiresAt <= Date.now()
  ) {
    console.error({
      operation: 'invalid-credentials',
      errorType: 'invalid-credentials-response',
    })

    return {
      success: false,
      status: 502,
      message: 'Сервіс автентифікації повернув некоректну відповідь.',
    }
  }

  return {
    success: true,
    data: credentials.data,
  }
}
