import { useQuery } from '@tanstack/react-query'
import { getMe } from '@/modules/users/api/get-me'

export const GET_ME_QUERY_KEYS = ['getMe'] as const

export const useGetMe = (refetchOnMount: boolean | 'always' = true) => {
  return useQuery({
    queryKey: GET_ME_QUERY_KEYS,
    queryFn: getMe,
    retry: false,
    refetchOnMount,
  })
}
