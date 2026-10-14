import 'server-only'

import type { NextResponse } from 'next/server'
import { type AuthCredentials } from './auth-credentials.schema'
import { cookies } from 'next/headers'

const HOST_SC_ACCESS = '__Host-sc-access' as const
const SC_ACCESS = 'sc-access' as const

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
    secure ? '__Host-sc-refresh' : 'sc-refresh',
    credentials.refreshToken,
    options,
  )
}

export async function getAccessToken() {
  const secure = process.env.NODE_ENV === 'production'

  const cookie = await cookies()

  return cookie.get(secure ? HOST_SC_ACCESS : SC_ACCESS)?.value
}
