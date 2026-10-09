import { z } from 'zod'

export const registerSchema = z.strictObject({
  firstName: z
    .string()
    .trim()
    .min(1, 'Вкажіть ім’я.')
    .max(100, 'Ім’я має містити не більше 100 символів.'),
  lastName: z
    .string()
    .trim()
    .min(1, 'Вкажіть прізвище.')
    .max(100, 'Прізвище має містити не більше 100 символів.'),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email('Вкажіть коректну електронну пошту.')),
  password: z
    .string()
    .min(8, 'Пароль має містити щонайменше 8 символів.')
    .max(64, 'Пароль має містити не більше 64 символів.'),
})

export type RegisterInput = z.infer<typeof registerSchema>
