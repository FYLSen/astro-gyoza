import React, { useEffect } from 'react'
import { PhotoGrid } from './PhotoGrid'
import { usePhotos } from './usePhotos'
import type { Photo } from './types'
import { useSetAtom } from 'jotai'
import { modalStackAtom } from '@/store/modalStack'
import { PhotoModal } from './PhotoModal'
import { generateHash } from '@/utils/strHash'

interface GalleryWrapperProps {
  initialPhotos: Photo[]
}

export const GalleryWrapper: React.FC<GalleryWrapperProps> = ({ initialPhotos }) => {
  const { photos, error } = usePhotos(initialPhotos)
  const setModalStack = useSetAtom(modalStackAtom)

  // 处理URL参数，打开对应照片模态框
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const viewParam = params.get('view')

    if (viewParam && photos.length > 0) {
      // 查找匹配哈希值的照片
      const photoToView = photos.find((photo) => {
        const photoHash = generateHash(photo.url)
        return photoHash === viewParam
      })

      if (photoToView) {
        // 打开模态框
        setModalStack((stack) => [
          ...stack,
          { id: `photo-${photoToView.url}`, content: <PhotoModal photo={photoToView} /> },
        ])

        // 更新URL，移除参数但不刷新页面
        const newUrl = window.location.pathname
        window.history.replaceState({}, document.title, newUrl)
      }
    }
  }, [photos, setModalStack])

  return <PhotoGrid photos={photos} error={error} />
}
