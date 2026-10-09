import 'client-only'

import type { LoginInput } from '../schemas/login.schema'
import { bffApi } from '@/lib/api/bff-api'
import { authResponseSchema } from '@/modules/auth/schemas/auth-response.schema'

export async function login(input: LoginInput): Promise<null> {
  const response = await bffApi
    .post<unknown>('/auth/login', input, {
      validateStatus: () => true,
    })
    .catch(() => {
      throw new Error(
        'Не вдалося отримати відповідь сервера. Спробуйте пізніше.',
      )
    })

  const result = authResponseSchema.safeParse(response.data)

  if (!result.success) {
    throw new Error('Отримано некоректну відповідь сервера.')
  }

  if (response.status === 200 && result.data.success) {
    return result.data.data
  }

  if (response.status >= 400 && !result.data.success) {
    throw new Error(result.data.message)
  }

  throw new Error('Отримано некоректну відповідь сервера.')
}
