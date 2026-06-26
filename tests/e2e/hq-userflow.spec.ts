import { expect, test } from '@playwright/test'

import { authStatePath, hasAuthState } from './support/e2e-env'
import { skipMessage } from './support/auth'
import {
  expectApiOk,
  expectNoButton,
  expectPageTitle,
  findFirstHqWarehouse,
  getSessionRole,
  openFirstTableRowIfAny,
} from './support/userflow'

test.describe('HQ Userflow', () => {
  test.skip(!hasAuthState('hq'), skipMessage('hq'))
  test.use({ storageState: authStatePath('hq') })

  test('본사 사용자는 대시보드 KPI와 주요 바로가기를 사용할 수 있다', async ({ page }) => {
    await test.step('본사 대시보드에 진입한다', async () => {
      await page.goto('/dashboard')
      await expectPageTitle(page, '본사 대시보드')
      await expect(page.getByText('최근 7일 활동')).toBeVisible()
      await expect(page.getByText('할 일')).toBeVisible()
    })

    await test.step('대시보드 바로가기로 재고 화면에 이동한다', async () => {
      await page.getByRole('button', { name: /재고 전체 보기/ }).click()
      await expectPageTitle(page, '재고 조회')
    })
  })

  test('본사 사용자는 구매 주문 목록과 상세 흐름을 조회한다', async ({ page }, testInfo) => {
    await test.step('구매 주문 목록을 조회한다', async () => {
      await page.goto('/purchase-orders')
      await expectPageTitle(page, '구매 주문')
      await expect(page.getByRole('button', { name: '구매 주문 등록' })).toBeVisible()
      await expect(page.getByPlaceholder('PO 번호 또는 공급사명')).toBeVisible()
    })

    await test.step('구매 주문 상세를 열 수 있으면 이력을 확인한다', async () => {
      const opened = await openFirstTableRowIfAny(page, testInfo, '구매 주문 데이터가 없어 상세 조회를 생략합니다.')

      if (opened) {
        await expect(page.getByText('주문 정보')).toBeVisible()
        await expect(page.getByText('변경 이력')).toBeVisible()
      }
    })
  })

  test('본사 사용자는 발주 요청 목록과 상세 검토 화면을 조회한다', async ({ page }, testInfo) => {
    await test.step('본사 발주 요청 목록을 조회한다', async () => {
      await page.goto('/sales-orders')
      await expectPageTitle(page, '발주 요청')
      await expect(page.getByPlaceholder(/요청번호/)).toBeVisible()
    })

    await test.step('발주 요청 상세를 열 수 있으면 검토 액션을 확인한다', async () => {
      const opened = await openFirstTableRowIfAny(page, testInfo, '발주 요청 데이터가 없어 상세 조회를 생략합니다.')

      if (opened) {
        await expect(page.getByText('요청 정보')).toBeVisible()
        await expect(page.getByText('변경 이력')).toBeVisible()
        await expect(page.getByRole('button', { name: '거절' })).toBeVisible()
        await expect(page.getByRole('button', { name: '출고' })).toBeVisible()
      }
    })
  })

  test('본사 사용자는 재고와 창고 범위 권한을 역할에 맞게 확인한다', async ({ page, request }, testInfo) => {
    const role = await getSessionRole(request, testInfo)

    await test.step('재고 조회와 재고 이력 화면을 조회한다', async () => {
      await page.goto('/stocks')
      await expectPageTitle(page, '재고 조회')
      await expect(page.getByPlaceholder('부품명 또는 코드')).toBeVisible()

      await page.goto('/stock-movements')
      await expectPageTitle(page, '재고 이력')
      await expect(page.getByPlaceholder('부품명 또는 코드')).toBeVisible()
    })

    await test.step('HQ_MANAGER와 HQ_STAFF의 관리 액션 노출을 구분한다', async () => {
      await page.goto('/stocks')

      if (role === 'HQ_MANAGER') {
        await expect(page.getByRole('button', { name: /^재고 조정$/ })).toBeVisible()
        await expect(page.getByRole('button', { name: '안전 재고 조정' })).toBeVisible()
      } else {
        await expectNoButton(page, /^재고 조정$/)
        await expectNoButton(page, '안전 재고 조정')
      }

      await expectNoButton(page, '재고 추가')
    })

    await test.step('창고 조회 API는 본사 범위에서 통과한다', async () => {
      await expect(findFirstHqWarehouse(request, testInfo)).resolves.toBeTruthy()
    })
  })

  test('본사 사용자는 Gateway API로 구매, 발주, 재고를 조회할 수 있다', async ({ request }, testInfo) => {
    await expectApiOk(await request.get('/api/procurement-orders?page=1&size=10'), testInfo, '구매 주문 목록 조회')
    await expectApiOk(await request.get('/api/sales-orders/hq?page=1&size=10'), testInfo, '본사 발주 목록 조회')
    await expectApiOk(await request.get('/api/inventory/stocks?page=1&size=20&sort=safetyRatio,asc'), testInfo, '재고 목록 조회')
  })
})
