import 'server-only'

import axios from 'axios'
import { api } from '@/lib/api/nest-api'
import {
  type AuthCredentials,
  authCredentialsSchema,
} from '@/lib/auth/auth-credentials.schema'
import type { LoginInput } from '../schemas/login.schema'
import type { RegisterInput } from '../schemas/register.schema'

type AuthFailure = {
  success: false
  status: number
  message: string
  retryAfter?: string
}

type AuthResult = { success: true; data: AuthCredentials } | AuthFailure

type AuthInput =
  | { action: 'login'; input: LoginInput }
  | { action: 'register'; input: RegisterInput }

export async function requestAuthCredentials({
  input,
  action,
}: AuthInput): Promise<AuthResult> {
  const operation = `auth.${action}`

  try {
    const response = await api.post<unknown>(`/auth/${action}`, input, {
      validateStatus: () => true,
    })

    if (response.status === 400) {
      return {
        success: false,
        status: 400,
        message: 'Перевірте введені дані.',
      }
    }

    if (action === 'login' && response.status === 401) {
      return {
        success: false,
        status: 401,
        message: 'Неправильна електронна пошта або пароль.',
      }
    }

    if (action === 'register' && response.status === 409) {
      return {
        success: false,
        status: 409,
        message: 'Користувач із такою електронною поштою вже існує.',
      }
    }

    if (response.status === 429) {
      const failure: AuthFailure = {
        success: false,
        status: 429,
        message: 'Забагато спроб. Спробуйте пізніше.',
      }

      const retryAfter: unknown = response.headers['retry-after']

      if (typeof retryAfter === 'string' && /^\d{1,6}$/.test(retryAfter)) {
        failure.retryAfter = retryAfter
      }

      return failure
    }

    const expectedStatus = action === 'register' ? 201 : 200

    if (response.status !== expectedStatus) {
      console.error({
        operation,
        upstreamStatus: response.status,
      })

      return {
        success: false,
        status: 502,
        message: 'Сервіс автентифікації тимчасово недоступний.',
      }
    }

    const credentials = authCredentialsSchema.safeParse(response.data)

    const expiresAt = credentials.success
      ? Date.parse(credentials.data.sessionExpiresAt)
      : Number.NaN

    if (
      !credentials.success ||
      !Number.isFinite(expiresAt) ||
      expiresAt <= Date.now()
    ) {
      console.error({
        operation,
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
  } catch (error) {
    const isAxiosError = axios.isAxiosError(error)
    const isTimeout =
      isAxiosError &&
      (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT')

    console.error({
      operation,
      errorType: isTimeout
        ? 'timeout'
        : isAxiosError
          ? 'network-error'
          : 'unexpected-error',
    })

    return {
      success: false,
      status: isTimeout ? 504 : isAxiosError ? 502 : 500,
      message: isTimeout
        ? 'Сервіс автентифікації не відповів вчасно.'
        : 'Не вдалося виконати запит. Спробуйте пізніше.',
    }
  }
}
