import { motion } from 'framer-motion'
import type { Photo } from './types'
import { useCurrentModal } from '@/components/ui/modal'
import { X, Calendar, BookMarked, MapPin, Copyright, User } from 'lucide-react'
import { useEffect, useState, useRef } from 'react'
import { getLocalTheme, getSystemTheme } from '@/utils/theme'
import { TimeRewindAnimation } from './TimeRewindAnimation'
import { footer } from '@/config.json'

interface PhotoModalProps {
  photo: Photo
}

export const PhotoModal: React.FC<PhotoModalProps> = ({ photo }) => {
  const { dismiss } = useCurrentModal()
  const [aspectRatio, setAspectRatio] = useState<number>(0)
  const [showTitle, setShowTitle] = useState(true)
  const imageRef = useRef<HTMLImageElement>(null)
  const theme = getLocalTheme() === 'system' ? getSystemTheme() : getLocalTheme()

  useEffect(() => {
    const img = new Image()
    img.src = photo.url
    img.onload = () => {
      setAspectRatio(img.width / img.height)
    }
  }, [photo.url])

  const sinceYear = new Date(footer.startTime).getFullYear()
  const thisYear = new Date().getFullYear()
  const copyDate = sinceYear === thisYear ? thisYear : `${sinceYear} - ${thisYear}`

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
        dark:bg-neutral-800 
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
          text-white dark:text-gray-900 transition-colors flex items-center justify-center cursor-pointer"
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

      <div className="md:h-full flex flex-col md:grid md:grid-cols-[2fr_1fr]">
        {/* Mobile Layout */}
        <div className="md:hidden flex flex-col max-h-[85vh]">
          {/* 图片容器 */}
          <div className="relative w-full bg-black dark:bg-gray-950">
            <div className="w-full max-h-[70vh] overflow-y-auto">
              <img
                ref={imageRef}
                src={photo.url}
                alt={photo.name}
                className="w-full h-auto object-contain cursor-pointer"
                style={{
                  minHeight: '200px',
                  maxHeight: aspectRatio < 0.1 ? 'none' : '100%',
                }}
                onClick={() => setShowTitle(!showTitle)}
              />
            </div>
            {/* 标题区域 - 可切换显示/隐藏 */}
            {showTitle && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                <h2 className="text-xl font-bold text-white drop-shadow-lg">
                  {photo.name
                    .split('\n')
                    .filter(Boolean)
                    .map((line, index) => (
                      <div key={index}>{line}</div>
                    ))}
                </h2>
              </div>
            )}
          </div>

          {/* 内容区域 */}
          <div className="flex-1 overflow-y-auto custom-scrollbar pb-6">
            <div className="p-6 space-y-6">
              {/* Description */}
              {photo.description && (
                <div>
                  <h3 className="flex items-center text-sm font-semibold text-gray-500 dark:text-gray-400 mb-4">
                    <BookMarked size={16} className="mr-2" />
                    印记
                  </h3>
                  <div className="text-gray-600 dark:text-gray-400/70 space-y-4">
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
                        duration={1333}
                        steps={333}
                        className="text-sm font-medium"
                      />
                    </div>
                  </div>
                </div>
              )}

              {
                <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                  <User size={16} className="flex-shrink-0" />
                  <span>{photo.author}</span>
                </div>
              }

              {/* Location and Tags section with unified background */}
              {(photo.location || photo.tag) && (
                <div className="bg-gray-50 dark:bg-neutral-700/50 rounded-lg p-4 space-y-4">
                  {/* Location */}
                  {photo.location && (
                    <div className="flex items-start">
                      <MapPin
                        size={16}
                        className="mr-2 mt-0.5 flex-shrink-0 text-gray-500 dark:text-gray-400"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-400/90">
                        {photo.location}
                      </span>
                    </div>
                  )}
                  {photo.location && photo.tag && (
                    <hr className="border-gray-200 dark:border-gray-700/50" />
                  )}
                  {/* Tags */}
                  {photo.tag && (
                    <div className="flex flex-wrap gap-2">
                      {photo.tag.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 bg-white dark:bg-neutral-600/80 text-gray-700 dark:text-gray-400/70 rounded-full text-sm truncate max-w-[180px]"
                          title={tag}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 版权信息 */}
              <div className="pt-4">
                <div className="flex items-center justify-center text-xs text-gray-500 dark:text-gray-400">
                  <Copyright size={14} className="mr-1" />
                  {photo.author}&nbsp;
                  <a href="/license" className="hover:underline">
                    版权所有
                  </a>
                  &nbsp;{copyDate}
                </div>
              </div>
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
        <div className="hidden md:flex flex-col flex-1 h-full bg-white dark:bg-neutral-800 overflow-hidden">
          {/* Desktop title */}
          <div className="bg-white dark:bg-neutral-800 p-6 pb-4 border-b border-neutral-100 dark:border-neutral-800/50">
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
                  <h3 className="flex items-center text-sm font-semibold text-gray-500 dark:text-gray-400 mb-4">
                    <BookMarked size={16} className="mr-2" />
                    印记
                  </h3>
                  <div className="text-gray-600 dark:text-gray-400/70 space-y-4">
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
                        duration={1333}
                        steps={333}
                        className="text-sm font-medium"
                      />
                    </div>
                  </div>
                </div>
              )}

              {
                <div className="flex text-gray-600 dark:text-gray-400">
                  <User size={16} className="mr-2 translate-y-0.5 flex-shrink-0" />
                  <span className="text-sm font-medium">{photo.author}</span>
                </div>
              }

              {/* Location and Tags section with unified background */}
              {(photo.location || photo.tag) && (
                <div className="bg-gray-50 dark:bg-neutral-700/50 rounded-lg p-4 space-y-4">
                  {/* Location */}
                  {photo.location && (
                    <div className="flex items-start">
                      <MapPin
                        size={16}
                        className="mr-2 mt-0.5 flex-shrink-0 text-gray-500 dark:text-gray-400"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-400/90">
                        {photo.location}
                      </span>
                    </div>
                  )}
                  {photo.location && photo.tag && (
                    <hr className="border-gray-200 dark:border-gray-700/50" />
                  )}
                  {/* Tags */}
                  {photo.tag && (
                    <div className="flex flex-wrap gap-2">
                      {photo.tag.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 bg-white dark:bg-neutral-600/80 text-gray-700 dark:text-gray-300/80 rounded-full text-sm truncate max-w-[180px] md:max-w-[220px]"
                          title={tag}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 桌面端版权信息 */}
          <div className="mt-auto p-3 border-t border-neutral-100 dark:border-neutral-800/50">
            <div className="flex items-center justify-center text-xs text-gray-500 dark:text-gray-400">
              <Copyright size={14} className="mr-1" />
              {photo.author}&nbsp;
              <a href="/license" className="hover:underline">
                版权所有
              </a>
              &nbsp;{copyDate}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default PhotoModal
