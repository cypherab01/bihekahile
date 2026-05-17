import type { Verdict } from '@/lib/schemas'

export function verdictFromScore(score: number): Verdict {
  if (score >= 75) return 'approved'
  if (score >= 50) return 'conditional'
  if (score >= 25) return 'disappointed'
  return 'emergency'
}

const LABELS: Record<Verdict, string> = {
  approved: 'Aunty Approved ✓',
  conditional: 'Conditional Approval',
  disappointed: 'Aunty Disappointed',
  emergency: 'Family Emergency 🚨',
}

export function verdictLabel(v: Verdict): string {
  return LABELS[v]
}

const ACCENTS: Record<Verdict, { fg: string; bg: string }> = {
  approved: { fg: '#1b5e20', bg: '#d7f3d8' },
  conditional: { fg: '#7c4a03', bg: '#ffe8b3' },
  disappointed: { fg: '#7a1414', bg: '#ffd4d6' },
  emergency: { fg: '#7a1414', bg: '#ffbcc1' },
}

export function verdictAccent(v: Verdict) {
  return ACCENTS[v]
}
