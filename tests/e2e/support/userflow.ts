import {
  expect,
  type APIRequestContext,
  type APIResponse,
  type Page,
  type Playwright,
  type TestInfo,
} from '@playwright/test'

import { authStatePath, isTestTargetProfile, todayIsoDate, type E2ERole } from './e2e-env'

interface ApiContentEnvelope<T> {
  content: T
}

export interface SessionBody {
  content?: {
    employeeNo?: string
    name?: string
    userRole?: string | null
  }
}

export interface PageResponse<T> {
  content: T[]
  totalElements?: number
}

export interface ItemSummary {
  active?: boolean
  name?: string
  sku: string
  unit?: string
  unitPrice?: number
}

export interface HqWarehouseSummary {
  code: string
  name?: string
}

export interface VendorSummary {
  active?: boolean
  code: string
  name?: string
}

export interface SalesOrderMutationResponse {
  code: string
  status: string
}

export interface PurchaseOrderMutationResponse {
  code: string
  status: string
}

export function e2eId(label: string) {
  return `E2E-${label}-${uniqueSuffix()}`
}

function uniqueSuffix() {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.floor(Math.random() * 1_679_616)
    .toString(36)
    .padStart(4, '0')
    .toUpperCase()

  return `${timestamp}${random}`
}

export function e2eCode(prefix: string, maxLength: number) {
  const suffix = uniqueSuffix()
  const safePrefix = prefix.toUpperCase()
  const prefixLength = Math.max(0, maxLength - suffix.length)

  return `${safePrefix.slice(0, prefixLength)}${suffix}`.slice(0, maxLength)
}

export function adminMutationEnabled() {
  return (
    process.env.E2E_ENABLE_MUTATION === 'true' &&
    process.env.E2E_ENABLE_ADMIN_MUTATION === 'true' &&
    isTestTargetProfile()
  )
}

export function mutationSkipMessage(scope = '쓰기') {
  return `${scope} E2E 테스트는 배포 데이터 보호를 위해 기본 비활성화되어 있습니다. E2E_ENABLE_MUTATION=true 설정 후 실행하세요.`
}

export function adminMutationSkipMessage() {
  return '관리자 변경 E2E 테스트는 E2E_TARGET_PROFILE=test, E2E_ENABLE_MUTATION=true, E2E_ENABLE_ADMIN_MUTATION=true 설정 후 실행하세요.'
}

async function responseText(response: APIResponse) {
  return await response.text().catch(() => '')
}

export async function attachApiFailure(testInfo: TestInfo, name: string, response: APIResponse) {
  const body = await responseText(response)

  await testInfo.attach(`${name} 실패 응답`, {
    body: `Status: ${response.status()}\nURL: ${response.url()}\n\n${body.slice(0, 4_000)}`,
    contentType: 'text/plain',
  })
}

export async function expectApiOk(response: APIResponse, testInfo: TestInfo, name: string) {
  if (!response.ok()) {
    await attachApiFailure(testInfo, name, response)
  }

  expect(response.ok(), `${name} API 요청이 성공해야 합니다. status=${response.status()}`).toBeTruthy()
}

export async function expectApiForbidden(response: APIResponse, testInfo: TestInfo, name: string) {
  if (response.status() !== 403) {
    await attachApiFailure(testInfo, name, response)
  }

  expect(response.status(), `${name} API 요청은 권한 부족으로 403이어야 합니다.`).toBe(403)
}

export async function expectApiStatusIn(
  response: APIResponse,
  statuses: number[],
  testInfo: TestInfo,
  name: string,
) {
  if (!statuses.includes(response.status())) {
    await attachApiFailure(testInfo, name, response)
  }

  expect(statuses, `${name} API status=${response.status()}가 허용 상태에 포함되어야 합니다.`).toContain(response.status())
}

export async function expectRouteBlocked(page: Page, path: string) {
  await expectRedirectedAwayFrom(page, path)
}

export async function expectUiValidation(page: Page, message: string | RegExp) {
  await expect(page.getByText(message)).toBeVisible()
}

export async function attachTestDataId(testInfo: TestInfo, id: string) {
  await testInfo.attach('E2E 테스트 데이터 ID', {
    body: id,
    contentType: 'text/plain',
  })
}

export async function createRoleApiContext(playwright: Playwright, baseURL: string | undefined, role: E2ERole) {
  return await playwright.request.newContext({
    baseURL,
    storageState: authStatePath(role),
  })
}

export async function postJsonWithRetry(
  request: APIRequestContext,
  path: string,
  data: unknown,
  attempts = 2,
) {
  let lastError: unknown

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await request.post(path, { data, timeout: 60_000 })
    } catch (error) {
      lastError = error
      if (attempt < attempts) {
        await new Promise((resolve) => setTimeout(resolve, 1_000))
      }
    }
  }

  throw lastError
}

export async function readJson<T>(response: APIResponse, testInfo: TestInfo, name: string): Promise<T> {
  const body = await responseText(response)

  if (!response.ok()) {
    await testInfo.attach(`${name} 실패 응답`, {
      body: `Status: ${response.status()}\nURL: ${response.url()}\n\n${body.slice(0, 4_000)}`,
      contentType: 'text/plain',
    })
  }

  expect(response.ok(), `${name} API 요청이 성공해야 합니다. status=${response.status()}`).toBeTruthy()

  return JSON.parse(body) as T
}

export async function attachCurrentPage(testInfo: TestInfo, page: Page, name = '현재 페이지') {
  await testInfo.attach(name, {
    body: page.url(),
    contentType: 'text/plain',
  })
}

export async function expectPath(page: Page, path: string) {
  await expect
    .poll(async () => new URL(page.url()).pathname, { timeout: 15_000 })
    .toBe(path)
}

export async function expectRedirectedAwayFrom(page: Page, path: string) {
  await page.goto(path)

  await expect
    .poll(async () => new URL(page.url()).pathname, { timeout: 15_000 })
    .not.toBe(path)
}

export async function expectPageTitle(page: Page, title: string | RegExp) {
  await expect(page.getByRole('heading', { name: title })).toBeVisible()
}

export async function openFirstTableRowIfAny(page: Page, testInfo: TestInfo, emptyReason: string) {
  const rows = page.getByTestId('fg-data-table-row')
  const rowCount = await rows.count()

  if (rowCount === 0) {
    await testInfo.attach('상세 진입 생략', {
      body: emptyReason,
      contentType: 'text/plain',
    })
    return false
  }

  await rows.first().click()
  return true
}

export async function expectNoButton(page: Page, name: string | RegExp) {
  await expect(page.getByRole('button', { name })).toHaveCount(0)
}

export async function getSessionRole(request: APIRequestContext, testInfo: TestInfo) {
  const session = await readJson<SessionBody>(
    await request.get('/api/users/session'),
    testInfo,
    '세션 조회',
  )

  return session.content?.userRole ?? null
}

export async function findFirstActiveItem(request: APIRequestContext, testInfo: TestInfo) {
  const body = await readJson<PageResponse<ItemSummary>>(
    await request.get('/api/items?page=1&size=20&sort=updatedAt,desc'),
    testInfo,
    '부품 후보 조회',
  )
  const envSku = process.env.E2E_SALES_ITEM_CODE
  const preferred = envSku
    ? body.content.find((item) => item.sku === envSku)
    : undefined

  return preferred ?? body.content.find((item) => item.active !== false) ?? body.content[0]
}

export async function findFirstHqWarehouse(request: APIRequestContext, testInfo: TestInfo) {
  const body = await readJson<ApiContentEnvelope<HqWarehouseSummary[]>>(
    await request.get('/api/inventory/warehouses/hq'),
    testInfo,
    '본사 창고 후보 조회',
  )
  const envWarehouseCode = process.env.E2E_SALES_TO_WAREHOUSE_CODE
  const preferred = envWarehouseCode
    ? body.content.find((warehouse) => warehouse.code === envWarehouseCode)
    : undefined

  return preferred ?? body.content[0]
}

export async function findFirstVendor(request: APIRequestContext, testInfo: TestInfo) {
  const vendors = await readJson<VendorSummary[]>(
    await request.get('/api/procurement-orders/vendors'),
    testInfo,
    '공급사 후보 조회',
  )

  return vendors.find((vendor) => vendor.active !== false) ?? vendors[0]
}

export function todayInvoice(id: string) {
  return `${id}-${todayIsoDate().replaceAll('-', '')}`
}

export function buildE2EUserPayload(employeeNo: string, overrides: Record<string, unknown> = {}) {
  return {
    display_name: `E2E 사용자 ${employeeNo}`,
    email: `${employeeNo.toLowerCase()}@e2e.local`,
    employee_no: employeeNo,
    initial_password: 'E2ePass1234',
    password_issue_mode: 'MANUAL',
    position: '테스트',
    role: 'ADMIN',
    tenancy: 'ADMIN',
    tenancy_code: 'ADMIN',
    ...overrides,
  }
}

export function buildE2EItemPayload(id: string, categoryCode: string, overrides: Record<string, unknown> = {}) {
  return {
    categoryCode,
    name: `${id} 테스트 부품`,
    safetyStock: 1,
    sku: e2eCode('E2E-I-', 30),
    unit: 'EA',
    unitPrice: 1000,
    ...overrides,
  }
}

export function buildE2EHqWarehousePayload(id: string, overrides: Record<string, unknown> = {}) {
  return {
    address: 'E2E 테스트 주소',
    branchId: null,
    code: e2eCode('E2EW', 20),
    name: `${id} 테스트 창고`,
    type: 'HQ',
    ...overrides,
  }
}

export function buildE2EStockPayload(
  sku: string,
  warehouseCode: string,
  overrides: Record<string, unknown> = {},
) {
  return {
    itemName: `${sku} 테스트 재고`,
    itemUnit: 'EA',
    quantity: 10,
    safetyStock: 2,
    sku,
    warehouseCode,
    ...overrides,
  }
}

export function buildE2ESalesOrderPayload(
  itemSku: string,
  warehouseCode: string,
  desiredArrivalDate: string,
  memo: string,
) {
  return {
    desiredArrivalDate,
    lines: [{ itemCode: itemSku, priority: 'NORMAL', quantity: 1 }],
    memo,
    warehouseCode,
  }
}

export function buildE2EPurchaseOrderPayload(
  itemSku: string,
  warehouseCode: string,
  vendorCode: string,
  desiredArrivalDate: string,
  memo: string,
  unitPrice = 1000,
) {
  return {
    desiredArrivalDate,
    lines: [{ itemSku, quantity: 1, unitPrice }],
    memo,
    vendorCode,
    warehouseCode,
  }
}
