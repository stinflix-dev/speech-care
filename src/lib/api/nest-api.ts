import 'server-only'

import axios from 'axios'
import { serverEnv } from '@/lib/env/server'

export const api = axios.create({
  baseURL: serverEnv.API_URL,
  adapter: 'http',
  timeout: 10_000,
  maxRedirects: 0,
  headers: {
    Accept: 'application/json',
  },
})
