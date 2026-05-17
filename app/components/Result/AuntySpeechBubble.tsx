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
      transition={{ delay: 0.4, duration: 0.5 }}
      className="relative"
    >
      <div className="flex items-end gap-3">
        <div
          aria-hidden
          className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-marigold text-3xl shadow-soft"
        >
          👵
        </div>
        <div className="relative max-w-prose rounded-2xl rounded-bl-sm bg-card px-4 py-3 text-base leading-relaxed text-ink shadow-soft font-deva">
          {text}
        </div>
      </div>
    </motion.div>
  )
}
