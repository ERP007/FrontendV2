import type { Item, ItemFilter } from './types'

export function filterItems(items: Item[], filter: ItemFilter): Item[] {
  const keyword = filter.keyword.trim().toLowerCase()

  const filtered = items.filter((item) => {
    if (keyword) {
      const matches =
        item.name.toLowerCase().includes(keyword) || item.code.toLowerCase().includes(keyword)
      if (!matches) return false
    }

    if (filter.majorCategory !== 'ALL' && item.majorCategory !== filter.majorCategory) return false
    if (filter.middleCategory !== 'ALL' && item.middleCategory !== filter.middleCategory) return false
    if (filter.status === 'ACTIVE' && !item.active) return false
    if (filter.status === 'INACTIVE' && item.active) return false

    return true
  })

  const sorted = [...filtered]
  if (filter.sort === 'updatedAt') {
    sorted.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  } else {
    sorted.sort((a, b) => a.code.localeCompare(b.code))
  }

  return sorted
}
