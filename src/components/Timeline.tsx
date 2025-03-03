import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, Pin, ChevronUp, ChevronDown } from 'lucide-react'

interface Post {
  slug: string
  title: string
  date: string
  month: number
  password?: boolean
  sticky?: number
}

interface YearGroup {
  year: number
  months: number[]
  posts: Post[]
}

interface TimelineProps {
  groupedPosts: YearGroup[]
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const Timeline: React.FC<TimelineProps> = ({ groupedPosts }) => {
  const [activeYear, setActiveYear] = useState<number>(
    groupedPosts[0]?.year || new Date().getFullYear(),
  )
  const [activeMonth, setActiveMonth] = useState<number | null>(null)
  const postsContainerRef = useRef<HTMLDivElement>(null)
  const monthRefs = useRef<Map<string, HTMLLIElement>>(new Map())
  const navRef = useRef<HTMLDivElement>(null)
  const [showScrollButtons, setShowScrollButtons] = useState(false)

  // 监听滚动更新当前月份
  useEffect(() => {
    const handleScroll = () => {
      if (!postsContainerRef.current) return

      const viewportMiddle = window.innerHeight / 2
      let closestElement: { month: number; distance: number } | null = null

      monthRefs.current.forEach((element, key) => {
        const [year, month] = key.split('-').map(Number)
        if (year === activeYear) {
          const rect = element.getBoundingClientRect()
          const distance = Math.abs(rect.top + rect.height / 2 - viewportMiddle)

          if (!closestElement || distance < closestElement.distance) {
            closestElement = { month, distance }
          }
        }
      })

      if (
        closestElement &&
        (closestElement as { month: number; distance: number }).month !== activeMonth
      ) {
        setActiveMonth((closestElement as { month: number; distance: number }).month)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => window.removeEventListener('scroll', handleScroll)
  }, [activeYear, activeMonth])

  // 检查是否需要显示滚动按钮
  React.useEffect(() => {
    const checkScroll = () => {
      if (navRef.current) {
        const { scrollHeight, clientHeight } = navRef.current
        setShowScrollButtons(scrollHeight > clientHeight)
      }
    }

    checkScroll()
    window.addEventListener('resize', checkScroll)
    return () => window.removeEventListener('resize', checkScroll)
  }, [])

  // 滚动控制
  const handleScroll = (direction: 'up' | 'down') => {
    if (navRef.current) {
      const scrollAmount = direction === 'up' ? -200 : 200
      navRef.current.scrollBy({
        top: scrollAmount,
        behavior: 'smooth',
      })
    }
  }

  // 滚动到指定月份的文章
  const scrollToMonth = (year: number, month: number) => {
    const key = `${year}-${month}`
    const element = monthRefs.current.get(key)
    if (element) {
      const container = postsContainerRef.current
      if (container) {
        const elementTop = element.offsetTop
        const containerTop = container.offsetTop
        const offset = elementTop - containerTop - 20 // 20px 的额外偏移
        window.scrollTo({
          top: offset,
          behavior: 'smooth',
        })
      }
    }
  }

  return (
    <section className="relative w-full min-h-[50vh] max-w-6xl mx-auto">
      {/* 年份导航 */}
      <div
        className="sticky top-0 md:fixed md:top-24 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-10 
          w-full md:w-32
          py-4 md:py-0 border-b md:border-b-0 border-gray-200/50 dark:border-gray-700/50
          md:right-[max(2rem,calc((100vw-72rem)/2+2rem))]"
      >
        {/* 桌面端滚动按钮 */}
        {showScrollButtons && (
          <div className="hidden md:flex md:flex-col md:absolute md:-left-6 md:top-1/2 md:-translate-y-1/2 md:gap-2 md:z-20">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleScroll('up')}
              className="p-1 rounded-full bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shadow-sm"
            >
              <ChevronUp size={16} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleScroll('down')}
              className="p-1 rounded-full bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shadow-sm"
            >
              <ChevronDown size={16} />
            </motion.button>
          </div>
        )}

        {/* 年份列表 */}
        <nav
          ref={navRef}
          className="relative flex flex-row md:flex-col gap-2 
            overflow-x-auto overflow-y-hidden md:overflow-y-auto md:overflow-x-hidden
            px-4 md:px-0 md:pr-2 md:border-l md:border-gray-200/50 dark:md:border-gray-700/50
            scrollbar-none hover:scrollbar-none
            snap-x md:snap-y snap-mandatory
            md:pl-3 md:max-h-[calc(100vh-12rem)]"
        >
          {groupedPosts.map(({ year, months }) => (
            <div key={year} className="flex flex-col gap-2 snap-center min-w-fit">
              <button
                onClick={() => {
                  setActiveYear(year)
                  setActiveMonth(null)
                }}
                className={`group flex items-center gap-1 transition-all duration-300 md:pl-2 ${
                  activeYear === year
                    ? 'text-accent'
                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <div
                  className={`hidden md:block w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                    activeYear === year
                      ? 'bg-accent scale-125'
                      : 'bg-gray-300 dark:bg-gray-600 group-hover:scale-110'
                  }`}
                />
                <span className="text-base font-medium whitespace-nowrap">{year}</span>
              </button>

              {/* 月份列表 - 只在 md 及以上屏幕显示 */}
              <AnimatePresence>
                {activeYear === year && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="hidden md:flex md:flex-col gap-1 md:pl-8 overflow-hidden"
                  >
                    {months.map((month) => (
                      <motion.button
                        key={month}
                        onClick={() => {
                          setActiveMonth(month)
                          scrollToMonth(year, month)
                        }}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className={`text-sm w-full text-left transition-colors duration-300 hover:text-accent ${
                          activeMonth === month ? 'text-accent' : 'text-gray-500 dark:text-gray-400'
                        }`}
                      >
                        {MONTHS[month]}
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </nav>
      </div>

      {/* 文章列表 */}
      <div ref={postsContainerRef} className="w-full relative mt-4 md:mt-0">
        <AnimatePresence mode="wait">
          {groupedPosts
            .filter((group) => group.year === activeYear)
            .map(({ year, posts }) => (
              <motion.div
                key={year}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="relative pt-10 ml-8"
              >
                <h3
                  className="absolute -top-3 -left-8 text-[7rem] text-transparent leading-none font-bold pointer-events-none select-none font-['Atkinson']"
                  style={{ WebkitTextStroke: '2px rgb(var(--color-text-primary) / 0.1)' }}
                >
                  {year}
                </h3>
                <ul className="space-y-6 list-none">
                  {posts.map((post, index) => (
                    <motion.li
                      key={post.slug}
                      ref={(el) => {
                        if (el) monthRefs.current.set(`${year}-${post.month}`, el)
                      }}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="group relative flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 hover:text-accent transition-colors duration-300"
                    >
                      <span className="text-sm text-gray-500 dark:text-gray-400 font-mono shrink-0">
                        {post.date}
                      </span>
                      <a
                        href={`/posts/${post.slug}`}
                        className="text-base group-hover:text-accent transition-colors duration-300"
                      >
                        {post.title}
                        <span className="inline-flex gap-1.5 ml-2 items-center">
                          {post.password && (
                            <motion.span
                              whileHover={{ scale: 1.2, rotate: 15 }}
                              whileTap={{ scale: 0.9 }}
                              className="text-accent transition-transform duration-300 hover:rotate-12"
                            >
                              <Lock size={14} />
                            </motion.span>
                          )}
                          {post.sticky && post.sticky > 0 && (
                            <motion.span
                              whileHover={{ scale: 1.2, rotate: -30 }}
                              whileTap={{ scale: 0.9 }}
                              className="text-accent transition-transform duration-300 rotate-45 hover:-rotate-45"
                            >
                              <Pin size={14} />
                            </motion.span>
                          )}
                        </span>
                      </a>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            ))}
        </AnimatePresence>
      </div>
    </section>
  )
}

export default Timeline
