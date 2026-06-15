import { BranchItemsPage } from '@/pages/branch/BranchItemsPage'
import { ItemsPage } from '@/pages/hq/ItemsPage'
import { useSession } from '@/shared/auth/session'

const BRANCH_ROLES = new Set(['BRANCH_MANAGER', 'BRANCH_STAFF'])

export function ItemsRoutePage() {
  const { data: session } = useSession()

  if (BRANCH_ROLES.has(session?.userRole ?? '')) {
    return <BranchItemsPage />
  }

  return <ItemsPage />
}
