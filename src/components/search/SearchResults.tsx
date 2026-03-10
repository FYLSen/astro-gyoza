import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
    Search,
    Loader,
    ChevronRight,
    Image,
    Camera,
    MessageSquare,
    User,
    ScrollText,
    FileText,
    FolderOpen,
} from 'lucide-react'
import Pagination from '@/components/ui/Pagination'
import docSearch from '@/config.json'

const HITS_PER_PAGE = 10

interface SearchResult {
    objectID: string
    url: string
    url_without_anchor?: string
    anchor?: string
    content?: string | null
    type?: string
    hierarchy?: {
        lvl0?: string | null
        lvl1?: string | null
        lvl2?: string | null
        lvl3?: string | null
        lvl4?: string | null
        lvl5?: string | null
        lvl6?: string | null
    }
    title?: string
    name?: string
    _snippetResult?: {
        content?: {
            value: string
        }
        hierarchy?: {
            lvl0?: { value: string }
            lvl1?: { value: string }
            lvl2?: { value: string }
            lvl3?: { value: string }
            lvl4?: { value: string }
            lvl5?: { value: string }
            lvl6?: { value: string }
        }
    }
    _highlightResult?: {
        hierarchy?: {
            lvl0?: { value: string; matchLevel: string; matchedWords: string[] }
            lvl1?: { value: string; matchLevel: string; matchedWords: string[] }
            lvl2?: { value: string; matchLevel: string; matchedWords: string[] }
            lvl3?: { value: string; matchLevel: string; matchedWords: string[] }
            lvl4?: { value: string; matchLevel: string; matchedWords: string[] }
            lvl5?: { value: string; matchLevel: string; matchedWords: string[] }
            lvl6?: { value: string; matchLevel: string; matchedWords: string[] }
        }
    }
    // 添加特定内容类型的字段
    contentType?: string
    category?: string
    photoUrl?: string
    sayingPreview?: string
}

interface SearchResultsProps {
    onPageChange?: (page: number) => void
}

export default function SearchResults({ onPageChange }: SearchResultsProps = {}) {
    // 从客户端获取参数
    const [query, setQuery] = useState('')
    const [searchInput, setSearchInput] = useState('')
    const [currentPage, setCurrentPage] = useState(1)

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [results, setResults] = useState<SearchResult[]>([])
    const [totalHits, setTotalHits] = useState(0)
    const [totalPages, setTotalPages] = useState(0)
    const [searchTime, setSearchTime] = useState(0)

    // 获取主标题
    const getMainTitle = (result: SearchResult) => {
        if (!result?.hierarchy) return '未知标题'

        // 获取最高级别的非空标题
        for (let i = 0; i <= 6; i++) {
            const level = `lvl${i}` as keyof typeof result.hierarchy
            if (result.hierarchy[level]) {
                // 清理标题中可能包含的站点名称
                let title = result.hierarchy[level] || ''
                title = title.split(' - ')[0]
                return title
            }
        }

        return result.title || result.name || '未知标题'
    }

    // 获取高亮的主标题
    const getHighlightedMainTitle = (result: SearchResult) => {
        if (!result?._highlightResult?.hierarchy) return getMainTitle(result)

        // 获取最高级别的非空高亮标题
        for (let i = 0; i <= 6; i++) {
            const level = `lvl${i}` as keyof typeof result._highlightResult.hierarchy
            if (result._highlightResult.hierarchy[level]?.value) {
                let title = result._highlightResult.hierarchy[level]?.value || ''
                title = title.split(' - ')[0]
                return title
            }
        }

        return getMainTitle(result)
    }

    // 获取层级路径信息
    const getHierarchyPath = (result: SearchResult) => {
        if (!result?.hierarchy) return []

        const path = []
        let maxLevel = 0

        // 确定结果的最大层级
        if (result.type) {
            const typeMatch = result.type.match(/lvl(\d+)/)
            if (typeMatch) {
                maxLevel = parseInt(typeMatch[1])
            }
        }

        // 收集所有非空的层级信息
        for (let i = 0; i <= Math.max(6, maxLevel); i++) {
            const level = `lvl${i}` as keyof typeof result.hierarchy
            if (result.hierarchy[level]) {
                path.push({
                    level: i,
                    title: result.hierarchy[level] || '',
                    highlighted:
                        result._highlightResult?.hierarchy?.[level]?.value || result.hierarchy[level] || '',
                })
            }
        }

        return path
    }

    // 安全地处理HTML内容，保留高亮标签
    const stripHtml = (html: string) => {
        if (!html) return ''
        try {
            // 处理高亮标记，保留 <em> 和 <mark> 标签
            return html.replace(/<(?!\/?(?:em|mark|span)(?:\s+[^>]*)?)>[^>]+>/g, '')
        } catch (e) {
            console.error('stripHtml 错误:', e)
            return html
        }
    }

    // 将URL转换为相对URL
    const getRelativeUrl = (url: string) => {
        try {
            // 如果URL不是以http或https开头，可能已经是相对URL
            if (!url.match(/^https?:\/\//i)) {
                return url
            }

            const urlObj = new URL(url)

            // 直接返回路径部分（包括查询参数和哈希）
            return `${urlObj.pathname}${urlObj.search}${urlObj.hash}`
        } catch (e) {
            console.error('URL转换错误:', e)
            // 如果解析失败，返回原始URL
            return url
        }
    }

    // 获取页面URL
    const getPageUrl = (page: number) => {
        const params = new URLSearchParams(window.location.search)
        params.set('page', page.toString())
        return `${window.location.pathname}?${params.toString()}`
    }

    // 获取结果类型图标 - 优化后的版本
    const getResultTypeIcon = (result: SearchResult) => {
        // 首先检查 hierarchy.lvl0 值或 contentType 值
        const category = result.hierarchy?.lvl0?.toLowerCase() || ''
        const contentType = result.contentType?.toLowerCase() || ''

        // 基于内容类型返回特定图标
        if (category === 'post' || contentType === 'post') {
            return <FileText className="flex-shrink-0" size={16} />
        } else if (category === 'gallery' || contentType === 'gallery') {
            return <Image className="flex-shrink-0" size={16} />
        } else if (category === 'photo' || contentType === 'photo') {
            return <Camera className="flex-shrink-0" size={16} />
        } else if (category === 'saying' || contentType === 'saying') {
            return <MessageSquare className="flex-shrink-0" size={16} />
        } else if (category === 'about') {
            return <User className="flex-shrink-0" size={16} />
        } else if (category === 'page' || contentType === 'page') {
            return <ScrollText className="flex-shrink-0" size={16} />
        }

        // 默认使用 FileText 图标
        return <FileText className="flex-shrink-0" size={16} />
    }

    // 获取结果类型的CSS类名
    const getResultTypeClass = (result: SearchResult) => {
        const category = result.hierarchy?.lvl0?.toLowerCase() || ''
        const contentType = result.contentType?.toLowerCase() || ''

        if (category === 'post' || contentType === 'post') {
            return 'post-result'
        } else if (category === 'gallery' || contentType === 'gallery') {
            return 'gallery-result'
        } else if (category === 'photo' || contentType === 'photo') {
            return 'photo-result'
        } else if (category === 'saying' || contentType === 'saying') {
            return 'saying-result'
        } else if (category === 'page' || contentType === 'page') {
            return 'page-result'
        } else if (category === 'about') {
            return 'about-result'
        }

        return ''
    }

    // 获取结果类型标签的样式
    const getResultTypeBadgeStyle = (result: SearchResult) => {
        const category = result.hierarchy?.lvl0?.toLowerCase() || ''
        const contentType = result.contentType?.toLowerCase() || ''

        if (category === 'post' || contentType === 'post') {
            return 'bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-300'
        } else if (category === 'gallery' || contentType === 'gallery') {
            return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-800/30 dark:text-indigo-300'
        } else if (category === 'photo' || contentType === 'photo') {
            return 'bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-300'
        } else if (category === 'saying' || contentType === 'saying') {
            return 'bg-purple-100 text-purple-800 dark:bg-purple-800/30 dark:text-purple-300'
        } else if (category === 'about') {
            return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-300'
        } else if (category === 'page' || contentType === 'page') {
            return 'bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-300'
        }

        return 'bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-300'
    }

    // 处理URL参数
    const handleSearch = () => {
        if (typeof window === 'undefined') return

        const urlParams = new URLSearchParams(window.location.search)
        const urlQuery = urlParams.get('q') || ''
        const urlPage = parseInt(urlParams.get('page') || '1')

        setQuery(urlQuery)
        setSearchInput(urlQuery)
        setCurrentPage(urlPage)

        document.title = urlQuery ? `搜索: ${urlQuery} - 第 ${urlPage} 页` : '搜索'
    }

    // 处理搜索提交
    const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
        e.preventDefault()

        if (!searchInput.trim()) return

        // 更新URL并触发搜索
        const params = new URLSearchParams(window.location.search)
        params.set('q', searchInput.trim())
        params.set('page', '1') // 重置到第一页

        const newUrl = `${window.location.pathname}?${params.toString()}`
        window.history.pushState({}, '', newUrl)

        setQuery(searchInput.trim())
        setCurrentPage(1)

        document.title = `搜索: ${searchInput.trim()} - 第 1 页`
    }

    // 监听客户端参数事件
    useEffect(() => {
        handleSearch()

        // 监听历史记录变化
        window.addEventListener('popstate', handleSearch)

        return () => {
            window.removeEventListener('popstate', handleSearch)
        }
    }, [])

    // 搜索结果获取
    useEffect(() => {
        if (!query) {
            setLoading(false)
            setResults([])
            return
        }

        const fetchResults = async () => {
            setLoading(true)
            setError('')

            const startTime = performance.now()

            try {
                const { appId, apiKey, indexName } = docSearch.docSearch || {}

                if (!appId || !apiKey || !indexName) {
                    throw new Error('搜索配置不完整')
                }

                const url = `https://${appId}-dsn.algolia.net/1/indexes/${indexName}/query`

                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'X-Algolia-API-Key': apiKey,
                        'X-Algolia-Application-Id': appId,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        query,
                        page: currentPage - 1,
                        hitsPerPage: HITS_PER_PAGE,
                        attributesToHighlight: ['title', 'content', 'hierarchy'],
                        attributesToSnippet: ['title:50', 'content:100', 'hierarchy:50'],
                        distinct: 1,
                        highlightPreTag: '<mark class="search-highlight">',
                        highlightPostTag: '</mark>',
                    }),
                })

                if (!response.ok) {
                    throw new Error(`搜索请求失败: ${response.status}`)
                }

                const data = await response.json()

                setResults(data.hits || [])
                setTotalHits(data.nbHits || 0)
                setTotalPages(Math.ceil((data.nbHits || 0) / HITS_PER_PAGE))

                setSearchTime((performance.now() - startTime) / 1000)
            } catch (err: any) {
                console.error('搜索错误:', err)
                setError(`搜索过程中出现错误: ${err.message}`)
                setResults([])
            } finally {
                setLoading(false)
            }
        }

        fetchResults()
    }, [query, currentPage])

    return (
        <div className="min-h-[400px] w-full">
            {/* 搜索框 */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-8 w-full max-w-3xl mx-auto"
            >
                <form onSubmit={handleSubmit} className="relative">
                    <motion.div whileHover={{ scale: 1.01 }} className="relative flex items-center group">
                        {/* 搜索图标 */}
                        <div className="absolute left-3.5 sm:left-4 text-neutral-500/70 dark:text-neutral-400/70 group-hover:text-teal-600 dark:text-teal-400 dark:text-neutral-500/60 dark:text-neutral-400/60 dark:group-hover:text-teal-600/90 dark:text-teal-400/90 transition-colors duration-200 hidden sm:block">
                            <Search size={16} strokeWidth={2} />
                        </div>

                        {/* 输入框 */}
                        <input
                            type="text"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="输入关键词搜索..."
                            className="w-full h-10 sm:h-11 pl-10 sm:pl-12 pr-20 sm:pr-24 rounded-full border border-neutral-200 dark:border-neutral-700 dark:border-neutral-200/40 dark:border-neutral-700/40 bg-white/90 dark:bg-neutral-800 text-gray-900 dark:text-gray-100 placeholder:text-neutral-500/60 dark:text-neutral-400/60 dark:placeholder:text-neutral-500/50 dark:text-neutral-400/50 focus:outline-none focus:ring-2 focus:ring-teal-600/30 dark:ring-teal-400/30 dark:focus:ring-teal-600/30 dark:ring-teal-400/30 focus:border-teal-600 dark:border-teal-400 hover:border-teal-600/60 dark:border-teal-400/60 dark:hover:border-teal-600/50 dark:border-teal-400/50 shadow-sm hover:shadow-md transition-all duration-200"
                        />

                        {/* 搜索按钮 */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            type="submit"
                            className="absolute right-1.5 sm:right-2 h-7 sm:h-8 bg-teal-600 dark:bg-teal-400 hover:bg-teal-600/90 dark:bg-teal-400/90 active:bg-teal-600/80 dark:bg-teal-400/80 text-white dark:text-black text-sm px-3 sm:px-4 rounded-full transition-colors duration-200 shadow-sm flex items-center justify-center"
                        >
                            <span className="hidden sm:inline">搜索</span>
                            <Search size={15} className="sm:hidden" />
                        </motion.button>
                    </motion.div>
                </form>
            </motion.div>

            {/* 加载状态 */}
            {loading && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-20"
                >
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                        className="mb-4 text-teal-600 dark:text-teal-400"
                    >
                        <Loader size={30} />
                    </motion.div>
                    <p className="text-neutral-500 dark:text-neutral-400 font-medium">正在搜索...</p>
                </motion.div>
            )}

            {/* 错误提示 */}
            {!loading && error && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 py-10 text-center"
                >
                    <p>{error}</p>
                </motion.div>
            )}

            {/* 搜索结果 */}
            {!loading && !error && results.length > 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    <motion.p
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-sm text-neutral-500 dark:text-neutral-400 mb-4 md:mb-6"
                    >
                        共找到与 "<span className="font-medium text-teal-600 dark:text-teal-400">{query}</span>"
                        相关内容{' '}
                        <span className="font-medium text-teal-600 dark:text-teal-400">{totalHits}</span>{' '}
                        条，用时 <span className="font-medium">{searchTime.toFixed(2)}</span> 秒。
                    </motion.p>

                    <div className="space-y-4 md:space-y-6">
                        {results.map((result, index) => {
                            const relativeUrl = getRelativeUrl(result.url)
                            const hierarchyPath = getHierarchyPath(result)
                            const resultIcon = getResultTypeIcon(result)
                            const resultTypeClass = getResultTypeClass(result)
                            const resultTypeBadgeStyle = getResultTypeBadgeStyle(result)
                            const currentLevelTitle =
                                hierarchyPath.length > 0
                                    ? hierarchyPath[hierarchyPath.length - 1].highlighted
                                    : getHighlightedMainTitle(result)
                            const category = result.hierarchy?.lvl0?.toLowerCase() || ''
                            const contentType = result.contentType?.toLowerCase() || ''
                            const isPhoto = category === 'photo' || contentType === 'photo'
                            const isSaying = category === 'saying' || contentType === 'saying'
                            const isPost = category === 'post' || contentType === 'post'

                            return (
                                <motion.div
                                    key={result.objectID}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                    className={`search-result-item ${resultTypeClass}`}
                                >
                                    <motion.a
                                        whileHover={{
                                            scale: 1.01,
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                                        }}
                                        href={relativeUrl}
                                        className="block p-5 md:p-6 rounded-xl border border-neutral-200/50 dark:border-neutral-700/50 dark:border-neutral-200/20 dark:border-neutral-700/20 bg-white dark:bg-neutral-800/80 hover:bg-neutral-100 dark:bg-neutral-800/30 dark:hover:bg-neutral-700/50 transition-all duration-200 shadow-sm hover:shadow-md relative"
                                    >
                                        {/* 类型标签 */}
                                        <div className="absolute top-3 right-3">
                                            <span
                                                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${resultTypeBadgeStyle}`}
                                            >
                                                {result.hierarchy?.lvl0 || result.contentType || '页面'}
                                            </span>
                                        </div>

                                        {/* 层级路径导航 */}
                                        {hierarchyPath.length > 1 && (
                                            <div className="flex flex-wrap items-center gap-1 text-xs text-neutral-500/70 dark:text-neutral-400/70 mb-3">
                                                {hierarchyPath.slice(0, -1).map((item, index) => (
                                                    <div key={index} className="flex items-center">
                                                        {index > 0 && <ChevronRight size={12} className="mx-1 opacity-40" />}
                                                        <span
                                                            className="hover:text-teal-600 dark:text-teal-400 transition-colors"
                                                            dangerouslySetInnerHTML={{ __html: stripHtml(item.title) }}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* 内容区域 - 使用 flex 布局实现左右结构 */}
                                        <div className={`flex ${isPhoto ? 'flex-col md:flex-row gap-4' : 'flex-col'}`}>
                                            {/* 左侧内容区域 */}
                                            <div className={isPhoto ? 'md:w-[60%] w-full' : 'w-full'}>
                                                {/* 主标题区域 */}
                                                <div className="flex items-start gap-3 mb-3.5">
                                                    <span className="mt-1 text-teal-600 dark:text-teal-400 bg-teal-600/10 dark:bg-teal-400/10 p-1.5 rounded-md">
                                                        {resultIcon}
                                                    </span>
                                                    <h2
                                                        className="text-lg md:text-xl font-medium text-neutral-900 dark:text-neutral-100 dark:text-neutral-900/90 dark:text-neutral-100/90 hover:text-teal-600 dark:text-teal-400 transition-colors line-clamp-2"
                                                        dangerouslySetInnerHTML={{ __html: stripHtml(currentLevelTitle) }}
                                                    />
                                                </div>

                                                {/* 内容摘要 */}
                                                {result._snippetResult?.content?.value && (
                                                    <div className="ml-9 mb-3">
                                                        <div
                                                            className="text-sm text-neutral-500/90 dark:text-neutral-400/90 dark:text-neutral-500/80 dark:text-neutral-400/80 leading-relaxed max-h-24 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent pr-1"
                                                            dangerouslySetInnerHTML={{
                                                                __html: stripHtml(result._snippetResult.content.value),
                                                            }}
                                                        />
                                                    </div>
                                                )}

                                                {/* 名言展示（如果是名言类型） */}
                                                {isSaying && result.sayingPreview && (
                                                    <div className="mt-3 ml-9">
                                                        <blockquote className="italic text-neutral-500 dark:text-neutral-400 border-l-4 border-teal-600/30 dark:border-teal-400/30 pl-3 py-1">
                                                            "{result.sayingPreview}"
                                                        </blockquote>
                                                    </div>
                                                )}
                                            </div>

                                            {/* 右侧照片预览（如果是照片类型） */}
                                            {isPhoto && result.photoUrl && (
                                                <div className="md:w-[40%] w-full flex items-center justify-center md:justify-end">
                                                    <div className="relative w-full md:w-auto md:h-[120px] h-[180px] rounded-md overflow-hidden bg-gray-100 dark:bg-gray-700">
                                                        <img
                                                            src={result.photoUrl}
                                                            alt={result.hierarchy?.lvl2 || 'Photo'}
                                                            className="object-cover w-full h-full"
                                                            onError={(e) => {
                                                                ; (e.target as HTMLImageElement).src = '/placeholder-image.svg'
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* 底部元数据区域 */}
                                        {isPost ? (
                                            <div className="ml-9 mt-4">
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-bg-tertiary/50 dark:bg-neutral-700/70 text-xs text-neutral-500 dark:text-neutral-400 hover:bg-bg-tertiary dark:hover:bg-neutral-700 transition-colors">
                                                    <FolderOpen size={12} className="mr-1" />
                                                    {result.category || '未分类'}
                                                </span>
                                            </div>
                                        ) : (
                                            hierarchyPath.length > 1 && (
                                                <div className="ml-9 mt-4 flex flex-wrap gap-2">
                                                    {hierarchyPath.slice(0, -1).map((item, index) => {
                                                        const hasHighlight = item.highlighted.includes('search-highlight')
                                                        if (!hasHighlight && index === 0) return null

                                                        return (
                                                            <span
                                                                key={index}
                                                                className="inline-flex items-center px-2.5 py-1 rounded-full bg-bg-tertiary/50 dark:bg-neutral-700/70 text-xs text-neutral-500 dark:text-neutral-400 hover:bg-bg-tertiary dark:hover:bg-neutral-700 transition-colors"
                                                            >
                                                                <span
                                                                    dangerouslySetInnerHTML={{ __html: stripHtml(item.highlighted) }}
                                                                />
                                                            </span>
                                                        )
                                                    })}
                                                </div>
                                            )
                                        )}
                                    </motion.a>
                                </motion.div>
                            )
                        })}
                    </div>

                    {/* 分页 */}
                    {totalPages > 1 && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="mt-6 md:mt-8"
                        >
                            <Pagination
                                current={currentPage}
                                total={totalPages}
                                getPageUrl={getPageUrl}
                                onChange={onPageChange}
                            />
                        </motion.div>
                    )}
                </motion.div>
            )}

            {/* 无结果提示 */}
            {!loading && !error && query && results.length === 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="py-16 text-center"
                >
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="bg-neutral-100 dark:bg-neutral-800/30 dark:bg-neutral-800/50 rounded-full p-6 inline-flex mb-6"
                    >
                        <Search size={48} className="text-neutral-500/40 dark:text-neutral-400/40" />
                    </motion.div>
                    <motion.p
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="text-xl md:text-2xl font-medium text-neutral-900 dark:text-neutral-100 dark:text-neutral-900/90 dark:text-neutral-100/90"
                    >
                        没有找到与 "<span className="text-teal-600 dark:text-teal-400">{query}</span>"
                        相关的结果
                    </motion.p>
                    <motion.p
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-neutral-500 dark:text-neutral-400 mt-3 max-w-md mx-auto"
                    >
                        请尝试其他关键词、检查拼写，或使用更通用的搜索词
                    </motion.p>
                </motion.div>
            )}

            {/* 初始状态提示 */}
            {!loading && !error && !query && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="py-16 text-center"
                >
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="bg-neutral-100 dark:bg-neutral-800/20 dark:bg-neutral-800/40 rounded-full p-8 inline-flex mb-6"
                    >
                        <Search size={56} className="text-neutral-500/30 dark:text-neutral-400/30" />
                    </motion.div>
                    <motion.p
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="text-xl md:text-2xl font-medium text-neutral-900 dark:text-neutral-100 dark:text-neutral-900/90 dark:text-neutral-100/90"
                    >
                        请输入搜索关键词
                    </motion.p>
                    <motion.p
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-neutral-500 dark:text-neutral-400 mt-3"
                    >
                        使用上方搜索框发现内容
                    </motion.p>
                </motion.div>
            )}

            {/* Algolia 归属信息 */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-12 pt-4 border-t border-neutral-200/30 dark:border-neutral-700/30 dark:border-neutral-200/20 dark:border-neutral-700/20 flex flex-row items-center justify-end"
            >
                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mr-2 flex items-center">
                    Search by
                </p>
                <a
                    href="https://www.algolia.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center"
                >
                    <img src="/logos/algolia.svg" alt="Algolia" className="h-4 sm:h-5" />
                </a>
            </motion.div>
        </div>
    )
}
