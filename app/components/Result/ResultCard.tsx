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
      className="rounded-2xl border border-card-border bg-card/80 backdrop-blur p-4 sm:p-6 shadow-soft"
    >
      <div className="grid sm:grid-cols-[auto_1fr] sm:items-center sm:gap-6">
        <AnimatedScore value={output.score} />
        <div className="mt-1 sm:mt-0 flex flex-col items-center sm:items-start gap-2">
          <VerdictBadge verdict={output.verdict} />
          <div className="rounded-full bg-bg-deep/70 px-3 py-1 text-xs text-ink">
            <span className="font-semibold">{output.proposalEstimate}</span>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <AuntySpeechBubble text={output.parentReaction} />
      </div>

      <div className="mt-4">
        <RedFlagList flags={output.redFlags} />
      </div>

      <div className="mt-5 space-y-2">
        <ShareActions output={output} input={input} />
        <button
          onClick={onRestart}
          className="w-full rounded-xl border border-card-border bg-card px-4 py-2 text-[13px] font-semibold text-ink-soft hover:bg-bg-deep/40"
        >
          Try again
        </button>
      </div>
    </motion.section>
  )
}
