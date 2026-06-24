import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'

import {
  api,
  clearAuthRedirectAttempt,
  hasRecentAuthRedirectAttempt,
  redirectToAuthLogin,
  waitForAuthRedirect,
} from '@/shared/api'
import { isErrorResponse } from '@/shared/api/error'
import { queryClient } from '@/shared/api/query-client'

import type { ErrorResponse } from '@/shared/api/error'

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
export const AUTH_SESSION_COOKIE_ERROR_CODE = 'AUTH_SESSION_COOKIE_MISSING'

const AUTH_SESSION_COOKIE_ERROR_DETAIL =
  '로그인은 완료됐지만 브라우저가 세션 쿠키를 저장하거나 전송하지 못했습니다. 시크릿 모드의 쿠키 차단 설정을 확인하거나 로컬 개발에서는 /api 프록시를 사용해주세요.'
const AUTH_SESSION_COOKIE_TOAST_ID = 'auth-session-cookie-missing'

function createAuthSessionCookieError(): ErrorResponse {
  return {
    detail: AUTH_SESSION_COOKIE_ERROR_DETAIL,
    errorCode: AUTH_SESSION_COOKIE_ERROR_CODE,
    status: 401,
    timestamp: new Date().toISOString(),
  }
}

export function isAuthSessionCookieError(error: unknown) {
  return isErrorResponse(error) && error.errorCode === AUTH_SESSION_COOKIE_ERROR_CODE
}

export async function fetchSession() {
  try {
    const response = await api.get<SessionResponse>('/users/session', {
      auth401Redirect: 'none',
      suppressGlobalErrorToast: true,
    })
    const session = response.data.content

    if (!session) {
      if (redirectToAuthLogin()) {
        return await waitForAuthRedirect()
      }

      throw new Error('Session response is missing content.')
    }

    clearAuthRedirectAttempt()

    return session
  } catch (error) {
    if (isErrorResponse(error) && error.status === 401) {
      if (hasRecentAuthRedirectAttempt()) {
        const authSessionCookieError = createAuthSessionCookieError()

        toast.error(authSessionCookieError.detail, { id: AUTH_SESSION_COOKIE_TOAST_ID })
        throw authSessionCookieError
      }

      if (redirectToAuthLogin()) {
        return await waitForAuthRedirect()
      }
    }

    throw error
  }
}

export function ensureSession() {
  return queryClient.fetchQuery({
    queryFn: fetchSession,
    queryKey: sessionQueryKey,
    retry: false,
    staleTime: 60_000,
  })
}

export function useSession() {
  return useQuery({
    queryFn: fetchSession,
    queryKey: sessionQueryKey,
    retry: false,
    staleTime: 60_000,
  })
}
