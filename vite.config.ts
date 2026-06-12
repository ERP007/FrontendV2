import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

const projectRoot = fileURLToPath(new URL('.', import.meta.url))

function normalizeProxyTarget(value: string | undefined) {
  const trimmed = value?.trim().replace(/\/+$/, '') ?? ''

  if (!trimmed || trimmed.startsWith('/')) {
    return undefined
  }

  return trimmed
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, projectRoot, '')
  const apiTarget = normalizeProxyTarget(env.VITE_API_BASE_URL)

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: apiTarget
      ? {
          proxy: {
            '/api': {
              changeOrigin: true,
              secure: true,
              target: apiTarget,
            },
            '/login/oauth2': {
              changeOrigin: true,
              secure: true,
              target: apiTarget,
            },
            '/oauth2': {
              changeOrigin: true,
              secure: true,
              target: apiTarget,
            },
          },
        }
      : undefined,
  }
})
