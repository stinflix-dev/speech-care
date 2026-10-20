import 'client-only'

import { BffError } from '@/lib/api/bff-error'
import { refreshSession } from '@/lib/auth/refresh-session'

const SESSION_LOCK = 'speech-care:auth-session'
const RECOVERY_STATE_KEY = 'speech-care:session-recovery'

const STORAGE_ERROR =
  'Не вдалося отримати доступ до сховища браузера. Перевірте його налаштування.'

function isUnauthorized(error: unknown): error is BffError {
  return error instanceof BffError && error.status === 401
}

function readRecoveryState(): string | null {
  try {
    return localStorage.getItem(RECOVERY_STATE_KEY)
  } catch {
    throw new Error(STORAGE_ERROR)
  }
}

function writeRecoveryState(state: 'pending' | 'expired' | null) {
  try {
    if (state === null) {
      localStorage.removeItem(RECOVERY_STATE_KEY)
    } else {
      localStorage.setItem(RECOVERY_STATE_KEY, state)
    }
  } catch {
    throw new Error(STORAGE_ERROR)
  }
}

export function resetSessionRecovery() {
  writeRecoveryState(null)
}

export async function withSessionLock<T>(
  operation: () => Promise<T>,
  signal?: AbortSignal,
): Promise<T> {
  signal?.throwIfAborted()

  if (!navigator.locks) {
    throw new Error(
      'Для роботи із сесією потрібен сучасний браузер із підтримкою Web Locks.',
    )
  }

  return navigator.locks.request(
    SESSION_LOCK,
    signal ? { signal } : {},
    operation,
  )
}

export function expireSessionRecovery() {
  writeRecoveryState('expired')
}

export function subscribeToSessionExpiry(onExpired: () => void) {
  function handleStorage(event: StorageEvent) {
    if (
      event.storageArea === localStorage &&
      event.key === RECOVERY_STATE_KEY &&
      event.newValue === 'expired'
    ) {
      onExpired()
    }
  }

  window.addEventListener('storage', handleStorage)

  return () => {
    window.removeEventListener('storage', handleStorage)
  }
}

// Використовуємо тільки для читання, яке безпечно повторювати.
export async function readWithSessionRecovery<T>(
  read: () => Promise<T>,
  signal?: AbortSignal,
): Promise<T> {
  signal?.throwIfAborted()

  try {
    return await read()
  } catch (error) {
    if (!isUnauthorized(error)) throw error
  }

  return withSessionLock(async () => {
    signal?.throwIfAborted()

    // Перевіряємо актуальні cookies після очікування іншої вкладки.
    try {
      return await read()
    } catch (error) {
      if (!isUnauthorized(error)) throw error
    }

    signal?.throwIfAborted()

    const state = readRecoveryState()

    if (state === 'expired') {
      throw new BffError('Потрібно увійти в акаунт.', 401)
    }

    if (state !== null) {
      throw new Error(
        'Попереднє відновлення сесії не було підтверджене. Увійдіть знову.',
      )
    }

    writeRecoveryState('pending')

    try {
      await refreshSession()
    } catch (error) {
      if (isUnauthorized(error)) {
        writeRecoveryState('expired')
      } else if (
        error instanceof BffError &&
        (error.status === 403 || error.status === 429)
      ) {
        // Our BFF/Nest guards reject these requests before rotation starts.
        resetSessionRecovery()
      }

      throw error
    }

    resetSessionRecovery()
    // Do not cancel an issued refresh: first settle its result and marker.
    signal?.throwIfAborted()

    // Після успішного refresh повторюємо читання лише один раз.
    try {
      return await read()
    } catch (error) {
      if (isUnauthorized(error)) {
        writeRecoveryState('expired')
      }

      throw error
    }
  }, signal)
}
