import { Construction } from 'lucide-react'

import { FgCard, FgEmptyState, FgPageHeader } from '@/shared/ui'

export interface PlaceholderPageProps {
  breadcrumbs: string[]
  description?: string
  title: string
}

export function PlaceholderPage({ breadcrumbs, description, title }: PlaceholderPageProps) {
  return (
    <div className="fg-content">
      <FgPageHeader breadcrumbs={breadcrumbs.map((label) => ({ label }))} title={title} />
      <FgCard>
        <FgEmptyState
          description={description ?? '이 화면은 곧 구현됩니다.'}
          icon={<Construction aria-hidden className="h-6 w-6" />}
          title="화면 준비 중입니다"
        />
      </FgCard>
    </div>
  )
}
