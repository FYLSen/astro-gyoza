import React from 'react'
import { PhotoGrid } from './PhotoGrid'
import { usePhotos } from './usePhotos'
import type { Photo } from './types'

interface GalleryWrapperProps {
  initialPhotos: Photo[]
}

export const GalleryWrapper: React.FC<GalleryWrapperProps> = ({ initialPhotos }) => {
  const { photos, error } = usePhotos(initialPhotos)
  return <PhotoGrid photos={photos} error={error} />
}
