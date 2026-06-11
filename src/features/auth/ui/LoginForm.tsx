import { Lock, User } from 'lucide-react'
import { useState } from 'react'
import type { FormEvent } from 'react'

import { FgButton, FgInput, FgNotice } from '@/shared/ui'

import { PasswordVisibilityToggle } from './PasswordVisibilityToggle'

export interface LoginFormProps {
  onSuccess: () => void
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [loginId, setLoginId] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError(null)

    if (!loginId.trim() || !password) {
      setFormError('사번(또는 이메일)과 비밀번호를 모두 입력하세요.')
      return
    }

    onSuccess()
  }

  return (
    <form
      className="flex w-full max-w-auth-card flex-col gap-5.5 rounded-modal bg-surface p-9 shadow-login"
      onSubmit={handleSubmit}
    >
      {formError ? <FgNotice tone="danger">{formError}</FgNotice> : null}
      <FgInput
        autoComplete="username"
        label="사번 또는 이메일"
        leftIcon={<User aria-hidden className="h-5 w-5" />}
        placeholder="HMC0001 또는 name@hyundaiparts.com"
        size="lg"
        value={loginId}
        onChange={(event) => setLoginId(event.target.value)}
      />
      <FgInput
        autoComplete="current-password"
        inputClassName="tracking-widest"
        label="비밀번호"
        leftIcon={<Lock aria-hidden className="h-5 w-5" />}
        placeholder="••••••••"
        rightIcon={
          <PasswordVisibilityToggle
            visible={showPassword}
            onToggle={() => setShowPassword((previous) => !previous)}
          />
        }
        size="lg"
        type={showPassword ? 'text' : 'password'}
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />
      <FgButton className="h-13 w-full text-body" type="submit" variant="primary">
        로그인
      </FgButton>
      <button
        className="flex h-13 w-full items-center justify-center rounded-control-lg border border-dashed border-line text-label text-faint transition-colors hover:text-muted"
        type="button"
      >
        사내 SSO 로그인
      </button>
    </form>
  )
}
