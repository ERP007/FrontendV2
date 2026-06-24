import { expect, test, type Page } from '@playwright/test'
import { allure } from 'allure-playwright'

import {
  authStatePath,
  hasAuthState,
  isMutationEnabled,
  tomorrowIsoDate,
} from './support/e2e-env'
import { skipMessage } from './support/auth'
import {
  e2eId,
  expectPageTitle,
  expectPath,
  findFirstActiveItem,
  findFirstHqWarehouse,
  findFirstVendor,
  mutationSkipMessage,
  readJson,
  type PurchaseOrderMutationResponse,
  type SalesOrderMutationResponse,
} from './support/userflow'

test.beforeEach(async () => {
  await allure.suite('Draft Lifecycle')
})

async function fillQuantityInput(page: Page, label: string, value: string) {
  const labeledInput = page.getByLabel(label)

  if (await labeledInput.count()) {
    await expect(labeledInput.first()).toBeVisible()
    await labeledInput.first().fill(value)
    return
  }

  const numberInput = page.locator('input[inputmode="numeric"], input[type="number"]').first()
  await expect(numberInput).toBeVisible()
  await numberInput.fill(value)
}

test.describe('Draft Lifecycle - 지점 발주', () => {
  test.skip(!isMutationEnabled(), mutationSkipMessage('Draft Lifecycle'))
  test.skip(!hasAuthState('branch'), skipMessage('branch'))
  test.use({ storageState: authStatePath('branch') })

  test('BRANCH는 임시저장 발주를 수정하고 요청 제출한다', async ({ page, request }, testInfo) => {
    const id = e2eId('SO-DRAFT')
    const item = await findFirstActiveItem(request, testInfo)
    const warehouse = await findFirstHqWarehouse(request, testInfo)

    expect(item?.sku, 'Draft 발주에 사용할 부품 코드').toBeTruthy()
    expect(warehouse?.code, 'Draft 발주 수신 본사 창고').toBeTruthy()

    const draft = await test.step('API로 지점 발주 임시저장을 생성한다', async () =>
      readJson<SalesOrderMutationResponse>(
        await request.post('/api/sales-orders/drafts', {
          data: {
            desiredArrivalDate: tomorrowIsoDate(),
            lines: [
              {
                itemCode: item!.sku,
                priority: 'NORMAL',
                quantity: 1,
              },
            ],
            memo: `${id} draft`,
            warehouseCode: warehouse!.code,
          },
        }),
        testInfo,
        '지점 발주 임시저장 생성',
      ))

    expect(draft.code, '생성된 지점 발주 Draft 코드').toBeTruthy()
    expect(draft.status).toBe('DRAFT')

    await test.step('상세 화면에서 수정 화면으로 진입한다', async () => {
      await page.goto(`/branch/sales-orders/${draft.code}`)
      await expect(page.getByRole('heading', { name: draft.code })).toBeVisible()
      await page.getByRole('button', { name: '수정하기' }).click()
      await expectPath(page, `/branch/sales-orders/${draft.code}/edit`)
      await expectPageTitle(page, '발주 요청 수정')
    })

    await test.step('수량과 메모를 수정하고 제출한다', async () => {
      await fillQuantityInput(page, '요청 품목 1 수량', '2')
      await page.getByLabel('메모').fill(`${id} edited`)
      await page.getByRole('button', { name: '제출' }).last().click()
      await expect(page.getByText('발주 요청이 제출되었습니다')).toBeVisible({ timeout: 15_000 })
      await expectPath(page, `/branch/sales-orders/${draft.code}`)
    })

    const submitted = await test.step('API로 REQUESTED 상태를 확인한다', async () =>
      readJson<{ status: string }>(
        await request.get(`/api/sales-orders/branch/${draft.code}`),
        testInfo,
        '지점 발주 Draft 제출 후 상세 조회',
      ))

    expect(submitted.status).toBe('REQUESTED')
  })
})

test.describe('Draft Lifecycle - HQ 구매', () => {
  test.skip(!isMutationEnabled(), mutationSkipMessage('Draft Lifecycle'))
  test.skip(!hasAuthState('hq'), skipMessage('hq'))
  test.use({ storageState: authStatePath('hq') })

  test('HQ는 임시저장 구매 주문을 수정하고 확정한다', async ({ page, request }, testInfo) => {
    const id = e2eId('PO-DRAFT')
    const item = await findFirstActiveItem(request, testInfo)
    const warehouse = await findFirstHqWarehouse(request, testInfo)
    const vendor = await findFirstVendor(request, testInfo)
    const unitPrice = Math.max(1, Number(process.env.E2E_PURCHASE_UNIT_PRICE ?? item?.unitPrice ?? 1000))

    expect(item?.sku, 'Draft 구매에 사용할 부품 코드').toBeTruthy()
    expect(warehouse?.code, 'Draft 구매 납품 창고').toBeTruthy()
    expect(vendor?.code, 'Draft 구매 공급사').toBeTruthy()

    const draft = await test.step('API로 구매 주문 임시저장을 생성한다', async () =>
      readJson<PurchaseOrderMutationResponse>(
        await request.post('/api/procurement-orders/drafts', {
          data: {
            desiredArrivalDate: tomorrowIsoDate(),
            lines: [
              {
                itemSku: item!.sku,
                quantity: 1,
                unitPrice,
              },
            ],
            memo: `${id} draft`,
            vendorCode: vendor!.code,
            warehouseCode: warehouse!.code,
          },
        }),
        testInfo,
        '구매 주문 임시저장 생성',
      ))

    expect(draft.code, '생성된 구매 주문 Draft 코드').toBeTruthy()
    expect(draft.status).toBe('DRAFT')

    await test.step('상세 화면에서 수정 화면으로 진입한다', async () => {
      await page.goto(`/purchase-orders/${draft.code}`)
      await expect(page.getByRole('heading', { name: draft.code })).toBeVisible()
      await page.getByRole('button', { name: '수정' }).click()
      await expectPath(page, `/purchase-orders/${draft.code}/edit`)
      await expectPageTitle(page, '구매 주문 수정')
    })

    await test.step('수량과 메모를 수정하고 저장한다', async () => {
      await fillQuantityInput(page, '주문 품목 1 수량', '2')
      await page.getByLabel('메모').fill(`${id} edited`)
      await page.getByRole('button', { name: '저장' }).last().click()
      await expect(page.getByText('구매 주문이 수정되었습니다')).toBeVisible({ timeout: 15_000 })
      await expectPath(page, `/purchase-orders/${draft.code}`)
    })

    await test.step('상세 화면에서 구매 주문을 확정한다', async () => {
      await page.getByRole('button', { name: '확정' }).click()
      await expect(page.getByText('구매 주문이 확정되었습니다')).toBeVisible({ timeout: 15_000 })
    })

    const approved = await test.step('API로 APPROVED 상태를 확인한다', async () =>
      readJson<{ status: string }>(
        await request.get(`/api/procurement-orders/${draft.code}`),
        testInfo,
        '구매 주문 Draft 확정 후 상세 조회',
      ))

    expect(approved.status).toBe('APPROVED')
  })
})
