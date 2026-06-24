import dayjs from 'dayjs'
import 'dayjs/locale/ko'

dayjs.locale('ko')

type DateInput = string | number | Date | null | undefined

function safeFormat(value: DateInput, template: string): string {
  if (value === null || value === undefined || value === '') return '-'
  const parsed = dayjs(value)
  if (!parsed.isValid()) return '-'
  return parsed.format(template)
}

export function formatDate(value: DateInput): string {
  return safeFormat(value, 'YYYY-MM-DD')
}

export function formatDateWithDay(value: DateInput): string {
  return safeFormat(value, 'YYYY-MM-DD (dd)')
}

export function formatDateTime(value: DateInput): string {
  return safeFormat(value, 'YYYY년 MM월 DD일 HH시 mm분')
}

export function formatTime(value: DateInput): string {
  return safeFormat(value, 'HH:mm')
}

export function formatNumber(value: number): string {
  return value.toLocaleString('ko-KR')
}

export function formatCurrency(value: number): string {
  return `₩${value.toLocaleString('ko-KR')}`
}

export function formatDelta(value: number): string {
  return value > 0 ? `+${value.toLocaleString('ko-KR')}` : value.toLocaleString('ko-KR')
}

export function formatDday(value: DateInput): string {
  if (value === null || value === undefined || value === '') return '-'
  const parsed = dayjs(value)
  if (!parsed.isValid()) return '-'
  const diff = parsed.startOf('day').diff(dayjs().startOf('day'), 'day')
  if (diff === 0) return 'D-Day'
  return diff > 0 ? `D-${diff}` : `D+${Math.abs(diff)}`
}

export function isOverdue(value: DateInput): boolean {
  if (value === null || value === undefined || value === '') return false
  const parsed = dayjs(value)
  if (!parsed.isValid()) return false
  return parsed.startOf('day').isBefore(dayjs().startOf('day'))
}
