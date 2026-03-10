import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { site } from '@/config.json'
import { useSetAtom } from 'jotai'
import { modalStackAtom } from '@/store/modalStack'
import { ImageModal } from '@/components/ui/modal/ImageModal'
import React from 'react'
import { generateHash } from '@/utils/strHash'

export interface SayingCard {
  illustration: string
  author: string
  content: string
  source?: string
  date: string
}

interface SayingsGridProps {
  sayings: SayingCard[]
  totalCount: number
  initialCount: number
}

const language = site?.lang || 'en-US'
const ITEMS_PER_PAGE = 6
// 增加缓冲区大小，确保内容能够预加载
const BUFFER_SIZE = 10

function classNames(...classes: (string | undefined | boolean)[]) {
  return classes.filter(Boolean).join(' ')
}

// 滚动节流函数
function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number,
): (...args: Parameters<T>) => void {
  let inThrottle = false
  return function (this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

const processSpoilerContent = (content: string) => {
  const parts = content.split(/(\|\|.*?\|\|)/g)
  const processedParts = parts.map((part, index) => {
    if (part.match(/^\|\|.*\|\|$/)) {
      const spoilerText = part.replace(/^\|\|(.*)\|\|$/, '$1')
      return (
        <span
          key={index}
          className="rounded inline blur-sm hover:blur-none transition-all duration-200"
          title="你知道的太多了"
        >
          {spoilerText}
        </span>
      )
    }
    return part
  })

  return processedParts.map((part, index) =>
    typeof part === 'string'
      ? part.split('\n').map((line, i) => (
          <React.Fragment key={`${index}-${i}`}>
            {line}
            {i < part.split('\n').length - 1 && <br />}
          </React.Fragment>
        ))
      : part,
  )
}

export default function SayingsGrid({ sayings, totalCount, initialCount }: SayingsGridProps) {
  const [displayCount, setDisplayCount] = useState(initialCount)
  const [loading, setLoading] = useState(false)
  const loadingRef = useRef<HTMLDivElement>(null)
  const setModalStack = useSetAtom(modalStackAtom)
  const gridRef = useRef<HTMLDivElement>(null)
  const [targetSaying, setTargetSaying] = useState<SayingCard | null>(null)
  // 使用状态存储可见范围，确保UI能正确更新
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: initialCount + BUFFER_SIZE })
  // 跟踪已加载的图片
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set())
  // 跟踪设备类型
  const [isMobile, setIsMobile] = useState(false)

  // 检测设备类型
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)

    return () => {
      window.removeEventListener('resize', checkMobile)
    }
  }, [])

  // 获取句子的唯一标识符
  const getSayingId = useCallback((saying: SayingCard): string => {
    return generateHash(saying.illustration)
  }, [])

  // 加载更多内容
  const loadMoreItems = useCallback(() => {
    if (!loading && displayCount < sayings.length) {
      setLoading(true)
      // 减少延迟时间，更快地加载内容
      setTimeout(() => {
        setDisplayCount((prev) => Math.min(prev + ITEMS_PER_PAGE, sayings.length))
        setLoading(false)
      }, 50)
    }
  }, [displayCount, loading, sayings.length])

  // 使用 IntersectionObserver 进行预加载
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0]
        if (first.isIntersecting) {
          loadMoreItems()
        }
      },
      {
        threshold: 0.1,
        rootMargin: '300px 0px',
      },
    )

    if (loadingRef.current) {
      observer.observe(loadingRef.current)
    }

    return () => observer.disconnect()
  }, [loadMoreItems])

  // 图片预加载处理 - 预加载更多图片
  useEffect(() => {
    // 预加载当前显示的所有图片，确保内容能够显示
    const preloadImages = () => {
      const start = Math.max(0, visibleRange.start - BUFFER_SIZE)
      const end = Math.min(displayCount, visibleRange.end + BUFFER_SIZE)

      for (let i = start; i < end; i++) {
        if (sayings[i] && !loadedImages.has(sayings[i].illustration)) {
          const img = new Image()
          img.onload = () => {
            setLoadedImages((prev) => new Set(prev).add(sayings[i].illustration))
          }
          img.src = sayings[i].illustration
        }
      }
    }

    preloadImages()
  }, [displayCount, sayings, loadedImages, visibleRange])

  // 优化的可见范围计算函数
  const updateVisibleItems = useCallback(() => {
    // 减少计算频率，但确保足够的响应性
    const throttleRate = isMobile ? 0.7 : 0.9
    if (Math.random() > throttleRate) return

    const viewportTop = window.scrollY
    const viewportBottom = viewportTop + window.innerHeight
    const visibleItems: number[] = []

    // 找出所有可见的项目索引
    document.querySelectorAll('[data-saying-index]').forEach((el) => {
      const rect = el.getBoundingClientRect()
      const elementTop = rect.top + window.scrollY
      const elementBottom = elementTop + rect.height

      // 元素与视口有交叉
      const isVisible = elementBottom > viewportTop - 300 && elementTop < viewportBottom + 300

      if (isVisible) {
        const index = parseInt(el.getAttribute('data-saying-index') || '0', 10)
        visibleItems.push(index)
      }
    })

    if (visibleItems.length > 0) {
      const minVisible = Math.min(...visibleItems)
      const maxVisible = Math.max(...visibleItems)

      // 计算带缓冲区的可见范围，增加缓冲区大小
      const start = Math.max(0, minVisible - BUFFER_SIZE)
      const end = Math.min(sayings.length - 1, maxVisible + BUFFER_SIZE)

      // 更新可见范围状态
      setVisibleRange((prev) => {
        // 只有当范围真正变化较大时才更新
        if (Math.abs(start - prev.start) > 3 || Math.abs(end - prev.end) > 3) {
          return { start, end }
        }
        return prev
      })
    }
  }, [sayings.length, isMobile])

  // 监控可视区域，更新可见项目范围
  useEffect(() => {
    // 使用节流函数减少滚动事件处理频率
    const handleScroll = throttle(
      () => {
        requestAnimationFrame(updateVisibleItems)
      },
      isMobile ? 150 : 100,
    ) // 调整节流间隔

    // 初始化时更新一次
    updateVisibleItems()

    // 添加滚动监听
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [updateVisibleItems, isMobile])

  // 页面加载后检查 URL 中是否包含查询参数，并找到对应的句子
  useEffect(() => {
    // 获取URL查询参数
    const params = new URLSearchParams(window.location.search)
    const sayingId = params.get('saying')

    if (sayingId) {
      // 查找对应的句子
      const targetIndex = sayings.findIndex((saying) => getSayingId(saying) === sayingId)
      if (targetIndex !== -1) {
        setTargetSaying(sayings[targetIndex])

        // 确保显示的句子数量足够
        if (targetIndex >= displayCount) {
          setDisplayCount(targetIndex + 1)
        }

        // 预加载目标句子的图片
        const img = new Image()
        img.onload = () => {
          setLoadedImages((prev) => new Set(prev).add(sayings[targetIndex].illustration))
        }
        img.src = sayings[targetIndex].illustration
      }
    }
  }, [sayings, displayCount, getSayingId])

  const openImageModal = useCallback(
    (saying: SayingCard, e: React.MouseEvent) => {
      e.stopPropagation()
      setModalStack((stack) => [
        ...stack,
        {
          id: `saying-image-${saying.illustration}`,
          content: <ImageModal imageUrl={saying.illustration} author={saying.author} />,
        },
      ])
    },
    [setModalStack],
  )

  // 确定每个项目是否应该渲染完整内容
  // 修改可见性判断逻辑，确保更多内容能够渲染
  const shouldRenderItem = useCallback(
    (index: number) => {
      // 始终渲染前20个项目，确保初始内容加载
      if (index < 20) return true

      // 其他项目根据可见范围渲染
      return index >= visibleRange.start - BUFFER_SIZE && index <= visibleRange.end + BUFFER_SIZE
    },
    [visibleRange],
  )

  // 渲染占位符 - 使用骨架屏而不是空框
  const renderPlaceholder = useCallback(
    (index: number) => (
      <div
        key={`placeholder-${index}`}
        data-saying-index={index}
        className={classNames(
          'relative',
          'bg-white/20 dark:bg-neutral-700/20',
          'rounded-2xl',
          'border border-gray-100 dark:border-gray-700',
          'flex flex-col md:flex-row',
          'max-h-[600px]',
        )}
        style={{
          height: isMobile ? '400px' : '400px',
        }}
      >
        {/* 骨架屏左侧 - 图片区域 */}
        <div className="w-full h-48 md:w-[40%] md:h-full bg-gray-200 dark:bg-gray-700 animate-pulse rounded-t-2xl md:rounded-t-none md:rounded-l-2xl"></div>

        {/* 骨架屏右侧 - 内容区域 */}
        <div className="flex-1 flex flex-col p-4 md:p-6">
          <div className="h-4 w-24 bg-gray-300 dark:bg-gray-600 rounded animate-pulse mb-4"></div>
          <div className="h-4 w-full bg-gray-300 dark:bg-gray-600 rounded animate-pulse mb-2"></div>
          <div className="h-4 w-3/4 bg-gray-300 dark:bg-gray-600 rounded animate-pulse mb-2"></div>
          <div className="h-4 w-5/6 bg-gray-300 dark:bg-gray-600 rounded animate-pulse mb-4"></div>
          <div className="mt-auto h-4 w-32 bg-gray-300 dark:bg-gray-600 rounded animate-pulse self-end"></div>
        </div>
      </div>
    ),
    [isMobile],
  )

  // 渲染完整的项目
  const renderItem = useCallback(
    (saying: SayingCard, index: number, isHighlighted = false) => {
      const isImageLoaded = loadedImages.has(saying.illustration)

      return (
        <div
          key={isHighlighted ? `highlighted-${index}` : `item-${index}`}
          data-saying-index={index}
          id={`saying-${getSayingId(saying)}`}
          className={classNames(
            'relative overflow-hidden',
            'bg-white/80 dark:bg-neutral-700/80 backdrop-blur-sm',
            'rounded-2xl shadow-lg',
            'border border-gray-100 dark:border-gray-700',
            'transform transition-all duration-300 ease-out',
            'hover:shadow-xl hover:bg-white dark:hover:bg-neutral-700',
            'flex flex-col md:flex-row',
            'max-h-[600px] md:h-[400px]',
            isHighlighted ? 'border-neutral-200 dark:border-neutral-700 ring-2 ring-primary' : '',
          )}
        >
          <div className={classNames('w-full h-48 md:w-[40%] md:h-full', 'relative')}>
            <div
              className={classNames(
                'relative overflow-hidden cursor-zoom-in group',
                'w-full h-full',
                'rounded-t-2xl md:rounded-t-none md:rounded-l-2xl',
                // 添加背景色作为图片加载前的占位
                'bg-gray-200 dark:bg-gray-700',
              )}
              onClick={(e) => openImageModal(saying, e)}
            >
              {/* 图片加载前显示骨架屏 */}
              {!isImageLoaded && (
                <div className="absolute inset-0 w-full h-full animate-pulse"></div>
              )}

              <img
                src={saying.illustration}
                alt={`Illustration for saying by ${saying.author}`}
                className={classNames(
                  'absolute inset-0 w-full h-full object-cover',
                  'transition-all duration-500',
                  isImageLoaded ? 'opacity-100 group-hover:scale-105' : 'opacity-0',
                )}
                loading={isHighlighted || index < 10 ? 'eager' : 'lazy'}
                decoding="async"
                fetchPriority={isHighlighted || index < initialCount ? 'high' : 'low'}
                onLoad={() => {
                  if (!loadedImages.has(saying.illustration)) {
                    setLoadedImages((prev) => new Set(prev).add(saying.illustration))
                  }
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          </div>

          <div className="flex-1 flex flex-col min-h-0 md:w-[60%]">
            <div className="px-4 md:px-6 py-3 md:py-4">
              <time
                className="block text-sm text-gray-600 dark:text-gray-400"
                dateTime={saying.date}
              >
                {new Date(saying.date).toLocaleDateString(language, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
            </div>

            <div
              className={classNames(
                'flex-1 overflow-y-auto',
                'px-4 md:px-6',
                'scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600',
                'scrollbar-track-transparent hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-gray-500',
              )}
            >
              <blockquote
                className={classNames(
                  'leading-relaxed whitespace-pre-wrap',
                  'text-base text-gray-800 dark:text-gray-200',
                )}
              >
                {processSpoilerContent(saying.content)}
              </blockquote>
            </div>

            <div
              className={classNames(
                'py-2.5 md:py-3 px-4 md:px-5 border-t border-gray-100 dark:border-gray-700/50',
                'text-right',
                'bg-white/50 dark:bg-neutral-700/50 backdrop-blur-sm',
              )}
            >
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {saying.author}
                {saying.source && (
                  <>
                    <span className="mx-2">-</span>
                    <span className="text-gray-500 dark:text-gray-400/80">{saying.source}</span>
                  </>
                )}
              </span>
            </div>
          </div>
        </div>
      )
    },
    [getSayingId, loadedImages, initialCount, openImageModal, language],
  )

  // 使用useMemo优化渲染列表，减少不必要的重渲染
  const renderList = useMemo(() => {
    return sayings
      .slice(0, displayCount)
      .map((saying: SayingCard, index: number) =>
        shouldRenderItem(index) ? renderItem(saying, index) : renderPlaceholder(index),
      )
  }, [sayings, displayCount, shouldRenderItem, renderItem, renderPlaceholder])

  return (
    <div className="w-full" ref={gridRef}>
      <div className="mt-8 mb-8 text-sm text-muted-foreground">总共收录了 {totalCount} 条句子</div>

      {/* 顶部卡片区域 - 当有目标句子时显示 */}
      {targetSaying && <div className="mb-8">{renderItem(targetSaying, -1, true)}</div>}

      <div className="flex flex-col gap-8">{renderList}</div>

      {displayCount < sayings.length && (
        <div ref={loadingRef} className="h-10 flex items-center justify-center mt-4">
          {loading ? (
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 dark:border-gray-100"></div>
          ) : (
            <div className="h-6 w-6"></div>
          )}
        </div>
      )}
    </div>
  )
}
