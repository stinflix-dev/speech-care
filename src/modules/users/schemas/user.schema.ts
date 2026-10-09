import { z } from 'zod'

export const userSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  firstName: z.string(),
  lastName: z.string(),
  avatarUrl: z.url().nullable(),
  birthday: z.iso.date().nullable(),
  createdAt: z.iso.datetime({ offset: true }),
  updatedAt: z.iso.datetime({ offset: true }),
})

export type User = z.infer<typeof userSchema>
