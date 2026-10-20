'use client'

import { useMutation } from '@tanstack/react-query'
import { login } from '@/modules/auth/api/login'
import {
  resetSessionRecovery,
  withSessionLock,
} from '@/lib/auth/session-recovery'
import type { LoginInput } from '@/modules/auth/schemas/login.schema'

export function useLogin() {
  return useMutation({
    mutationFn: (input: LoginInput) =>
      withSessionLock(async () => {
        const result = await login(input)
        resetSessionRecovery()
        return result
      }),
    retry: false,
    gcTime: 0,
  })
}
