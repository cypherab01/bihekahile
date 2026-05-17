'use client'

import { animate, motion, useMotionValue, useTransform } from 'framer-motion'
import { useEffect, useState } from 'react'

interface Props {
  value: number
}

export function AnimatedScore({ value }: Props) {
  const count = useMotionValue(0)
  const rounded = useTransform(count, (v) => Math.round(v))
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    const unsubscribe = rounded.on('change', setDisplay)
    const controls = animate(count, value, {
      duration: 1.4,
      ease: 'easeOut',
    })
    return () => {
      unsubscribe()
      controls.stop()
    }
  }, [count, rounded, value])

  return (
    <div className="text-center">
      <p className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-ink-soft mb-0.5">
        Aunty Approval
      </p>
      <motion.div
        className="text-[5.5rem] sm:text-[7rem] leading-[0.9] font-bold tracking-tight text-ink"
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
      >
        <span>{display}</span>
        <span className="text-[2rem] sm:text-[2.5rem] text-ink-soft">
          /100
        </span>
      </motion.div>
    </div>
  )
}
