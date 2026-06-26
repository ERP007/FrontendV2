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
  mutationSkipMessage,
  readJson,
  todayInvoice,
  type SalesOrderMutationResponse,
} from './support/userflow'

async function selectOption(page: import('@playwright/test').Page, label: string, optionName: string | RegExp) {
  const labeledCombobox = page.getByRole('combobox', { name: label })

  if (await labeledCombobox.count()) {
    await labeledCombobox.first().click()
  } else {
    await page.getByRole('combobox').first().click()
  }

  await page.getByRole('option', { name: optionName }).click()
}

test.describe('Cross-role Flow - 판매 발주', () => {
  test.skip(!isMutationEnabled(), mutationSkipMessage('판매 발주 쓰기'))
  test.skip(!hasAuthState('branch'), skipMessage('branch'))
  test.skip(!hasAuthState('hq'), skipMessage('hq'))

  test('지점 요청부터 본사 출고와 지점 입고까지 완료한다', async ({ browser, playwright, baseURL }, testInfo) => {
    const branchApi = await playwright.request.newContext({
      baseURL,
      storageState: authStatePath('branch'),
    })
    const hqApi = await playwright.request.newContext({
      baseURL,
      storageState: authStatePath('hq'),
    })
    const hqContext = await browser.newContext({
      baseURL,
      storageState: authStatePath('hq'),
    })
    const branchContext = await browser.newContext({
      baseURL,
      storageState: authStatePath('branch'),
    })

    const hqPage = await hqContext.newPage()
    const branchPage = await branchContext.newPage()
    const id = e2eId('SO')

    try {
      const item = await findFirstActiveItem(branchApi, testInfo)
      const warehouse = await findFirstHqWarehouse(hqApi, testInfo)

      expect(item?.sku, '판매 발주에 사용할 부품 코드').toBeTruthy()
      expect(warehouse?.code, '판매 발주 수신 본사 창고').toBeTruthy()

      const created = await test.step('BRANCH가 API로 E2E 발주 요청을 생성한다', async () =>
        readJson<SalesOrderMutationResponse>(
          await branchApi.post('/api/sales-orders', {
            data: {
              desiredArrivalDate: tomorrowIsoDate(),
              lines: [
                {
                  itemCode: item.sku,
                  priority: 'NORMAL',
                  quantity: Number(process.env.E2E_SALES_QUANTITY ?? '1'),
                },
              ],
              memo: `${id} branch request`,
              warehouseCode: warehouse.code,
            },
          }),
          testInfo,
          '지점 발주 요청 생성',
        ))

      expect(created.status).toBe('REQUESTED')

      await test.step('HQ가 화면에서 발주 요청 상세를 열고 출고 화면으로 이동한다', async () => {
        await hqPage.goto(`/sales-orders/${created.code}`)
        await expect(hqPage.getByRole('heading', { name: created.code })).toBeVisible()
        await expect(hqPage.getByRole('button', { name: '출고' })).toBeEnabled()
        await hqPage.getByRole('button', { name: '출고' }).click()
        await expect(hqPage.getByRole('heading', { name: created.code })).toBeVisible()
        await expect(hqPage.getByRole('button', { name: '출고 확정' })).toBeVisible()
      })

      await test.step('HQ가 화면에서 운송 정보를 입력하고 출고 확정한다', async () => {
        await selectOption(hqPage, '운송 수단', '택배')
        await hqPage.getByLabel('출고 일자').fill(todayIsoDate())
        await hqPage.getByLabel('송장번호').fill(todayInvoice(id))
        await hqPage.getByRole('button', { name: '출고 확정' }).click()
        await expect(hqPage.getByText('출고되었습니다')).toBeVisible({ timeout: 15_000 })
      })

      const approved = await test.step('HQ API로 출고 상태를 확인한다', async () =>
        readJson<{ status: string }>(
          await hqApi.get(`/api/sales-orders/hq/${created.code}`),
          testInfo,
          '본사 발주 상세 조회',
        ))

      expect(approved.status).toBe('APPROVED')

      await test.step('BRANCH가 화면에서 도착 입고를 확정한다', async () => {
        await branchPage.goto(`/branch/sales-orders/${created.code}`)
        await expect(branchPage.getByRole('heading', { name: created.code })).toBeVisible()
        await expect(branchPage.getByRole('button', { name: '입고하기' })).toBeEnabled()
        await branchPage.getByRole('button', { name: '입고하기' }).click()
        await expect(branchPage.getByText('도착 입고 확인', { exact: true })).toBeVisible()
        await branchPage.getByLabel('도착 일자').fill(todayIsoDate())
        await branchPage.getByRole('button', { name: '도착 확정' }).click()
        await expect(branchPage).toHaveURL(/\/branch\/sales-orders$/)
      })

      const delivered = await test.step('BRANCH API로 입고 완료 상태와 이력을 확인한다', async () =>
        readJson<{ status: string }>(
          await branchApi.get(`/api/sales-orders/branch/${created.code}`),
          testInfo,
          '지점 발주 상세 조회',
        ))

      expect(delivered.status).toBe('DELIVERED')

      const histories = await readJson<Array<{ status: string }>>(
        await branchApi.get(`/api/sales-orders/${created.code}/histories`),
        testInfo,
        '판매 발주 이력 조회',
      )
      expect(histories.map((history) => history.status)).toEqual(
        expect.arrayContaining(['REQUESTED', 'APPROVED', 'DELIVERED']),
      )
    } finally {
      await branchApi.dispose()
      await hqApi.dispose()
      await hqContext.close()
      await branchContext.close()
    }
  })
})
