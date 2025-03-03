import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import type { Variants } from 'framer-motion'
import { useInView } from 'react-intersection-observer'

interface TypewriterTextProps {
  text: string
  delay?: number
  speed?: number
  className?: string
  cursorClassName?: string
}

export const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  delay = 0.5,
  speed = 30,
  className = '',
  cursorClassName = '',
}) => {
  const [displayedText, setDisplayedText] = useState<string>('')
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  })

  useEffect(() => {
    if (inView) {
      let currentIndex = 0
      const interval = setInterval(() => {
        if (currentIndex <= text.length) {
          setDisplayedText(text.slice(0, currentIndex))
          currentIndex++
        } else {
          clearInterval(interval)
        }
      }, speed)

      return () => clearInterval(interval)
    }
  }, [inView, text, speed])

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.5, delay },
    },
  }

  const cursorVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: [1, 0],
      transition: {
        duration: 0.6,
        repeat: Infinity,
        repeatType: 'reverse',
      },
    },
  }

  return (
    <motion.div
      ref={ref}
      className={`block relative ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
    >
      <div className="invisible h-0 whitespace-pre-wrap leading-normal">{text}</div>
      <div className="absolute inset-0 whitespace-pre-wrap leading-normal">
        {displayedText}
        {displayedText.length < text.length && (
          <motion.span
            className={`inline-block w-0.5 h-4 bg-current align-middle ml-0.5 ${cursorClassName}`}
            variants={cursorVariants}
            initial="hidden"
            animate="visible"
          />
        )}
      </div>
    </motion.div>
  )
}

export default TypewriterText
