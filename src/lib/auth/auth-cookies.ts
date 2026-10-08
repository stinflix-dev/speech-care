import 'server-only'

import type { NextResponse } from 'next/server'
import { type AuthCredentials } from './auth-credentials.schema'

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
    secure ? '__Host-sc-access' : 'sc-access',
    credentials.accessToken,
    options,
  )

  response.cookies.set(
    secure ? '__Host-sc-refresh' : 'sc-refresh',
    credentials.refreshToken,
    options,
  )
}
