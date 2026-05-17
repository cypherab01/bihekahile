import type { Verdict } from '@/lib/schemas'
import { verdictAccent, verdictLabel } from '@/lib/verdict'

export function VerdictBadge({ verdict }: { verdict: Verdict }) {
  const a = verdictAccent(verdict)
  return (
    <div
      className="mx-auto inline-flex items-center gap-2 rounded-full px-4 py-2 font-semibold shadow-soft"
      style={{ background: a.bg, color: a.fg }}
    >
      {verdictLabel(verdict)}
    </div>
  )
}
