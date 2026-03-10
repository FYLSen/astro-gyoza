import React, { useState, useEffect, useRef, useCallback } from 'react'
import Masonry from 'react-masonry-css'
import { PhotoCard } from './PhotoCard'
import type { Photo } from './types'
import { PhotoModal } from './PhotoModal'
import { useSetAtom } from 'jotai'
import { modalStackAtom } from '@/store/modalStack'

interface PhotoGridProps {
  photos: Photo[]
  error: string | null
}

const ITEMS_PER_PAGE = 8

const breakpointColumns = {
  default: 4,
  1536: 4,
  1280: 3,
  1024: 3,
  768: 2,
  640: 1,
}

export const PhotoGrid: React.FC<PhotoGridProps> = ({ photos, error }) => {
  const setModalStack = useSetAtom(modalStackAtom)
  const [visiblePhotos, setVisiblePhotos] = useState<Photo[]>([])
  const loadingRef = useRef<HTMLDivElement | null>(null)
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false)
  const [page, setPage] = useState<number>(2) // 跟踪当前页码，初始加载两页

  const openPhotoModal = useCallback(
    (photo: Photo): void => {
      setModalStack((stack) => [
        ...stack,
        { id: `photo-${photo.url}`, content: <PhotoModal photo={photo} /> },
      ])
    },
    [setModalStack],
  )

  // 当photos属性变化时重置状态
  useEffect(() => {
    setVisiblePhotos(photos.slice(0, ITEMS_PER_PAGE * 2))
    setPage(2)
    setIsLoadingMore(false)
  }, [photos])

  // 使用useCallback包装加载更多逻辑，避免依赖循环
  const loadMorePhotos = useCallback((): void => {
    if (isLoadingMore || visiblePhotos.length >= photos.length) return

    setIsLoadingMore(true)

    // 计算下一页的起始索引
    const startIndex = page * ITEMS_PER_PAGE

    setTimeout(() => {
      const nextPhotos = photos.slice(startIndex, startIndex + ITEMS_PER_PAGE)
      if (nextPhotos.length > 0) {
        setVisiblePhotos((prev) => [...prev, ...nextPhotos])
        setPage((prevPage) => prevPage + 1)
      }
      setIsLoadingMore(false)
    }, 500)
  }, [isLoadingMore, page, photos, visiblePhotos.length])

  useEffect(() => {
    const observerCallback: IntersectionObserverCallback = (entries) => {
      const target = entries[0]
      if (target.isIntersecting) {
        loadMorePhotos()
      }
    }

    const observerOptions: IntersectionObserverInit = {
      root: null,
      rootMargin: '200px',
      threshold: 0.1,
    }

    const observer = new IntersectionObserver(observerCallback, observerOptions)

    if (loadingRef.current) {
      observer.observe(loadingRef.current)
    }

    return () => {
      observer.disconnect() // 使用disconnect()方法更彻底地清理
    }
  }, [loadMorePhotos])

  if (error) {
    return (
      <div className="text-center text-red-500 py-8">
        <p>{error}</p>
      </div>
    )
  }

  // 确保photo.url存在，防止映射中的潜在错误
  const safeVisiblePhotos = visiblePhotos.filter((photo) => !!photo?.url)

  return (
    <div className="space-y-4">
      <Masonry
        breakpointCols={breakpointColumns}
        className="flex -ml-4 w-auto"
        columnClassName="pl-4 bg-clip-padding"
      >
        {safeVisiblePhotos.map((photo, index) => (
          <div key={`${photo.url}-${index}`} className="mb-4">
            <PhotoCard photo={photo} onClick={() => openPhotoModal(photo)} />
          </div>
        ))}
      </Masonry>
      {visiblePhotos.length < photos.length && (
        <div ref={loadingRef} className="h-10 flex items-center justify-center">
          {isLoadingMore ? (
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 dark:border-gray-100"></div>
          ) : (
            <div className="h-6 w-6"></div> // 占位元素，确保即使没有加载动画也有一个观察目标
          )}
        </div>
      )}
    </div>
  )
}
