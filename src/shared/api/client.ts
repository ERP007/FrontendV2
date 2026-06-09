import axios from 'axios'

import { normalizeErrorResponse } from '@/shared/api/error'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  withCredentials: true,
})

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => Promise.reject(normalizeErrorResponse(error)),
)
