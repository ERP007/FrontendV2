import { expect, test } from '@playwright/test'

import {
  authStatePath,
  hasAuthState,
  isMutationEnabled,
  todayIsoDate,
  tomorrowIsoDate,
} from './support/e2e-env'
import { skipMessage } from './support/auth'
import {
  e2eId,
  findFirstActiveItem,
  findFirstHqWarehouse,
  findFirstVendor,
  mutationSkipMessage,
  readJson,
  type PurchaseOrderMutationResponse,
} from './support/userflow'

interface PurchaseOrderDetail {
  status: string
}

interface ItemStockListResponse {
  stocks: Array<{
    code?: string
    warehouseCode?: string
  }>
}

test.describe('Cross-role Flow - 구매 입고', () => {
  test.skip(!isMutationEnabled(), mutationSkipMessage('구매 입고 쓰기'))
  test.skip(!hasAuthState('hq'), skipMessage('hq'))
  test.use({ storageState: authStatePath('hq') })

  test('본사는 구매 주문을 확정하고 입고 처리해 재고 반영까지 확인한다', async ({ page, request }, testInfo) => {
    const id = e2eId('PO')

    const item = await findFirstActiveItem(request, testInfo)
    const warehouse = await findFirstHqWarehouse(request, testInfo)
    const vendor = await findFirstVendor(request, testInfo)

    expect(item?.sku, '구매 주문에 사용할 부품 코드').toBeTruthy()
    expect(warehouse?.code, '구매 주문 납품 창고').toBeTruthy()
    expect(vendor?.code, '구매 주문 공급사').toBeTruthy()

    const created = await test.step('HQ가 API로 E2E 구매 주문을 생성한다', async () =>
      readJson<PurchaseOrderMutationResponse>(
        await request.post('/api/procurement-orders', {
          data: {
            desiredArrivalDate: tomorrowIsoDate(),
            lines: [
              {
                itemSku: item.sku,
                quantity: Number(process.env.E2E_PURCHASE_QUANTITY ?? '1'),
                unitPrice: Number(process.env.E2E_PURCHASE_UNIT_PRICE ?? item.unitPrice ?? '1000'),
              },
            ],
            memo: `${id} purchase order`,
            vendorCode: vendor.code,
            warehouseCode: warehouse.code,
          },
        }),
        testInfo,
        '구매 주문 생성',
      ))

    expect(created.code).toBeTruthy()

    await test.step('HQ가 화면에서 구매 주문 확정 상태를 준비한다', async () => {
      await page.goto(`/purchase-orders/${created.code}`)
      await expect(page.getByRole('heading', { name: created.code })).toBeVisible()

      const detail = await readJson<PurchaseOrderDetail>(
        await request.get(`/api/procurement-orders/${created.code}`),
        testInfo,
        '확정 전 구매 주문 상세 조회',
      )

      if (detail.status === 'DRAFT') {
        await expect(page.getByRole('button', { name: '확정' })).toBeEnabled()
        await page.getByRole('button', { name: '확정' }).click()
        await expect(page.getByText('구매 주문이 확정되었습니다')).toBeVisible({ timeout: 15_000 })
      } else {
        expect(detail.status).toBe('APPROVED')
      }
    })

    const approved = await test.step('API로 확정 상태를 확인한다', async () =>
      readJson<{ status: string }>(
        await request.get(`/api/procurement-orders/${created.code}`),
        testInfo,
        '구매 주문 상세 조회',
      ))

    expect(approved.status).toBe('APPROVED')

    await test.step('HQ가 화면에서 입고 처리한다', async () => {
      await expect(page.getByRole('button', { name: '입고 처리' })).toBeEnabled()
      await page.getByRole('button', { name: '입고 처리' }).click()
      await expect(page.getByRole('dialog', { name: '입고 처리' })).toBeVisible()
      await page.getByLabel('입고 일자').fill(todayIsoDate())
      await page.getByRole('button', { name: '입고 완료' }).click()
      await expect(page.getByText('입고 처리되었습니다')).toBeVisible({ timeout: 15_000 })
    })

    const received = await test.step('API로 입고 완료 상태와 이력을 확인한다', async () =>
      readJson<{ status: string }>(
        await request.get(`/api/procurement-orders/${created.code}`),
        testInfo,
        '입고 후 구매 주문 상세 조회',
      ))

    expect(received.status).toBe('RECEIVED')

    const histories = await readJson<Array<{ status: string }>>(
      await request.get(`/api/procurement-orders/${created.code}/histories`),
      testInfo,
      '구매 주문 이력 조회',
    )
    expect(histories.map((history) => history.status)).toEqual(expect.arrayContaining(['APPROVED', 'RECEIVED']))

    await test.step('입고된 부품의 재고 상세 API가 조회된다', async () => {
      const stock = await readJson<ItemStockListResponse>(
        await request.get(
          `/api/inventory/items/${encodeURIComponent(item.sku)}/stocks?warehouseCode=${encodeURIComponent(warehouse.code)}`,
        ),
        testInfo,
        '입고 후 부품 창고별 재고 조회',
      )
      const warehouseCodes = stock.stocks.map((row) => row.warehouseCode ?? row.code)
      expect(warehouseCodes).toContain(warehouse.code)
    })
  })
})
