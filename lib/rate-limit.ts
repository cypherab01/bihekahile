type CheckResult =
  | { ok: true; remaining: number }
  | { ok: false; retryAfterMs: number }

export interface RateLimiter {
  check(key: string): CheckResult
}

export function createRateLimiter(opts: {
  limit: number
  windowMs: number
}): RateLimiter {
  const events = new Map<string, number[]>()

  return {
    check(key) {
      const now = Date.now()
      const cutoff = now - opts.windowMs
      const arr = (events.get(key) ?? []).filter((t) => t > cutoff)

      if (arr.length >= opts.limit) {
        const oldest = arr[0]
        events.set(key, arr)
        return { ok: false, retryAfterMs: oldest + opts.windowMs - now }
      }

      arr.push(now)
      events.set(key, arr)
      return { ok: true, remaining: opts.limit - arr.length }
    },
  }
}

export const scoreLimiter = createRateLimiter({
  limit: 20,
  windowMs: 60 * 60 * 1000,
})
