import { ImageResponse } from 'next/og'
import { VerdictSchema, type Verdict } from '@/lib/schemas'
import { verdictAccent, verdictLabelPlain } from '@/lib/verdict'
import { DOMAIN, APP_NAME_LATIN } from '@/lib/brand'

export const runtime = 'edge'

function clampToAscii(s: string): string {
  return s.replace(/[^\x20-\x7E]/g, '').trim()
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)

    const scoreRaw = Number(searchParams.get('score'))
    const score = Number.isFinite(scoreRaw)
      ? Math.max(0, Math.min(100, Math.round(scoreRaw)))
      : 50

    const verdictParsed = VerdictSchema.safeParse(
      searchParams.get('verdict') ?? 'conditional',
    )
    const verdict: Verdict = verdictParsed.success
      ? verdictParsed.data
      : 'conditional'

    const reaction = clampToAscii(
      (searchParams.get('reaction') ?? '').slice(0, 300),
    )

    const format =
      searchParams.get('format') === 'square' ? 'square' : 'story'

    const accent = verdictAccent(verdict)
    const size =
      format === 'square'
        ? { width: 1080, height: 1080 }
        : { width: 1080, height: 1920 }

    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            padding: '120px 80px 80px',
            background: 'linear-gradient(180deg, #fff8ee 0%, #f5e7c8 100%)',
            color: '#2a1a10',
            fontFamily: 'sans-serif',
          }}
        >
          <div
            style={{
              display: 'flex',
              fontSize: 40,
              color: '#b45309',
              fontWeight: 700,
              letterSpacing: 2,
            }}
          >
            {APP_NAME_LATIN.toUpperCase()}
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 24,
              color: '#5a4434',
              marginTop: 8,
            }}
          >
            Aunty Approval Score
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              marginTop: 60,
            }}
          >
            <div
              style={{
                display: 'flex',
                fontSize: format === 'square' ? 220 : 280,
                fontWeight: 800,
                lineHeight: 1,
              }}
            >
              {score}
            </div>
            <div
              style={{
                display: 'flex',
                fontSize: format === 'square' ? 80 : 96,
                color: '#5a4434',
              }}
            >
              /100
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              marginTop: 32,
              padding: '14px 36px',
              borderRadius: 999,
              background: accent.bg,
              color: accent.fg,
              fontWeight: 700,
              fontSize: 36,
            }}
          >
            {verdictLabelPlain(verdict)}
          </div>

          {reaction && (
            <div
              style={{
                display: 'flex',
                marginTop: 70,
                fontSize: format === 'square' ? 28 : 34,
                lineHeight: 1.4,
                textAlign: 'center',
                maxWidth: 880,
                color: '#2a1a10',
              }}
            >
              {reaction}
            </div>
          )}

          <div
            style={{
              display: 'flex',
              marginTop: 'auto',
              fontSize: 26,
              color: '#5a4434',
              fontWeight: 600,
              letterSpacing: 2,
            }}
          >
            {DOMAIN}
          </div>
        </div>
      ),
      {
        ...size,
        headers: {
          'cache-control': 'public, max-age=60',
        },
      },
    )
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: 'OG render failed',
        detail: (err as Error).message,
      }),
      { status: 500, headers: { 'content-type': 'application/json' } },
    )
  }
}
