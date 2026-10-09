'use client'

import { useMutation } from '@tanstack/react-query'
import { login } from '@/modules/auth/api/login'

export function useLogin() {
  return useMutation({
    mutationFn: login,
    retry: false,
    gcTime: 0,
  })
}
