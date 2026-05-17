'use client'

import { motion } from 'framer-motion'

interface Props {
  flags: string[]
}

export function RedFlagList({ flags }: Props) {
  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-sindoor">
        Red flags
      </h3>
      <ul className="space-y-1.5">
        {flags.map((f, i) => (
          <motion.li
            key={f + i}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 + i * 0.1 }}
            className="flex gap-2 text-sm text-ink"
          >
            <span aria-hidden>🚩</span>
            <span>{f}</span>
          </motion.li>
        ))}
      </ul>
    </div>
  )
}
