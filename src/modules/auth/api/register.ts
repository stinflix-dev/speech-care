import 'client-only'

import { bffApi } from '@/lib/api/bff-api'
import type { RegisterInput } from '../schemas/register.schema'
import type { ApiResponse } from '@/types/api-types'
import { BffError } from '@/lib/api/bff-error'

export async function register(input: RegisterInput): Promise<null> {
  const response = await bffApi
    .post<ApiResponse<null>>('/auth/register', input, {
      validateStatus: () => true,
    })
    .catch(() => {
      throw new Error(
        'Не вдалося отримати відповідь сервера. Якщо запит уже був надісланий, спробуйте увійти перед повторною реєстрацією.',
      )
    })

  if (!response.data.success) {
    throw new BffError(response.data.message, response.status)
  }

  return response.data.data
}
