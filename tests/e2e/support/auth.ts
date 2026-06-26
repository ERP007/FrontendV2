import fs from 'node:fs'

import { expect, type Browser, type BrowserContext, type Page } from '@playwright/test'

import { AUTH_STATE_DIR, BASE_URL, authStatePath, type RoleConfig } from './e2e-env'

interface SessionResponse {
  content?: {
    employeeNo?: string
    name?: string
    userRole?: string | null
  }
}

function envValue(name: string) {
  const value = process.env[name]

  if (!value) {
    throw new Error(`Missing ${name}. Set it before running E2E login setup.`)
  }

  return value
}

function isKeycloakUrl(value: string) {
  return (
    value.includes('/realms/') ||
    value.includes('/protocol/openid-connect/') ||
    value.includes('/login-actions/') ||
    value.includes('auth.erp007.xyz')
  )
}

async function fillIfVisible(page: Page, selector: string, value: string) {
  const locator = page.locator(selector).first()

  if (await locator.isVisible({ timeout: 10_000 }).catch(() => false)) {
    await locator.fill(value)
    return true
  }

  return false
}

async function submitLoginForm(page: Page) {
  await page.locator('button[type="submit"], input[type="submit"], #kc-login').first().click()
}

async function waitForPostLoginRedirect(page: Page, role: string) {
  await expect
    .poll(async () => {
      const currentUrl = page.url()
      return isKeycloakUrl(currentUrl) ? currentUrl : 'post-login'
    }, {
      message: `${role} login should leave Keycloak after submitting credentials`,
      timeout: 30_000,
    })
    .toBe('post-login')
}

async function startSsoLogin(page: Page) {
  await page.goto('/login', { waitUntil: 'domcontentloaded' })

  const ssoButton = page.getByRole('button', { name: /사내 SSO 로그인|SSO/i })

  if (await ssoButton.isVisible({ timeout: 5_000 }).catch(() => false)) {
    await ssoButton.click()
    return
  }

  await page.goto('/oauth2/authorization/keycloak')
}

export async function assertGatewaySession(context: BrowserContext, expectedRoles: string[]) {
  const cookies = await context.cookies(BASE_URL)
  expect(cookies.some((cookie) => cookie.name === 'GATEWAY_SESSION')).toBeTruthy()

  const sessionResponse = await context.request.get(new URL('/api/users/session', BASE_URL).toString())
  expect(sessionResponse.ok()).toBeTruthy()

  const sessionBody = (await sessionResponse.json()) as SessionResponse
  const userRole = sessionBody.content?.userRole

  expect(userRole, 'Gateway session user role').toBeTruthy()
  expect(expectedRoles).toContain(userRole)

  return sessionBody
}

export async function loginAndSaveStorageState(browser: Browser, config: RoleConfig) {
  const username = envValue(config.usernameEnv)
  const password = envValue(config.passwordEnv)
  const context = await browser.newContext({ baseURL: BASE_URL })
  const page = await context.newPage()

  await startSsoLogin(page)

  await fillIfVisible(page, 'input[name="username"], input#username', username)
  await fillIfVisible(page, 'input[name="password"], input#password', password)
  await submitLoginForm(page)

  await waitForPostLoginRedirect(page, config.role)

  await assertGatewaySession(context, config.expectedRoles)

  fs.mkdirSync(AUTH_STATE_DIR, { recursive: true })
  await context.storageState({ path: authStatePath(config.role) })
  await context.close()
}

export function skipMessage(role: string) {
  return `${role} 로그인 상태가 없습니다. 해당 E2E 계정 USERNAME/PASSWORD env를 설정한 뒤 npm run test:e2e를 실행하세요.`
}
