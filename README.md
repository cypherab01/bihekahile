# बिहे कहिले? (Bihe Kahile?)

Spicy AI Nepali aunty rates your life choices on a 0–100 approval scale.
One-shot, downloadable share card, no database.

## Local dev

```bash
cp .env.example .env.local
# Edit .env.local — either set ANTHROPIC_API_KEY or USE_MOCK_AUNTY=true
pnpm install
pnpm dev
```

Open http://localhost:3000.

## Tests

```bash
pnpm test         # one shot
pnpm test:watch   # interactive
```

## Deploy (Vercel)

1. Push this repo to GitHub.
2. Import to Vercel.
3. Add `ANTHROPIC_API_KEY` as an environment variable.
4. Set the production domain (`bihekahile.com`).

## What's where

- `app/page.tsx` — landing page, form ↔ result orchestrator
- `app/api/score/route.ts` — POST: validate + call Claude + return JSON
- `app/api/og/route.tsx` — GET: ImageResponse share card
- `app/about/page.tsx` — disclaimer + how-it-works
- `lib/` — schemas, prompt, anthropic client, rate limiter, brand constants, verdict helper
- `docs/srs.md` — the spec
- `docs/superpowers/plans/` — implementation plans

## Safety guardrails

The system prompt in `lib/prompt.ts` forbids caste-, religion-, appearance-,
and body-based judgment and gender double standards. These constraints are
test-locked — `lib/__tests__/prompt.test.ts` will fail if they're removed.
