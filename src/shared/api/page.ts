/**
 * 페이지네이션이 적용된 모든 응답의 공용 envelope.
 * `content`만 도메인별로 달라짐.
 */
export interface PageResponse<T> {
  content: T[]
  hasNext: boolean
  hasPrevious: boolean
  page: number
  size: number
  totalElements: number
  totalPages: number
}
