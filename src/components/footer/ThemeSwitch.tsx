'use client'

import { themeAtom } from '@/store/theme'
import { useAtom } from 'jotai'
import { Sun, Moon, Monitor } from 'lucide-react'
import { motion } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'

type Theme = 'light' | 'dark' | 'system'

export function ThemeSwitch() {
  const [theme, setTheme] = useAtom(themeAtom)
  const [isOpen, setIsOpen] = useState(false)
  const switchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (switchRef.current && !switchRef.current.contains(event.target as Node) && isOpen) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const CurrentIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun size={16} strokeWidth={2} />
      case 'dark':
        return <Moon size={16} strokeWidth={2} />
      default:
        return <Monitor size={16} strokeWidth={2} />
    }
  }

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme)
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={switchRef}>
      <motion.div
        className="flex items-center justify-center bg-white dark:bg-neutral-900 rounded-full overflow-hidden shadow-lg border border-neutral-200 dark:border-neutral-800 shadow-teal-500/30 dark:shadow-teal-400/30"
        animate={{
          width: isOpen ? '104px' : '40px',
          height: '40px',
        }}
        transition={{ duration: 0.3 }}
      >
        {!isOpen ? (
          <button
            className="w-full h-full flex items-center justify-center text-primary-foreground hover:opacity-80 transition-opacity cursor-pointer"
            onClick={() => setIsOpen(true)}
            aria-label="Switch"
          >
            <motion.div
              whileHover={{
                scale: 1.2,
                transition: { duration: 0.2 },
              }}
            >
              <CurrentIcon />
            </motion.div>
          </button>
        ) : (
          <div className="flex w-full justify-between px-3">
            <button
              className="flex items-center justify-center p-1.5 rounded-full hover:bg-primary-foreground/10 text-primary-foreground hover:opacity-80 transition-all cursor-pointer"
              onClick={() => handleThemeChange('light')}
              aria-label="Light"
            >
              <motion.div
                whileHover={{
                  scale: 1.2,
                  rotate: 180,
                  transition: { duration: 0.5 },
                }}
              >
                <Sun size={16} strokeWidth={2} />
              </motion.div>
            </button>
            <button
              className="flex items-center justify-center p-1.5 rounded-full hover:bg-primary-foreground/10 text-primary-foreground hover:opacity-80 transition-all cursor-pointer"
              onClick={() => handleThemeChange('system')}
              aria-label="System"
            >
              <motion.div
                whileHover={{
                  scale: 1.2,
                  transition: { duration: 0.2 },
                }}
              >
                <Monitor size={16} strokeWidth={2} />
              </motion.div>
            </button>
            <button
              className="flex items-center justify-center p-1.5 rounded-full hover:bg-primary-foreground/10 text-primary-foreground hover:opacity-80 transition-all cursor-pointer"
              onClick={() => handleThemeChange('dark')}
              aria-label="Dark"
            >
              <motion.div
                whileHover={{
                  rotate: [0, -10, 10, -5, 5, 0],
                  transition: { duration: 0.8 },
                }}
              >
                <Moon size={16} strokeWidth={2} />
              </motion.div>
            </button>
          </div>
        )}
      </motion.div>
    </div>
  )
}
