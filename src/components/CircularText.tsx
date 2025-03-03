import { useEffect, useRef } from 'react'

interface CircularTextProps {
  text: string
  className?: string
  onLoad?: () => void
}

export const CircularText = ({ text, className = '', onLoad }: CircularTextProps) => {
  const textPathRef = useRef<SVGTextPathElement>(null)
  const pathRef = useRef<SVGPathElement>(null)

  useEffect(() => {
    const adjustTextPosition = () => {
      const textPath = textPathRef.current
      const path = pathRef.current

      if (!textPath || !path) return

      const textLength = textPath.getComputedTextLength()
      const pathLength = path.getTotalLength()
      const startOffset = pathLength * 0.25 - textLength / 2

      textPath.setAttribute('startOffset', startOffset.toString())
      onLoad?.()
    }

    adjustTextPosition()
    window.addEventListener('resize', adjustTextPosition)

    return () => {
      window.removeEventListener('resize', adjustTextPosition)
    }
  }, [text, onLoad])

  return (
    <svg
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      viewBox="0 0 200 200"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <path
          ref={pathRef}
          id="CirclePath"
          d="M 100,100 m -85,0 a 85,85 0 1,1 170,0 a 85,85 0 1,1 -170,0"
          fill="none"
        />
      </defs>
      <text className="text-xs font-medium fill-zinc-500 dark:fill-zinc-400">
        <textPath ref={textPathRef} href="#CirclePath" startOffset="0" textAnchor="start">
          • {text} •
        </textPath>
      </text>
    </svg>
  )
}
