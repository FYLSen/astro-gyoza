import { useState, useEffect } from 'react'
import { CircularText } from '@/components/CircularText'
import { GlassBreakEffectVoronoi } from '@/components/GlassBreakEffectVoronoi'

interface AvatarContainerProps {
  secret: string
  avatar: string
  className?: string
}

export const AvatarContainer: React.FC<AvatarContainerProps> = ({
  secret,
  avatar,
  className = '',
}) => {
  const [avatarLoaded, setAvatarLoaded] = useState(false)

  useEffect(() => {
    const loadImage = (src: string, onLoad: () => void) => {
      const img = new Image()
      img.src = src
      img.onload = onLoad
    }

    loadImage(avatar, () => setAvatarLoaded(true))
  }, [avatar])

  return (
    <div
      className={`relative size-[200px] lg:size-[300px] rounded-full overflow-hidden border border-primary bg-zinc-100 dark:bg-zinc-800 ${className}`}
    >
      {/* 背景层 - 仅在头像加载完成后显示 */}
      {avatarLoaded && <CircularText text={secret} />}

      {/* 头像层 */}
      <GlassBreakEffectVoronoi
        src={avatar}
        clipShape="circle"
        className="size-full object-cover relative z-10"
      />
    </div>
  )
}
