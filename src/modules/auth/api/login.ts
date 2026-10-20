import 'client-only'

import type { LoginInput } from '../schemas/login.schema'
import { bffApi } from '@/lib/api/bff-api'
import { DEFAULT_SERVER_ERROR_MESSAGE } from '@/constants/api.constants'
import type { ApiResponse } from '@/types/api-types'
import { BffError } from '@/lib/api/bff-error'

export async function login(input: LoginInput): Promise<null> {
  const response = await bffApi
    .post<ApiResponse<null>>('/auth/login', input, {
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
