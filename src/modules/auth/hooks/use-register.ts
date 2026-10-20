'use client'

import { useMutation } from '@tanstack/react-query'
import { register } from '../api/register'
import type { RegisterInput } from '@/modules/auth/schemas/register.schema'
import {
  resetSessionRecovery,
  withSessionLock,
} from '@/lib/auth/session-recovery'

export function useRegister() {
  return useMutation({
    mutationFn: (input: RegisterInput) =>
      withSessionLock(async () => {
        const result = await register(input)
        resetSessionRecovery()
        return result
      }),
    retry: false,
    gcTime: 0,
  })
}
