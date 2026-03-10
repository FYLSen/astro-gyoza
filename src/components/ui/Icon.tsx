import { icons } from 'lucide-react'

export type IconName = keyof typeof icons

interface IconProps {
  name: IconName
  size?: number
  className?: string
}

export function Icon({ name, size = 16, className }: IconProps) {
  const LucideIcon = icons[name]
  return <LucideIcon size={size} className={className} />
}
