import { pageScrollLocationAtom, pageScrollDirectionAtom } from '@/store/scrollInfo'
import type { MarkdownHeading } from 'astro'
import clsx from 'clsx'
import { useAtomValue } from 'jotai'
import { startTransition, useEffect, useRef, useState } from 'react'

function useActiveItem() {
  const [activeItem, setActiveItem] = useState('')
  const scrollY = useAtomValue(pageScrollLocationAtom)

  useEffect(() => {
    const $article = document.querySelector('#markdown-wrapper')
    if (!$article) return

    const $headings = Array.from($article.querySelectorAll('h1,h2,h3,h4,h5,h6'))
    if ($headings.length === 0) return

    // Get the absolute positions of headings relative to the document
    const headingPositions = $headings.map((heading) => {
      const rect = heading.getBoundingClientRect()
      return {
        id: heading.id,
        top: rect.top + window.scrollY,
      }
    })

    // Find the active heading based on scroll position
    const currentPosition = window.scrollY + 80 // 80px offset for header
    let activeId = headingPositions[0].id

    for (let i = 0; i < headingPositions.length; i++) {
      const current = headingPositions[i]
      const next = headingPositions[i + 1]

      if (!next) {
        if (currentPosition >= current.top) {
          activeId = current.id
        }
        break
      }

      if (currentPosition >= current.top && currentPosition < next.top) {
        activeId = current.id
        break
      }
    }

    startTransition(() => {
      setActiveItem(activeId)
    })
  }, [scrollY])

  return activeItem
}

export function PostToc({ headings }: { headings: MarkdownHeading[] }) {
  const activeItem = useActiveItem()

  return (
    <ul
      className="relative overflow-y-auto space-y-2 group text-sm"
      style={{
        maxHeight: 'min(380px, calc(100vh - 250px))',
        scrollbarWidth: 'none',
      }}
    >
      {headings.map((item) => (
        <TocItem
          key={item.slug}
          slug={item.slug}
          text={item.text}
          depth={item.depth}
          isActive={item.slug === activeItem}
        />
      ))}
    </ul>
  )
}

export function TocItem({
  slug,
  text,
  depth,
  isActive,
}: {
  slug: string
  text: string
  depth: number
  isActive: boolean
}) {
  const itemRef = useRef<HTMLLIElement>(null)
  const scrollDirection = useAtomValue(pageScrollDirectionAtom)

  useEffect(() => {
    if (!isActive) return
    const $item = itemRef.current
    if (!$item) return
    const $container = $item.parentElement
    if (!$container) return

    const containerHeight = $container.clientHeight
    const itemHeight = $item.clientHeight
    const itemOffsetTop = $item.offsetTop
    const scrollTop = $container.scrollTop

    const itemTop = itemOffsetTop - scrollTop
    const itemBottom = itemTop + itemHeight

    if (itemTop < 0 || itemBottom > containerHeight) {
      if (scrollDirection === 'up') {
        $container.scrollTop = itemOffsetTop - containerHeight + itemHeight
      } else {
        $container.scrollTop = itemOffsetTop
      }
    }
  }, [isActive])

  return (
    <li className="relative" ref={itemRef}>
      <span
        className={clsx(
          'absolute left-0 top-2 h-1 rounded-full',
          isActive ? 'bg-accent' : 'bg-zinc-300 dark:bg-zinc-700',
        )}
        style={{ width: `${4 * (7 - depth)}px` }}
      ></span>
      <a
        className={clsx(
          'inline-block pl-8 transition-opacity duration-300 ease-in-out',
          isActive
            ? 'opacity-100 text-accent font-bold'
            : 'opacity-75 group-hover:opacity-100 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100',
        )}
        href={`#${slug}`}
      >
        <span>{text}</span>
      </a>
    </li>
  )
}
