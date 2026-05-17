import { describe, it, expect } from 'vitest'
import {
  ApprovalInputSchema,
  AiOutputSchema,
  VerdictSchema,
} from '@/lib/schemas'

const validInput = {
  salaryBand: '30-80k',
  job: 'engineer',
  country: 'nepal',
  ownsHouse: 'no',
  vehicle: 'scooter',
  cooking: 'basic',
  drinksSmokes: 'occasionally',
  age: 27,
  maritalStatus: 'single',
  gender: 'woman',
  caste: '',
}

describe('ApprovalInputSchema', () => {
  it('accepts a fully filled valid input', () => {
    expect(() => ApprovalInputSchema.parse(validInput)).not.toThrow()
  })

  it('rejects ages outside 16–80', () => {
    expect(() =>
      ApprovalInputSchema.parse({ ...validInput, age: 12 })
    ).toThrow()
    expect(() =>
      ApprovalInputSchema.parse({ ...validInput, age: 95 })
    ).toThrow()
  })

  it('truncates caste field longer than 60 chars', () => {
    const parsed = ApprovalInputSchema.parse({
      ...validInput,
      caste: 'x'.repeat(200),
    })
    expect(parsed.caste.length).toBeLessThanOrEqual(60)
  })

  it('rejects unknown enum values', () => {
    expect(() =>
      ApprovalInputSchema.parse({ ...validInput, job: 'astronaut' })
    ).toThrow()
  })

  it('defaults caste to empty string when missing', () => {
    const { caste: _omit, ...rest } = validInput
    const parsed = ApprovalInputSchema.parse(rest)
    expect(parsed.caste).toBe('')
  })

  it('accepts the three gender values', () => {
    for (const g of ['man', 'woman', 'skip']) {
      expect(() =>
        ApprovalInputSchema.parse({ ...validInput, gender: g }),
      ).not.toThrow()
    }
  })

  it('rejects unknown gender values', () => {
    expect(() =>
      ApprovalInputSchema.parse({ ...validInput, gender: 'other' }),
    ).toThrow()
  })

  it('requires gender (no default)', () => {
    const { gender: _omit, ...rest } = validInput
    expect(() => ApprovalInputSchema.parse(rest)).toThrow()
  })
})

describe('VerdictSchema', () => {
  it('accepts the four verdicts', () => {
    for (const v of ['approved', 'conditional', 'disappointed', 'emergency']) {
      expect(() => VerdictSchema.parse(v)).not.toThrow()
    }
  })

  it('rejects anything else', () => {
    expect(() => VerdictSchema.parse('blessed')).toThrow()
  })
})

describe('AiOutputSchema', () => {
  const valid = {
    score: 72,
    verdict: 'conditional',
    parentReaction:
      'Engineer ta ho tara salary thorai cha. Kura suncha ki nai? Aja bholi yo umer ma...',
    proposalEstimate: '3-5 proposals this Dashain',
    redFlags: ['Salary kam', 'Daal-bhaat aaudaina', 'Scooter matra'],
  }

  it('accepts a valid output', () => {
    expect(() => AiOutputSchema.parse(valid)).not.toThrow()
  })

  it('clamps score to 0–100', () => {
    expect(() => AiOutputSchema.parse({ ...valid, score: 150 })).toThrow()
    expect(() => AiOutputSchema.parse({ ...valid, score: -5 })).toThrow()
  })

  it('requires 1–6 red flags', () => {
    expect(() => AiOutputSchema.parse({ ...valid, redFlags: [] })).toThrow()
    expect(() =>
      AiOutputSchema.parse({ ...valid, redFlags: new Array(10).fill('x') })
    ).toThrow()
  })
})
