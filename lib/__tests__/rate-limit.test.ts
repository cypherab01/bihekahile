import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createRateLimiter } from '@/lib/rate-limit'

describe('createRateLimiter', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'))
  })

  it('allows up to `limit` requests within the window', () => {
    const limiter = createRateLimiter({ limit: 3, windowMs: 60_000 })
    expect(limiter.check('1.2.3.4').ok).toBe(true)
    expect(limiter.check('1.2.3.4').ok).toBe(true)
    expect(limiter.check('1.2.3.4').ok).toBe(true)
    expect(limiter.check('1.2.3.4').ok).toBe(false)
  })

  it('isolates keys', () => {
    const limiter = createRateLimiter({ limit: 1, windowMs: 60_000 })
    expect(limiter.check('a').ok).toBe(true)
    expect(limiter.check('b').ok).toBe(true)
    expect(limiter.check('a').ok).toBe(false)
  })

  it('rolls events out of the window', () => {
    const limiter = createRateLimiter({ limit: 2, windowMs: 1000 })
    expect(limiter.check('x').ok).toBe(true)
    expect(limiter.check('x').ok).toBe(true)
    expect(limiter.check('x').ok).toBe(false)
    vi.advanceTimersByTime(1001)
    expect(limiter.check('x').ok).toBe(true)
  })

  it('returns retryAfterMs when blocked', () => {
    const limiter = createRateLimiter({ limit: 1, windowMs: 5000 })
    limiter.check('y')
    vi.advanceTimersByTime(2000)
    const r = limiter.check('y')
    expect(r.ok).toBe(false)
    if (!r.ok) {
      expect(r.retryAfterMs).toBeGreaterThan(2500)
      expect(r.retryAfterMs).toBeLessThanOrEqual(3000)
    }
  })
})
