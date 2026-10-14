import 'server-only'

import axios from 'axios'
import { serverEnv } from '@/lib/env/server'
import { getAccessToken } from '@/lib/auth/auth-cookies'

const PUBLIC_URLS = [
  '/auth/login',
  '/auth/register',
  '/auth/logout',
  '/auth/refresh',
]

export class MissingAccessTokenError extends Error {
  constructor() {
    super('Потрібно увійти в акаунт.')
    this.name = 'MissingAccessTokenError'
  }
}

export const api = axios.create({
  baseURL: serverEnv.API_URL,
  adapter: 'http',
  timeout: 10_000,
  maxRedirects: 0,
  headers: {
    Accept: 'application/json',
  },
})

api.interceptors.request.use(async (config) => {
  const isPublicRequest =
    config.method === 'post' && PUBLIC_URLS.includes(config.url ?? '')

  if (isPublicRequest) {
    return config
  }

  const accessToken = await getAccessToken()

  if (!accessToken || !accessToken.trim()) {
    throw new MissingAccessTokenError()
  }

  config.headers.set('Authorization', `Bearer ${accessToken}`)

  return config
})
