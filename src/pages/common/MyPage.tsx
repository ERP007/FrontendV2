import { useNavigate } from '@tanstack/react-router'

import {
  MY_ACTIVITY_FIXTURES,
  MyActivityCard,
  MyPasswordCard,
  MyProfileCard,
  PASSWORD_CHANGED_AT,
} from '@/features/user'
import { MOCK_SESSION } from '@/shared/config/session'
import { FgPageHeader } from '@/shared/ui'

export function MyPage() {
  const navigate = useNavigate()

  return (
    <div className="fg-content max-w-content-narrow">
      <FgPageHeader breadcrumbs={[{ label: '설정' }, { label: '마이페이지' }]} title="마이페이지" />
      <MyProfileCard session={MOCK_SESSION} />
      <MyPasswordCard
        changedAt={PASSWORD_CHANGED_AT}
        onChangePassword={() => void navigate({ to: '/password-change' })}
      />
      <MyActivityCard activities={MY_ACTIVITY_FIXTURES} />
    </div>
  )
}
