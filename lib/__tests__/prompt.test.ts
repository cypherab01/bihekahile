import { describe, it, expect } from 'vitest'
import { buildSystemPrompt, buildUserPrompt } from '@/lib/prompt'
import type { ApprovalInput } from '@/lib/schemas'

describe('buildSystemPrompt', () => {
  const sp = buildSystemPrompt()

  it('forbids caste-based judgment', () => {
    expect(sp.toLowerCase()).toMatch(/caste/)
    expect(sp.toLowerCase()).toMatch(
      /never (judge|use|mock|reference|mention).*caste|forbidden.*caste|ignore.*caste/,
    )
  })

  it('forbids religion / appearance / body / gender-double-standard jokes', () => {
    for (const term of ['religion', 'appearance', 'body', 'gender']) {
      expect(sp.toLowerCase()).toContain(term)
    }
  })

  it('demands strict JSON output', () => {
    expect(sp).toMatch(/JSON/)
    expect(sp.toLowerCase()).toMatch(/only.*json|return.*json/)
  })

  it('mentions all five output fields by name', () => {
    for (const k of [
      'score',
      'verdict',
      'parentReaction',
      'proposalEstimate',
      'redFlags',
    ]) {
      expect(sp).toContain(k)
    }
  })

  it('locks the verdict enum', () => {
    for (const v of ['approved', 'conditional', 'disappointed', 'emergency']) {
      expect(sp).toContain(v)
    }
  })

  it('names the persona "Chimeki Aunty"', () => {
    expect(sp).toContain('Chimeki Aunty')
  })

  it('introduces a gender lens for flavor', () => {
    const lower = sp.toLowerCase()
    expect(lower).toMatch(/gender lens|gender field/)
    // All three gender values must be referenced for the model to dispatch on them
    for (const g of ['"man"', '"woman"', '"skip"']) {
      expect(sp).toContain(g)
    }
  })

  it('explicitly locks equal severity across genders', () => {
    const lower = sp.toLowerCase()
    // The severity-is-gender-blind rule must survive any future tone tweaks
    expect(lower).toMatch(
      /severity is gender-blind|same (score|penalty|hit).*gender|gender.*flavor.*not.*severity/,
    )
  })

  it('forbids real names of politicians / celebrities / castes / ethnic groups', () => {
    const lower = sp.toLowerCase()
    expect(lower).toMatch(/never name real|no real names/)
  })
})

describe('buildUserPrompt', () => {
  const input: ApprovalInput = {
    salaryBand: '30-80k',
    job: 'engineer',
    country: 'nepal',
    ownsHouse: 'no',
    vehicle: 'scooter',
    cooking: 'basic',
    drinksSmokes: 'occasionally',
    age: 27,
    maritalStatus: 'single',
    caste: '',
  }

  it('includes every field value', () => {
    const up = buildUserPrompt(input)
    expect(up).toContain('30-80k')
    expect(up).toContain('engineer')
    expect(up).toContain('27')
  })

  it('omits the caste line when blank', () => {
    expect(buildUserPrompt(input)).not.toMatch(/caste/i)
  })

  it('includes caste line when provided (but with neutral framing)', () => {
    const up = buildUserPrompt({ ...input, caste: 'Sharma' })
    expect(up).toContain('Sharma')
  })
})
