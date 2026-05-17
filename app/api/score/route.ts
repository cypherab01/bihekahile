import { ApprovalInputSchema } from '@/lib/schemas'
import { callAunty } from '@/lib/llm'
import { scoreLimiter } from '@/lib/rate-limit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function ipFrom(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0].trim()
  const real = req.headers.get('x-real-ip')
  if (real) return real
  return 'unknown'
}

export async function POST(req: Request) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = ApprovalInputSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json(
      { error: 'Invalid input', details: parsed.error.flatten() },
      { status: 400 },
    )
  }

  const ip = ipFrom(req)
  const rl = scoreLimiter.check(ip)
  if (!rl.ok) {
    return Response.json(
      {
        error: 'Rate limit. Aunty needs a chiya break.',
        retryAfterMs: rl.retryAfterMs,
      },
      {
        status: 429,
        headers: {
          'retry-after': String(Math.ceil(rl.retryAfterMs / 1000)),
        },
      },
    )
  }

  try {
    const out = await callAunty(parsed.data)
    return Response.json(out, { status: 200 })
  } catch (err) {
    return Response.json(
      {
        error: 'Aunty is offline. Try again.',
        detail: (err as Error).message,
      },
      { status: 502 },
    )
  }
}
