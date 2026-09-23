import 'server-only'

import { serverEnvSchema } from './schema'

const result = serverEnvSchema.safeParse(process.env)

if (!result.success) {
  const invalidVariables = result.error.issues
    .map((issue) => issue.path.join('.'))
    .join(', ')

  throw new Error(`Invalid server environment variables: ${invalidVariables}`)
}

export const serverEnv = result.data
