import { expect, test, type Page } from '@playwright/test'
import { allure } from 'allure-playwright'

import { authStatePath, hasAuthState } from './support/e2e-env'
import { skipMessage } from './support/auth'
import {
  expectApiForbidden,
  expectPageTitle,
  expectPath,
} from './support/userflow'

async function expectHomeRedirect(page: Page, expectedPath: string) {
  await page.goto('/')
  await expectPath(page, expectedPath)
}

async function expectMyPageAccessible(page: Page) {
  await page.goto('/my-page')
  await expectPath(page, '/my-page')
  await expectPageTitle(page, '마이페이지')
}

async function expectLegacyMyPageRedirect(page: Page) {
  await page.goto('/mypage')
  await expectPath(page, '/my-page')
  await expectPageTitle(page, '마이페이지')
}

test.beforeEach(async () => {
  await allure.suite('권한 차단')
})

test.describe('권한 차단 API', () => {
  test.describe('지점 세션', () => {
    test.skip(!hasAuthState('branch'), skipMessage('branch'))
    test.use({ storageState: authStatePath('branch') })

    test('지점은 관리자와 본사 전용 API를 호출할 수 없다', async ({ request }, testInfo) => {
      await test.step('사용자 관리 API가 403으로 차단된다', async () => {
        await expectApiForbidden(
          await request.get('/api/users?page=1&size=10&sortBy=employeeNo&sortDirection=ASC&role=ALL&status=ALL&tenancy_code=ALL'),
          testInfo,
          '지점 사용자 목록 차단',
        )
      })

      await test.step('구매 주문 API가 403으로 차단된다', async () => {
        await expectApiForbidden(
          await request.get('/api/procurement-orders?page=1&size=10'),
          testInfo,
          '지점 구매 주문 목록 차단',
        )
      })

      await test.step('본사 발주 요청 API가 403으로 차단된다', async () => {
        await expectApiForbidden(
          await request.get('/api/sales-orders/hq?page=1&size=10'),
          testInfo,
          '지점 본사 발주 목록 차단',
        )
      })
    })
  })

  test.describe('본사 세션', () => {
    test.skip(!hasAuthState('hq'), skipMessage('hq'))
    test.use({ storageState: authStatePath('hq') })

    test('본사는 관리자와 지점 전용 API를 호출할 수 없다', async ({ request }, testInfo) => {
      await test.step('사용자 관리 API가 403으로 차단된다', async () => {
        await expectApiForbidden(
          await request.get('/api/users?page=1&size=10&sortBy=employeeNo&sortDirection=ASC&role=ALL&status=ALL&tenancy_code=ALL'),
          testInfo,
          '본사 사용자 목록 차단',
        )
      })

      await test.step('지점 발주 요청 API가 403으로 차단된다', async () => {
        await expectApiForbidden(
          await request.get('/api/sales-orders/branch?page=1&size=10'),
          testInfo,
          '본사 지점 발주 목록 차단',
        )
      })
    })
  })

  test.describe('관리자 세션', () => {
    test.skip(!hasAuthState('admin'), skipMessage('admin'))
    test.use({ storageState: authStatePath('admin') })

    test('관리자는 지점 전용 API를 호출할 수 없다', async ({ request }, testInfo) => {
      await expectApiForbidden(
        await request.get('/api/sales-orders/branch?page=1&size=10'),
        testInfo,
        '관리자 지점 발주 목록 차단',
      )
    })
  })
})

test.describe('공통 라우트와 읽기 권한', () => {
  test.describe('관리자 세션', () => {
    test.skip(!hasAuthState('admin'), skipMessage('admin'))
    test.use({ storageState: authStatePath('admin') })

    test('관리자는 루트에서 사용자 목록으로 이동하고 마이페이지를 조회한다', async ({ page }) => {
      await test.step('루트 진입 시 관리자 홈으로 이동한다', async () => {
        await expectHomeRedirect(page, '/users')
      })

      await test.step('마이페이지를 조회한다', async () => {
        await expectMyPageAccessible(page)
      })

      await test.step('legacy 마이페이지 경로가 새 경로로 이동한다', async () => {
        await expectLegacyMyPageRedirect(page)
      })
    })
  })

  test.describe('본사 세션', () => {
    test.skip(!hasAuthState('hq'), skipMessage('hq'))
    test.use({ storageState: authStatePath('hq') })

    test('본사는 루트에서 대시보드로 이동하고 마이페이지를 조회한다', async ({ page }) => {
      await test.step('루트 진입 시 본사 홈으로 이동한다', async () => {
        await expectHomeRedirect(page, '/dashboard')
      })

      await test.step('마이페이지를 조회한다', async () => {
        await expectMyPageAccessible(page)
      })

      await test.step('legacy 마이페이지 경로가 새 경로로 이동한다', async () => {
        await expectLegacyMyPageRedirect(page)
      })
    })
  })

  test.describe('지점 세션', () => {
    test.skip(!hasAuthState('branch'), skipMessage('branch'))
    test.use({ storageState: authStatePath('branch') })

    test('지점은 루트에서 허용 홈으로 이동하고 마이페이지를 조회한다', async ({ page }) => {
      await test.step('루트 진입 시 지점 허용 홈으로 이동한다', async () => {
        await expectHomeRedirect(page, '/stocks')
      })

      await test.step('마이페이지를 조회한다', async () => {
        await expectMyPageAccessible(page)
      })

      await test.step('legacy 마이페이지 경로가 새 경로로 이동한다', async () => {
        await expectLegacyMyPageRedirect(page)
      })
    })

    test('지점은 창고를 조회할 수 있지만 관리 액션은 사용할 수 없다', async ({ page }) => {
      await page.goto('/warehouses')
      await expectPath(page, '/warehouses')
      await expectPageTitle(page, '창고 관리')

      await test.step('창고 관리 CTA가 비활성화되어 있다', async () => {
        await expect(page.getByRole('button', { name: '지점 추가' })).toBeDisabled()
        await expect(page.getByRole('button', { name: '창고 추가' })).toBeDisabled()
      })

      await test.step('행 액션 메뉴가 있으면 수정/활성 전환 액션이 비활성화되어 있다', async () => {
        const actionMenus = page.getByRole('button', { name: '액션 메뉴' })
        const actionMenuCount = await actionMenus.count()
        if (actionMenuCount === 0) return

        await actionMenus.first().click()
        await expect(page.getByRole('menuitem', { name: '수정' })).toHaveAttribute('aria-disabled', 'true')
        await expect(page.getByRole('menuitem', { name: /활성 전환|비활성 전환/ })).toHaveAttribute('aria-disabled', 'true')
      })
    })
  })
})
