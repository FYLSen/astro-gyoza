import { useAtomValue } from 'jotai'
import { pageScrollLocationAtom } from '@/store/scrollInfo'
import { AnimatePresence, motion } from 'framer-motion'
import { Rocket } from 'lucide-react'

export function BackToTopFAB() {
  const scrollY = useAtomValue(pageScrollLocationAtom)
  const isShow = scrollY > 100

  return (
    <div className="fixed right-4 bottom-6 z-10">
      <AnimatePresence>{isShow && <BackToTop />}</AnimatePresence>
    </div>
  )
}

function BackToTop() {
  const handleBackToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  return (
    <motion.button
      className="size-10 rounded-full shadow-lg shadow-zinc-800/5 border border-primary bg-white/50 dark:bg-zinc-800/50 backdrop-blur flex items-center justify-center text-primary hover:bg-white/80 dark:hover:bg-zinc-800/80 transition-colors"
      type="button"
      aria-label="Back to top"
      onClick={handleBackToTop}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0 }}
    >
      <Rocket size={20} className="transform -rotate-45" />
    </motion.button>
  )
}
