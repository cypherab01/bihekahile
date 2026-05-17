'use client'

import { motion } from 'framer-motion'

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
        <div className="relative max-w-prose rounded-2xl rounded-bl-sm bg-card px-3.5 py-2.5 text-[14px] leading-snug text-ink shadow-soft font-deva">
          {text}
        </div>
      </div>
    </motion.div>
  )
}
