import 'client-only'
import type { User } from '@/modules/users/schemas/user.schema'
import { bffApi } from '@/lib/api/bff-api'
import type { ApiResponse } from '@/types/api-types'
import { GET_RESPONSE_ERROR } from '@/constants/api.constants'

export async function getMe(): Promise<User> {
  const response = await bffApi
    .get<ApiResponse<User>>('/users/me', { validateStatus: () => true })
    .catch(() => {
      throw new Error(GET_RESPONSE_ERROR)
    })

  if (!response.data.success) {
    throw new Error(response.data.message)
  }

  return response.data.data
}
