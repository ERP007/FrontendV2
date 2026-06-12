export {
  API_BASE_URL,
  API_ORIGIN,
  KEYCLOAK_AUTHORIZATION_URL,
  api,
  clearAuthRedirectAttempt,
  isAuthRedirectInProgress,
  redirectToAuthLogin,
  waitForAuthRedirect,
} from '@/shared/api/client'
export type { PageResponse } from '@/shared/api/page'
export { queryClient } from '@/shared/api/query-client'
export type { ErrorResponse } from '@/shared/api/error'
export { isErrorResponse, normalizeErrorResponse } from '@/shared/api/error'
export type {
  CommonErrorCode,
  DomainErrorCode,
  ErrorCode,
  ErrorDomain,
  GlobalErrorCode,
  InventoryErrorCode,
  ItemErrorCode,
  PurchaseOrderErrorCode,
  SalesOrderErrorCode,
  UserErrorCode,
} from '@/shared/api/error-codes'
export {
  COMMON_ERROR_CODES,
  getErrorDomain,
  GLOBAL_ERROR_CODES,
  INVENTORY_ERROR_CODES,
  isDomainErrorCode,
  ITEM_ERROR_CODES,
  PURCHASE_ORDER_ERROR_CODES,
  SALES_ORDER_ERROR_CODES,
  USER_ERROR_CODES,
} from '@/shared/api/error-codes'
