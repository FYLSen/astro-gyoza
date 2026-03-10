import { motion, useAnimation, AnimatePresence } from 'framer-motion'
import { useState, useRef, useEffect } from 'react'
import { Search, X } from 'lucide-react'

export function SearchButton() {
    const [isExpanded, setIsExpanded] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const controls = useAnimation()
    const searchButtonRef = useRef<HTMLButtonElement>(null)
    const searchInputRef = useRef<HTMLInputElement>(null)
    const searchFormRef = useRef<HTMLFormElement>(null)
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const checkScreenSize = () => {
            setIsMobile(window.innerWidth <= 768)
        }

        // 初始检查
        checkScreenSize()

        // 监听窗口大小变化
        window.addEventListener('resize', checkScreenSize)

        return () => {
            window.removeEventListener('resize', checkScreenSize)
        }
    }, [])

    const toggleSearch = () => {
        if (!isExpanded) {
            setSearchQuery('')
        }
        setIsExpanded(!isExpanded)
    }

    const handleSearch = (e: React.SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
        e.preventDefault()
        if (searchQuery.trim()) {
            const tempLink = document.createElement('a')
            tempLink.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`
            tempLink.style.display = 'none'
            document.body.appendChild(tempLink)
            tempLink.click()
            setTimeout(() => {
                document.body.removeChild(tempLink)
            }, 100)
            setIsExpanded(false)
        }
    }

    // 当搜索框展开时，自动聚焦搜索输入框
    useEffect(() => {
        if (isExpanded && searchInputRef.current) {
            setTimeout(() => {
                searchInputRef.current?.focus()
            }, 300)
        }
    }, [isExpanded])

    // 处理ESC键关闭搜索框
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isExpanded) {
                setIsExpanded(false)
            }
        }

        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [isExpanded])

    // 点击外部区域关闭搜索框
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                isExpanded &&
                searchFormRef.current &&
                searchButtonRef.current &&
                !searchFormRef.current.contains(e.target as Node) &&
                !searchButtonRef.current.contains(e.target as Node)
            ) {
                setIsExpanded(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [isExpanded])

    return (
        <div className="flex items-center justify-center h-full w-full">
            <AnimatePresence>
                {isExpanded && (
                    <motion.form
                        ref={searchFormRef}
                        className="absolute h-9 z-20 overflow-hidden rounded-[18px] right-11 w-[calc(100vw-120px)] md:w-auto"
                        initial={{ width: 0, opacity: 0, scale: 0.5 }}
                        animate={{
                            width: isMobile ? 'calc(100vw - 120px)' : 240,
                            opacity: 1,
                            scale: 1,
                        }}
                        exit={{ width: 0, opacity: 0, scale: 0.5 }}
                        transition={{
                            duration: 0.3,
                            ease: 'easeInOut',
                            opacity: { duration: 0.2 },
                        }}
                        onSubmit={handleSearch}
                        style={{
                            backgroundColor: isMobile ? 'rgba(var(--color-bg-primary),0.95)' : 'transparent',
                            backdropFilter: isMobile ? 'blur(8px)' : 'none',
                        }}
                    >
                        <div className="relative w-full h-full flex">
                            <input
                                ref={searchInputRef}
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="搜索..."
                                className="w-full h-full py-2 px-4 pr-10 rounded-[18px] 
                md:border-0 border border-neutral-200 dark:border-neutral-700 
                bg-transparent text-neutral-900 dark:text-neutral-100 text-sm outline-none transition-all duration-200 
                
                md:bg-gradient-to-b md:from-white/95 md:to-zinc-100/95 
                md:dark:from-zinc-800 md:dark:to-zinc-900
                
                md:shadow-[inset_0_1px_3px_rgba(0,0,0,0.2)] 
                dark:md:shadow-[inset_0_1px_3px_rgba(0,0,0,0.4)]
                
                shadow-sm dark:border-neutral-200 dark:border-neutral-700 
                focus:border-teal-600 dark:border-teal-400 
                md:focus:shadow-[inset_0_1px_3px_rgba(0,0,0,0.2),0_0_0_2px_rgba(var(--color-accent),0.3)] 
                focus:shadow-[0_0_0_2px_rgba(var(--color-accent),0.2)]
                
                md:backdrop-blur-md"
                            />
                            <div className="absolute right-0 inset-y-0 pr-2 flex items-center">
                                <button
                                    type="submit"
                                    className="flex items-center justify-center bg-transparent border-none text-neutral-500 dark:text-neutral-400 p-1 rounded-full transition-all duration-200 hover:text-teal-600 dark:text-teal-400 hover:bg-teal-600/10 dark:hover:bg-teal-400/10 cursor-pointer"
                                    aria-label="Searching"
                                >
                                    <Search size={16} className="flex-shrink-0" />
                                </button>
                            </div>
                        </div>
                    </motion.form>
                )}
            </AnimatePresence>

            <motion.button
                ref={searchButtonRef}
                className="w-9 h-9 rounded-full flex items-center justify-center text-teal-600 dark:text-teal-400 transition-all duration-200 overflow-hidden z-30 cursor-pointer
        bg-gradient-to-b from-white/95 to-zinc-100/95 dark:from-zinc-800 dark:to-zinc-900
        shadow-lg shadow-zinc-800/10 ring-1 ring-zinc-900/10 dark:ring-zinc-100/20
        hover:shadow-md hover:ring-zinc-900/20 dark:hover:ring-zinc-100/30"
                animate={{
                    width: isExpanded ? '20px' : '36px',
                    height: isExpanded ? '20px' : '36px',
                    scale: isExpanded ? 0.8 : 1,
                }}
                transition={{
                    duration: 0.3,
                    scale: { type: 'spring', stiffness: 300, damping: 25 },
                }}
                type="button"
                aria-label={isExpanded ? 'Close' : 'Search'}
                onClick={toggleSearch}
                onMouseEnter={() => !isExpanded && controls.start('animate')}
                onMouseLeave={() => !isExpanded && controls.start('normal')}
            >
                <motion.div
                    className="flex items-center justify-center w-full h-full"
                    variants={{
                        normal: { scale: 1 },
                        animate: {
                            scale: [1, 1.2, 0.9, 1],
                        },
                    }}
                    transition={{
                        duration: 0.6,
                        ease: 'easeInOut',
                    }}
                    animate={controls}
                >
                    {isExpanded ? (
                        <motion.div
                            className="flex items-center justify-center w-full h-full"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <X size={12} className="flex-shrink-0" />
                        </motion.div>
                    ) : (
                        <motion.div
                            className="flex items-center justify-center w-full h-full"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Search size={20} className="flex-shrink-0" />
                        </motion.div>
                    )}
                </motion.div>
            </motion.button>
        </div>
    )
}
