type GetErrorMessageType = (error: unknown, fallbackMessage?: string) => string

const DEFAULT_ERROR_MESSAGE = 'Something went wrong'

export const getErrorMessage: GetErrorMessageType = (
  error,
  fallbackMessage = DEFAULT_ERROR_MESSAGE,
) => {
  if (error instanceof Error && error.message) {
    return error.message
  }

  if (typeof error === 'string') {
    return error
  }

  return fallbackMessage
}
