import { author } from '@/config.json'
import { useEffect } from 'react'
import { useSetAtom } from 'jotai'
import { modalStackAtom } from '@/store/modalStack'
import { ImageModal } from '@/components/ui/modal/ImageModal'

export const PostImageEnhancer = () => {
  const setModalStack = useSetAtom(modalStackAtom)

  useEffect(() => {
    const handleImageClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.classList.contains('modal-trigger')) {
        e.preventDefault()
        const img = target as HTMLImageElement
        const imageAuthor = img.dataset.modalAuthor || author.name

        setModalStack((stack) => [
          ...stack,
          {
            id: `post-image-${img.src}`,
            content: <ImageModal imageUrl={img.src} author={imageAuthor} />,
          },
        ])
      }
    }

    document.addEventListener('click', handleImageClick)
    return () => document.removeEventListener('click', handleImageClick)
  }, [setModalStack])

  return null
}
