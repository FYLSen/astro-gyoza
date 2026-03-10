import { useState, useEffect } from 'react'
import { CircularText } from '@/components/CircularText'
import { GlassBreakEffectVoronoi } from '@/components/GlassBreakEffectVoronoi'

interface AvatarContainerProps {
  secret: string
  avatar: string
  secretSvg: string
  className?: string
}

export const AvatarContainer: React.FC<AvatarContainerProps> = ({
  secret,
  avatar,
  secretSvg,
  className = '',
}) => {
  const [avatarLoaded, setAvatarLoaded] = useState(false)

  useEffect(() => {
    let isMounted = true

    const loadImage = (src: string, onLoad: () => void) => {
      const img = new Image()
      img.src = src
      if (img.complete) {
        onLoad()
      } else {
        img.onload = onLoad
      }
    }

    loadImage(avatar, () => {
      if (isMounted) setAvatarLoaded(true)
    })

    return () => {
      isMounted = false
    }
  }, [avatar])

  return (
    <div
      className={`relative size-[200px] lg:size-[300px] rounded-full overflow-hidden border border-neutral-200 dark:border-neutral-700 bg-zinc-100 dark:bg-zinc-800 ${className}`}
    >
      {/* 背景层 - 仅在头像加载完成后显示 */}
      {avatarLoaded && (
        <div className="absolute inset-0 z-0">
          {/* SVG 背景图片容器 */}
          <div className="absolute inset-0 flex items-center justify-center">
            <img
              src={secretSvg}
              alt="background"
              className="w-3/4 h-3/4 object-contain opacity-30 
              [filter:invert(0)_brightness(0.3)] dark:[filter:invert(1)_brightness(0.7)]
              transition-[filter] duration-300"
              style={{
                maxWidth: '75%',
                maxHeight: '75%',
              }}
            />
          </div>
          {/* 圆形文字 */}
          <CircularText text={secret} />
        </div>
      )}

      {/* 头像层 */}
      <GlassBreakEffectVoronoi
        src={avatar}
        clipShape="circle"
        className="size-full object-cover relative z-10"
      />
    </div>
  )
}
