import { useEffect } from 'react'
import { Package } from 'lucide-react'

import { LoginForm } from '@/features/auth'
import { clearAuthRedirectAttempt, redirectToAuthLogin } from '@/shared/api'

export function LoginPage() {
  const hasSessionError =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('auth_error') === 'session'

  useEffect(() => {
    clearAuthRedirectAttempt()
  }, [])

  function handleSsoLogin() {
    redirectToAuthLogin({ force: true })
  }

  return (
    <div className="fg-auth-page">
      <div className="flex flex-col items-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-modal border border-dashed border-line bg-surface text-ink-2">
          <Package aria-hidden className="h-7 w-7" strokeWidth={1.6} />
        </span>
        <h1 className="mt-6 text-display text-ink">통합 부품 ERP</h1>
        <div className="mt-4 h-1 w-16 rounded-pill bg-primary" />
        <p className="mt-5 text-label font-medium text-muted">현대 파츠 (주)</p>
      </div>
      <LoginForm
        errorMessage={
          hasSessionError ? '로그인 세션을 확인하지 못했습니다. 다시 로그인해 주세요.' : undefined
        }
        onSsoLogin={handleSsoLogin}
      />
      <p className="text-label text-faint">비밀번호 분실 시 관리자에게 문의</p>
    </div>
  )
}
