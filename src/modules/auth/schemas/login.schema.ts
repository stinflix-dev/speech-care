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
