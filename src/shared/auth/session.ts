import { useQuery } from '@tanstack/react-query'

import {
  api,
  clearAuthRedirectAttempt,
  redirectToAuthLogin,
  waitForAuthRedirect,
} from '@/shared/api'
import { queryClient } from '@/shared/api/query-client'

export interface AuthSession {
  employeeNo: string
  name: string
  position: string | null
  tenancyCode: string | null
  tenancyType: string | null
  userRole: string | null
}

interface SessionResponse {
  content: AuthSession
}

export const sessionQueryKey = ['auth', 'session'] as const

export async function fetchSession() {
  const response = await api.get<SessionResponse>('/users/session', { auth401Redirect: 'login' })
  const session = response.data.content

  if (!session) {
    if (redirectToAuthLogin()) {
      return await waitForAuthRedirect()
    }

    throw new Error('Session response is missing content.')
  }

  clearAuthRedirectAttempt()
  return session
}

export function ensureSession() {
  return queryClient.fetchQuery({
    queryFn: fetchSession,
    queryKey: sessionQueryKey,
    staleTime: 60_000,
  })
}

export function useSession() {
  return useQuery({
    queryFn: fetchSession,
    queryKey: sessionQueryKey,
    staleTime: 60_000,
  })
}
