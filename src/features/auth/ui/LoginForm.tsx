import { LogIn } from 'lucide-react'

import { FgButton } from '@/shared/ui'

export interface LoginFormProps {
  errorMessage?: string
  onSsoLogin: () => void
}

export function LoginForm({ errorMessage, onSsoLogin }: LoginFormProps) {
  return (
    <div
      className="flex w-full max-w-auth-card flex-col gap-5.5 rounded-modal bg-surface p-9 shadow-login"
    >
      {errorMessage ? (
        <p className="rounded-control border border-danger-bg bg-danger-bg px-3 py-2 text-label font-semibold text-danger">
          {errorMessage}
        </p>
      ) : null}
      <FgButton
        className="h-13 w-full text-body"
        leftIcon={<LogIn aria-hidden className="h-5 w-5" />}
        variant="primary"
        onClick={onSsoLogin}
      >
        사내 SSO 로그인
      </FgButton>
    </div>
  )
}
