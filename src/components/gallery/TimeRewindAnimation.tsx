import React, { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { calculateTimeDifference, formatTimeDifference, getTimeUnits } from '@/utils/date'

interface TimeRewindAnimationProps {
  targetDate: string | Date
  duration?: number
  steps?: number
  className?: string
  onAnimationComplete?: () => void
}

export const TimeRewindAnimation: React.FC<TimeRewindAnimationProps> = ({
  targetDate,
  duration = 2000,
  steps = 60,
  className = '',
  onAnimationComplete,
}) => {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isAnimating, setIsAnimating] = useState(false)
  const [hasAnimated, setHasAnimated] = useState(false)
  const componentRef = useRef<HTMLDivElement>(null)

  const formatTimeUnit = (unit: number): string => {
    return unit.toString().padStart(2, '0')
  }

  const startAnimation = async () => {
    if (hasAnimated) return

    try {
      const target = targetDate instanceof Date ? targetDate : new Date(targetDate)

      if (isNaN(target.getTime())) {
        throw new Error('Invalid target date provided')
      }

      const start = new Date()
      const timeDiff = start.getTime() - target.getTime()

      setIsAnimating(true)

      const stepDuration = duration / steps

      for (let i = 0; i <= steps; i++) {
        const progress = i / steps
        const currentDiff = timeDiff * (1 - progress)
        const currentDate = new Date(target.getTime() + currentDiff)

        setCurrentTime(currentDate)
        await new Promise((resolve) => setTimeout(resolve, stepDuration))
      }

      setIsAnimating(false)
      setHasAnimated(true)
      onAnimationComplete?.()
    } catch (error) {
      console.error('Animation error:', error)
      setIsAnimating(false)
    }
  }

  const resetAnimation = () => {
    setHasAnimated(false)
    setCurrentTime(new Date())
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            startAnimation()
          }
        })
      },
      {
        threshold: 0.5,
        rootMargin: '0px',
      },
    )

    if (componentRef.current) {
      observer.observe(componentRef.current)
    }

    return () => {
      if (componentRef.current) {
        observer.unobserve(componentRef.current)
      }
    }
  }, [hasAnimated, targetDate])

  useEffect(() => {
    resetAnimation()
  }, [targetDate])

  const timeUnits = getTimeUnits(currentTime)
  const target = targetDate instanceof Date ? targetDate : new Date(targetDate)
  const timeDifference = calculateTimeDifference(new Date(), target)
  const timeDifferevceText = `这是${formatTimeDifference(timeDifference)}前的故事。`

  return (
    <div ref={componentRef} className={`grid grid-rows-[auto,1fr] gap-1 font-mono ${className}`}>
      <div className="flex items-center space-x-1">
        <motion.span className="inline-block">{timeUnits.year}</motion.span>
        <span>-</span>
        <motion.span className="inline-block">{formatTimeUnit(timeUnits.month)}</motion.span>
        <span>-</span>
        <motion.span className="inline-block">{formatTimeUnit(timeUnits.day)}</motion.span>
        <span className="mx-2">&nbsp;</span>
        <motion.span className="inline-block">{formatTimeUnit(timeUnits.hours)}</motion.span>
        <span>:</span>
        <motion.span className="inline-block">{formatTimeUnit(timeUnits.minutes)}</motion.span>
        <span>:</span>
        <motion.span className="inline-block">{formatTimeUnit(timeUnits.seconds)}</motion.span>
      </div>
      <div className="h-5 text-xs text-gray-500 dark:text-gray-400" aria-hidden={isAnimating}>
        {!isAnimating && timeDifferevceText}
      </div>
    </div>
  )
}

export default TimeRewindAnimation
