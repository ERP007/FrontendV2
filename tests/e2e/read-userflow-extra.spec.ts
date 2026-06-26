import { expect, test } from '@playwright/test'
import { allure } from 'allure-playwright'

import { authStatePath, hasAuthState } from './support/e2e-env'
import { skipMessage } from './support/auth'
import {
  expectNoButton,
  expectPageTitle,
  expectPath,
  expectRouteBlocked,
  openFirstTableRowIfAny,
} from './support/userflow'

test.beforeEach(async () => {
  await allure.suite('권한 세부 검증')
})

test.describe('읽기 Userflow 확장', () => {
  test.describe('ADMIN 세션', () => {
    test.skip(!hasAuthState('admin'), skipMessage('admin'))
    test.use({ storageState: authStatePath('admin') })

    test('관리자는 사용자와 부품 상세 모달을 열 수 있다', async ({ page }, testInfo) => {
      await test.step('사용자 상세 모달을 연다', async () => {
        await page.goto('/users')
        await expectPageTitle(page, '사용자 목록')

        const actionMenus = page.getByRole('button', { name: '액션 메뉴' })
        if ((await actionMenus.count()) === 0) {
          await testInfo.attach('사용자 상세 생략', {
            body: '사용자 목록 행이 없어 상세 모달 검증을 생략합니다.',
            contentType: 'text/plain',
          })
          return
        }

        await actionMenus.first().click()
        await page.getByRole('menuitem', { name: '유저 상세' }).click()
        await expect(page.getByRole('dialog', { name: '사용자 상세' })).toBeVisible()
        await expect(page.getByText('저장 시 사용자 기본 정보가 즉시 반영됩니다.')).toBeVisible()
      })

      await test.step('부품 상세 모달을 연다', async () => {
        await page.goto('/items')
        await expectPageTitle(page, '부품 마스터')

        const opened = await openFirstTableRowIfAny(page, testInfo, '부품 데이터가 없어 상세 모달 검증을 생략합니다.')
        if (!opened) return

        await expect(page.getByRole('dialog', { name: '부품 상세' })).toBeVisible()
        await expect(page.getByText('기본 정보')).toBeVisible()
      })
    })
  })

  test.describe('HQ 세션', () => {
    test.skip(!hasAuthState('hq'), skipMessage('hq'))
    test.use({ storageState: authStatePath('hq') })

    test('본사는 구매와 발주 목록 검색/필터를 사용할 수 있다', async ({ page }) => {
      await test.step('구매 주문 목록 검색과 상태 필터를 조작한다', async () => {
        await page.goto('/purchase-orders')
        await expectPageTitle(page, '구매 주문')

        const searchInput = page.getByPlaceholder('PO 번호 또는 공급사명')
        await searchInput.fill('E2E')
        await expect(searchInput).toHaveValue('E2E')

        await page.getByText('상태 : 전체').click()
        await expect(page.getByRole('menu', { name: /상태/ })).toBeVisible()
        await expect(page.getByRole('menuitemcheckbox').first()).toBeVisible()
        await page.keyboard.press('Escape')
        await expect(page.getByRole('button', { name: /초기화/ })).toBeVisible()
      })

      await test.step('본사 발주 목록 검색과 상태/창고 필터를 조작한다', async () => {
        await page.goto('/sales-orders')
        await expectPageTitle(page, '발주 요청')

        const searchInput = page.getByPlaceholder(/요청번호/)
        await searchInput.fill('E2E')
        await expect(searchInput).toHaveValue('E2E')

        await page.getByRole('button', { name: /상태/ }).click()
        await expect(page.getByRole('menu', { name: /상태/ })).toBeVisible()
        await expect(page.getByRole('menuitemcheckbox').first()).toBeVisible()
        await page.keyboard.press('Escape')

        await expect(page.getByRole('button', { name: /초기화/ })).toBeVisible()
      })
    })

    test('본사는 지점 전용 라우트에 직접 접근할 수 없다', async ({ page }) => {
      await expectRouteBlocked(page, '/branch/sales-orders')
      await expectPath(page, '/dashboard')

      await expectRouteBlocked(page, '/branch/sales-orders/new')
      await expectPath(page, '/dashboard')
    })
  })

  test.describe('BRANCH 세션', () => {
    test.skip(!hasAuthState('branch'), skipMessage('branch'))
    test.use({ storageState: authStatePath('branch') })

    test('지점 재고 창고 selector는 본인 지점 범위로 제한된다', async ({ page }) => {
      await page.goto('/stocks')
      await expectPageTitle(page, '재고 조회')

      await expect(page.getByRole('combobox', { name: '창고 : 전체' })).toHaveCount(0)
      await expect(page.getByText('창고 : 전체')).toHaveCount(0)
      await expectNoButton(page, '재고 추가')
      await expectNoButton(page, /^재고 조정$/)
      await expectNoButton(page, '안전 재고 조정')
    })
  })
})
