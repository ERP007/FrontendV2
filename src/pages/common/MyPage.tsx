import { useNavigate } from '@tanstack/react-router'

import {
  MY_ACTIVITY_FIXTURES,
  MyActivityCard,
  MyPasswordCard,
  MyProfileCard,
  PASSWORD_CHANGED_AT,
} from '@/features/user'
import { useSession } from '@/shared/auth/session'
import { FgPageHeader } from '@/shared/ui'

export function MyPage() {
  const navigate = useNavigate()
  const { data: session } = useSession()

  return (
    <div className="fg-content max-w-content-narrow">
      <FgPageHeader breadcrumbs={[{ label: '설정' }, { label: '마이페이지' }]} title="마이페이지" />
      {session ? <MyProfileCard session={session} /> : null}
      <MyPasswordCard
        changedAt={PASSWORD_CHANGED_AT}
        onChangePassword={() => void navigate({ to: '/password-change' })}
      />
      <MyActivityCard activities={MY_ACTIVITY_FIXTURES} />
    </div>
  )
}
