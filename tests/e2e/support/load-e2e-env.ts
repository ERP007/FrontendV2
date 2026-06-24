import fs from 'node:fs'
import path from 'node:path'

const ENV_FILE = '.env.e2e'

function stripOptionalQuotes(value: string) {
  const trimmed = value.trim()
  const quote = trimmed[0]

  if ((quote === '"' || quote === "'") && trimmed.endsWith(quote)) {
    return trimmed.slice(1, -1)
  }

  return trimmed
}

export function loadE2EEnv() {
  const envPath = path.join(process.cwd(), ENV_FILE)

  if (!fs.existsSync(envPath)) {
    return
  }

  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/)

  for (const line of lines) {
    const trimmed = line.trim()

    if (!trimmed || trimmed.startsWith('#')) {
      continue
    }

    const separatorIndex = trimmed.indexOf('=')

    if (separatorIndex < 1) {
      continue
    }

    const key = trimmed.slice(0, separatorIndex).trim()
    const value = stripOptionalQuotes(trimmed.slice(separatorIndex + 1))

    if (!process.env[key]) {
      process.env[key] = value
    }
  }
}
