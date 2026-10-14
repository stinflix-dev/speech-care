import {
  errorResponse,
  nestErrorResponse,
  requestErrorResponse,
  successResponse,
} from '@/lib/api/bff-http'
import { api } from '@/lib/api/nest-api'
import { userSchema } from '@/modules/users/schemas/user.schema'

export async function GET() {
  try {
    const response = await api.get<unknown>('/users/me', {
      validateStatus: () => true,
    })

    if (response.status !== 200) {
      return nestErrorResponse(response.status, response.data)
    }

    const validatedUser = userSchema.safeParse(response.data)

    if (!validatedUser.success) {
      return errorResponse(502, 'Отримано некоректні дані користувача')
    }

    return successResponse(validatedUser.data)
  } catch (error) {
    return requestErrorResponse(
      error,
      'Не вдалося отримати інформацію про користувача.',
    )
  }
}
