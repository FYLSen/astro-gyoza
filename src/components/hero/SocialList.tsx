import clsx from 'clsx'
import { hero } from '@/config.json'
import { motion } from 'framer-motion'
import { icons } from 'lucide-react'

type iconName = keyof typeof icons

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 40,
  },
  visible: {
    opacity: 1,
    y: 0,
  },
}

export function SocialList({ className }: { className?: string }) {
  return (
    <motion.ul
      className={clsx(
        'flex gap-4 flex-wrap items-center justify-center lg:justify-start',
        className,
      )}
      initial="hidden"
      animate="visible"
      transition={{
        staggerChildren: 0.1,
      }}
    >
      {hero.socials.map((social) => (
        <motion.li key={social.name} variants={itemVariants}>
          <a
            className="relative size-9 text-white text-xl flex justify-center items-center group"
            href={social.url}
            title={social.name}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span
              className="absolute inset-0 -z-1 rounded-full group-hover:scale-105 transition"
              style={{ backgroundColor: social.color }}
            ></span>
            <LucideIcon name={social.icon as iconName} size={16} />
          </a>
        </motion.li>
      ))}
    </motion.ul>
  )
}

const LucideIcon = ({ name, size }: { name: iconName; size?: number }) => {
  const Icon = icons[name]
  return <Icon size={size} />
}
