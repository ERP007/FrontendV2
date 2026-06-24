import fs from 'node:fs'
import path from 'node:path'

const resultDirs = [
  'allure-results',
  'allure-report',
  'playwright-report',
  'test-results',
]

for (const dir of resultDirs) {
  fs.rmSync(path.join(process.cwd(), dir), { force: true, recursive: true })
}
