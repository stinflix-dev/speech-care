import {
  errorResponse,
  nestErrorResponse,
  successResponse,
} from '@/lib/api/bff-http'
import { clearAuthCookies, getUserToken } from '@/lib/auth/auth-cookies'
import { api } from '@/lib/api/nest-api'

export async function POST(request: Request) {
  try {
    if (request.headers.get('Sec-Fetch-Site') !== 'same-origin') {
      return errorResponse(403, 'Запит із цього джерела заборонений.')
    }

    const refreshToken = await getUserToken('refresh')

    if (refreshToken) {
      await api.post<void>('/auth/logout', { refreshToken })
    }

    const response = successResponse(null)
    clearAuthCookies(response)

    return response
  } catch (error) {
    return nestErrorResponse(error)
  }
}
