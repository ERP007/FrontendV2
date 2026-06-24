import { expect, test } from '@playwright/test'

import { ROLE_CONFIGS, authStatePath, hasAuthState } from './support/e2e-env'
import { assertGatewaySession, skipMessage } from './support/auth'

const ROLE_LABELS = {
  admin: '관리자',
  branch: '지점',
  branchManager: '지점 관리자',
  branchStaff: '지점 담당자',
  hq: '본사',
  hqManager: '본사 매니저',
  hqStaff: '본사 담당자',
} as const

test.describe('인증', () => {
  test('비로그인 사용자는 보호된 화면 접근 시 로그인 흐름으로 이동한다', async ({ page }) => {
    await page.goto('/users')

    await expect
      .poll(async () => page.url(), { timeout: 15_000 })
      .toMatch(/\/login|auth\.erp007\.xyz|\/oauth2\/authorization\/keycloak/)
  })

  for (const config of ROLE_CONFIGS) {
    test.describe(`${ROLE_LABELS[config.role]} 세션`, () => {
      test.skip(!hasAuthState(config.role), skipMessage(config.role))
      test.use({ storageState: authStatePath(config.role) })

      test(`${ROLE_LABELS[config.role]} 계정은 Gateway 세션을 가진다`, async ({ context, page }) => {
        await page.goto(config.defaultPath)

        await assertGatewaySession(context, config.expectedRoles)
      })
    })
  }
})
