'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { AppRoutes } from '@/constants/routes'
import {
  expireSessionRecovery,
  withSessionLock,
} from '@/lib/auth/session-recovery'
import { logout } from '@/modules/auth/api/logout'

export function useLogout() {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: () =>
      withSessionLock(async () => {
        await logout()

        try {
          expireSessionRecovery()
        } finally {
          await queryClient.cancelQueries()
          queryClient.removeQueries()
          router.replace(AppRoutes.LOGIN)
        }
      }),
    retry: false,
    gcTime: 0,
    networkMode: 'always',
  })
}
