import 'client-only'

import { bffApi } from '@/lib/api/bff-api'
import { authResponseSchema } from '../schemas/auth-response.schema'
import type { RegisterInput } from '../schemas/register.schema'

export async function register(input: RegisterInput): Promise<null> {
  const response = await bffApi
    .post<unknown>('/auth/register', input, {
      validateStatus: () => true,
    })
    .catch(() => {
      throw new Error(
        'Не вдалося отримати відповідь сервера. Якщо запит уже був надісланий, спробуйте увійти перед повторною реєстрацією.',
      )
    })

  const result = authResponseSchema.safeParse(response.data)

  if (!result.success) {
    throw new Error('Отримано некоректну відповідь сервера.')
  }

  if (response.status === 201 && result.data.success) {
    return result.data.data
  }

  if (response.status >= 400 && !result.data.success) {
    throw new Error(result.data.message)
  }

  throw new Error('Отримано некоректну відповідь сервера.')
}
