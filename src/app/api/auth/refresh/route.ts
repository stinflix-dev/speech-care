import {
  errorResponse,
  nestErrorResponse,
  successResponse,
} from '@/lib/api/bff-http'
import {
  clearAuthCookies,
  getUserToken,
  setAuthCookies,
} from '@/lib/auth/auth-cookies'
import { api } from '@/lib/api/nest-api'
import { parseAuthCredentials } from '@/modules/auth/api/parse-auth-credentials'
import axios from 'axios'

export async function POST(request: Request) {
  try {
    if (request.headers.get('Sec-Fetch-Site') !== 'same-origin') {
      return errorResponse(403, 'Запит із цього джерела заборонений.')
    }

    const refreshToken = await getUserToken('refresh')

    if (!refreshToken) {
      const response = errorResponse(401, 'Потрібно увійти в акаунт.')

      clearAuthCookies(response)

      return response
    }

    const nestResponse = await api.post<unknown>('/auth/refresh', {
      refreshToken,
    })

    const result = parseAuthCredentials(nestResponse.data)

    if (!result.success) {
      return errorResponse(result.status, result.message)
    }

    const response = successResponse(null)

    setAuthCookies(response, result.data)

    return response
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      const response = errorResponse(
        401,
        'Сесію не вдалося відновити. Увійдіть знову.',
      )

      clearAuthCookies(response)

      return response
    }

    return nestErrorResponse(error)
  }
}
