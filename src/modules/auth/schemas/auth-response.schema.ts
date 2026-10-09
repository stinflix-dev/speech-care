import { z } from 'zod'

export const authResponseSchema = z.discriminatedUnion('success', [
  z.object({
    success: z.literal(true),
    data: z.null(),
  }),
  z.object({
    success: z.literal(false),
    message: z.string().min(1).max(500),
  }),
])
