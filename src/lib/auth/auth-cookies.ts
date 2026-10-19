import 'server-only'

import type { NextResponse } from 'next/server'
import { type AuthCredentials } from './auth-credentials.schema'
import { cookies } from 'next/headers'

const HOST_SC_ACCESS = '__Host-sc-access' as const
const HOST_SC_REFRESH = '__Host-sc-refresh' as const

const SC_ACCESS = 'sc-access' as const
const SC_REFRESH = 'sc-refresh' as const

export function setAuthCookies(
  response: NextResponse,
  credentials: AuthCredentials,
) {
  const secure = process.env.NODE_ENV === 'production'

  const options = {
    httpOnly: true,
    secure,
    sameSite: 'lax' as const,
    path: '/',
    expires: new Date(credentials.sessionExpiresAt),
  }

  response.cookies.set(
    secure ? HOST_SC_ACCESS : SC_ACCESS,
    credentials.accessToken,
    options,
  )

  response.cookies.set(
    secure ? HOST_SC_REFRESH : SC_REFRESH,
    credentials.refreshToken,
    options,
  )
}

export function clearAuthCookies(response: NextResponse) {
  const secure = process.env.NODE_ENV === 'production'

  const options = {
    httpOnly: true,
    secure,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 0,
  }

  response.cookies.set(secure ? HOST_SC_ACCESS : SC_ACCESS, '', options)

  response.cookies.set(secure ? HOST_SC_REFRESH : SC_REFRESH, '', options)
}

export async function getUserToken(
  tokenType: 'access' | 'refresh',
): Promise<string | undefined> {
  const secure = process.env.NODE_ENV === 'production'

  const cookie = await cookies()

  return tokenType === 'access'
    ? cookie.get(secure ? HOST_SC_ACCESS : SC_ACCESS)?.value
    : cookie.get(secure ? HOST_SC_REFRESH : SC_REFRESH)?.value
}
