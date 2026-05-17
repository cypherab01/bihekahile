'use client'

import { motion } from 'framer-motion'
import type { AiOutput, ApprovalInput } from '@/lib/schemas'
import { AnimatedScore } from './AnimatedScore'
import { VerdictBadge } from './VerdictBadge'
import { AuntySpeechBubble } from './AuntySpeechBubble'
import { RedFlagList } from './RedFlagList'
import { ShareActions } from './ShareActions'

interface Props {
  input: ApprovalInput
  output: AiOutput
  onRestart: () => void
}

export function ResultCard({ input, output, onRestart }: Props) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-3xl border border-card-border bg-card/80 backdrop-blur p-6 shadow-soft"
    >
      <AnimatedScore value={output.score} />
      <div className="mt-3 text-center">
        <VerdictBadge verdict={output.verdict} />
      </div>

      <div className="mt-6">
        <AuntySpeechBubble text={output.parentReaction} />
      </div>

      <div className="mt-5 rounded-2xl bg-bg-deep/60 px-4 py-3 text-center text-sm text-ink">
        <span className="font-semibold">{output.proposalEstimate}</span>
      </div>

      <div className="mt-5">
        <RedFlagList flags={output.redFlags} />
      </div>

      <div className="mt-6 grid gap-2">
        <ShareActions output={output} input={input} />
        <button
          onClick={onRestart}
          className="w-full rounded-xl border border-card-border bg-card px-4 py-2.5 text-sm font-semibold text-ink hover:bg-bg-deep/40"
        >
          Try again
        </button>
      </div>
    </motion.section>
  )
}
