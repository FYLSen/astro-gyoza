import { motion } from 'framer-motion'
import type { Photo } from './types'
import { useCurrentModal } from '@/components/ui/modal'
import { X, Calendar, BookMarked, Tags } from 'lucide-react'
import { useEffect, useState, useRef } from 'react'
import { getLocalTheme } from '@/utils/theme'
import { TimeRewindAnimation } from './TimeRewindAnimation'

interface PhotoModalProps {
  photo: Photo
}

export const PhotoModal: React.FC<PhotoModalProps> = ({ photo }) => {
  const { dismiss } = useCurrentModal()
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [aspectRatio, setAspectRatio] = useState<number>(0)
  const imageRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const img = new Image()
    img.src = photo.url
    img.onload = () => {
      setAspectRatio(img.width / img.height)
    }
  }, [photo.url])

  useEffect(() => {
    const currentTheme = getLocalTheme()
    setTheme(
      currentTheme === 'system'
        ? window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light'
        : currentTheme,
    )

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
      if (getLocalTheme() === 'system') {
        setTheme(e.matches ? 'dark' : 'light')
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0, y: 20 }}
      animate={{
        scale: 1,
        opacity: 1,
        y: 0,
        transition: { type: 'spring', duration: 0.5, bounce: 0.3 },
      }}
      exit={{
        scale: 0.95,
        opacity: 0,
        y: 20,
        transition: { duration: 0.3, ease: 'easeOut' },
      }}
      className={`
        relative 
        w-[90%] 
        md:w-[95%] 
        max-w-7xl 
        mx-auto 
        bg-white 
        dark:bg-gray-900 
        rounded-lg 
        overflow-hidden 
        shadow-xl 
        md:h-[85vh] 
        max-h-[85vh] 
        ${theme === 'dark' ? 'dark' : ''}
      `}
    >
      {/* Close button */}
      <button
        onClick={dismiss}
        className="absolute top-0 right-0 z-50 w-12 h-12 
          text-white dark:text-gray-900 transition-colors flex items-center justify-center"
        style={{
          background:
            theme === 'dark'
              ? 'radial-gradient(circle at top right, rgb(255 255 255 / 0.5) 70%, transparent 71%)'
              : 'radial-gradient(circle at top right, rgb(0 0 0 / 0.5) 70%, transparent 71%)',
          transform: 'translate(12px, -12px)',
        }}
      >
        <X size={16} />
      </button>

      <div className="md:h-full flex flex-col md:grid md:grid-cols-[2fr,1fr]">
        {/* Mobile Layout */}
        <div className="md:hidden flex flex-col max-h-[85vh]">
          {/* 图片容器 */}
          <div className="relative w-full bg-black dark:bg-gray-950">
            <div className="w-full">
              <img
                ref={imageRef}
                src={photo.url}
                alt={photo.name}
                className="w-full h-auto object-contain"
              />
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
              <h2 className="text-xl font-bold text-white">
                {photo.name
                  .split('\n')
                  .filter(Boolean)
                  .map((line, index) => (
                    <div key={index}>{line}</div>
                  ))}
              </h2>
            </div>
          </div>

          {/* 内容区域 - 自适应高度且可滚动 */}
          <div className="flex-1 overflow-y-auto min-h-0 bg-white dark:bg-gray-900">
            <div className="p-6 space-y-6">
              {/* Description */}
              {photo.description && (
                <div>
                  <h3 className="flex items-center text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">
                    <BookMarked size={16} className="mr-2" />
                    印记
                  </h3>
                  <div className="text-gray-600 dark:text-gray-300 space-y-4">
                    {photo.description
                      .split('\n')
                      .filter(Boolean)
                      .map((paragraph, index) => (
                        <p key={index}>{paragraph}</p>
                      ))}
                  </div>
                </div>
              )}

              {/* Date section */}
              {photo.date && (
                <div>
                  <div className="flex flex-col space-y-1">
                    <div className="flex text-gray-600 dark:text-gray-400">
                      <Calendar size={16} className="mr-2 translate-y-0.5" />
                      <TimeRewindAnimation
                        targetDate={photo.date}
                        duration={3333}
                        steps={333}
                        className="text-sm font-medium"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Tags */}
              {photo.tag && (
                <div>
                  <h3 className="flex items-center text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">
                    <Tags size={16} className="mr-2" />
                    标签
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {photo.tag.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:block relative h-full bg-black dark:bg-gray-950">
          <div className="absolute inset-0 flex items-center justify-center">
            <img
              src={photo.url}
              alt={photo.name}
              className={`${
                aspectRatio > 1 ? 'w-full max-h-full' : 'h-full max-w-full'
              } object-contain`}
            />
          </div>
        </div>

        {/* Desktop Content section */}
        <div className="hidden md:flex flex-col flex-1 h-full bg-white dark:bg-gray-900 overflow-hidden">
          {/* Desktop title */}
          <div className="bg-white dark:bg-gray-900 p-6 pb-4 border-b dark:border-gray-800">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {photo.name
                .split('\n')
                .filter(Boolean)
                .map((line, index) => (
                  <div key={index}>{line}</div>
                ))}
            </h2>
          </div>

          {/* Scrollable content area */}
          <div className="flex-1 overflow-y-auto custom-scrollbar scrollbar-thin scrollbar-track-transparent scrollbar-thumb-scrollbar-light/50 hover:scrollbar-thumb-scrollbar-light dark:scrollbar-thumb-scrollbar-dark/50 dark:hover:scrollbar-thumb-scrollbar-dark transition-colors duration-200">
            <div className="p-6 space-y-6">
              {/* Description */}
              {photo.description && (
                <div>
                  <h3 className="flex items-center text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">
                    <BookMarked size={16} className="mr-2" />
                    印记
                  </h3>
                  <div className="text-gray-600 dark:text-gray-300 space-y-4">
                    {photo.description
                      .split('\n')
                      .filter(Boolean)
                      .map((paragraph, index) => (
                        <p key={index}>{paragraph}</p>
                      ))}
                  </div>
                </div>
              )}

              {/* Date section */}
              {photo.date && (
                <div>
                  <div className="flex flex-col space-y-1">
                    <div className="flex text-gray-600 dark:text-gray-400">
                      <Calendar size={16} className="mr-2 translate-y-0.5" />
                      <TimeRewindAnimation
                        targetDate={photo.date}
                        duration={3333}
                        steps={333}
                        className="text-sm font-medium"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Tags */}
              {photo.tag && (
                <div>
                  <h3 className="flex items-center text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">
                    <Tags size={16} className="mr-2" />
                    标签
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {photo.tag.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default PhotoModal
