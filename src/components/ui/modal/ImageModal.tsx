import { motion } from 'framer-motion'
import { useCurrentModal } from './hooks'
import { X } from 'lucide-react'

interface ImageModalProps {
  imageUrl: string
  author: string
}

export const ImageModal: React.FC<ImageModalProps> = ({ imageUrl, author }) => {
  const { dismiss } = useCurrentModal()

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0, y: 20 }}
      animate={{
        scale: 1,
        opacity: 1,
        y: 0,
        transition: {
          type: 'spring',
          duration: 0.5,
          bounce: 0.3,
        },
      }}
      exit={{
        scale: 0.95,
        opacity: 0,
        y: 20,
        transition: {
          duration: 0.3,
          ease: 'easeOut',
        },
      }}
      className="relative max-w-7xl w-full bg-white rounded-lg overflow-hidden shadow-xl"
    >
      <button
        onClick={dismiss}
        className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
      >
        <X size={16} />
      </button>

      <div className="relative bg-black flex items-center justify-center">
        <img
          src={imageUrl}
          alt={`Illustration for saying by ${author}`}
          className="max-h-[90vh] w-full object-contain"
        />
      </div>
    </motion.div>
  )
}
