import 'client-only'
import type { ApiResponse } from '@/types/api-types'
import { bffApi } from '@/lib/api/bff-api'
import { DEFAULT_SERVER_ERROR_MESSAGE } from '@/constants/api.constants'
import { BffError } from '@/lib/api/bff-error'

export async function refreshSession(): Promise<null> {
  const response = await bffApi
    .post<ApiResponse<null>>('/auth/refresh', undefined, {
      validateStatus: () => true,
    })
    .catch(() => {
      throw new Error(DEFAULT_SERVER_ERROR_MESSAGE)
    })

  if (!response.data.success) {
    throw new BffError(response.data.message, response.status)
  }

  return response.data.data
}
