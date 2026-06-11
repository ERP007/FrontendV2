import { useNavigate, useRouter } from '@tanstack/react-router'
import { toast } from 'sonner'

import { PasswordChangeForm } from '@/features/auth'

export function PasswordChangePage() {
  const navigate = useNavigate()
  const router = useRouter()

  function handleSuccess() {
    toast.success('비밀번호가 변경되었습니다. 다시 로그인해 주세요.')
    void navigate({ to: '/login' })
  }

  function handleCancel() {
    router.history.back()
  }

  return (
    <div className="fg-auth-page">
      <div className="flex flex-col items-center">
        <h1 className="text-h1 text-ink">비밀번호 변경</h1>
        <div className="mt-4 h-1 w-16 rounded-pill bg-primary" />
      </div>
      <PasswordChangeForm onCancel={handleCancel} onSuccess={handleSuccess} />
    </div>
  )
}
