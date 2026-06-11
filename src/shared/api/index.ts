export {
  API_BASE_URL,
  api,
  isAuthRedirectInProgress,
  redirectToAuthLogin,
  waitForAuthRedirect,
} from '@/shared/api/client'
export { queryClient } from '@/shared/api/query-client'
export type { ErrorResponse } from '@/shared/api/error'
export { isErrorResponse, normalizeErrorResponse } from '@/shared/api/error'
