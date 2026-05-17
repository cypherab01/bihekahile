'use client'

import { motion } from 'framer-motion'

interface Props {
  flags: string[]
}

export function RedFlagList({ flags }: Props) {
  return (
    <div>
      <h3 className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-sindoor">
        Red flags
      </h3>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1">
        {flags.map((f, i) => (
          <motion.li
            key={f + i}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.55 + i * 0.08 }}
            className="flex gap-1.5 text-[13px] text-ink leading-snug"
          >
            <span aria-hidden>🚩</span>
            <span>{f}</span>
          </motion.li>
        ))}
      </ul>
    </div>
  )
}
