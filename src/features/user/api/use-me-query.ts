import { useQuery } from '@tanstack/react-query'

import { api } from '@/shared/api'

import type { Me } from '../model/types'

export const meQueryKey = ['users', 'me'] as const

export function useMeQuery() {
  return useQuery({
    queryFn: async () => {
      const response = await api.get<Me>('/users/me')
      return response.data
    },
    queryKey: meQueryKey,
    staleTime: 5 * 60_000,
  })
}
