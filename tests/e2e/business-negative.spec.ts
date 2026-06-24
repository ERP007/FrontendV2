import { expect, test } from '@playwright/test'
import { allure } from 'allure-playwright'

import {
  authStatePath,
  hasAuthState,
  isMutationEnabled,
  tomorrowIsoDate,
} from './support/e2e-env'
import { skipMessage } from './support/auth'
import {
  buildE2EPurchaseOrderPayload,
  buildE2ESalesOrderPayload,
  createRoleApiContext,
  e2eId,
  findFirstActiveItem,
  findFirstHqWarehouse,
  findFirstVendor,
  mutationSkipMessage,
  readJson,
  type PurchaseOrderMutationResponse,
  type SalesOrderMutationResponse,
} from './support/userflow'

async function selectRejectReason(page: import('@playwright/test').Page, optionName: string) {
  const namedCombobox = page.getByRole('combobox', { name: '거절 사유' })

  if (await namedCombobox.count()) {
    await namedCombobox.first().click()
  } else {
    await page.getByRole('dialog', { name: '발주 요청 거절' }).getByRole('combobox').first().click()
  }

  await page.getByRole('option', { name: optionName }).click()
}

async function fillRejectMemo(page: import('@playwright/test').Page, memo: string) {
  const labeledMemo = page.getByLabel('메모 (선택)')

  if (await labeledMemo.count()) {
    await labeledMemo.first().fill(memo)
  } else {
    await page.getByPlaceholder('요청자에게 전달할 추가 설명').fill(memo)
  }
}

async function createRequestedSalesOrder(
  branchApi: import('@playwright/test').APIRequestContext,
  hqApi: import('@playwright/test').APIRequestContext,
  testInfo: import('@playwright/test').TestInfo,
  memo: string,
) {
  const item = await findFirstActiveItem(branchApi, testInfo)
  const warehouse = await findFirstHqWarehouse(hqApi, testInfo)

  expect(item?.sku, '판매 발주에 사용할 부품 코드').toBeTruthy()
  expect(warehouse?.code, '판매 발주 수신 본사 창고').toBeTruthy()

  return await readJson<SalesOrderMutationResponse>(
    await branchApi.post('/api/sales-orders', {
      data: buildE2ESalesOrderPayload(item!.sku, warehouse!.code, tomorrowIsoDate(), memo),
    }),
    testInfo,
    '판매 발주 요청 생성',
  )
}

async function createPurchaseOrder(
  hqApi: import('@playwright/test').APIRequestContext,
  testInfo: import('@playwright/test').TestInfo,
  memo: string,
) {
  const item = await findFirstActiveItem(hqApi, testInfo)
  const warehouse = await findFirstHqWarehouse(hqApi, testInfo)
  const vendor = await findFirstVendor(hqApi, testInfo)

  expect(item?.sku, '구매 주문에 사용할 부품 코드').toBeTruthy()
  expect(warehouse?.code, '구매 주문 납품 창고').toBeTruthy()
  expect(vendor?.code, '구매 주문 공급사').toBeTruthy()

  return await readJson<PurchaseOrderMutationResponse>(
    await hqApi.post('/api/procurement-orders', {
      data: buildE2EPurchaseOrderPayload(
        item!.sku,
        warehouse!.code,
        vendor!.code,
        tomorrowIsoDate(),
        memo,
        Number(process.env.E2E_PURCHASE_UNIT_PRICE ?? item!.unitPrice ?? '1000'),
      ),
    }),
    testInfo,
    '구매 주문 생성',
  )
}

test.beforeEach(async () => {
  await allure.suite('업무 Negative')
})

test.describe('업무 Negative - 판매 발주', () => {
  test.skip(!isMutationEnabled(), mutationSkipMessage('판매 발주 Negative'))
  test.skip(!hasAuthState('branch'), skipMessage('branch'))
  test.skip(!hasAuthState('hq'), skipMessage('hq'))

  test('Branch는 요청 생성 후 취소 사유 validation과 취소 상태를 확인한다', async ({ baseURL, browser, playwright }, testInfo) => {
    const branchApi = await createRoleApiContext(playwright, baseURL, 'branch')
    const hqApi = await createRoleApiContext(playwright, baseURL, 'hq')
    const branchContext = await browser.newContext({ baseURL, storageState: authStatePath('branch') })
    const page = await branchContext.newPage()
    const id = e2eId('SO-CANCEL')

    try {
      const created = await createRequestedSalesOrder(branchApi, hqApi, testInfo, `${id} cancel`)

      await test.step('취소 사유 없이 요청 취소 시 validation을 표시한다', async () => {
        await page.goto(`/branch/sales-orders/${created.code}`)
        await expect(page.getByRole('heading', { name: created.code })).toBeVisible()
        await page.getByRole('button', { name: '취소하기' }).click()
        await expect(page.getByRole('dialog', { name: '발주 요청 취소' })).toBeVisible()
        await page.getByRole('button', { name: '요청 취소' }).click()
        await expect(page.getByText('취소 사유를 입력하세요.')).toBeVisible()
      })

      await test.step('취소 사유 입력 후 상태와 이력을 확인한다', async () => {
        await page.getByLabel('취소 사유').fill(`${id} 취소 사유`)
        await page.getByRole('button', { name: '요청 취소' }).click()
        await expect(page.getByText('발주 요청이 취소되었습니다')).toBeVisible({ timeout: 15_000 })

        const canceled = await readJson<{ status: string }>(
          await branchApi.get(`/api/sales-orders/branch/${created.code}`),
          testInfo,
          '취소 후 지점 발주 상세 조회',
        )
        expect(canceled.status).toBe('CANCELED')

        const histories = await readJson<Array<{ status: string }>>(
          await branchApi.get(`/api/sales-orders/${created.code}/histories`),
          testInfo,
          '취소 후 판매 발주 이력 조회',
        )
        expect(histories.map((history) => history.status)).toEqual(
          expect.arrayContaining(['REQUESTED', 'CANCELED']),
        )
      })
    } finally {
      await branchContext.close()
      await branchApi.dispose()
      await hqApi.dispose()
    }
  })

  test('HQ는 요청 거절 사유 validation과 거절 상태를 확인한다', async ({ baseURL, browser, playwright }, testInfo) => {
    const branchApi = await createRoleApiContext(playwright, baseURL, 'branch')
    const hqApi = await createRoleApiContext(playwright, baseURL, 'hq')
    const hqContext = await browser.newContext({ baseURL, storageState: authStatePath('hq') })
    const page = await hqContext.newPage()
    const id = e2eId('SO-REJECT')

    try {
      const created = await createRequestedSalesOrder(branchApi, hqApi, testInfo, `${id} reject`)

      await test.step('거절 사유 없이 요청 거절 시 validation을 표시한다', async () => {
        await page.goto(`/sales-orders/${created.code}`)
        await expect(page.getByRole('heading', { name: created.code })).toBeVisible()
        await page.getByRole('button', { name: '거절' }).click()
        await expect(page.getByRole('dialog', { name: '발주 요청 거절' })).toBeVisible()
        await page.getByRole('button', { name: '요청 거절' }).click()
        await expect(page.getByText('거절 사유를 선택하세요.')).toBeVisible()
      })

      await test.step('거절 사유 선택 후 상태를 확인한다', async () => {
        await selectRejectReason(page, '기타')
        await fillRejectMemo(page, `${id} 거절 사유`)
        await page.getByRole('button', { name: '요청 거절' }).click()
        await expect(page.getByText('발주 요청이 거절되었습니다')).toBeVisible({ timeout: 15_000 })

        const rejected = await readJson<{ status: string }>(
          await hqApi.get(`/api/sales-orders/hq/${created.code}`),
          testInfo,
          '거절 후 본사 발주 상세 조회',
        )
        expect(rejected.status).toBe('REJECTED')
      })
    } finally {
      await hqContext.close()
      await branchApi.dispose()
      await hqApi.dispose()
    }
  })

  test('HQ 출고 화면은 운송 수단 누락을 validation으로 막는다', async ({ baseURL, browser, playwright }, testInfo) => {
    const branchApi = await createRoleApiContext(playwright, baseURL, 'branch')
    const hqApi = await createRoleApiContext(playwright, baseURL, 'hq')
    const hqContext = await browser.newContext({ baseURL, storageState: authStatePath('hq') })
    const page = await hqContext.newPage()
    const id = e2eId('SO-SHIP-VALIDATION')

    try {
      const created = await createRequestedSalesOrder(branchApi, hqApi, testInfo, `${id} ship validation`)

      await page.goto(`/sales-orders/${created.code}/ship`)
      await expect(page.getByRole('button', { name: '출고 확정' })).toBeVisible()
      await page.getByRole('button', { name: '출고 확정' }).click()
      await expect(page.getByText('운송 수단을 선택하세요.')).toBeVisible()
    } finally {
      await hqContext.close()
      await branchApi.dispose()
      await hqApi.dispose()
    }
  })
})

test.describe('업무 Negative - 구매 주문', () => {
  test.skip(!isMutationEnabled(), mutationSkipMessage('구매 주문 Negative'))
  test.skip(!hasAuthState('hq'), skipMessage('hq'))
  test.use({ storageState: authStatePath('hq') })

  test('HQ는 구매 주문 취소 사유 validation과 취소 상태를 확인한다', async ({ page, request }, testInfo) => {
    const id = e2eId('PO-CANCEL')
    const created = await createPurchaseOrder(request, testInfo, `${id} cancel`)

    await test.step('취소 사유 없이 주문 취소 시 validation을 표시한다', async () => {
      await page.goto(`/purchase-orders/${created.code}`)
      await expect(page.getByRole('heading', { name: created.code })).toBeVisible()
      await page.getByRole('button', { name: '취소' }).click()
      await expect(page.getByRole('dialog', { name: '구매 주문 취소' })).toBeVisible()
      await page.getByRole('button', { name: '주문 취소' }).click()
      await expect(page.getByText('취소 사유를 입력하세요.')).toBeVisible()
    })

    await test.step('취소 사유 입력 후 상태와 이력을 확인한다', async () => {
      await page.getByLabel('취소 사유').fill(`${id} 취소 사유`)
      await page.getByRole('button', { name: '주문 취소' }).click()
      await expect(page.getByText('구매 주문이 취소되었습니다')).toBeVisible({ timeout: 15_000 })

      const canceled = await readJson<{ status: string }>(
        await request.get(`/api/procurement-orders/${created.code}`),
        testInfo,
        '취소 후 구매 주문 상세 조회',
      )
      expect(canceled.status).toBe('CANCELED')

      const histories = await readJson<Array<{ status: string }>>(
        await request.get(`/api/procurement-orders/${created.code}/histories`),
        testInfo,
        '취소 후 구매 주문 이력 조회',
      )
      expect(histories.map((history) => history.status)).toContain('CANCELED')
    })
  })
})
