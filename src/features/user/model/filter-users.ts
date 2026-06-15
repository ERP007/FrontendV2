import type { User, UserFilter } from './types'
import { getUserTenancyLabel } from './user-tenancy'

export function filterUsers(users: User[], filter: UserFilter): User[] {
  const keyword = filter.keyword.trim().toLowerCase()

  return users.filter((user) => {
    if (keyword) {
      const matches =
        user.name.toLowerCase().includes(keyword) || user.empNo.toLowerCase().includes(keyword)
      if (!matches) return false
    }

    if (filter.role !== 'ALL' && user.role !== filter.role) return false
    if (filter.status !== 'ALL' && user.status !== filter.status) return false
    if (filter.tenancyCode !== 'ALL') {
      const tenancyLabel = getUserTenancyLabel(filter.tenancyCode)

      if (user.warehouseName !== tenancyLabel && user.warehouseName !== filter.tenancyCode) return false
    }

    return true
  })
}
