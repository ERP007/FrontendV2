import { expect, test, type APIRequestContext } from '@playwright/test'
import { allure } from 'allure-playwright'

import { authStatePath, hasAuthState } from './support/e2e-env'
import { skipMessage } from './support/auth'
import {
  adminMutationEnabled,
  adminMutationSkipMessage,
  attachTestDataId,
  buildE2EItemPayload,
  buildE2EStockPayload,
  buildE2EUserPayload,
  e2eCode,
  e2eId,
  expectApiOk,
  expectApiStatusIn,
  postJsonWithRetry,
  readJson,
} from './support/userflow'

interface ApiEnvelope<T> {
  content: T
}

interface UserSearchResponse {
  content: Array<{
    userId: string
  }>
}

interface UserDetail {
  email: string
  employeeNo: string
  name: string
  position: string | null
  role: string
  status: string
  tenancyCode: string
  tenancyName: string
  userId: string
}

interface ItemCategory {
  categoryCode: string
  categoryName: string
}

interface ItemDetail {
  active: boolean
  categoryCode: string
  name: string
  safetyStock: number
  sku: string
  subCategoryCode?: string
  unit: string
  unitPrice: number
}

interface BranchLocation {
  id: number
  name: string
}

interface WarehouseDetail {
  active: boolean
  address: string
  branchId: number | null
  code: string
  name: string
  type: string
  version: number
}

interface SafetyStockEdit {
  safetyStock: number
  sku: string
  version: number
  warehouseCode: string
}

function unwrapContent<T>(body: T | ApiEnvelope<T>) {
  if (typeof body === 'object' && body !== null && 'content' in body) {
    return (body as ApiEnvelope<T>).content
  }

  return body as T
}

async function readContent<T>(request: APIRequestContext, path: string, testInfo: Parameters<typeof readJson>[1], name: string) {
  const body = await readJson<T | ApiEnvelope<T>>(await request.get(path), testInfo, name)

  return unwrapContent(body)
}

async function findCreatedUserId(request: APIRequestContext, employeeNo: string, testInfo: Parameters<typeof readJson>[1]) {
  const users = await readJson<UserSearchResponse>(
    await request.get(`/api/users?keyword=${employeeNo}&page=1&size=10&sortBy=employeeNo&sortDirection=ASC&role=ALL&status=ALL&tenancy_code=ALL`),
    testInfo,
    '생성 사용자 검색',
  )

  return users.content[0]?.userId
}

async function findUsableCategoryCode(request: APIRequestContext, testInfo: Parameters<typeof readJson>[1]) {
  const categories = await readJson<ItemCategory[]>(
    await request.get('/api/items/categories'),
    testInfo,
    '부품 대분류 조회',
  )
  const category = categories[0]
  expect(category?.categoryCode, '부품 생성에 사용할 대분류 코드').toBeTruthy()

  const subCategories = await readJson<ItemCategory[]>(
    await request.get(`/api/items/categories/${encodeURIComponent(category!.categoryCode)}/sub-categories`),
    testInfo,
    '부품 중분류 조회',
  )

  return subCategories[0]?.categoryCode ?? category!.categoryCode
}

test.beforeEach(async () => {
  await allure.suite('Admin Mutation')
})

test.describe('Admin Mutation', () => {
  test.skip(!adminMutationEnabled(), adminMutationSkipMessage())
  test.skip(!hasAuthState('admin'), skipMessage('admin'))
  test.use({ storageState: authStatePath('admin') })

  test('관리자는 사용자 생성부터 수정, 비밀번호 초기화, 정지/해제, 중복 검증까지 수행한다', async ({ request }, testInfo) => {
    const id = e2eId('ADMIN-USER')
    const employeeNo = e2eCode('E2EU', 20)
    const createPayload = buildE2EUserPayload(employeeNo)
    await attachTestDataId(testInfo, id)

    await test.step('E2E 사용자를 생성한다', async () => {
      await expectApiStatusIn(
        await postJsonWithRetry(request, '/api/users/create', createPayload),
        [200, 201, 409],
        testInfo,
        '사용자 생성',
      )
    })

    const userId = await test.step('생성된 사용자 상세를 조회한다', async () => {
      const createdUserId = await findCreatedUserId(request, employeeNo, testInfo)
      expect(createdUserId, '생성된 사용자 ID').toBeTruthy()

      const detail = await readContent<UserDetail>(
        request,
        `/api/users/${encodeURIComponent(createdUserId!)}`,
        testInfo,
        '사용자 상세 조회',
      )
      expect(detail.employeeNo).toBe(employeeNo)

      return createdUserId!
    })

    await test.step('사용자 기본 정보를 수정한다', async () => {
      const detail = await readContent<UserDetail>(
        request,
        `/api/users/${encodeURIComponent(userId)}`,
        testInfo,
        '수정 전 사용자 상세 조회',
      )
      await expectApiOk(
        await request.patch(`/api/users/${encodeURIComponent(userId)}`, {
          data: {
            display_name: `${detail.name} 수정`,
            email: `updated-${detail.email}`,
            position: '테스트 수정',
            role: detail.role,
            tenancy_code: detail.tenancyCode,
            tenancy_name: detail.tenancyName,
          },
        }),
        testInfo,
        '사용자 정보 수정',
      )
    })

    await test.step('비밀번호 초기화와 정지/해제를 수행한다', async () => {
      await expectApiOk(
        await request.patch(`/api/users/${encodeURIComponent(userId)}/reset-password`),
        testInfo,
        '비밀번호 초기화',
      )
      await expectApiOk(
        await request.patch(`/api/users/${encodeURIComponent(userId)}/suspension`, {
          data: { suspended: true },
        }),
        testInfo,
        '사용자 정지',
      )
      await expectApiOk(
        await request.patch(`/api/users/${encodeURIComponent(userId)}/suspension`, {
          data: { suspended: false },
        }),
        testInfo,
        '사용자 정지 해제',
      )
    })

    await test.step('중복 사번/이메일 생성은 400 또는 409로 차단된다', async () => {
      await expectApiStatusIn(
        await request.post('/api/users/create', { data: createPayload }),
        [400, 409],
        testInfo,
        '사용자 중복 생성 차단',
      )
    })
  })

  test('관리자는 부품과 창고 생성/수정/활성 전환과 중복 검증을 수행한다', async ({ request }, testInfo) => {
    const id = e2eId('ADMIN-MASTER')
    const sku = e2eCode('E2E-I-', 30)
    const warehouseCode = e2eCode('E2EW', 20)
    await attachTestDataId(testInfo, id)

    const categoryCode = await findUsableCategoryCode(request, testInfo)

    await test.step('부품을 생성하고 상세를 수정한다', async () => {
      await expectApiOk(
        await request.post('/api/items', {
          data: buildE2EItemPayload(id, categoryCode, { sku }),
        }),
        testInfo,
        '부품 생성',
      )

      const detail = await readJson<ItemDetail>(
        await request.get(`/api/items/${encodeURIComponent(sku)}`),
        testInfo,
        '생성 부품 상세 조회',
      )

      await expectApiOk(
        await request.patch(`/api/items/${encodeURIComponent(sku)}`, {
          data: {
            categoryCode: detail.categoryCode,
            name: `${detail.name} 수정`,
            safetyStock: detail.safetyStock + 1,
            subCategoryCode: detail.subCategoryCode ?? detail.categoryCode,
            unit: detail.unit,
            unitPrice: detail.unitPrice + 100,
          },
        }),
        testInfo,
        '부품 수정',
      )
    })

    await test.step('부품 활성 상태 전환과 중복 SKU 검증을 수행한다', async () => {
      await expectApiOk(
        await request.patch(`/api/items/${encodeURIComponent(sku)}/deactivate`),
        testInfo,
        '부품 비활성 전환',
      )
      await expectApiOk(
        await request.patch(`/api/items/${encodeURIComponent(sku)}/activate`),
        testInfo,
        '부품 활성 전환',
      )
      await expectApiStatusIn(
        await request.post('/api/items', {
          data: buildE2EItemPayload(`${id}-DUP`, categoryCode, { sku }),
        }),
        [400, 409],
        testInfo,
        '부품 중복 SKU 생성 차단',
      )
    })

    await test.step('지점과 창고를 생성한다', async () => {
      const branchName = `${id} 테스트 지점`
      await expectApiOk(
        await request.post('/api/inventory/branch-locations', { data: { name: branchName } }),
        testInfo,
        '지점 생성',
      )

      const unassigned = await readJson<ApiEnvelope<BranchLocation[]>>(
        await request.get('/api/inventory/branch-locations/unassigned'),
        testInfo,
        '미할당 지점 조회',
      )
      const branch = unassigned.content.find((candidate) => candidate.name === branchName)
      expect(branch?.id, '생성 창고에 연결할 지점 ID').toBeTruthy()

      await expectApiOk(
        await request.post('/api/inventory/warehouses', {
          data: {
            address: 'E2E 테스트 주소',
            branchId: branch!.id,
            code: warehouseCode,
            name: `${id} 테스트 창고`,
            type: 'DEALER',
          },
        }),
        testInfo,
        '창고 생성',
      )
    })

    await test.step('창고 수정과 활성 상태 전환을 수행한다', async () => {
      const detail = await readJson<WarehouseDetail>(
        await request.get(`/api/inventory/warehouses/${encodeURIComponent(warehouseCode)}`),
        testInfo,
        '창고 상세 조회',
      )
      await expectApiOk(
        await request.put(`/api/inventory/warehouses/${encodeURIComponent(warehouseCode)}`, {
          data: {
            address: `${detail.address} 수정`,
            branchId: detail.branchId,
            name: `${detail.name} 수정`,
            type: detail.type,
            version: detail.version,
          },
        }),
        testInfo,
        '창고 수정',
      )

      const updated = await readJson<WarehouseDetail>(
        await request.get(`/api/inventory/warehouses/${encodeURIComponent(warehouseCode)}`),
        testInfo,
        '수정 후 창고 상세 조회',
      )
      await expectApiOk(
        await request.patch(`/api/inventory/warehouses/${encodeURIComponent(warehouseCode)}/active`, {
          data: { active: false, version: updated.version },
        }),
        testInfo,
        '창고 비활성 전환',
      )

      const deactivated = await readJson<WarehouseDetail>(
        await request.get(`/api/inventory/warehouses/${encodeURIComponent(warehouseCode)}`),
        testInfo,
        '비활성 후 창고 상세 조회',
      )
      await expectApiOk(
        await request.patch(`/api/inventory/warehouses/${encodeURIComponent(warehouseCode)}/active`, {
          data: { active: true, version: deactivated.version },
        }),
        testInfo,
        '창고 활성 전환',
      )
    })

    await test.step('중복 창고 코드는 중복 확인과 생성에서 차단된다', async () => {
      const codeCheck = await readJson<{ available: boolean }>(
        await request.get(`/api/inventory/warehouses/code-check?code=${encodeURIComponent(warehouseCode)}`),
        testInfo,
        '창고 코드 중복 확인',
      )
      expect(codeCheck.available).toBe(false)

      await expectApiStatusIn(
        await request.post('/api/inventory/warehouses', {
          data: {
            address: 'E2E 테스트 주소',
            branchId: null,
            code: warehouseCode,
            name: `${id} 중복 창고`,
            type: 'HQ',
          },
        }),
        [400, 409],
        testInfo,
        '창고 중복 코드 생성 차단',
      )
    })
  })

  test('관리자는 테스트 부품/창고 기반 재고 생성, 조정, 안전재고 조정과 validation을 수행한다', async ({ request }, testInfo) => {
    const id = e2eId('ADMIN-STOCK')
    const sku = e2eCode('E2E-I-', 30)
    const warehouseCode = e2eCode('E2EW', 20)
    await attachTestDataId(testInfo, id)

    const categoryCode = await findUsableCategoryCode(request, testInfo)

    await test.step('재고 테스트용 부품과 HQ 창고를 생성한다', async () => {
      await expectApiOk(
        await request.post('/api/items', {
          data: buildE2EItemPayload(id, categoryCode, { sku }),
        }),
        testInfo,
        '재고 테스트 부품 생성',
      )
      await expectApiOk(
        await request.post('/api/inventory/warehouses', {
          data: {
            address: 'E2E 테스트 주소',
            branchId: null,
            code: warehouseCode,
            name: `${id} 테스트 HQ 창고`,
            type: 'HQ',
          },
        }),
        testInfo,
        '재고 테스트 창고 생성',
      )
    })

    await test.step('테스트 재고를 생성하고 상세를 조회한다', async () => {
      await expectApiOk(
        await request.post('/api/inventory/stocks', {
          data: buildE2EStockPayload(sku, warehouseCode),
        }),
        testInfo,
        '재고 생성',
      )

      const stock = await readJson<{ totalQuantity: number; totalSafetyStock: number; warehouse: Array<{ warehouseCode: string }> }>(
        await request.get(`/api/inventory/stocks/${encodeURIComponent(sku)}`),
        testInfo,
        '재고 SKU 상세 조회',
      )
      expect(stock.totalQuantity).toBeGreaterThanOrEqual(0)
      expect(stock.totalSafetyStock).toBeGreaterThanOrEqual(0)
      expect(stock.warehouse.map((warehouse) => warehouse.warehouseCode)).toContain(warehouseCode)
    })

    await test.step('재고 조정과 조정 이력을 확인한다', async () => {
      await expectApiOk(
        await request.post('/api/inventory/stocks/adjustments', {
          data: {
            adjustmentType: 'INCREASE',
            note: `${id} 재고 증가`,
            quantity: 5,
            reason: 'FOUND',
            sku,
            warehouseCode,
          },
        }),
        testInfo,
        '재고 조정',
      )

      await expectApiOk(
        await request.get(`/api/inventory/stocks/movements?keyword=${encodeURIComponent(sku)}&page=1&size=20`),
        testInfo,
        '재고 조정 이력 조회',
      )
    })

    await test.step('안전재고를 조정하고 상세를 확인한다', async () => {
      const edit = await readJson<SafetyStockEdit>(
        await request.get(`/api/inventory/stocks/${encodeURIComponent(warehouseCode)}/${encodeURIComponent(sku)}/safety-stock`),
        testInfo,
        '안전재고 조정 프리필 조회',
      )
      await expectApiOk(
        await request.patch(`/api/inventory/stocks/${encodeURIComponent(warehouseCode)}/${encodeURIComponent(sku)}/safety-stock`, {
          data: { safetyStock: edit.safetyStock + 1, version: edit.version },
        }),
        testInfo,
        '안전재고 조정',
      )
    })

    await test.step('재고 조정 수량 0은 400 또는 422로 차단된다', async () => {
      await expectApiStatusIn(
        await request.post('/api/inventory/stocks/adjustments', {
          data: {
            adjustmentType: 'INCREASE',
            note: `${id} invalid quantity`,
            quantity: 0,
            reason: 'FOUND',
            sku,
            warehouseCode,
          },
        }),
        [400, 422],
        testInfo,
        '재고 조정 수량 0 차단',
      )
    })
  })
})
