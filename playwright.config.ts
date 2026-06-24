import { defineConfig, devices } from '@playwright/test'

import { loadE2EEnv } from './tests/e2e/support/load-e2e-env'

loadE2EEnv()

const baseURL = process.env.E2E_BASE_URL ?? 'https://erp007.xyz'
const isCi = Boolean(process.env.CI)

export default defineConfig({
  expect: {
    timeout: 10_000,
  },
  forbidOnly: isCi,
  fullyParallel: false,
  globalSetup: './tests/e2e/auth.setup.ts',
  outputDir: 'test-results',
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  reporter: [
    ['line'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['allure-playwright', { resultsDir: 'allure-results' }],
  ],
  retries: isCi ? 1 : 0,
  testDir: './tests/e2e',
  testMatch: '**/*.spec.ts',
  timeout: 60_000,
  use: {
    baseURL,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
  },
  workers: 1,
})
