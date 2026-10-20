'use client'

import { type ReactNode, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { BffError } from '@/lib/api/bff-error'
import { useGetMe } from '@/modules/users/hooks/use-get-me'
import type { Route } from 'next'
import { useQueryClient } from '@tanstack/react-query'
import { subscribeToSessionExpiry } from '@/lib/auth/session-recovery'

type AuthGateProps = {
  mode: 'guest' | 'protected' | 'redirect'
  children: ReactNode
}

export function AuthGate({ mode, children }: AuthGateProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const query = useGetMe('always')

  useEffect(() => {
    return subscribeToSessionExpiry(() => {
      void queryClient.resetQueries()
    })
  }, [queryClient])

  const unauthorized =
    query.isError &&
    query.error instanceof BffError &&
    query.error.status === 401

  const checking = query.isPending || query.isFetching
  const ready = !checking && !query.isPaused

  let destination: Route | null = null

  if (ready) {
    if ((mode === 'guest' || mode === 'redirect') && query.isSuccess) {
      destination = '/profile'
    } else if ((mode === 'protected' || mode === 'redirect') && unauthorized) {
      destination = '/login'
    }
  }

  useEffect(() => {
    if (destination) {
      router.replace(destination)
    }
  }, [destination, router])

  if (query.isPaused) {
    return (
      <div>
        <p>Перевірка сесії очікує підключення до мережі.</p>
        {mode === 'guest' ? children : null}
      </div>
    )
  }

  if (checking || destination) {
    return <div>Перевіряємо сесію...</div>
  }

  if (mode === 'guest') {
    return (
      <>
        {query.isError && !unauthorized ? (
          <p role="status">
            Не вдалося перевірити сесію. Можна спробувати увійти знову.
          </p>
        ) : null}
        {children}
      </>
    )
  }

  if (query.isError) {
    return (
      <div>
        <p role="alert">{query.error.message}</p>
        <button type="button" onClick={() => void query.refetch()}>
          Спробувати ще
        </button>
        <Link href="/login">Перейти до входу</Link>
      </div>
    )
  }

  return children
}
