import { expect, test } from '@playwright/test'

import { authStatePath, hasAuthState } from './support/e2e-env'
import { skipMessage } from './support/auth'
import {
  expectApiOk,
  expectNoButton,
  expectPageTitle,
  expectRedirectedAwayFrom,
  openFirstTableRowIfAny,
} from './support/userflow'

test.describe('BRANCH Userflow', () => {
  test.skip(!hasAuthState('branch'), skipMessage('branch'))
  test.use({ storageState: authStatePath('branch') })

  test('지점 사용자는 내 지점 발주 요청 목록과 필터를 조회한다', async ({ page }, testInfo) => {
    await test.step('내 지점 발주 요청 목록에 진입한다', async () => {
      await page.goto('/branch/sales-orders')
      await expectPageTitle(page, '내 지점 발주 요청')
      await expect(page.getByRole('button', { name: '발주 요청 등록' })).toBeVisible()
      await expect(page.getByPlaceholder('요청번호 또는 부품명·코드 검색')).toBeVisible()
    })

    await test.step('상태 탭과 검색 필터를 사용할 수 있다', async () => {
      await page.getByRole('tab', { name: '진행 중' }).click()
      await expect(page.getByRole('tab', { name: '진행 중' })).toHaveAttribute('aria-selected', 'true')

      const searchInput = page.getByPlaceholder('요청번호 또는 부품명·코드 검색')
      await searchInput.fill('HMC')
      await expect(searchInput).toHaveValue('HMC')
    })

    await test.step('발주 요청 상세를 열 수 있으면 이력을 확인한다', async () => {
      const opened = await openFirstTableRowIfAny(page, testInfo, '지점 발주 데이터가 없어 상세 조회를 생략합니다.')

      if (opened) {
        await expect(page.getByText('발주 요약')).toBeVisible()
        await expect(page.getByText('변경 이력')).toBeVisible()
      }
    })
  })

  test('지점 사용자는 부품 마스터를 읽기 전용으로 조회한다', async ({ page }, testInfo) => {
    await test.step('부품 마스터에 진입한다', async () => {
      await page.goto('/items')
      await expectPageTitle(page, '부품 마스터')
      await expectNoButton(page, '부품 추가')
      await expect(page.getByPlaceholder('부품명 또는 코드')).toBeVisible()
    })

    await test.step('부품 상세를 열 수 있으면 읽기 전용 상태를 확인한다', async () => {
      const opened = await openFirstTableRowIfAny(page, testInfo, '부품 데이터가 없어 상세 조회를 생략합니다.')

      if (opened) {
        await expect(page.getByRole('dialog', { name: /부품 상세/ })).toBeVisible()
        await expect(page.getByText(/본인 지점 창고|기준/)).toBeVisible()
        await expectNoButton(page, '저장')
      }
    })
  })

  test('지점 사용자는 본인 지점 범위의 재고와 재고 이력을 조회한다', async ({ page }) => {
    await test.step('재고 조회 화면에서 관리 액션이 노출되지 않는다', async () => {
      await page.goto('/stocks')
      await expectPageTitle(page, '재고 조회')
      await expect(page.getByPlaceholder('부품명 또는 코드')).toBeVisible()
      await expectNoButton(page, '재고 추가')
      await expectNoButton(page, /^재고 조정$/)
      await expectNoButton(page, '안전 재고 조정')
    })

    await test.step('재고 이력을 조회한다', async () => {
      await page.goto('/stock-movements')
      await expectPageTitle(page, '재고 이력')
      await expect(page.getByPlaceholder('부품명 또는 코드')).toBeVisible()
    })
  })

  test('지점 사용자는 관리자와 본사 전용 화면에 접근할 수 없다', async ({ page }) => {
    await expectRedirectedAwayFrom(page, '/users')
    await expectRedirectedAwayFrom(page, '/dashboard')
    await expectRedirectedAwayFrom(page, '/purchase-orders')
    await expectRedirectedAwayFrom(page, '/sales-orders')
  })

  test('지점 사용자는 Gateway API로 지점 허용 범위를 조회할 수 있다', async ({ request }, testInfo) => {
    await expectApiOk(await request.get('/api/sales-orders/branch?page=1&size=10'), testInfo, '지점 발주 목록 조회')
    await expectApiOk(await request.get('/api/items?page=1&size=10&sort=updatedAt,desc'), testInfo, '부품 목록 조회')
    await expectApiOk(await request.get('/api/inventory/stocks?page=1&size=20&sort=safetyRatio,asc'), testInfo, '재고 목록 조회')
  })
})
