export const register = async () => {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    try {
      await import('@/lib/env/server')
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Invalid server environment variables'

      console.error(`❌ ${message}`)
      process.exit(1)
    }
  }
}
