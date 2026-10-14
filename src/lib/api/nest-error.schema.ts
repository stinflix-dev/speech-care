import { z } from 'zod'

export const nestErrorSchema = z.object({
  statusCode: z.number().int().min(400).max(599),
  message: z.union([z.string().min(1), z.array(z.string().min(1)).min(1)]),
})
