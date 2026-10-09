import { getErrorMessage } from '@/lib/errors/get-error-message'

export const register = async () => {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    try {
      await import('@/lib/env/server')
    } catch (error) {
      const message = getErrorMessage(
        error,
        'Invalid server environment variables',
      )

      console.error(`❌ ${message}`)
      process.exit(1)
    }
  }
}
