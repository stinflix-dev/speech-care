import {
  errorResponse,
  nestErrorResponse,
  readSameOriginJson,
  successResponse,
} from '@/lib/api/bff-http'
import { setAuthCookies } from '@/lib/auth/auth-cookies'
import { registerSchema } from '@/modules/auth/schemas/register.schema'
import { requestAuthCredentials } from '@/modules/auth/api/request-auth-credentials'

export async function POST(request: Request) {
  try {
    const body = await readSameOriginJson(request, 8192)

    if (!body.success) return body.response

    const input = registerSchema.safeParse(body.data)

    if (!input.success) {
      return errorResponse(400, 'Перевірте дані для реєстрації.')
    }

    const result = await requestAuthCredentials({
      action: 'register',
      input: input.data,
    })

    if (!result.success) {
      return errorResponse(result.status, result.message)
    }

    const response = successResponse(null, 201)
    setAuthCookies(response, result.data)

    return response
  } catch (error) {
    return nestErrorResponse(error)
  }
}
