import { errorResponse, successResponse } from '@/lib/api/bff-http'
import { getAccessToken } from '@/lib/auth/auth-cookies'
import { api } from '@/lib/api/nest-api'
import { userSchema } from '@/modules/users/schemas/user.schema'
import { nestErrorSchema } from '@/lib/api/nest-error.schema'

export async function GET() {
  try {
    const accessToken = await getAccessToken()

    if (!accessToken || !accessToken.trim()) {
      return errorResponse(401, 'Потрібно увійти в акаунт.')
    }

    const response = await api.get<unknown>('/users/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      validateStatus: () => true,
    })

    if (response.status !== 200) {
      const parsedError = nestErrorSchema.safeParse(response.data)

      if (
        !parsedError.success ||
        parsedError.data.statusCode !== response.status
      ) {
        return errorResponse(502, 'Отримано некоректну відповідь сервісу.')
      }

      const message = Array.isArray(parsedError.data.message)
        ? parsedError.data.message.join('; ')
        : parsedError.data.message

      return errorResponse(response.status, message)
    }

    const validatedUser = userSchema.safeParse(response.data)

    if (!validatedUser.success) {
      return errorResponse(502, 'Отримано некоректні дані користувача')
    }

    return successResponse(validatedUser.data)
  } catch {
    return errorResponse(500, 'Не вдалося отримати інформація про користувача')
  }
}
