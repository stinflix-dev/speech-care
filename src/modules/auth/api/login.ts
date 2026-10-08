import 'server-only'

import axios from 'axios'
import { api } from '@/lib/api/nest-api'
import type { LoginInput } from '../schemas/login.schema'
import {
  type AuthCredentials,
  authCredentialsSchema,
} from '@/lib/auth/auth-credentials.schema'

type LoginFailure = {
  success: false
  status: number
  message: string
  retryAfter?: string
}

type LoginResult = { success: true; data: AuthCredentials } | LoginFailure

export async function login(input: LoginInput): Promise<LoginResult> {
  try {
    const response = await api.post<unknown>('/auth/login', input, {
      validateStatus: () => true,
    })

    if (response.status === 400) {
      return {
        success: false,
        status: 400,
        message: 'Перевірте електронну пошту та пароль.',
      }
    }

    if (response.status === 401) {
      return {
        success: false,
        status: 401,
        message: 'Неправильна електронна пошта або пароль.',
      }
    }

    if (response.status === 429) {
      const failure: LoginFailure = {
        success: false,
        status: 429,
        message: 'Забагато спроб входу. Спробуйте пізніше.',
      }

      const retryAfter: unknown = response.headers['retry-after']

      if (typeof retryAfter === 'string' && /^\d{1,6}$/.test(retryAfter)) {
        failure.retryAfter = retryAfter
      }

      return failure
    }

    if (response.status !== 200) {
      console.error({
        operation: 'auth.login',
        upstreamStatus: response.status,
      })

      return {
        success: false,
        status: 502,
        message: 'Сервіс входу тимчасово недоступний.',
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
        operation: 'auth.login',
        errorType: 'invalid-credentials-response',
      })

      return {
        success: false,
        status: 502,
        message: 'Сервіс входу повернув некоректну відповідь.',
      }
    }

    return { success: true, data: credentials.data }
  } catch (error) {
    const isAxiosError = axios.isAxiosError(error)
    const isTimeout =
      isAxiosError &&
      (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT')

    console.error({
      operation: 'auth.login',
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
        ? 'Сервіс входу не відповів вчасно.'
        : 'Не вдалося виконати вхід. Спробуйте пізніше.',
    }
  }
}
