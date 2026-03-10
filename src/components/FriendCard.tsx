import React, { useRef, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ExternalLink } from 'lucide-react'
import type { CollectionEntry } from 'astro:content'

type FriendData = CollectionEntry<'friends'>['data']

interface FriendCardProps {
  friend: FriendData
}

export default function FriendCard({ friend }: FriendCardProps): React.ReactElement {
  const descriptionRef = useRef<HTMLDivElement>(null)
  const [isOverflowing, setIsOverflowing] = useState(false)

  useEffect(() => {
    const checkOverflow = () => {
      if (descriptionRef.current) {
        const element = descriptionRef.current
        setIsOverflowing(element.scrollWidth > element.clientWidth + 2)
      }
    }

    checkOverflow()
    window.addEventListener('resize', checkOverflow)
    const timeoutId = setTimeout(checkOverflow, 500)

    return () => {
      window.removeEventListener('resize', checkOverflow)
      clearTimeout(timeoutId)
    }
  }, [friend.description])

  return (
    <motion.li
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="h-full relative z-0 group"
    >
      <a
        href={friend.link}
        target="_blank"
        rel="noopener noreferrer external"
        className="block h-full"
      >
        <div
          className="p-4 flex items-start gap-3 bg-teal-600/10 dark:bg-teal-400/10 hover:bg-teal-600/15 dark:bg-teal-400/15 rounded-lg 
                      transition-all duration-300 border border-transparent hover:border-teal-600/20 dark:border-teal-400/20 
                      shadow-sm hover:shadow-md h-full origin-center
                      group-hover:scale-105 group-hover:z-10 group-hover:relative"
        >
          <img
            className="shrink-0 size-16 object-contain rounded-full transition-transform duration-300 group-hover:scale-105"
            src={friend.avatar}
            alt={`Friend avatar: ${friend.name}`}
            loading="lazy"
          />
          <div className="min-w-0 grow relative pr-6 flex flex-col">
            <div className="truncate font-bold text-xl group-hover:text-teal-600 dark:text-teal-400 transition-colors duration-300">
              {friend.name}
            </div>
            <div
              className="text-sm text-gray-600 dark:text-gray-300 relative"
              style={{ height: '2.5rem' }}
            >
              <div
                ref={descriptionRef}
                className="absolute top-0 left-0 right-0 line-clamp-1 opacity-100 group-hover:opacity-0 transition-opacity duration-300"
              >
                {friend.description}
              </div>
              <div className="absolute top-0 left-0 right-0 line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {friend.description}
                {isOverflowing && (
                  <span className="text-teal-600/70 dark:text-teal-400/70 ml-1">...</span>
                )}
              </div>
            </div>

            <ExternalLink
              size={18}
              className="absolute top-1 right-0 text-teal-600 dark:text-teal-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            />
          </div>
        </div>
      </a>
    </motion.li>
  )
}
