import { useEffect, useState, useCallback } from 'react'
import { useAtomValue } from 'jotai'
import { pageScrollLocationAtom } from '@/store/scrollInfo'
import { floor } from 'lodash-es'
import { processDecryptedContent } from './contentUtils'

export function ReadingProgress() {
  const [percent, setPercent] = useState(0)
  const scrollY = useAtomValue(pageScrollLocationAtom)

  const calculateProgress = useCallback(() => {
    const $markdownWrapper = document.querySelector('#markdown-wrapper')
    if (!$markdownWrapper) {
      console.warn('Markdown wrapper not found')
      return
    }

    // 获取文档的总高度和当前滚动位置
    const docHeight = $markdownWrapper.scrollHeight
    const winHeight = window.innerHeight
    const scrollPosition = scrollY || document.documentElement.scrollTop

    // 获取文章内容的顶部偏移
    const wrapperRect = $markdownWrapper.getBoundingClientRect()
    const wrapperTop = wrapperRect.top + scrollPosition

    // 调整滚动位置，考虑文章容器的顶部偏移
    const adjustedScrollPosition = Math.max(0, scrollPosition - wrapperTop)

    // 计算实际可滚动距离，考虑文章实际高度
    const scrollable = docHeight - winHeight

    if (scrollable <= 0) {
      setPercent(0)
      return
    }

    // 计算进度百分比，确保在文章范围内才开始计算
    const calculatedPercent =
      scrollPosition < wrapperTop ? 0 : floor((adjustedScrollPosition / scrollable) * 100)

    setPercent(Math.max(0, Math.min(100, calculatedPercent)))
  }, [scrollY])

  // 处理内容解密后的逻辑
  useEffect(() => {
    const handleContentUnlock = () => {
      const $protectedContent = document.getElementById('protected-content')
      const $markdownWrapper = document.getElementById('markdown-wrapper')

      if ($protectedContent && $markdownWrapper) {
        processDecryptedContent($protectedContent, $markdownWrapper)

        // 触发一次滚动事件以更新 TOC 高亮
        window.dispatchEvent(new Event('scroll'))

        // 计算新的阅读进度
        setTimeout(calculateProgress, 100)
      }
    }

    document.addEventListener('content-unlocked', handleContentUnlock)
    return () => document.removeEventListener('content-unlocked', handleContentUnlock)
  }, [calculateProgress])

  // 监听内容变化
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setTimeout(() => {
        calculateProgress()
        // 触发滚动事件以更新 TOC 高亮
        window.dispatchEvent(new Event('scroll'))
      }, 100)
    })

    const $markdownWrapper = document.querySelector('#markdown-wrapper')
    if ($markdownWrapper) {
      observer.observe($markdownWrapper, {
        childList: true,
        subtree: true,
        characterData: true,
      })
    }

    return () => observer.disconnect()
  }, [calculateProgress])

  // 监听滚动
  useEffect(() => {
    const handleScroll = () => {
      requestAnimationFrame(calculateProgress)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [calculateProgress])

  // 监听窗口大小变化
  useEffect(() => {
    const handleResize = () => calculateProgress()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [calculateProgress])

  return (
    <div>
      <span className="text-sm">进度 {percent}%</span>
    </div>
  )
}

export default ReadingProgress
