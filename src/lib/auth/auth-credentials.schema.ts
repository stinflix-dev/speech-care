import 'server-only'

import { z } from 'zod'

const cookieCredentialSchema = z
  .string()
  .min(1)
  .max(3500)
  .regex(/^[A-Za-z0-9._~-]+$/)

export const authCredentialsSchema = z.object({
  accessToken: cookieCredentialSchema,
  refreshToken: cookieCredentialSchema,
  sessionExpiresAt: z.iso.datetime({ offset: true }),
})

export type AuthCredentials = z.infer<typeof authCredentialsSchema>
