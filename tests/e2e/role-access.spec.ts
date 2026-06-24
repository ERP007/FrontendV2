import { test, type Page } from '@playwright/test'

import { authStatePath, hasAuthState } from './support/e2e-env'
import { skipMessage } from './support/auth'
import { expectPath, expectRedirectedAwayFrom } from './support/userflow'

async function expectAllowed(page: Page, path: string) {
  await page.goto(path)
  await expectPath(page, path)
}

test.describe('역할별 접근 제어', () => {
  test.describe('관리자', () => {
    test.skip(!hasAuthState('admin'), skipMessage('admin'))
    test.use({ storageState: authStatePath('admin') })

    test('사용자 관리 화면에 접근할 수 있다', async ({ page }) => {
      await expectAllowed(page, '/users')
    })

    test('본사 업무 화면에 접근할 수 있다', async ({ page }) => {
      await expectAllowed(page, '/dashboard')
      await expectAllowed(page, '/items')
      await expectAllowed(page, '/stocks')
      await expectAllowed(page, '/sales-orders')
    })
  })

  test.describe('본사', () => {
    test.skip(!hasAuthState('hq'), skipMessage('hq'))
    test.use({ storageState: authStatePath('hq') })

    test('본사 업무 화면에 접근할 수 있다', async ({ page }) => {
      await expectAllowed(page, '/dashboard')
      await expectAllowed(page, '/items')
      await expectAllowed(page, '/stocks')
      await expectAllowed(page, '/sales-orders')
    })

    test('관리자 전용 사용자 관리 화면에는 접근할 수 없다', async ({ page }) => {
      await expectRedirectedAwayFrom(page, '/users')
    })
  })

  test.describe('지점', () => {
    test.skip(!hasAuthState('branch'), skipMessage('branch'))
    test.use({ storageState: authStatePath('branch') })

    test('지점 발주와 공통 재고 화면에 접근할 수 있다', async ({ page }) => {
      await expectAllowed(page, '/branch/sales-orders')
      await expectAllowed(page, '/stocks')
    })

    test('본사 발주와 관리자 사용자 관리 화면에는 접근할 수 없다', async ({ page }) => {
      await expectRedirectedAwayFrom(page, '/sales-orders')
      await expectRedirectedAwayFrom(page, '/users')
    })
  })
})
