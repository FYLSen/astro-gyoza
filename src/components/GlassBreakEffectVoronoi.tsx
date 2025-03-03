import React, { useState, useMemo, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Delaunay } from 'd3-delaunay'

interface FragmentData {
  id: string
  path: string
  cx: number
  cy: number
}

interface GlassBreakEffectVoronoiProps {
  src: string
  pointCount?: number
  className?: string
  clipShape?: 'circle' | 'custom'
  clipPath?: string
  onLoad?: () => void
}

export const GlassBreakEffectVoronoi: React.FC<GlassBreakEffectVoronoiProps> = ({
  src,
  pointCount = 333,
  className = '',
  clipShape = 'none',
  clipPath,
  onLoad,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [clickPoint, setClickPoint] = useState<{ x: number; y: number } | null>(null)
  const [adjustedPointCount, setAdjustedPointCount] = useState(pointCount)

  // 使用 useEffect 处理 window 相关逻辑
  useEffect(() => {
    const updatePointCount = () => {
      setAdjustedPointCount(window.innerWidth < 768 ? Math.floor(pointCount * 0.03) : pointCount)
    }

    // 初始设置
    updatePointCount()

    // 监听窗口大小变化
    window.addEventListener('resize', updatePointCount)

    return () => {
      window.removeEventListener('resize', updatePointCount)
    }
  }, [pointCount])

  // 使用 ResizeObserver 监听容器尺寸变化
  useEffect(() => {
    if (!containerRef.current) return

    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect()
        setDimensions({ width, height })
      }
    }

    updateDimensions()

    const resizeObserver = new ResizeObserver(updateDimensions)
    resizeObserver.observe(containerRef.current)

    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current)
      }
    }
  }, [])

  const clipPathId = useMemo(() => `clip-path-${Math.random().toString(36).slice(2, 11)}`, [])

  const getClipPathContent = () => {
    const { width, height } = dimensions
    switch (clipShape) {
      case 'circle':
        const radius = Math.min(width, height) / 2
        const cx = width / 2
        const cy = height / 2
        return <circle cx={cx} cy={cy} r={radius} />
      case 'custom':
        return <path d={clipPath} />
      default:
        return null
    }
  }

  const fragments: FragmentData[] = useMemo(() => {
    const { width, height } = dimensions
    if (!width || !height) return []

    const points: [number, number][] = []
    for (let i = 0; i < adjustedPointCount; i++) {
      let x, y
      if (clipShape === 'circle') {
        const radius = Math.min(width, height) / 2
        const angle = Math.random() * 2 * Math.PI
        const r = Math.sqrt(Math.random()) * radius
        x = width / 2 + r * Math.cos(angle)
        y = height / 2 + r * Math.sin(angle)
      } else {
        x = Math.random() * width
        y = Math.random() * height
      }
      points.push([x, y])
    }

    const delaunay = Delaunay.from(points)
    const voronoi = delaunay.voronoi([0, 0, width, height])

    const cells: FragmentData[] = []
    for (let i = 0; i < points.length; i++) {
      const cell = voronoi.cellPolygon(i)
      if (!cell) continue

      const path = 'M' + cell.map((p) => p.join(',')).join(' L') + ' Z'

      let cx = 0
      let cy = 0
      for (const p of cell) {
        cx += p[0]
        cy += p[1]
      }
      cx /= cell.length
      cy /= cell.length

      cells.push({
        id: `cell-${i}`,
        path,
        cx,
        cy,
      })
    }
    return cells
  }, [dimensions, adjustedPointCount, clipShape])

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const clickY = e.clientY - rect.top

    if (clipShape === 'circle') {
      const radius = Math.min(dimensions.width, dimensions.height) / 2
      const centerX = dimensions.width / 2
      const centerY = dimensions.height / 2
      const distance = Math.sqrt(Math.pow(clickX - centerX, 2) + Math.pow(clickY - centerY, 2))
      if (distance > radius) return
    }

    setClickPoint({ x: clickX, y: clickY })
    setTimeout(() => {
      setClickPoint(null)
    }, 4000)
  }

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden cursor-pointer w-full h-full ${className}`}
      onClick={handleClick}
    >
      <motion.img
        src={src}
        className="absolute top-0 left-0 w-full h-full object-cover"
        style={{ clipPath: clipShape !== 'none' ? `url(#${clipPathId})` : undefined }}
        animate={{
          opacity: clickPoint ? 0 : 1,
          transition: { duration: clickPoint ? 0.3 : 1.5 },
        }}
        onLoad={() => onLoad?.()}
      />
      {dimensions.width > 0 && dimensions.height > 0 && (
        <svg
          width={dimensions.width}
          height={dimensions.height}
          className="absolute top-0 left-0 pointer-events-none"
          style={{ visibility: clickPoint ? 'visible' : 'hidden' }}
        >
          <defs>
            <pattern
              id={`imgPattern-${clipPathId}`}
              patternUnits="userSpaceOnUse"
              width={dimensions.width}
              height={dimensions.height}
            >
              <image
                href={src}
                width={dimensions.width}
                height={dimensions.height}
                preserveAspectRatio="xMidYMid slice"
              />
            </pattern>
            {clipShape !== 'none' && <clipPath id={clipPathId}>{getClipPathContent()}</clipPath>}
          </defs>
          <g clipPath={clipShape !== 'none' ? `url(#${clipPathId})` : undefined}>
            {fragments.map((frag) => {
              let offsetX = 0
              let offsetY = 0
              if (clickPoint) {
                const deltaX = frag.cx - clickPoint.x
                const deltaY = frag.cy - clickPoint.y
                const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
                const scale = Math.min(distance, 100) / distance
                const distanceScale = Math.min(1, 150 / distance)
                offsetX = deltaX * scale * distanceScale * 0.4
                offsetY = deltaY * scale * distanceScale * 0.4
                offsetY += dimensions.height * (1.2 + Math.random() * 0.8)
              }
              return (
                <motion.path
                  key={frag.id}
                  d={frag.path}
                  fill={`url(#imgPattern-${clipPathId})`}
                  initial={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
                  animate={
                    clickPoint
                      ? {
                          x: offsetX,
                          y: offsetY,
                          rotate: (Math.random() - 0.5) * 90,
                          opacity: 0.6,
                          scale: 1.2,
                          transition: {
                            x: {
                              duration: 0.8,
                              ease: [0.23, 1, 0.32, 1],
                            },
                            y: {
                              duration: 2.5,
                              ease: [0.4, 0, 0.2, 1],
                            },
                            rotate: {
                              duration: 1.2,
                              ease: [0.33, 0, 0.67, 1],
                            },
                          },
                        }
                      : {
                          x: 0,
                          y: 0,
                          rotate: 0,
                          opacity: 1,
                          scale: 1,
                          transition: {
                            y: {
                              type: 'spring',
                              bounce: 0.3,
                              duration: 2.5,
                            },
                            rotate: {
                              duration: 2,
                              ease: [0.4, 0, 0.2, 1],
                            },
                            scale: {
                              duration: 2,
                              ease: [0.4, 0, 0.2, 1],
                            },
                            opacity: {
                              duration: 1,
                              ease: [0.4, 0, 0.2, 1],
                            },
                          },
                        }
                  }
                />
              )
            })}
          </g>
        </svg>
      )}
    </div>
  )
}

export default GlassBreakEffectVoronoi
