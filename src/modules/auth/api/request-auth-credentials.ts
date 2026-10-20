import 'server-only'

import { api } from '@/lib/api/nest-api'
import type { LoginInput } from '../schemas/login.schema'
import type { RegisterInput } from '../schemas/register.schema'
import type { AuthResult } from '../types/api-types'
import { parseAuthCredentials } from '@/modules/auth/api/parse-auth-credentials'

type AuthInput =
  | { action: 'login'; input: LoginInput }
  | { action: 'register'; input: RegisterInput }

export async function requestAuthCredentials({
  input,
  action,
}: AuthInput): Promise<AuthResult> {
  const response = await api.post<unknown>(`/auth/${action}`, input)

  return parseAuthCredentials(response.data)
}
