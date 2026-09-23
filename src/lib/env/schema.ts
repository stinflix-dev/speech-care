import { z } from 'zod'

export const serverEnvSchema = z.object({
  APP_URL: z.url(),
})

export const clientEnvSchema = z.object({
  NEXT_PUBLIC_API_URL: z.url(),
})
