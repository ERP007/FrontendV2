import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/app/styles/global.css'
import App from '@/App.tsx'
import { AppProviders } from '@/app/providers/AppProviders'

if (import.meta.env.DEV) {
  void import('@/shared/auth/debug-oauth2-token').then(({ installOAuth2TokenDebug }) => {
    installOAuth2TokenDebug()
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </StrictMode>,
)
