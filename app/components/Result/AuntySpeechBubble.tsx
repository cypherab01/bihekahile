'use client'

import { motion } from 'framer-motion'
import { PERSONA_NAME } from '@/lib/brand'

interface Props {
  text: string
}

export function AuntySpeechBubble({ text }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35, duration: 0.45 }}
    >
      <div className="flex items-end gap-2.5">
        <div
          aria-hidden
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-marigold text-2xl shadow-soft"
        >
          👵
        </div>
        <div className="relative max-w-prose rounded-2xl rounded-bl-sm bg-card px-3.5 py-2.5 text-[14px] leading-snug text-ink shadow-soft">
          <span className="block text-[10px] font-semibold uppercase tracking-wider text-marigold-deep mb-1">
            — {PERSONA_NAME}
          </span>
          <span className="font-deva">{text}</span>
        </div>
      </div>
    </motion.div>
  )
}
