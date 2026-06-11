import type { User, UserFilter } from './types'

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
    if (filter.warehouseName !== 'ALL' && user.warehouseName !== filter.warehouseName) return false

    return true
  })
}
