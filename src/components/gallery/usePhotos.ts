import { useState, useEffect } from 'react'
import type { Photo } from './types'

export const usePhotos = (initialPhotos: Photo[]) => {
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      if (!Array.isArray(initialPhotos)) {
        throw new Error('照片数据格式不正确')
      }

      // 验证照片数据的完整性
      const invalidPhotos = initialPhotos.some((photo) => {
        return !photo.url || !photo.name
      })

      if (invalidPhotos) {
        throw new Error('部分照片数据不完整')
      }

      setPhotos(initialPhotos)
      setError(null)
    } catch (err) {
      console.error('Error processing photos:', err)
      setError(err instanceof Error ? err.message : '处理照片数据时出错')
    }
  }, [initialPhotos])

  return { photos, error }
}
