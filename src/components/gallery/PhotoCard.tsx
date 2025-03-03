import { motion } from 'framer-motion'
import type { Photo } from './types'

interface PhotoCardProps {
  photo: Photo
  onClick?: () => void
}

export const PhotoCard: React.FC<PhotoCardProps> = ({ photo, onClick }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-lg cursor-pointer group"
      onClick={onClick}
    >
      <img
        src={photo.url}
        alt={photo.name}
        className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
        loading="lazy"
      />

      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <h3 className="text-white font-medium mb-1">{photo.name}</h3>
        {photo.description && <p className="text-white/80 text-sm truncate">{photo.description}</p>}

        {photo.tag && (
          <div className="relative">
            <div className="flex gap-2 mt-2 flex-wrap h-6 overflow-hidden">
              {photo.tag.map((tag) => (
                <span key={tag} className="text-xs px-2 py-0.5 bg-white/20 rounded-full text-white">
                  {tag}
                </span>
              ))}
            </div>
            <div className="absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-black/70 to-transparent" />
          </div>
        )}
      </div>
    </motion.div>
  )
}
