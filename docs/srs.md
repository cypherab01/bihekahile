# Software Requirements Specification

## बिहे कहिले? — AI Nepali Parent Approval Calculator

**Version:** 0.1 (MVP)
**Owner:** Arjun
**Stack:** Next.js 16 (App Router) + TypeScript + Tailwind v4 + Google Gemini API
**Domain (target):** bihekaile.abhishekg.info.np

---

## 1. Purpose & Vision

A web app where users input life details (salary, job, lifestyle, etc.), and an AI
judges them from the perspective of a stereotypical Nepali parent/aunty. Returns a
humorous "Approval Score" with a generated parent reaction and a shareable image
card.

**Goal:** Maximize shareability on Facebook, TikTok, Instagram Reels, and group
chats during Dashain/Tihar season.

**Success looks like:**

- 10k+ unique users in first 2 weeks
- 30%+ users generate a share card
- Trending on Nepali Twitter/FB at least once

---

## 2. Target Users

- Nepali youth aged 18–32 (primary)
- Nepali diaspora abroad (secondary — high engagement, often the subject of family pressure)
- College students, early-career professionals, unmarried adults
- Indirect audience: parents/relatives who see shared cards

---

## 3. Scope

### In scope (MVP)

- Single-page web app
- Multi-section form (5–10 questions)
- AI-generated approval score (0–100)
- AI-generated parent reaction text (2–3 sentences, Nepali + English mix)
- Downloadable + shareable result card (PNG)
- Mobile-first responsive design
- Devanagari rendering
- Basic analytics (Vercel Analytics)

### Out of scope (v1)

- User accounts / login
- Leaderboards
- Saving history (no DB)
- Result URL sharing (`/result/[id]`) — one-shot only
- Voice mode
- Multi-language toggle (Nepali + English mix baked in)

### Future (v2+)

- Leaderboard ("Most roasted today")
- Compare with friends
- "Generate parent voice note" (TTS)
- Dashain/Tihar themed variants

---

## 4. Functional Requirements

### FR-1: Input Form

User answers questions across these dimensions:

| Field | Type | Example |
|-------|------|---------|
| Monthly salary (NPR) | Select (range) | `<30k`, `30–80k`, `80–200k`, `200k+` |
| Job type | Select | Government, Bank, Engineer, Doctor, "IT ma kaam", Freelancer, Unemployed, Business, Abroad |
| Country | Select | Nepal, USA, Australia, UK, Gulf, Japan, Korea, Other |
| Owns house? | Select | Yes / No / "Parents ko" |
| Vehicle | Select | None, Scooter, Bike, Car, Multiple |
| Cooking (daal-bhaat) | Select | "Bhaat pani pakauna aaudaina", Basic, Good, "Aama jasto" |
| Drinks/smokes? | Select | Never, Occasionally, Regularly, "Aamabuwa lai thaha chaina" |
| Age | Number | |
| Marital status | Select | Single, Dating, Engaged, Married |
| Caste (optional) | Free text / skip | with explicit "skip — none of aunty's business" option |

**Note on caste:** Culturally relevant for the joke but ethically sensitive.
Explicitly optional. Not stored. Not used for negative judgment by the prompt.

### FR-2: AI Scoring

- On submit, send structured input to Google Gemini API (Gemini Flash Lite for speed + free tier).
- Prompt returns strict JSON:
  `{ score, verdict, parentReaction, proposalEstimate, redFlags }`
- Validate with Zod before rendering.

### FR-3: Result Display

- Big animated score (Framer Motion count-up)
- Verdict badge: "Aunty Approved ✓" / "Conditional Approval" / "Aunty Disappointed" / "Family Emergency"
- Parent reaction in speech-bubble UI
- Estimated marriage proposals this Dashain
- Top 3 "red flags" as a list

### FR-4: Share Card

- "Download card" button → PNG via `next/og`'s `ImageResponse`.
  - Story format (1080×1920) and square (1080×1080).
- "Share" button → Web Share API on mobile, copy-link fallback on desktop.
- Card includes: score, verdict, one-line roast, domain watermark.

### FR-5: Rate Limiting

- IP-based rate limit (≈20 generations/hour) to control LLM costs.
- MVP: in-memory sliding-window keyed by IP (acceptable for single-instance MVP).
- v2: Upstash Redis if traffic grows.

---

## 5. Non-Functional Requirements

| Requirement | Target |
|-------------|--------|
| Page load (LCP) | < 2s on 4G |
| AI response time | < 4s p95 |
| Mobile-first | 90% of traffic will be mobile |
| Devanagari support | Noto Sans Devanagari, properly subset |
| Cost per generation | $0 on Gemini free tier (15 req/min) |
| Uptime | 99% (Vercel default) |

---

## 6. Architecture

```
┌─────────────────────────────────────────┐
│  Next.js 16 App (Vercel)                │
│                                         │
│  app/                                   │
│  ├── page.tsx          → Form + Result  │
│  ├── api/                               │
│  │   ├── score/        → Calls Claude   │
│  │   └── og/           → Share image    │
│  ├── about/page.tsx    → Disclaimer     │
│  └── components/                        │
└─────────────┬───────────────────────────┘
              │
              ├──→ Google Gemini API (Flash Lite)
              └──→ Vercel Analytics
```

**No database.** State lives in React, persisted to `sessionStorage` so a
refresh doesn't immediately wipe the result.

---

## 7. Tech Stack

| Layer | Choice | Reason |
|-------|--------|--------|
| Framework | Next.js 16 (App Router) | Full-stack, SSR, OG generation |
| Language | TypeScript | Type safety on AI JSON contracts |
| Styling | Tailwind CSS v4 | Speed |
| Animation | Framer Motion | Score count-up, transitions |
| Validation | Zod | AI output + form validation |
| AI | `@google/genai` | Gemini Flash Lite |
| OG Images | `next/og` `ImageResponse` | Built into Next.js |
| Rate limit | In-memory sliding window | Free, edge-compatible |
| Analytics | `@vercel/analytics` | Privacy-friendly |
| Fonts | Noto Sans Devanagari + Inter | Devanagari rendering |
| Hosting | Vercel | Zero config |

---

## 8. AI Prompt Contract

The route handler sends a system prompt like:

> You are a stereotypical Nepali aunty/parent judging a potential
> son/daughter-in-law. Be funny, exaggerated, warm but judgmental. Mix Nepali
> (Romanized) and English naturally. Never be mean about caste, religion, or
> appearance. Return ONLY valid JSON.

Output schema (validated with Zod):

```ts
{
  score: number,              // 0-100
  verdict: "approved" | "conditional" | "disappointed" | "emergency",
  parentReaction: string,     // 2-3 sentences
  proposalEstimate: string,   // "3-5 proposals this Dashain"
  redFlags: string[]          // 2-4 items
}
```

---

## 9. Content & Safety Guardrails

- No caste-based judgment. Even if the user enters caste, the AI prompt explicitly forbids using it negatively.
- No religion jokes.
- No appearance/body jokes.
- No gendered double standards.
- No real names of politicians, celebrities, or castes in output.
- Hard refuse list in the system prompt for slurs and protected characteristics.
- Footer disclaimer: "Just for fun. Not a real judgment. Your aunty's opinion is not your worth."

---

## 10. Pages & Routes

| Route | Purpose |
|-------|---------|
| `/` | Landing + form + result (all client-driven after form submit) |
| `/about` | Disclaimer, who built it, credits |
| `/api/score` | `POST` → Anthropic call → JSON result |
| `/api/og` | `GET` → PNG share card (params via query string) |

---

## 11. Data Model

**None.** No PII, no login, no DB. Only ephemeral state in React +
`sessionStorage`. The result PNG carries the brand watermark — virality
spreads via image, not URL.

---

## 12. Open Questions / Locked Decisions

| Question | Answer |
|----------|--------|
| Humor edginess | Spicy — sharp roasts, no slurs / taboo |
| Domain direction | `bihekaile.abhishekg.info.np` ("Bihe Kahile?" / "बिहे कहिले?") |
| Result persistence | One-shot, download card only — no DB |

---

## 13. Milestones

| Phase | Deliverable | Est. |
|-------|-------------|------|
| 1. Scaffold | Next.js + Tailwind + Devanagari fonts + form UI | 1 day |
| 2. AI integration | `/api/score` + Zod + spicy prompt tuning | 1–2 days |
| 3. Result UI | Animated score, aunty speech bubble, red flags | 1 day |
| 4. Share card | `next/og` with brand watermark | 1 day |
| 5. Polish | Rate limit, error states, copy pass | 1 day |
| 6. Launch | Deploy, point domain, post | 0.5 day |

Total: 5–6 days.
