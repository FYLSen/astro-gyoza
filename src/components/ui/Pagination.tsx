import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'

interface PaginationProps {
  current: number
  total: number
  getPageUrl: (page: number) => string
  onChange?: (page: number) => void
}

interface PaginationItem {
  type: 'page' | 'ellipsis' | 'nav'
  page?: number
  icon?: 'ChevronLeft' | 'ChevronRight'
  label?: string
}

export default function Pagination({ current, total, getPageUrl, onChange }: PaginationProps) {
  // 如果总页数小于等于1，不显示分页
  if (total <= 1) return null

  // 确保当前页在有效范围内
  const validCurrent = Math.max(1, Math.min(current, total))

  // 处理页码点击
  const handlePageClick = (page: number, e: React.MouseEvent) => {
    if (onChange && page !== validCurrent) {
      e.preventDefault()
      onChange(page)
    }
  }

  // 生成分页项
  const generatePaginationItems = (): PaginationItem[] => {
    const items: PaginationItem[] = []

    // 添加"上一页"按钮
    if (validCurrent > 1) {
      items.push({
        type: 'nav',
        page: validCurrent - 1,
        icon: 'ChevronLeft',
        label: '上一页',
      })
    }

    // 确定要显示的页码
    const visiblePages = new Set<number>()

    // 始终显示第一页、最后一页和当前页
    visiblePages.add(1)
    visiblePages.add(total)
    visiblePages.add(validCurrent)

    // 显示当前页的前后一页
    if (validCurrent - 1 > 1) visiblePages.add(validCurrent - 1)
    if (validCurrent + 1 < total) visiblePages.add(validCurrent + 1)

    // 排序页码并添加省略号
    const sortedPages = Array.from(visiblePages).sort((a, b) => a - b)

    sortedPages.forEach((page, index) => {
      if (index > 0 && page - sortedPages[index - 1] > 1) {
        items.push({ type: 'ellipsis' })
      }
      items.push({ type: 'page', page })
    })

    // 添加"下一页"按钮
    if (validCurrent < total) {
      items.push({
        type: 'nav',
        page: validCurrent + 1,
        icon: 'ChevronRight',
        label: '下一页',
      })
    }

    return items
  }

  const paginationItems = generatePaginationItems()

  // 样式定义
  const pageButtonStyles =
    'size-8 rounded-lg flex items-center justify-center transition-colors duration-200 select-none'
  const navButtonStyles =
    'size-6 rounded-full flex items-center justify-center transition-colors duration-200 select-none'
  const hoverStyles = 'hover:bg-teal-600/20 dark:bg-teal-400/20'
  const currentPageStyles = 'text-white bg-teal-600 dark:bg-teal-400 dark:text-black'

  return (
    <div className="mt-12 flex items-center justify-center gap-2">
      {paginationItems.map((item, index) => {
        if (item.type === 'nav') {
          return (
            <a
              key={`nav-${index}-${item.page}`}
              className={`${navButtonStyles} ${hoverStyles}`}
              href={getPageUrl(item.page!)}
              aria-label={item.label}
              onClick={(e) => handlePageClick(item.page!, e)}
            >
              {item.icon === 'ChevronLeft' ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
            </a>
          )
        }

        if (item.type === 'ellipsis') {
          return (
            <span key={`ellipsis-${index}`} className={`${pageButtonStyles} cursor-default`}>
              <MoreHorizontal size={16} />
            </span>
          )
        }

        return (
          <a
            key={`page-${item.page}`}
            href={item.page === validCurrent ? undefined : getPageUrl(item.page!)}
            className={`${pageButtonStyles} ${
              item.page === validCurrent
                ? `${currentPageStyles} cursor-default`
                : `${hoverStyles} cursor-pointer`
            }`}
            onClick={item.page !== validCurrent ? (e) => handlePageClick(item.page!, e) : undefined}
          >
            {item.page}
          </a>
        )
      })}
    </div>
  )
}
