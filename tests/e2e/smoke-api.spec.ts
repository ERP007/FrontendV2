import { expect, test, type APIRequestContext } from '@playwright/test'

import { authStatePath, hasAuthState } from './support/e2e-env'
import { skipMessage } from './support/auth'

async function expectGatewayOk(request: APIRequestContext, url: string) {
  const response = await request.get(url)
  const body = response.ok() ? '' : await response.text()
  expect(
    response.ok(),
    `${url} 요청은 Gateway 세션 인증으로 통과해야 합니다. Status=${response.status()} Body=${body.slice(0, 500)}`,
  ).toBeTruthy()
}

test.describe('Gateway API 스모크', () => {
  test.describe('본사 세션', () => {
    test.skip(!hasAuthState('hq'), skipMessage('hq'))
    test.use({ storageState: authStatePath('hq') })

    test('Gateway를 통해 사용자, 부품, 재고, 판매 서비스를 호출할 수 있다', async ({ request }) => {
      await expectGatewayOk(request, '/api/users/session')
      await expectGatewayOk(request, '/api/items?page=1&size=10&sort=updatedAt,desc')
      await expectGatewayOk(request, '/api/inventory/stocks?page=1&size=20&sort=safetyRatio,asc')
      await expectGatewayOk(request, '/api/sales-orders/hq?page=1&size=10')
    })
  })

  test.describe('지점 세션', () => {
    test.skip(!hasAuthState('branch'), skipMessage('branch'))
    test.use({ storageState: authStatePath('branch') })

    test('Gateway를 통해 지점 허용 API를 호출할 수 있다', async ({ request }) => {
      await expectGatewayOk(request, '/api/users/session')
      await expectGatewayOk(request, '/api/items?page=1&size=10&sort=updatedAt,desc')
      await expectGatewayOk(request, '/api/inventory/stocks?page=1&size=20&sort=safetyRatio,asc')
      await expectGatewayOk(request, '/api/sales-orders/branch?page=1&size=10')
    })
  })
})
