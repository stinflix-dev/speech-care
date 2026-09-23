import { clientEnvSchema } from '@/lib/env/schema'

const result = clientEnvSchema.safeParse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
})

if (!result.success) {
  const invalidVariables = result.error.issues
    .map((issue) => issue.path.join('.'))
    .join(', ')

  throw new Error(`Invalid public environment variables: ${invalidVariables}`)
}

export const clientEnv = result.data
