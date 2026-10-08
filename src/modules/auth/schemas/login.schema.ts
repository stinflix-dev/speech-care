import { z } from 'zod'

export const loginSchema = z.strictObject({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email('Вкажіть коректну електронну пошту.')),
  password: z.string().min(1, 'Вкажіть пароль.'),
})

export type LoginInput = z.infer<typeof loginSchema>

export const loginResponseSchema = z.discriminatedUnion('success', [
  z.object({
    success: z.literal(true),
    data: z.null(),
  }),
  z.object({
    success: z.literal(false),
    message: z.string().min(1).max(500),
  }),
])
