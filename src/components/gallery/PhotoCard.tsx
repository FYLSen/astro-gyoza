import { motion } from 'framer-motion'
import { useRef, useEffect, useState, memo } from 'react'
import type { Photo } from './types'
import { useInView } from 'react-intersection-observer'
import { User } from 'lucide-react'

interface PhotoCardProps {
  photo: Photo
  onClick?: () => void
}

export const PhotoCard: React.FC<PhotoCardProps> = memo(({ photo, onClick }) => {
  const tagsContainerRef = useRef<HTMLDivElement>(null)
  const [isOverflowing, setIsOverflowing] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  const { ref: inViewRef, inView } = useInView({
    threshold: 0,
    triggerOnce: true,
    rootMargin: '200px 0px',
  })

  useEffect(() => {
    const checkOverflow = () => {
      if (tagsContainerRef.current) {
        const { scrollWidth, clientWidth } = tagsContainerRef.current
        setIsOverflowing(scrollWidth > clientWidth)
      }
    }

    const checkMobile = () => {
      setIsMobile(window.matchMedia('(max-width: 767px)').matches)
    }

    const handleResize = () => {
      checkOverflow()
      checkMobile()
    }

    const resizeObserver = new ResizeObserver(handleResize)
    if (tagsContainerRef.current) {
      resizeObserver.observe(tagsContainerRef.current)
    }

    checkMobile()

    return () => {
      resizeObserver.disconnect()
    }
  }, [photo.tag])

  const handleImageLoad = () => {
    setIsLoaded(true)
  }

  return (
    <motion.div
      ref={inViewRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-lg cursor-pointer group"
      onClick={onClick}
    >
      {inView && (
        <>
          <img
            src={photo.url}
            alt={photo.name}
            className={`
              w-full h-auto object-cover transition-transform duration-300 
              group-hover:scale-105 
              ${isLoaded ? 'opacity-100' : 'opacity-0'}
            `}
            loading="lazy"
            decoding="async"
            onLoad={handleImageLoad}
          />

          <div
            className={`
              absolute bottom-0 left-0 right-0 p-4 
              bg-gradient-to-t from-black/70 to-transparent 
              opacity-0 group-hover:opacity-100 transition-opacity duration-300
            `}
          >
            <h3 className="text-white font-medium mb-1">{photo.name}</h3>

            {/* 作者信息 */}
            {
              <div className="flex items-center text-white/80 text-sm mb-1">
                <User size={12} className="mr-1" />
                <span>{photo.author}</span>
              </div>
            }

            {photo.description && (
              <p className="text-white/80 text-sm truncate">{photo.description}</p>
            )}

            {photo.tag && (
              <div className="relative">
                <div
                  ref={tagsContainerRef}
                  className="flex gap-2 mt-2 flex-wrap h-6 overflow-hidden"
                >
                  {photo.tag.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-0.5 bg-white/20 rounded-full text-white"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                {isOverflowing && !isMobile && (
                  <div className="absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-black/70 to-transparent" />
                )}
              </div>
            )}
          </div>
        </>
      )}
    </motion.div>
  )
})

PhotoCard.displayName = 'PhotoCard'
