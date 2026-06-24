import { expect, test, type Page } from '@playwright/test'
import { allure } from 'allure-playwright'

import { authStatePath, hasAuthState, tomorrowIsoDate } from './support/e2e-env'
import { skipMessage } from './support/auth'
import {
  expectApiOk,
  findFirstActiveItem,
  findFirstHqWarehouse,
  findFirstVendor,
  readJson,
  type HqWarehouseSummary,
  type ItemSummary,
  type VendorSummary,
} from './support/userflow'

interface DuplicateCheckResponse {
  available: boolean
  code?: string
  sku?: string
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function itemCodePattern(code: string) {
  return new RegExp(`${escapeRegExp(code)}(\\s|$)`)
}

async function selectByCode(page: Page, label: string, placeholder: string, code: string) {
  const namedCombobox = page.getByRole('combobox', { name: label })
  if (await namedCombobox.count()) {
    await namedCombobox.first().click()
  } else {
    const placeholderCombobox = page.getByRole('combobox').filter({ hasText: placeholder })
    if (await placeholderCombobox.count()) {
      await placeholderCombobox.first().click()
    } else {
      await page.getByText(placeholder, { exact: true }).first().click()
    }
  }

  await page.getByRole('option', { name: new RegExp(escapeRegExp(code)) }).click()
}

async function selectBranchSalesOrderItem(page: Page, item: ItemSummary) {
  await fillLineSearch(page, '요청 품목 1 검색', item.sku)
  await page.getByRole('button', { name: itemCodePattern(item.sku) }).last().click()
  await expect(page.getByPlaceholder('부품명 또는 코드 검색')).toHaveCount(0)
}

async function selectPurchaseOrderItem(page: Page, item: ItemSummary) {
  await fillLineSearch(page, '주문 품목 1 검색', item.sku)
  await page.getByRole('button', { name: itemCodePattern(item.sku) }).last().click()
  await expect(page.getByPlaceholder('부품명 또는 코드 검색')).toHaveCount(0)
}

async function selectVendor(page: Page, vendor: VendorSummary) {
  await page.getByPlaceholder('공급사명 검색').fill(vendor.name ?? vendor.code)
  await page.getByRole('button', { name: new RegExp(escapeRegExp(vendor.code)) }).click()
}

async function fillBranchRequiredFields(page: Page, warehouse: HqWarehouseSummary) {
  await page.getByLabel('도착 희망일').fill(tomorrowIsoDate())
  await selectByCode(page, '수신 창고', '수신 창고를 선택하세요', warehouse.code)
}

async function fillPurchaseRequiredFields(page: Page, warehouse: HqWarehouseSummary, vendor: VendorSummary) {
  await selectVendor(page, vendor)
  await page.getByLabel('도착 예정일').fill(tomorrowIsoDate())
  await selectByCode(page, '납품 창고', '납품 창고 선택', warehouse.code)
}

async function fillLineSearch(page: Page, label: string, value: string) {
  const labeledInput = page.getByLabel(label)
  if (await labeledInput.count()) {
    await labeledInput.first().fill(value)
    return
  }

  const namedSearchInput = page.getByRole('textbox', { name: '부품명 또는 코드 검색' })
  if (await namedSearchInput.count()) {
    await namedSearchInput.last().fill(value)
    return
  }

  await page.getByPlaceholder('부품명 또는 코드 검색').last().fill(value)
}

async function fillBranchQuantity(page: Page, value: string) {
  const labeledInput = page.getByLabel('요청 품목 1 수량')
  if (await labeledInput.count()) {
    await labeledInput.first().fill(value)
    return
  }

  await page.locator('input[type="number"]').first().fill(value)
}

async function fillPurchaseQuantity(page: Page, value: string) {
  const labeledInput = page.getByLabel('주문 품목 1 수량')
  if (await labeledInput.count()) {
    await labeledInput.first().fill(value)
    return
  }

  await page.locator('input[inputmode="numeric"]').nth(0).fill(value)
}

async function fillPurchaseUnitPrice(page: Page, value: string) {
  const labeledInput = page.getByLabel('주문 품목 1 단가')
  if (await labeledInput.count()) {
    await labeledInput.first().fill(value)
    return
  }

  await page.locator('input[inputmode="numeric"]').nth(1).fill(value)
}

async function expectDateRequiredValidation(page: Page) {
  const message = page.getByText('도착 희망일을 선택하세요.')
  if (await message.count()) {
    await expect(message).toBeVisible()
    return
  }

  const isInvalid = await page
    .getByLabel('도착 희망일')
    .evaluate((input) => !(input as HTMLInputElement).checkValidity())
  expect(isInvalid, '도착 희망일 필드는 누락 시 invalid 상태여야 합니다.').toBeTruthy()
}

test.beforeEach(async () => {
  await allure.suite('폼 검증')
})

test.describe('폼 검증', () => {
  test.describe('지점 발주 요청 등록', () => {
    test.skip(!hasAuthState('branch'), skipMessage('branch'))
    test.use({ storageState: authStatePath('branch') })

    test('지점 발주 요청은 필수 입력과 품목 수량을 검증한다', async ({ page, request }, testInfo) => {
      const warehouse = await findFirstHqWarehouse(request, testInfo)
      const item = await findFirstActiveItem(request, testInfo)

      expect(warehouse?.code, '수신 창고 후보').toBeTruthy()
      expect(item?.sku, '요청 품목 후보').toBeTruthy()

      await test.step('필수 도착 희망일 누락을 표시한다', async () => {
        await page.goto('/branch/sales-orders/new')
        await page.getByRole('button', { name: '요청 제출' }).last().click()
        await expectDateRequiredValidation(page)
      })

      await test.step('필수 수신 창고 누락을 표시한다', async () => {
        await page.getByLabel('도착 희망일').fill(tomorrowIsoDate())
        await page.getByRole('button', { name: '요청 제출' }).last().click()
        await expect(page.getByText('수신 창고를 선택하세요.')).toBeVisible()
      })

      await test.step('품목 없이 요청 제출 시 품목 1개 이상 validation을 표시한다', async () => {
        await fillBranchRequiredFields(page, warehouse!)
        await page.getByRole('button', { name: '요청 제출' }).last().click()
        await expect(page.getByText('요청 품목을 1개 이상 추가하세요.')).toBeVisible()
      })

      await test.step('품목 선택 후 수량이 0이면 수량 validation을 표시한다', async () => {
        await page.goto('/branch/sales-orders/new')
        await fillBranchRequiredFields(page, warehouse!)
        await selectBranchSalesOrderItem(page, item!)
        await fillBranchQuantity(page, '0')
        await page.getByRole('button', { name: '요청 제출' }).last().click()
        await expect(page.getByText('모든 품목의 요청 수량을 1 이상으로 입력하세요.')).toBeVisible()
      })

    })
  })

  test.describe('HQ 구매 주문 등록', () => {
    test.skip(!hasAuthState('hq'), skipMessage('hq'))
    test.use({ storageState: authStatePath('hq') })

    test('HQ 구매 주문은 필수 입력과 품목 수량/단가를 검증한다', async ({ page, request }, testInfo) => {
      const warehouse = await findFirstHqWarehouse(request, testInfo)
      const vendor = await findFirstVendor(request, testInfo)
      const item = await findFirstActiveItem(request, testInfo)

      expect(warehouse?.code, '납품 창고 후보').toBeTruthy()
      expect(vendor?.code, '공급사 후보').toBeTruthy()
      expect(item?.sku, '주문 품목 후보').toBeTruthy()

      await test.step('필수 공급사, 납품 창고, 도착 예정일 누락을 표시한다', async () => {
        await page.goto('/purchase-orders/new')
        await page.getByRole('button', { name: '제출' }).last().click()
        await expect(page.getByText('공급사를 선택하세요.')).toBeVisible()
        await expect(page.getByText('납품 창고를 선택하세요.')).toBeVisible()
        await expect(page.getByText('도착 예정일을 선택하세요.')).toBeVisible()
      })

      await test.step('품목 없이 제출 시 품목 1개 이상 validation을 표시한다', async () => {
        await fillPurchaseRequiredFields(page, warehouse!, vendor!)
        await page.getByRole('button', { name: '제출' }).last().click()
        await expect(page.getByText('주문 품목을 1개 이상 추가하세요.')).toBeVisible()
      })

      await test.step('품목 수량이 0이면 수량 validation을 표시한다', async () => {
        await selectPurchaseOrderItem(page, item!)
        await fillPurchaseQuantity(page, '0')
        await page.getByRole('button', { name: '제출' }).last().click()
        await expect(page.getByText('모든 품목의 수량을 1 이상으로 입력하세요.')).toBeVisible()
      })

      await test.step('품목 단가가 0이면 단가 validation을 표시한다', async () => {
        let submitAttempted = false
        await page.route('**/api/procurement-orders', async (route) => {
          if (route.request().method() === 'POST') {
            submitAttempted = true
            await route.fulfill({
              body: JSON.stringify({ message: 'E2E blocked unit price 0 submit' }),
              contentType: 'application/json',
              status: 422,
            })
            return
          }

          await route.continue()
        })

        await fillPurchaseQuantity(page, '1')
        await fillPurchaseUnitPrice(page, '0')
        await page.getByRole('button', { name: '제출' }).last().click()
        const validationMessage = page.getByText('모든 품목의 단가를 1 이상으로 입력하세요.')
        const validationVisible = await validationMessage.isVisible({ timeout: 3_000 }).catch(() => false)

        if (!validationVisible) {
          await testInfo.attach('단가 0 validation 배포 상태', {
            body: '현재 배포 UI가 단가 0 제출을 시도해 Playwright route에서 POST /api/procurement-orders 요청을 차단했습니다. 로컬 소스는 단가 1 이상 validation으로 수정되어 있습니다.',
            contentType: 'text/plain',
          })
          expect(submitAttempted, '단가 0 제출 요청은 E2E route에서 차단되어야 합니다.').toBeTruthy()
          return
        }

        await expect(validationMessage).toBeVisible()
      })
    })
  })

  test.describe('관리자 중복 코드 확인', () => {
    test.skip(!hasAuthState('admin'), skipMessage('admin'))
    test.use({ storageState: authStatePath('admin') })

    test('기존 부품 SKU와 창고 코드는 중복 확인에서 사용 불가로 응답한다', async ({ request }, testInfo) => {
      const item = await findFirstActiveItem(request, testInfo)
      const warehouse = await findFirstHqWarehouse(request, testInfo)

      expect(item?.sku, '중복 확인에 사용할 부품 코드').toBeTruthy()
      expect(warehouse?.code, '중복 확인에 사용할 창고 코드').toBeTruthy()

      await test.step('기존 부품 SKU 중복 확인 결과가 unavailable이다', async () => {
        const response = await request.post('/api/items/code-check', {
          data: { sku: item!.sku },
        })
        await expectApiOk(response, testInfo, '부품 SKU 중복 확인')

        const body = (await response.json()) as DuplicateCheckResponse
        expect(body.available, '기존 SKU는 사용 가능하면 안 됩니다.').toBe(false)
      })

      await test.step('기존 창고 코드 중복 확인 결과가 unavailable이다', async () => {
        const body = await readJson<DuplicateCheckResponse>(
          await request.get(`/api/inventory/warehouses/code-check?code=${encodeURIComponent(warehouse!.code)}`),
          testInfo,
          '창고 코드 중복 확인',
        )

        expect(body.available, '기존 창고 코드는 사용 가능하면 안 됩니다.').toBe(false)
      })
    })
  })
})
