import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/llm', () => ({
  callAunty: vi.fn(),
}))

import { POST } from '@/app/api/score/route'
import { callAunty } from '@/lib/llm'

const okBody = {
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

function req(body: unknown, headers: Record<string, string> = {}) {
  return new Request('http://localhost/api/score', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: JSON.stringify(body),
  })
}

describe('POST /api/score', () => {
  beforeEach(() => {
    vi.mocked(callAunty).mockReset()
  })

  it('returns 200 and result on valid input', async () => {
    vi.mocked(callAunty).mockResolvedValueOnce({
      score: 70,
      verdict: 'conditional',
      parentReaction:
        'Hmm. Tara dherai kura milau bhanchu chhori/chhora lai.',
      proposalEstimate: '3-5 proposals',
      redFlags: ['Salary thorai', 'Ghar chaina'],
    })
    const res = await POST(req(okBody, { 'x-forwarded-for': '9.9.9.9' }))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.score).toBe(70)
  })

  it('returns 400 on invalid input', async () => {
    const res = await POST(
      req({ ...okBody, job: 'astronaut' }, { 'x-forwarded-for': '9.9.9.10' }),
    )
    expect(res.status).toBe(400)
  })

  it('returns 502 if aunty throws', async () => {
    vi.mocked(callAunty).mockRejectedValueOnce(new Error('boom'))
    const res = await POST(req(okBody, { 'x-forwarded-for': '9.9.9.11' }))
    expect(res.status).toBe(502)
  })
})
