import axios from 'axios'
import { toast } from 'sonner'

import { normalizeErrorResponse } from '@/shared/api/error'
import { queryClient } from '@/shared/api/query-client'

import type { ErrorResponse } from '@/shared/api/error'

const DEFAULT_API_BASE_URL = '/api'
const AUTH_LOGIN_PATH = '/auth/login'
const LOGIN_PATH = '/login'
const AUTH_REDIRECT_ATTEMPT_KEY = 'erp007.authRedirectAttempted'

let authRedirectInProgress = false

export function isAuthRedirectInProgress() {
  return authRedirectInProgress
}

export function waitForAuthRedirect(): Promise<never> {
  return new Promise(() => undefined)
}

function hasAuthRedirectAttempted() {
  try {
    return window.sessionStorage.getItem(AUTH_REDIRECT_ATTEMPT_KEY) === 'true'
  } catch {
    return false
  }
}

function markAuthRedirectAttempted() {
  try {
    window.sessionStorage.setItem(AUTH_REDIRECT_ATTEMPT_KEY, 'true')
  } catch {
    // Ignore storage failures. The redirect itself is still the source of truth.
  }
}

export function clearAuthRedirectAttempt() {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.sessionStorage.removeItem(AUTH_REDIRECT_ATTEMPT_KEY)
  } catch {
    // Ignore storage failures.
  }
}

function normalizeApiBaseUrl(value: string) {
  const trimmed = value.trim().replace(/\/+$/, '')

  if (!trimmed || trimmed === '/') {
    return DEFAULT_API_BASE_URL
  }

  if (/^https?:\/\//i.test(trimmed)) {
    const url = new URL(trimmed)

    if (url.pathname === '') {
      url.pathname = DEFAULT_API_BASE_URL
    }

    if (url.pathname === '/') {
      url.pathname = DEFAULT_API_BASE_URL
    }

    return url.toString().replace(/\/+$/, '')
  }

  return trimmed
}

export const API_BASE_URL = normalizeApiBaseUrl(
  import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL,
)

function buildApiUrl(path: string) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${API_BASE_URL}${normalizedPath}`
}

function redirectToLoginWithSessionError() {
  authRedirectInProgress = true
  window.location.assign(`${LOGIN_PATH}?auth_error=session`)
  return true
}

export function redirectToAuthLogin({ force = false }: { force?: boolean } = {}) {
  if (typeof window === 'undefined') {
    return false
  }

  if (authRedirectInProgress) {
    return true
  }

  if (!force && window.location.pathname === LOGIN_PATH) {
    return false
  }

  if (!force && hasAuthRedirectAttempted()) {
    return redirectToLoginWithSessionError()
  }

  authRedirectInProgress = true
  markAuthRedirectAttempted()
  window.location.assign(buildApiUrl(AUTH_LOGIN_PATH))
  return true
}

function handleGlobalError(error: ErrorResponse) {
  if (error.status === 401) {
    const isRedirecting = redirectToAuthLogin()
    queryClient.clear()
    return isRedirecting
  }

  if (error.status === 403) {
    toast.error(error.detail || '접근 권한이 없습니다.')
    return false
  }

  if (error.status !== 400) {
    toast.error(error.detail || '요청 처리 중 오류가 발생했습니다.')
  }

  return false
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
})

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const errorResponse = normalizeErrorResponse(error)
    const isWaitingForAuthRedirect = handleGlobalError(errorResponse)

    if (isWaitingForAuthRedirect) {
      return waitForAuthRedirect()
    }

    return Promise.reject(errorResponse)
  },
)
