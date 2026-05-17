import { ImageResponse } from 'next/og'
import { AiOutputSchema, VerdictSchema } from '@/lib/schemas'
import { verdictAccent, verdictLabel } from '@/lib/verdict'
import { DOMAIN, APP_NAME_LATIN } from '@/lib/brand'

export const runtime = 'edge'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const score = Number(searchParams.get('score'))
  const verdict = VerdictSchema.parse(
    searchParams.get('verdict') ?? 'conditional',
  )
  const reaction = (searchParams.get('reaction') ?? '').slice(0, 300)
  const format = searchParams.get('format') === 'square' ? 'square' : 'story'

  const validScore = AiOutputSchema.shape.score.parse(score)
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
              fontSize: format === 'square' ? 220 : 280,
              fontWeight: 800,
              lineHeight: 1,
            }}
          >
            {validScore}
          </div>
          <div
            style={{
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
          {verdictLabel(verdict)}
        </div>

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
}
