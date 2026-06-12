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

  switch (filter.sort) {
    case 'name,asc':
      sorted.sort((a, b) => a.name.localeCompare(b.name, 'ko'))
      break
    case 'name,desc':
      sorted.sort((a, b) => b.name.localeCompare(a.name, 'ko'))
      break
    case 'sku,asc':
      sorted.sort((a, b) => a.code.localeCompare(b.code))
      break
    case 'sku,desc':
      sorted.sort((a, b) => b.code.localeCompare(a.code))
      break
    case 'updatedAt,asc':
      sorted.sort((a, b) => a.updatedAt.localeCompare(b.updatedAt))
      break
    case 'updatedAt,desc':
      sorted.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      break
  }

  return sorted
}
