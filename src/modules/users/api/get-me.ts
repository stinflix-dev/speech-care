import 'client-only'
import type { User } from '@/modules/users/schemas/user.schema'
import { bffApi } from '@/lib/api/bff-api'
import type { ApiResponse } from '@/types/api-types'
import { DEFAULT_SERVER_ERROR_MESSAGE } from '@/constants/api.constants'
import { BffError } from '@/lib/api/bff-error'
import { readWithSessionRecovery } from '@/lib/auth/session-recovery'

async function requestMe(signal?: AbortSignal): Promise<User> {
  const response = await bffApi
    .get<ApiResponse<User>>('/users/me', {
      validateStatus: () => true,
      ...(signal ? { signal } : {}),
    })
    .catch(() => {
      signal?.throwIfAborted()
      throw new Error(DEFAULT_SERVER_ERROR_MESSAGE)
    })

  if (!response.data.success) {
    throw new BffError(response.data.message, response.status)
  }

  return response.data.data
}

export function getMe(signal?: AbortSignal): Promise<User> {
  return readWithSessionRecovery(() => requestMe(signal), signal)
}
