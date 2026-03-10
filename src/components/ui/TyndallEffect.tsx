import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { getLocalTheme, getSystemTheme } from '@/utils/theme'

export function TyndallEffect() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    const checkDarkMode = () => {
      const localTheme = getLocalTheme()
      if (localTheme === 'dark') {
        return true
      } else if (localTheme === 'light') {
        return false
      } else {
        return getSystemTheme() === 'dark'
      }
    }
    setIsDarkMode(checkDarkMode())
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      setIsDarkMode(checkDarkMode())
    }

    darkModeMediaQuery.addEventListener('change', handleChange)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'gyoza-theme') {
        setIsDarkMode(checkDarkMode())
      }
    }

    window.addEventListener('storage', handleStorageChange)

    return () => {
      darkModeMediaQuery.removeEventListener('change', handleChange)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  useEffect(() => {
    // 暗色模式下添加鼠标跟随效果
    if (!isDarkMode || !containerRef.current) return

    const container = containerRef.current
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e
      const { left, top, width, height } = container.getBoundingClientRect()

      // 计算鼠标在容器内的相对位置
      const x = ((clientX - left) / width) * 100
      const y = ((clientY - top) / height) * 100

      // 创建光束效果层
      container.style.setProperty('--light-x', `${x}%`)
      container.style.setProperty('--light-y', `${y}%`)
    }

    document.addEventListener('mousemove', handleMouseMove)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
    }
  }, [isDarkMode])

  return (
    <>
      <motion.div
        className="absolute -z-1 top-0 inset-x-0 h-[350px] bg-gradient-to-r from-accent/5 to-accent/15"
        style={{
          maskImage: 'linear-gradient(black, transparent)',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      />
      {isDarkMode && (
        <>
          <motion.div
            ref={containerRef}
            className="absolute -z-1 top-0 inset-x-0 h-[350px] overflow-hidden pointer-events-none"
            style={
              {
                maskImage: 'linear-gradient(black, transparent)',
                background:
                  'radial-gradient(circle at var(--light-x, 50%) var(--light-y, 50%), rgba(255, 255, 255, 0.25) 0%, transparent 60%)',
                '--light-x': '50%',
                '--light-y': '50%',
              } as React.CSSProperties
            }
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {/* 漂浮粒子效果 */}
            <div className="absolute inset-0">
              {Array.from({ length: 30 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full bg-teal-600/30 dark:bg-teal-400/30"
                  style={{
                    width: `${Math.random() * 6 + 2}px`,
                    height: `${Math.random() * 6 + 2}px`,
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    boxShadow: '0 0 3px rgba(255, 255, 255, 0.3)',
                  }}
                  animate={{
                    y: [0, -20, 0],
                    opacity: [0.2, 0.6, 0.2],
                  }}
                  transition={{
                    duration: Math.random() * 5 + 3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: Math.random() * 2,
                  }}
                />
              ))}
            </div>
          </motion.div>

          {/* 额外的光束高光层 */}
          <motion.div
            className="absolute -z-1 top-0 inset-x-0 h-[350px] overflow-hidden pointer-events-none"
            style={{
              maskImage: 'linear-gradient(black, transparent)',
              background: 'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, transparent 100%)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
          />
        </>
      )}
    </>
  )
}
