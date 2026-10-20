import 'client-only'

import { bffApi } from '@/lib/api/bff-api'
import { BffError } from '@/lib/api/bff-error'
import type { ApiResponse } from '@/types/api-types'

export async function logout(): Promise<null> {
  const response = await bffApi
    .post<ApiResponse<null>>('/auth/logout', undefined, {
      validateStatus: () => true,
    })
    .catch(() => {
      throw new Error(
        'Не вдалося підтвердити вихід. Перевірте з’єднання та спробуйте ще раз.',
      )
    })

  if (!response.data.success) {
    throw new BffError(response.data.message, response.status)
  }

  return response.data.data
}
