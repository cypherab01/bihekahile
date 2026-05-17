# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

Package manager is **pnpm** (see `pnpm-lock.yaml`, `pnpm-workspace.yaml`). Do not use npm/yarn.

```bash
pnpm dev                       # next dev — http://localhost:3000
pnpm build                     # next build
pnpm lint                      # eslint (flat config, eslint-config-next)
pnpm test                      # vitest run (one-shot)
pnpm test:watch                # vitest interactive
pnpm test path/to/file.test.ts # single file
pnpm test -t "substring"       # single test by name
```

No typecheck script — TS is checked as part of `next build`. There is no separate typecheck command.

## Architecture

One-shot, no-database web app. State lives in React + `sessionStorage` (`bihe-kahile:last-result` key in `app/page.tsx`); refresh restores the last result but nothing persists server-side.

**Request flow (the only real flow):**

1. `app/components/Form/ApprovalForm.tsx` collects answers, validates with `ApprovalInputSchema` client-side, then POSTs to `/api/score`.
2. `app/api/score/route.ts` re-validates (never trust the client), runs `scoreLimiter.check(ip)` (in-memory sliding window, 20/hr per IP — see `lib/rate-limit.ts`), then calls `callAunty()`.
3. `lib/llm.ts` `callAunty()` calls Gemini via `@google/genai` with the system prompt from `lib/prompt.ts`, parses the JSON response, and validates with `AiOutputSchema`. **It retries exactly once on any failure** before bubbling a combined error. If `USE_MOCK_AUNTY=true`, returns `mockAunty()` deterministically without an API call.
4. `app/components/Result/ResultCard.tsx` renders the result. `ShareActions` fetches `/api/og?score=…&verdict=…&reaction=…&format=story|square` to get a PNG share card.
5. `app/api/og/route.tsx` renders via `next/og` `ImageResponse`. Note: `clampToAscii()` strips non-ASCII because `ImageResponse` ships only the default Latin font here — **Romanized Nepali only on the card, never Devanagari**.

**Boundaries to respect:**

- `lib/schemas.ts` is the source of truth for the AI contract. Both `app/api/score/route.ts` (input validation) and `lib/llm.ts` (output validation) parse against it. Update the schema and you update the contract.
- `lib/prompt.ts` safety guardrails (no caste / religion / appearance / body / gender double standards) are **test-locked** in `lib/__tests__/prompt.test.ts`. Loosening the prompt fails CI. Don't soften them.
- `lib/llm.ts` exports `__setLlmClientForTests()` for injection — tests should use that, not mock `@google/genai`.
- Path alias `@/*` → repo root (e.g. `@/lib/schemas`, `@/app/components/...`).

**Env vars** (`.env.example`): `GEMINI_API_KEY` required in prod; `GEMINI_MODEL` overrides default (`gemini-3.1-flash-lite`); `USE_MOCK_AUNTY=true` bypasses the API entirely. For frontend work without burning quota, prefer the mock over a real key.

**Runtime pinning:** both API routes set `runtime = 'nodejs'` and `dynamic = 'force-dynamic'`. The OG route depends on Node APIs in `next/og`; don't switch them to edge without testing.
