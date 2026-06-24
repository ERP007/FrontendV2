import { expect, test } from '@playwright/test'
import { allure } from 'allure-playwright'

import { authStatePath, hasAuthState } from './support/e2e-env'
import { skipMessage } from './support/auth'
import {
  expectApiStatusIn,
  expectRedirectedAwayFrom,
  expectRouteBlocked,
} from './support/userflow'

test.beforeEach(async () => {
  await allure.suite('인증 Negative')
})

test.describe('인증 Negative', () => {
  test('비로그인 API 요청은 세션을 얻을 수 없다', async ({ baseURL, playwright }, testInfo) => {
    const anonymousRequest = await playwright.request.newContext({
      baseURL,
      storageState: { cookies: [], origins: [] },
    })

    try {
      await expectApiStatusIn(
        await anonymousRequest.get('/api/users/session'),
        [401, 403],
        testInfo,
        '비로그인 세션 조회',
      )
    } finally {
      await anonymousRequest.dispose()
    }
  })

  test('빈 storage state로 보호 라우트에 접근하면 로그인 흐름으로 이동한다', async ({ browser, baseURL }) => {
    const context = await browser.newContext({
      baseURL,
      storageState: { cookies: [], origins: [] },
    })
    const page = await context.newPage()

    try {
      await expectRedirectedAwayFrom(page, '/users')
      await expect(page).toHaveURL(/login|oauth2|auth\.erp007\.xyz/)
    } finally {
      await context.close()
    }
  })

  test.describe('세션 제거 흐름', () => {
    test.skip(!hasAuthState('admin'), skipMessage('admin'))
    test.use({ storageState: authStatePath('admin') })

    test('브라우저 세션 쿠키 제거 후 보호 라우트 재접근은 다시 로그인 흐름으로 이동한다', async ({ page }) => {
      await test.step('관리자 세션으로 보호 라우트에 접근한다', async () => {
        await page.goto('/users')
        await expect(page.getByRole('heading', { name: '사용자 목록' })).toBeVisible()
      })

      await test.step('현재 브라우저 컨텍스트의 세션 쿠키를 제거한다', async () => {
        await page.context().clearCookies()
      })

      await test.step('보호 라우트 재접근 시 차단된다', async () => {
        await expectRouteBlocked(page, '/users')
        await expect(page).toHaveURL(/login|oauth2|auth\.erp007\.xyz/)
      })
    })
  })
})
