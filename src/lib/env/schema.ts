import { z } from 'zod'

export const serverEnvSchema = z.object({
  API_URL: z.url(),
})
