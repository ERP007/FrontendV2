import { expect, test } from '@playwright/test'

import { authStatePath, hasAuthState } from './support/e2e-env'
import { skipMessage } from './support/auth'
import {
  adminMutationEnabled,
  adminMutationSkipMessage,
  e2eCode,
  e2eId,
  expectApiOk,
  expectApiStatusIn,
  expectNoButton,
  expectPageTitle,
  openFirstTableRowIfAny,
  postJsonWithRetry,
  readJson,
} from './support/userflow'

interface UserListResponse {
  content: Array<{
    employeeNo: string
    userId: string
  }>
}

test.describe('ADMIN Userflow', () => {
  test.skip(!hasAuthState('admin'), skipMessage('admin'))
  test.use({ storageState: authStatePath('admin') })

  test('관리자는 사용자 목록을 조회하고 관리자 액션을 확인한다', async ({ page }) => {
    await test.step('사용자 관리 화면으로 이동한다', async () => {
      await page.goto('/users')
      await expectPageTitle(page, '사용자 목록')
      await expect(page.getByRole('button', { name: '사용자 추가' })).toBeVisible()
      await expect(page.getByPlaceholder('이름 또는 사번')).toBeVisible()
    })

    await test.step('사용자 검색 필터를 입력할 수 있다', async () => {
      const searchInput = page.getByPlaceholder('이름 또는 사번')
      await searchInput.fill('HMC')
      await expect(searchInput).toHaveValue('HMC')
      await expect(page.getByRole('button', { name: '초기화' })).toBeVisible()
    })
  })

  test('관리자는 마스터와 재고 관리 액션을 확인한다', async ({ page }, testInfo) => {
    await test.step('부품 마스터에서 부품 추가 액션을 확인한다', async () => {
      await page.goto('/items')
      await expectPageTitle(page, '부품 마스터')
      await expect(page.getByRole('button', { name: '부품 추가' })).toBeVisible()
    })

    await test.step('창고 관리에서 지점/창고 추가 액션을 확인한다', async () => {
      await page.goto('/warehouses')
      await expectPageTitle(page, '창고 관리')
      await expect(page.getByRole('button', { name: '지점 추가' })).toBeEnabled()
      await expect(page.getByRole('button', { name: '창고 추가' })).toBeEnabled()
    })

    await test.step('재고 조회에서 관리자 전용 액션을 확인한다', async () => {
      await page.goto('/stocks')
      await expectPageTitle(page, '재고 조회')
      await expect(page.getByRole('button', { name: '재고 추가' })).toBeVisible()
      await expect(page.getByRole('button', { name: /^재고 조정$/ })).toBeVisible()
      await expect(page.getByRole('button', { name: '안전 재고 조정' })).toBeVisible()

      await openFirstTableRowIfAny(page, testInfo, '재고 행이 없어 상세 패널 선택 검증을 생략합니다.')
    })
  })

  test('관리자는 Gateway API로 관리자와 본사 범위를 조회할 수 있다', async ({ request }, testInfo) => {
    await test.step('관리자 전용 사용자 API를 조회한다', async () => {
      await expectApiOk(
        await request.get('/api/users?page=1&size=10&sortBy=employeeNo&sortDirection=ASC&role=ALL&status=ALL&tenancy_code=ALL'),
        testInfo,
        '사용자 목록 조회',
      )
    })

    await test.step('본사 업무 API를 조회한다', async () => {
      await expectApiOk(await request.get('/api/procurement-orders?page=1&size=10'), testInfo, '구매 주문 목록 조회')
      await expectApiOk(await request.get('/api/sales-orders/hq?page=1&size=10'), testInfo, '본사 발주 목록 조회')
      await expectApiOk(await request.get('/api/inventory/warehouses?status=ACTIVE'), testInfo, '창고 목록 조회')
    })
  })

  test.describe('관리자 변경 흐름', () => {
    test.skip(!adminMutationEnabled(), adminMutationSkipMessage())

    test('관리자는 E2E 사용자 생성, 비밀번호 초기화, 정지와 해제를 수행한다', async ({ request }, testInfo) => {
      const id = e2eId('ADMIN-USER')
      const employeeNo = e2eCode('E2EU', 20)
      const email = `${employeeNo.toLowerCase()}@e2e.local`

      await test.step('E2E 관리자 사용자를 생성한다', async () => {
        await expectApiStatusIn(
          await postJsonWithRetry(request, '/api/users/create', {
            display_name: `E2E 관리자 ${employeeNo}`,
            email,
            employee_no: employeeNo,
            initial_password: 'E2ePass1234',
            password_issue_mode: 'MANUAL',
            position: '테스트',
            role: 'ADMIN',
            tenancy: 'ADMIN',
            tenancy_code: 'ADMIN',
          }),
          [200, 201, 409],
          testInfo,
          '사용자 생성',
        )
      })

      const users = await test.step('생성된 사용자를 목록에서 찾는다', async () =>
        readJson<UserListResponse>(
          await request.get(`/api/users?keyword=${employeeNo}&page=1&size=10&sortBy=employeeNo&sortDirection=ASC&role=ALL&status=ALL&tenancy_code=ALL`),
          testInfo,
          '생성 사용자 검색',
        ))
      const userId = users.content[0]?.userId
      expect(userId, '생성된 사용자의 userId').toBeTruthy()

      await test.step('비밀번호를 초기화한다', async () => {
        await expectApiOk(
          await request.patch(`/api/users/${encodeURIComponent(userId)}/reset-password`),
          testInfo,
          '비밀번호 초기화',
        )
      })

      await test.step('사용자를 정지하고 다시 해제한다', async () => {
        await expectApiOk(
          await request.patch(`/api/users/${encodeURIComponent(userId)}/suspension`, {
            data: { suspended: true },
          }),
          testInfo,
          '사용자 정지',
        )
        await expectApiOk(
          await request.patch(`/api/users/${encodeURIComponent(userId)}/suspension`, {
            data: { suspended: false },
          }),
          testInfo,
          '사용자 정지 해제',
        )
      })
    })
  })
})

test.describe('ADMIN 역방향 권한 확인', () => {
  test.skip(!hasAuthState('branch'), skipMessage('branch'))
  test.use({ storageState: authStatePath('branch') })

  test('지점 계정에는 관리자 전용 사용자 추가 버튼이 노출되지 않는다', async ({ page }) => {
    await page.goto('/items')
    await expectPageTitle(page, '부품 마스터')
    await expectNoButton(page, '부품 추가')
  })
})
