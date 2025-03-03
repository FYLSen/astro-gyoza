import { useState, useEffect, useRef } from 'react'
import { site } from '@/config.json'
import { useSetAtom } from 'jotai'
import { modalStackAtom } from '@/store/modalStack'
import { ImageModal } from '@/components/ui/modal/ImageModal'
import Masonry from 'react-masonry-css'

interface SayingCard {
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

function classNames(...classes: (string | undefined | boolean)[]) {
  return classes.filter(Boolean).join(' ')
}

const processSpoilerContent = (content: string) => {
  const parts = content.split(/(\|\|.*?\|\|)/g)
  return parts.map((part, index) => {
    if (part.match(/^\|\|.*\|\|$/)) {
      const spoilerText = part.replace(/^\|\|(.*)\|\|$/, '$1')
      return (
        <span
          key={index}
          className="italic rounded inline blur-sm hover:blur-none transition-all duration-200"
          title="你知道的太多了"
        >
          {spoilerText}
        </span>
      )
    }
    return part
  })
}

const TypewriterText = ({ author, source }: { author: string; source?: string }) => {
  const [text, setText] = useState(author)
  const [isTyping, setIsTyping] = useState(false)

  useEffect(() => {
    if (!source) return

    const typeText = async (newText: string) => {
      setIsTyping(true)
      let currentText = ''

      for (let i = text.length; i >= 0; i--) {
        currentText = text.substring(0, i)
        setText(currentText)
        await new Promise((resolve) => setTimeout(resolve, 90))
      }

      await new Promise((resolve) => setTimeout(resolve, 200))

      for (let i = 0; i <= newText.length; i++) {
        currentText = newText.substring(0, i)
        setText(currentText)
        await new Promise((resolve) => setTimeout(resolve, 100))
      }

      setIsTyping(false)
    }

    let timeoutId: NodeJS.Timeout

    const startTyping = () => {
      const nextText = text === author ? source : author
      if (nextText) {
        typeText(nextText)
      }
    }

    if (!isTyping) {
      timeoutId = setTimeout(startTyping, 4000)
    }

    return () => {
      clearTimeout(timeoutId)
    }
  }, [text, author, source, isTyping])

  return (
    <div className="text-right min-w-[120px]">
      <span
        className={classNames(
          'text-sm relative',
          isTyping
            ? "after:content-['|'] after:ml-0.5 after:animate-[blink_1s_step-end_infinite]"
            : '',
        )}
      >
        {text}
      </span>
    </div>
  )
}

export default function SayingsGrid({ sayings, totalCount, initialCount }: SayingsGridProps) {
  const [displayCount, setDisplayCount] = useState(initialCount)
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const loadingRef = useRef<HTMLDivElement>(null)
  const setModalStack = useSetAtom(modalStackAtom)

  const breakpointColumns = {
    default: 3, // >= 1920px
    1920: 3,
    1536: 2, // 2xl breakpoint
    1280: 2, // xl breakpoint
    768: 2, // md breakpoint
    640: 1, // sm breakpoint
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0]
        if (first.isIntersecting && !loading && displayCount < sayings.length) {
          setLoading(true)
          setTimeout(() => {
            setDisplayCount((prev) => Math.min(prev + ITEMS_PER_PAGE, sayings.length))
            setLoading(false)
          }, 300)
        }
      },
      { threshold: 0.1 },
    )

    if (loadingRef.current) {
      observer.observe(loadingRef.current)
    }

    return () => observer.disconnect()
  }, [displayCount, loading, sayings.length])

  const openImageModal = (saying: SayingCard, e: React.MouseEvent) => {
    e.stopPropagation()
    setModalStack((stack) => [
      ...stack,
      {
        id: `saying-image-${saying.illustration}`,
        content: <ImageModal imageUrl={saying.illustration} author={saying.author} />,
      },
    ])
  }

  return (
    <div className="w-full">
      <div className="mt-8 mb-8 text-sm text-muted-foreground">总共收录了 {totalCount} 条句子</div>

      <Masonry
        breakpointCols={breakpointColumns}
        className="flex -ml-6 w-auto"
        columnClassName="pl-6"
      >
        {sayings.slice(0, displayCount).map((saying: SayingCard, index: number) => {
          const isExpanded = expandedIndex === index

          return (
            <div
              key={index}
              className={classNames(
                'mb-6', // 每个卡片底部间距
                'relative overflow-hidden',
                'bg-white dark:bg-gray-800 rounded-xl shadow-md',
                'transform transition-all duration-300 ease-out',
                'hover:shadow-lg hover:-translate-y-1',
                'will-change-transform motion-reduce:transition-none',
                'dark:bg-opacity-90 dark:backdrop-blur-sm',
              )}
              onClick={() => setExpandedIndex(isExpanded ? null : index)}
            >
              <div
                className="relative w-full aspect-[3/4] overflow-hidden cursor-zoom-in group"
                onClick={(e) => openImageModal(saying, e)}
              >
                <img
                  src={saying.illustration}
                  alt={`Illustration for saying by ${saying.author}`}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              <div className="p-5 flex flex-col gap-4">
                <blockquote
                  className={classNames(
                    'leading-relaxed italic',
                    'transition-all duration-300',
                    isExpanded ? 'text-lg' : 'text-base',
                    'text-gray-900 dark:text-gray-100',
                  )}
                >
                  {processSpoilerContent(saying.content)}
                </blockquote>

                <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
                  <time className="text-sm text-gray-500 dark:text-gray-400" dateTime={saying.date}>
                    {new Date(saying.date).toLocaleDateString(language, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </time>
                  <TypewriterText author={saying.author} source={saying.source} />
                </div>
              </div>
            </div>
          )
        })}
      </Masonry>

      {displayCount < sayings.length && (
        <div
          ref={loadingRef}
          className={classNames(
            'w-full py-8 flex justify-center items-center',
            'transition-opacity duration-300',
            loading ? 'opacity-100' : 'opacity-0',
          )}
        >
          <div
            className={classNames(
              'h-8 w-8 rounded-full',
              'border-2 border-gray-300 dark:border-gray-600',
              'border-t-gray-900 dark:border-t-gray-300',
              'animate-spin',
            )}
          />
        </div>
      )}
    </div>
  )
}
