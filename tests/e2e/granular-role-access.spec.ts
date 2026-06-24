import { expect, test } from '@playwright/test'
import { allure } from 'allure-playwright'

import { authStatePath, hasAuthState, type E2ERole } from './support/e2e-env'
import { skipMessage } from './support/auth'
import {
  createRoleApiContext,
  expectApiForbidden,
  expectApiOk,
  expectNoButton,
  expectPageTitle,
} from './support/userflow'

test.beforeEach(async () => {
  await allure.suite('권한 세부 검증')
})

test.describe('세부 role 계정 권한', () => {
  test.describe('HQ_MANAGER 세션', () => {
    test.skip(!hasAuthState('hqManager'), skipMessage('hqManager'))
    test.use({ storageState: authStatePath('hqManager') })

    test('HQ_MANAGER는 창고 관리와 재고 조정 UI/API가 허용된다', async ({ baseURL, page, playwright }, testInfo) => {
      const api = await createRoleApiContext(playwright, baseURL, 'hqManager')

      try {
        await test.step('창고 관리 CTA가 활성화되어 있다', async () => {
          await page.goto('/warehouses')
          await expectPageTitle(page, '창고 관리')
          await expect(page.getByRole('button', { name: '지점 추가' })).toBeEnabled()
          await expect(page.getByRole('button', { name: '창고 추가' })).toBeEnabled()
        })

        await test.step('재고 조정 UI가 노출된다', async () => {
          await page.goto('/stocks')
          await expectPageTitle(page, '재고 조회')
          await expect(page.getByRole('button', { name: /^재고 조정$/ })).toBeVisible()
          await expect(page.getByRole('button', { name: '안전 재고 조정' })).toBeVisible()
          await expectNoButton(page, '재고 추가')
        })

        await expectApiOk(await api.get('/api/inventory/warehouses?status=ACTIVE'), testInfo, 'HQ_MANAGER 창고 목록 조회')
      } finally {
        await api.dispose()
      }
    })
  })

  test.describe('HQ_STAFF 세션', () => {
    test.skip(!hasAuthState('hqStaff'), skipMessage('hqStaff'))
    test.use({ storageState: authStatePath('hqStaff') })

    test('HQ_STAFF는 조회는 가능하지만 관리 액션은 사용할 수 없다', async ({ baseURL, page, playwright }, testInfo) => {
      const api = await createRoleApiContext(playwright, baseURL, 'hqStaff')

      try {
        await page.goto('/stocks')
        await expectPageTitle(page, '재고 조회')
        await expectNoButton(page, /^재고 조정$/)
        await expectNoButton(page, '안전 재고 조정')
        await expectNoButton(page, '재고 추가')

        await expectApiForbidden(
          await api.get('/api/users?page=1&size=10&sortBy=employeeNo&sortDirection=ASC&role=ALL&status=ALL&tenancy_code=ALL'),
          testInfo,
          'HQ_STAFF 사용자 관리 차단',
        )
      } finally {
        await api.dispose()
      }
    })
  })

  const branchRoles: Array<{ label: string; role: E2ERole }> = [
    { label: 'BRANCH_MANAGER', role: 'branchManager' },
    { label: 'BRANCH_STAFF', role: 'branchStaff' },
  ]

  for (const { label, role } of branchRoles) {
    test.describe(`${label} 세션`, () => {
      test.skip(!hasAuthState(role), skipMessage(role))
      test.use({ storageState: authStatePath(role) })

      test(`${label}는 지점 업무만 허용되고 관리자/HQ API는 차단된다`, async ({ baseURL, page, playwright }, testInfo) => {
        const api = await createRoleApiContext(playwright, baseURL, role)

        try {
          await test.step('지점 발주와 재고 조회 화면에 접근한다', async () => {
            await page.goto('/branch/sales-orders')
            await expectPageTitle(page, '내 지점 발주 요청')

            await page.goto('/stocks')
            await expectPageTitle(page, '재고 조회')
          })

          await test.step('관리자와 HQ API가 403으로 차단된다', async () => {
            await expectApiForbidden(
              await api.get('/api/users?page=1&size=10&sortBy=employeeNo&sortDirection=ASC&role=ALL&status=ALL&tenancy_code=ALL'),
              testInfo,
              `${label} 사용자 관리 차단`,
            )
            await expectApiForbidden(
              await api.get('/api/procurement-orders?page=1&size=10'),
              testInfo,
              `${label} 구매 주문 차단`,
            )
            await expectApiForbidden(
              await api.get('/api/sales-orders/hq?page=1&size=10'),
              testInfo,
              `${label} HQ 발주 차단`,
            )
          })
        } finally {
          await api.dispose()
        }
      })
    })
  }
})
