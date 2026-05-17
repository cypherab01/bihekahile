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
      duration: 1.6,
      ease: 'easeOut',
    })
    return () => {
      unsubscribe()
      controls.stop()
    }
  }, [count, rounded, value])

  return (
    <div className="text-center">
      <motion.div
        className="text-[7rem] sm:text-[8rem] leading-none font-bold tracking-tight text-ink"
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <span>{display}</span>
        <span className="text-[2.5rem] sm:text-[3rem] text-ink-soft">
          /100
        </span>
      </motion.div>
      <p className="mt-1 text-sm uppercase tracking-widest text-ink-soft">
        Aunty Approval
      </p>
    </div>
  )
}
