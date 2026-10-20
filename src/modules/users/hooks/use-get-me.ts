import { useQuery } from '@tanstack/react-query'
import { getMe } from '@/modules/users/api/get-me'

export const GET_ME_QUERY_KEYS = ['getMe'] as const

export const useGetMe = () => {
  return useQuery({
    queryKey: GET_ME_QUERY_KEYS,
    queryFn: ({ signal }) => getMe(signal),
    retry: false,
  })
}
