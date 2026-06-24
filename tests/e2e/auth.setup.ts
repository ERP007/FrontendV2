import fs from 'node:fs'
import path from 'node:path'

import { chromium } from '@playwright/test'

import { BASE_URL, ROLE_CONFIGS, hasRoleCredentials } from './support/e2e-env'
import { loginAndSaveStorageState } from './support/auth'

function writeAllureEnvironment() {
  fs.mkdirSync('allure-results', { recursive: true })

  const lines = [
    `Base URL=${BASE_URL}`,
    `Node.js=${process.version}`,
    `Platform=${process.platform}`,
    `Mutation tests=${process.env.E2E_ENABLE_MUTATION === 'true' ? 'enabled' : 'disabled'}`,
  ]

  fs.writeFileSync(path.join('allure-results', 'environment.properties'), `${lines.join('\n')}\n`)
}

async function globalSetup() {
  writeAllureEnvironment()

  const rolesWithCredentials = ROLE_CONFIGS.filter(hasRoleCredentials)

  if (rolesWithCredentials.length === 0) {
    console.log('No E2E role credentials were provided. Authenticated specs will be skipped.')
    return
  }

  const browser = await chromium.launch()

  try {
    for (const roleConfig of rolesWithCredentials) {
      await loginAndSaveStorageState(browser, roleConfig)
      console.log(`Saved ${roleConfig.role} auth state.`)
    }
  } finally {
    await browser.close()
  }
}

export default globalSetup
