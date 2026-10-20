import 'server-only'

import { NextResponse } from 'next/server'
import type { ApiResponse } from '@/types/api-types'
import axios from 'axios'
import { MissingAccessTokenError } from '@/lib/api/nest-api'

export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json<ApiResponse<T>>(
    { success: true, data },
    {
      status,
      headers: { 'Cache-Control': 'no-store' },
    },
  )
}

export function errorResponse(status: number, message: string) {
  return NextResponse.json<ApiResponse<never>>(
    { success: false, message },
    {
      status,
      headers: { 'Cache-Control': 'no-store' },
    },
  )
}

export function nestErrorResponse(error: unknown) {
  if (error instanceof MissingAccessTokenError) {
    return errorResponse(401, error.message)
  }

  if (!axios.isAxiosError(error)) {
    return errorResponse(500, 'Внутрішня помилка сервера.')
  }

  if (!error.response) {
    return errorResponse(502, 'Не вдалося отримати відповідь сервісу.')
  }

  const { status } = error.response
  const data: unknown = error.response.data

  if (typeof data === 'object' && data !== null && 'message' in data) {
    const value = data.message

    const message =
      typeof value === 'string'
        ? value
        : Array.isArray(value) &&
            value.every((item) => typeof item === 'string')
          ? value.join('; ')
          : null

    if (message?.trim()) {
      const response = errorResponse(status, message)
      const retryAfter: unknown = error.response.headers['retry-after']

      if (
        status === 429 &&
        typeof retryAfter === 'string' &&
        /^\d{1,6}$/.test(retryAfter)
      ) {
        response.headers.set('Retry-After', retryAfter)
      }

      return response
    }
  }

  return errorResponse(502, 'Отримано некоректну відповідь сервісу.')
}

type JsonRequestResult =
  { success: true; data: unknown } | { success: false; response: NextResponse }

export async function readSameOriginJson(
  request: Request,
  maxBytes: number,
): Promise<JsonRequestResult> {
  if (request.headers.get('sec-fetch-site') !== 'same-origin') {
    return {
      success: false,
      response: errorResponse(403, 'Запит із цього джерела заборонений.'),
    }
  }

  const contentType = request.headers
    .get('content-type')
    ?.split(';')[0]
    ?.trim()
    .toLowerCase()

  if (contentType !== 'application/json') {
    return {
      success: false,
      response: errorResponse(415, 'Очікується JSON.'),
    }
  }

  const reader = request.body?.getReader()

  if (!reader) {
    return {
      success: false,
      response: errorResponse(400, 'Відсутнє тіло запиту.'),
    }
  }

  try {
    const decoder = new TextDecoder('utf-8', { fatal: true })
    let size = 0
    let text = ''

    while (true) {
      const { done, value } = await reader.read()

      if (done) break

      size += value.byteLength

      if (size > maxBytes) {
        await reader.cancel().catch(() => undefined)

        return {
          success: false,
          response: errorResponse(413, 'Завеликий запит.'),
        }
      }

      text += decoder.decode(value, { stream: true })
    }

    const data: unknown = JSON.parse(text + decoder.decode())

    return { success: true, data }
  } catch {
    return {
      success: false,
      response: errorResponse(400, 'Некоректний JSON.'),
    }
  } finally {
    reader.releaseLock()
  }
}
