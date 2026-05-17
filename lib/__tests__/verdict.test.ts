import { describe, it, expect } from 'vitest'
import { verdictFromScore, verdictLabel, verdictLabelPlain } from '@/lib/verdict'

describe('verdictFromScore', () => {
  it('returns "emergency" for 0–24', () => {
    expect(verdictFromScore(0)).toBe('emergency')
    expect(verdictFromScore(24)).toBe('emergency')
  })
  it('returns "disappointed" for 25–49', () => {
    expect(verdictFromScore(25)).toBe('disappointed')
    expect(verdictFromScore(49)).toBe('disappointed')
  })
  it('returns "conditional" for 50–74', () => {
    expect(verdictFromScore(50)).toBe('conditional')
    expect(verdictFromScore(74)).toBe('conditional')
  })
  it('returns "approved" for 75–100', () => {
    expect(verdictFromScore(75)).toBe('approved')
    expect(verdictFromScore(100)).toBe('approved')
  })
})

describe('verdictLabel', () => {
  it('returns a label for each verdict', () => {
    expect(verdictLabel('approved')).toMatch(/Approved/)
    expect(verdictLabel('emergency')).toMatch(/Emergency/)
  })
})

describe('verdictLabelPlain (for OG image — must be Latin/font-safe)', () => {
  it('returns ASCII-only labels for every verdict so satori does not chase dynamic fonts', () => {
    for (const v of ['approved', 'conditional', 'disappointed', 'emergency'] as const) {
      const label = verdictLabelPlain(v)
      expect(label, `verdict ${v} → "${label}" must be ASCII`).toMatch(
        /^[\x20-\x7E]+$/,
      )
    }
  })
})
