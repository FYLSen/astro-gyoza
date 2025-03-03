import React, { useState, useEffect, useRef } from 'react'
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
  const loadingRef = useRef<HTMLDivElement>(null)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  const openPhotoModal = (photo: Photo) => {
    setModalStack((stack) => [
      ...stack,
      { id: `photo-${photo.url}`, content: <PhotoModal photo={photo} /> },
    ])
  }

  useEffect(() => {
    // 初始加载两页数据
    setVisiblePhotos(photos.slice(0, ITEMS_PER_PAGE * 2))
  }, [photos])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0]
        if (target.isIntersecting && !isLoadingMore && visiblePhotos.length < photos.length) {
          setIsLoadingMore(true)
          // 加载下一页数据
          setTimeout(() => {
            const nextPhotos = photos.slice(
              visiblePhotos.length,
              visiblePhotos.length + ITEMS_PER_PAGE,
            )
            if (nextPhotos.length > 0) {
              setVisiblePhotos((prev) => [...prev, ...nextPhotos])
            }
            setIsLoadingMore(false)
          }, 500) // 添加小延迟，使加载动画更自然
        }
      },
      {
        root: null,
        rootMargin: '200px',
        threshold: 0.1,
      },
    )

    if (loadingRef.current) {
      observer.observe(loadingRef.current)
    }

    return () => {
      if (loadingRef.current) {
        observer.unobserve(loadingRef.current)
      }
    }
  }, [photos, visiblePhotos, isLoadingMore])

  if (error) {
    return (
      <div className="text-center text-red-500 py-8">
        <p>{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Masonry
        breakpointCols={breakpointColumns}
        className="flex -ml-4 w-auto"
        columnClassName="pl-4 bg-clip-padding"
      >
        {visiblePhotos.map((photo) => (
          <div key={photo.url} className="mb-4">
            <PhotoCard photo={photo} onClick={() => openPhotoModal(photo)} />
          </div>
        ))}
      </Masonry>
      {visiblePhotos.length < photos.length && (
        <div ref={loadingRef} className="h-10 flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 dark:border-gray-100"></div>
        </div>
      )}
    </div>
  )
}
