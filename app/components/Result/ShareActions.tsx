'use client'

import type { AiOutput, ApprovalInput } from '@/lib/schemas'

interface Props {
  output: AiOutput
  input: ApprovalInput
}

export function ShareActions(_props: Props) {
  return (
    <div className="text-xs text-ink-soft text-center">
      Share actions wire up next.
    </div>
  )
}
