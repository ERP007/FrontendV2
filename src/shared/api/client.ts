import axios from 'axios'
import { toast } from 'sonner'

import { normalizeErrorResponse } from '@/shared/api/error'
import { queryClient } from '@/shared/api/query-client'

import type { ErrorResponse } from '@/shared/api/error'

const LOGIN_PATH = '/login'

function redirectToLogin() {
  if (typeof window === 'undefined') {
    return
  }

  if (window.location.pathname !== LOGIN_PATH) {
    window.location.assign(LOGIN_PATH)
  }
}

function handleGlobalError(error: ErrorResponse) {
  if (error.status === 401) {
    queryClient.clear()
    redirectToLogin()
    return
  }

  if (error.status === 403) {
    toast.error(error.detail || '접근 권한이 없습니다.')
    return
  }

  if (error.status !== 400) {
    toast.error(error.detail || '요청 처리 중 오류가 발생했습니다.')
  }
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  withCredentials: true,
})

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const errorResponse = normalizeErrorResponse(error)

    handleGlobalError(errorResponse)

    return Promise.reject(errorResponse)
  },
)
