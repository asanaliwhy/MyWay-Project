
import React from 'react'
import { motion } from 'framer-motion'
interface ActivityIndicatorProps {
  data: number[]
  color?: string
  className?: string
}
export function ActivityIndicator({
  data,
  color = '#0d9488',
  className = '',
}: ActivityIndicatorProps) {
  
  const width = 40
  const height = 20
  const max = Math.max(...data, 1)
  const min = Math.min(...data, 0)
  const range = max - min
  const points = data
    .map((val, i) => {
      const x = (i / (data.length - 1)) * width
      const y = height - ((val - min) / range) * height
      return `${x},${y}`
    })
    .join(' ')
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="overflow-visible"
      >
        {/* Sparkline path */}
        <motion.polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{
            pathLength: 0,
            opacity: 0,
          }}
          animate={{
            pathLength: 1,
            opacity: 1,
          }}
          transition={{
            duration: 1,
            ease: 'easeOut',
          }}
        />
        {/* Pulse dot at the end */}
        <motion.circle
          cx={width}
          cy={height - ((data[data.length - 1] - min) / range) * height}
          r="2"
          fill={color}
          animate={{
            r: [2, 4, 2],
            opacity: [1, 0.5, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </svg>
    </div>
  )
}