import { motion } from 'framer-motion'
import type { Variants } from 'framer-motion'
import { useInView } from 'react-intersection-observer'

const sentenceVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.3,
      staggerChildren: 0.08,
    },
  },
}

const wordVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 100 },
  },
}

export const AnimatedText = ({ first = '', last = '' }: { first: string; last: string }) => {
  const { ref, inView } = useInView({ threshold: 0.1 })

  const renderWord = (word: string, index: number, prefix: string) => (
    <motion.span key={`${prefix}-${index}`} variants={wordVariants} className="inline-block mr-2">
      {word}
    </motion.span>
  )

  return (
    <motion.div
      ref={ref}
      className="text-xs text-center text-balance text-neutral-500 dark:text-neutral-400"
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={sentenceVariants}
    >
      <div className="mb-2">{first.split(' ').map((word, i) => renderWord(word, i, 'first'))}</div>

      <div>{last.split(' ').map((word, i) => renderWord(word, i, 'last'))}</div>
    </motion.div>
  )
}

export default AnimatedText
