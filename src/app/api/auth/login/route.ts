import {
  errorResponse,
  nestErrorResponse,
  readSameOriginJson,
  successResponse,
} from '@/lib/api/bff-http'
import { setAuthCookies } from '@/lib/auth/auth-cookies'
import { loginSchema } from '@/modules/auth/schemas/login.schema'
import { requestAuthCredentials } from '@/modules/auth/api/request-auth-credentials'

export async function POST(request: Request) {
  try {
    const body = await readSameOriginJson(request, 8192)

    if (!body.success) return body.response

    const input = loginSchema.safeParse(body.data)

    if (!input.success) {
      return errorResponse(400, 'Перевірте дані для входу.')
    }

    const result = await requestAuthCredentials({
      action: 'login',
      input: input.data,
    })

    if (!result.success) {
      return errorResponse(result.status, result.message)
    }

    const response = successResponse(null)
    setAuthCookies(response, result.data)

    return response
  } catch (error) {
    return nestErrorResponse(error)
  }
}
