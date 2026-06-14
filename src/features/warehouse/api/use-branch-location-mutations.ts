import { useMutation, useQueryClient } from '@tanstack/react-query'

import { api } from '@/shared/api'

import { branchLocationsQueryKey } from './use-branch-locations-query'

/** 지점 등록 (POST /inventory/branch-locations). ADMIN·HQ_MANAGER 전용. */
export function useBranchLocationCreateMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (name: string) => {
      await api.post('/inventory/branch-locations', { name })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: branchLocationsQueryKey }),
  })
}
