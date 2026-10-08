import 'client-only'

import axios from 'axios'

export const bffApi = axios.create({
  baseURL: '/api',
  timeout: 15_000,
  headers: {
    Accept: 'application/json',
  },
})
