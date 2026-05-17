import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  callAunty,
  mockAunty,
  __setAnthropicClientForTests,
} from '@/lib/anthropic'
import type { ApprovalInput } from '@/lib/schemas'

const baseInput: ApprovalInput = {
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

function mockClient(responses: string[]) {
  const calls: unknown[] = []
  const messages = {
    create: vi.fn(async (params: unknown) => {
      calls.push(params)
      const text =
        responses[calls.length - 1] ?? responses[responses.length - 1]
      return { content: [{ type: 'text', text }] }
    }),
  }
  return {
    client: { messages } as unknown as Parameters<
      typeof __setAnthropicClientForTests
    >[0],
    calls,
    messages,
  }
}

describe('callAunty', () => {
  beforeEach(() => {
    __setAnthropicClientForTests(null)
    delete process.env.USE_MOCK_AUNTY
  })

  it('parses a valid JSON response', async () => {
    const valid = JSON.stringify({
      score: 70,
      verdict: 'conditional',
      parentReaction:
        'Engineer ta ramro ho tara salary thorai cha. Ghar pani aafno chaina.',
      proposalEstimate: '3-5 proposals',
      redFlags: ['Salary thorai', 'Ghar chaina'],
    })
    const { client } = mockClient([valid])
    __setAnthropicClientForTests(client)

    const out = await callAunty(baseInput)
    expect(out.score).toBe(70)
    expect(out.verdict).toBe('conditional')
  })

  it('retries once on invalid JSON, then succeeds', async () => {
    const valid = JSON.stringify({
      score: 60,
      verdict: 'conditional',
      parentReaction:
        'Hmm. Sochna parcha. Ghar ko kura ta milau bhanchu.',
      proposalEstimate: '2-3',
      redFlags: ['x flag', 'y flag'],
    })
    const { client, messages } = mockClient(['not json at all', valid])
    __setAnthropicClientForTests(client)

    const out = await callAunty(baseInput)
    expect(out.score).toBe(60)
    expect(messages.create).toHaveBeenCalledTimes(2)
  })

  it('throws after two failed attempts', async () => {
    const { client } = mockClient(['nope', 'still not json'])
    __setAnthropicClientForTests(client)
    await expect(callAunty(baseInput)).rejects.toThrow()
  })

  it('extracts JSON from code fences if model wraps it', async () => {
    const valid = JSON.stringify({
      score: 80,
      verdict: 'approved',
      parentReaction:
        'Engineer ho, abroad jaane plan cha re. Tehi ho chahiyeko keto.',
      proposalEstimate: '5+ proposals this Dashain',
      redFlags: ['Aaja samma bihe gareko chaina'],
    })
    const fenced = '```json\n' + valid + '\n```'
    const { client } = mockClient([fenced])
    __setAnthropicClientForTests(client)
    const out = await callAunty(baseInput)
    expect(out.verdict).toBe('approved')
  })

  it('honors USE_MOCK_AUNTY=true and skips API', async () => {
    process.env.USE_MOCK_AUNTY = 'true'
    const { client, messages } = mockClient(['should not be called'])
    __setAnthropicClientForTests(client)
    const out = await callAunty(baseInput)
    expect(messages.create).not.toHaveBeenCalled()
    expect(out.score).toBeGreaterThanOrEqual(0)
    expect(out.score).toBeLessThanOrEqual(100)
  })
})

describe('mockAunty', () => {
  it('returns a Zod-valid AiOutput for any input', () => {
    const out = mockAunty(baseInput)
    expect(out.score).toBeGreaterThanOrEqual(0)
    expect(out.score).toBeLessThanOrEqual(100)
    expect(out.redFlags.length).toBeGreaterThan(0)
  })

  it('penalizes unemployed + regular drinking', () => {
    const out = mockAunty({
      ...baseInput,
      job: 'unemployed',
      drinksSmokes: 'regularly',
    })
    expect(out.score).toBeLessThan(40)
  })

  it('rewards doctor + 200k+', () => {
    const out = mockAunty({
      ...baseInput,
      job: 'doctor',
      salaryBand: '200k+',
    })
    expect(out.score).toBeGreaterThan(70)
  })
})
