import axios from 'axios'
import { toast } from 'sonner'

import { normalizeErrorResponse } from '@/shared/api/error'
import { queryClient } from '@/shared/api/query-client'

import type { ErrorResponse } from '@/shared/api/error'

declare module 'axios' {
  export interface AxiosRequestConfig {
    suppressGlobalErrorToast?: boolean
  }
}

const API_PATH_PREFIX = '/api'
const DEFAULT_API_ORIGIN = ''
const KEYCLOAK_AUTHORIZATION_PATH = '/oauth2/authorization/keycloak'
const PASSWORD_CHANGE_PATH = '/api/auth/password-change'
const LOGOUT_PATH = '/api/auth/logout'
const LOGIN_PATH = '/login'
const AUTH_REDIRECT_ATTEMPT_KEY = 'erp007.authRedirectAttempted'

let authRedirectInProgress = false

export function isAuthRedirectInProgress() {
  return authRedirectInProgress
}

export function waitForAuthRedirect(): Promise<never> {
  return new Promise(() => undefined)
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

function hasAuthRedirectAttempt() {
  try {
    return window.sessionStorage.getItem(AUTH_REDIRECT_ATTEMPT_KEY) === 'true'
  } catch {
    return false
  }
}

function markAuthRedirectAttempt() {
  try {
    window.sessionStorage.setItem(AUTH_REDIRECT_ATTEMPT_KEY, 'true')
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
export const PASSWORD_CHANGE_URL = buildBackendUrl(PASSWORD_CHANGE_PATH)
export const LOGOUT_URL = buildBackendUrl(LOGOUT_PATH)

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

  authRedirectInProgress = true

  if (hasAuthRedirectAttempt()) {
    window.location.assign(`${LOGIN_PATH}?auth_error=session`)
    return true
  }

  markAuthRedirectAttempt()
  window.location.assign(KEYCLOAK_AUTHORIZATION_URL)
  return true
}

function handleGlobalError(error: ErrorResponse, { suppressToast = false }: { suppressToast?: boolean } = {}) {
  if (error.status === 401) {
    queryClient.clear()
    const isRedirecting = redirectToAuthLogin({ force: true })
    return isRedirecting
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
    const suppressToast = axios.isAxiosError(error) && Boolean(error.config?.suppressGlobalErrorToast)
    const errorResponse = normalizeErrorResponse(error)
    const isWaitingForAuthRedirect = handleGlobalError(errorResponse, { suppressToast })

    if (isWaitingForAuthRedirect) {
      return waitForAuthRedirect()
    }

    return Promise.reject(errorResponse)
  },
)
