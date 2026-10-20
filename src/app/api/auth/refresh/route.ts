import { errorResponse, successResponse } from '@/lib/api/bff-http'
import {
  clearAuthCookies,
  getUserToken,
  setAuthCookies,
} from '@/lib/auth/auth-cookies'
import { api } from '@/lib/api/nest-api'
import { parseAuthCredentials } from '@/modules/auth/api/parse-auth-credentials'

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
  } catch {
    console.error({
      operation: 'auth.refresh.route',
      errorType: 'unexpected-error',
    })

    return errorResponse(500, 'Не вдалося оновити сесію. Спробуйте пізніше.')
  }
}
