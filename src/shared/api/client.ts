import axios from 'axios'
import { toast } from 'sonner'

import { normalizeErrorResponse } from '@/shared/api/error'
import { queryClient } from '@/shared/api/query-client'

import type { ErrorResponse } from '@/shared/api/error'

type Auth401Redirect = 'forced-login' | 'login' | 'none'

declare module 'axios' {
  export interface AxiosRequestConfig {
    auth401Redirect?: Auth401Redirect
    suppressGlobalErrorToast?: boolean
  }
}

const API_PATH_PREFIX = '/api'
const DEFAULT_API_ORIGIN = ''
const KEYCLOAK_AUTHORIZATION_PATH = '/oauth2/authorization/keycloak'
const KEYCLOAK_FORCED_AUTHORIZATION_PATH = '/api/auth/login?prompt=login'
const PASSWORD_CHANGE_PATH = '/api/auth/password-change'
const LOGOUT_PATH = '/api/auth/logout'
const LOGOUT_REDIRECT_PENDING_KEY = 'erp007.logoutRedirectPending'
const AUTH_REDIRECT_ATTEMPT_KEY = 'erp007.authRedirectAttempt'
const AUTH_REDIRECT_ATTEMPT_WINDOW_MS = 120_000

type LogoutRedirectTarget = 'forced-login' | 'login'
type AuthRedirectAttemptTarget = LogoutRedirectTarget

let authRedirectInProgress = false

export function isAuthRedirectInProgress() {
  return authRedirectInProgress
}

export function waitForAuthRedirect(): Promise<never> {
  return new Promise(() => undefined)
}

export function clearLogoutRedirectPending() {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.sessionStorage.removeItem(LOGOUT_REDIRECT_PENDING_KEY)
  } catch {
    // Ignore storage failures.
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

export function hasRecentAuthRedirectAttempt(target?: AuthRedirectAttemptTarget) {
  if (typeof window === 'undefined') {
    return false
  }

  try {
    const rawValue = window.sessionStorage.getItem(AUTH_REDIRECT_ATTEMPT_KEY)

    if (!rawValue) {
      return false
    }

    const value = JSON.parse(rawValue) as Partial<{
      startedAt: number
      target: AuthRedirectAttemptTarget
    }>
    const startedAt = typeof value.startedAt === 'number' ? value.startedAt : 0
    const isFresh = Date.now() - startedAt <= AUTH_REDIRECT_ATTEMPT_WINDOW_MS
    const isTargetMatched = !target || value.target === target

    if (!isFresh) {
      clearAuthRedirectAttempt()
    }

    return isFresh && isTargetMatched
  } catch {
    return false
  }
}

export function consumeLogoutRedirectPending() {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const value = window.sessionStorage.getItem(LOGOUT_REDIRECT_PENDING_KEY)

    if (value) {
      window.sessionStorage.removeItem(LOGOUT_REDIRECT_PENDING_KEY)
    }

    if (value === 'forced-login') {
      return 'forced-login'
    }

    return value === 'login' || value === 'true' ? 'login' : null
  } catch {
    return null
  }
}

function markLogoutRedirectPending(target: LogoutRedirectTarget) {
  try {
    window.sessionStorage.setItem(LOGOUT_REDIRECT_PENDING_KEY, target)
  } catch {
    // Ignore storage failures.
  }
}

function markAuthRedirectAttempt(target: AuthRedirectAttemptTarget) {
  try {
    window.sessionStorage.setItem(
      AUTH_REDIRECT_ATTEMPT_KEY,
      JSON.stringify({
        startedAt: Date.now(),
        target,
      }),
    )
  } catch {
    // Ignore storage failures.
  }
}

function normalizeApiOrigin(value: string) {
  const trimmed = value.trim().replace(/\/+$/, '')

  if (!trimmed || trimmed === '/' || trimmed === API_PATH_PREFIX) {
    return DEFAULT_API_ORIGIN
  }

  if (/^https?:\/\//i.test(trimmed)) {
    const url = new URL(trimmed)

    url.hash = ''
    url.search = ''

    if (url.pathname === '/' || url.pathname === API_PATH_PREFIX) {
      url.pathname = ''
    }

    return url.toString().replace(/\/+$/, '')
  }

  return trimmed.replace(new RegExp(`${API_PATH_PREFIX}$`), '')
}

export const API_ORIGIN = normalizeApiOrigin(
  import.meta.env.VITE_API_BASE_URL || DEFAULT_API_ORIGIN,
)

function buildBackendUrl(path: string) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${API_ORIGIN}${normalizedPath}`
}

export const API_BASE_URL = buildBackendUrl(API_PATH_PREFIX)
export const KEYCLOAK_AUTHORIZATION_URL = buildBackendUrl(KEYCLOAK_AUTHORIZATION_PATH)
export const KEYCLOAK_FORCED_AUTHORIZATION_URL = buildBackendUrl(KEYCLOAK_FORCED_AUTHORIZATION_PATH)
export const PASSWORD_CHANGE_URL = buildBackendUrl(PASSWORD_CHANGE_PATH)
export const LOGOUT_URL = buildBackendUrl(LOGOUT_PATH)

export function redirectToAuthLogin() {
  if (typeof window === 'undefined') {
    return false
  }

  if (authRedirectInProgress) {
    return true
  }

  authRedirectInProgress = true
  clearLogoutRedirectPending()
  markAuthRedirectAttempt('login')
  queryClient.clear()
  window.location.assign(KEYCLOAK_AUTHORIZATION_URL)

  return true
}

export function redirectToForcedAuthLogin() {
  if (typeof window === 'undefined') {
    return false
  }

  if (authRedirectInProgress) {
    return true
  }

  authRedirectInProgress = true
  clearLogoutRedirectPending()
  markAuthRedirectAttempt('forced-login')
  queryClient.clear()
  window.location.assign(KEYCLOAK_FORCED_AUTHORIZATION_URL)

  return true
}

export function logoutAndRedirectToLogin({
  afterLogout = 'login',
}: { afterLogout?: LogoutRedirectTarget } = {}) {
  if (typeof window === 'undefined') {
    return false
  }

  if (authRedirectInProgress) {
    return true
  }

  authRedirectInProgress = true
  markLogoutRedirectPending(afterLogout)
  queryClient.clear()
  window.location.assign(LOGOUT_URL)

  return true
}

function handleGlobalError(
  error: ErrorResponse,
  {
    auth401Redirect = 'forced-login',
    suppressToast = false,
  }: { auth401Redirect?: Auth401Redirect; suppressToast?: boolean } = {},
) {
  if (error.status === 401) {
    if (auth401Redirect === 'none') {
      return false
    }

    return auth401Redirect === 'login' ? redirectToAuthLogin() : redirectToForcedAuthLogin()
  }

  if (suppressToast) {
    return false
  }

  if (error.status === 403) {
    toast.error(error.detail || '접근 권한이 없습니다.')
    return false
  }

  toast.error(error.detail || '요청 처리 중 오류가 발생했습니다.')

  return false
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
})

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const auth401Redirect = axios.isAxiosError(error) ? error.config?.auth401Redirect : undefined
    const suppressToast = axios.isAxiosError(error) && Boolean(error.config?.suppressGlobalErrorToast)
    const errorResponse = normalizeErrorResponse(error)
    const isWaitingForAuthRedirect = handleGlobalError(errorResponse, { auth401Redirect, suppressToast })

    if (isWaitingForAuthRedirect) {
      return waitForAuthRedirect()
    }

    return Promise.reject(errorResponse)
  },
)
