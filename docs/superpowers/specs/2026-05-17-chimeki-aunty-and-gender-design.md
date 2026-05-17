# Chimeki Aunty persona + gender-flavored roasts + darker comedy

**Date:** 2026-05-17
**Status:** Draft, awaiting user review
**Owner:** Arjun

## Goal

Three coordinated changes to the existing "Bihe Kahile?" app:

1. **Persona:** Name the aunty. The system prompt already describes her — give her the explicit name **Chimeki Aunty** ("छिमेकी आन्टी") and surface that name in the UI. Product name stays "Bihe Kahile?". No domain change.
2. **Gender support:** Add a `gender` field to the form (`man` / `woman` / `skip`). Pipe it into the prompt as a **flavor lens** — gender changes which cultural pressures, which invented cousins, and which doomsday scenarios aunty deploys; it does NOT change the severity of penalties on any behavior.
3. **Darker comedy:** Push catastrophizing harder. More bleak, more existential, more meme-specific. The destruction stays aimed at *choices* (job, salary, lifestyle, hiding behavior) and *life trajectory*. The existing hard rules (no caste, religion, appearance, body, gender severity bias) stay locked.

## Non-goals

- Renaming the app or buying a new domain.
- Saving any new PII. Gender is form-state only, sent to the prompt, never persisted.
- Adding non-binary as a roast variable. "Skip" handles "prefer not to say" — the joke engine doesn't have a non-binary script worth committing to, and a bad one would be worse than none.
- Touching rate limiting, share card layout, or analytics.

## Design

### 1. Brand & persona

`lib/brand.ts` gains two constants:

```ts
export const PERSONA_NAME = 'Chimeki Aunty'
export const PERSONA_NAME_DEVA = 'छिमेकी आन्टी'
```

Persona surfaces in exactly these places (no more, no less — restraint is the joke):

- **Result card speech bubble** — small header "— Chimeki Aunty" above or below the reaction text.
- **About page** — one line introducing her ("Your judge today is Chimeki Aunty. She's seen things.").
- **OG share card** — small subtitle under the score: "Judged by Chimeki Aunty".

Product name (`APP_NAME_LATIN = 'Bihe Kahile?'`) and `APP_TAGLINE` are unchanged. The domain is unchanged.

### 2. Gender field

**Schema** (`lib/schemas.ts`):

```ts
export const Gender = z.enum(['man', 'woman', 'skip'])
// ApprovalInputSchema gains:
gender: Gender
```

`gender` is required in the schema but the form offers a "Skip — none of aunty's business" option that maps to `'skip'`. No default — force a choice so we don't infer one. Order in the form: right after age, before marital status.

**Form** (`app/components/Form/`): add `GENDER_OPTIONS` to `FORM_OPTIONS.ts`, render as a select via `FormField`.

**User prompt** (`lib/prompt.ts` `buildUserPrompt`): append a `Gender: <man|woman|skip>` line.

**System prompt** (`lib/prompt.ts` `buildSystemPrompt`): add a new section that distinguishes *flavor* from *severity*:

> GENDER LENS — flavor only, never severity:
> - Same behaviors get the same score and same penalty regardless of gender. Drinking, smoking, hiding things, unemployment, can't cook — identical hits for `man`, `woman`, and `skip`.
> - But the CULTURAL REFERENCES change. Aunty's invented cousins, the doomsday scenarios she paints, and the life-stage pressure she invokes shift by gender — because that's what a real chimeki aunty does.
> - **For `woman`:** invent overachieving female cousins ("Geeta aunty ko bhanji Anjali le 24 mai bihe garera Sydney gayee"). Bleak life-stage scenarios skew toward biological clock and being-the-last-unmarried-one ("30 ma single — tero classmate haru ko bachha haru school ja-na thaale"). Cooking and household competence weigh in flavor (not severity).
> - **For `man`:** invent overachieving male cousins ("Sushma ko chhora Bishal ko Fortuner 3 barsa puranai bhaisakyo"). Bleak life-stage scenarios skew toward provider failure and property ("ghar chaina, gaadi chaina, 32 ma single — kasle dincha chhori?"). Salary and property weigh in flavor (not severity).
> - **For `skip`:** keep references gender-ambiguous. Use "tero classmate" / "tero batch" instead of gendered cousins. Don't ask aunty to play dumb — she just doesn't have a script.

**Mock fallback** (`lib/llm.ts` `mockAunty`): keep deterministic scoring identical (severity is gender-blind). Replace the verdict-keyed reactions with **gender-keyed reactions per verdict** — one reaction string per `(verdict, gender)` pair, plus a generic `skip` script. Same scores, same red flags, gender-flavored prose only.

### 3. Darker comedy

The current prompt is already in dark-comedy territory. The change is **commitment**, not a new direction:

- **Intensify catastrophizing.** Specific, bleak future scenarios — "5 barsa pachi ek-bigha jamin ko biraalo sangai", "amabuwa ko 25th wedding anniversary ma timi single jasari basne", "tero life ko insurance ko nominee section khali ho — pre-grief gareko cha aamale". Add 4-6 more reusable bleak anchors to the system prompt, gender-tagged.
- **Tighten pacing.** Shorter sentences. More fragments. The current prompt already says this — re-emphasize with a "PACING > LENGTH" rule near the top.
- **Add one new commandment** to the TONE COMMANDMENTS list: *"7. EXISTENTIAL > situational. The deepest cut isn't 'your job is bad', it's 'this is who you'll be at 40'. Make her predict the trajectory."*
- **Refresh vibe anchors.** Replace the four existing per-verdict vibe anchors with two-per-verdict, gender-tagged where the example would differ — total 8 anchors. Keep them short.

### 4. Safety rules (unchanged, just clarified)

The existing HARD RULES stay verbatim. The new gender-lens section explicitly cross-references the severity rule so the prompt is internally consistent:

> The gender lens controls FLAVOR (which cousin, which scenario, which pressure). It does NOT control SEVERITY (the score impact of a given behavior). Drinking is drinking. Hiding things is hiding things. Unemployment is unemployment. Same hit for everyone. See HARD RULES.

The test file enforces both halves: that gender flavor is referenced AND that the equal-severity rule survives.

## Component-level changes

| File | Change |
|------|--------|
| `lib/schemas.ts` | Add `Gender` enum, add `gender` field to `ApprovalInputSchema` |
| `lib/brand.ts` | Add `PERSONA_NAME`, `PERSONA_NAME_DEVA` |
| `lib/prompt.ts` | Add gender lens section, intensify catastrophizing, tighten pacing rule, new commandment #7, refresh vibe anchors, append `Gender:` line in `buildUserPrompt` |
| `lib/llm.ts` | `mockAunty` keyed by `(verdict, gender)` for reaction; scoring untouched |
| `lib/__tests__/prompt.test.ts` | New tests: gender lens referenced, equal-severity rule present, persona name present, no gender-severity contradiction |
| `lib/__tests__/schemas.test.ts` | Add `gender` to valid input fixtures; assert `gender: 'invalid'` fails |
| `lib/__tests__/llm.test.ts` | Update mock fixtures to include `gender`; assert mock reactions differ across `man`/`woman` for the same other inputs |
| `app/components/Form/FORM_OPTIONS.ts` | Add `GENDER_OPTIONS` |
| `app/components/Form/ApprovalForm.tsx` | Add gender `<select>`, place after age, before marital |
| `app/components/Result/AuntySpeechBubble.tsx` | Add "— Chimeki Aunty" attribution |
| `app/about/page.tsx` | One-line persona intro |
| `app/api/og/route.tsx` | "Judged by Chimeki Aunty" subtitle (ASCII-safe, already ASCII) |
| `app/__tests__/score.route.test.ts` | Update fixture to include `gender` |

## Data flow

No change to flow. Input gains one field; output schema (`AiOutputSchema`) is **unchanged** — the prompt is what's gender-aware, not the response shape. This means no migration on the share card or the OG image; their inputs (`score`, `verdict`, `reaction`) all come from the same fields as before.

## Testing strategy

- **Prompt structure tests** (locked, fail-loudly): caste/religion/appearance/body/gender-severity rules survive, gender-lens flavor language is present, persona name is in the prompt, JSON contract intact.
- **Schema tests:** `gender` required, three valid values, rejects other strings.
- **Mock tests:** for same input but different `gender`, `parentReaction` differs; `score` and `redFlags` are identical (severity proof).
- **Route test:** existing fixture extended with `gender`.

No tests of the live Gemini call — that stays manual via `pnpm dev` with a real key, or `USE_MOCK_AUNTY=true` for everything else.

## Risks & mitigations

| Risk | Mitigation |
|------|------------|
| The "darker" tuning crosses into protected-class territory | Test-locks already block caste/religion/appearance/body/gender-severity. New commandment is about *trajectory*, not identity. Existing guardrails catch any drift. |
| Gender flavor accidentally encodes severity (e.g., a "woman" reaction implicitly penalizes drinking harder than the same input for "man") | Mock test asserts identical `score` and `redFlags` across genders for matching inputs. For the live model, the prompt explicitly forbids it and the existing severity-rule test still passes. |
| Skip-gender becomes a degenerate path that gives weak roasts | Prompt explicitly says "don't play dumb — pick gender-ambiguous references". Mock has its own `skip` script, not a fallback to `man`. |
| Persona name appears inconsistently across UI surfaces (sometimes "Chimeki Aunty", sometimes "aunty") | All surfaces read from `PERSONA_NAME` constant. Find/replace at the source. |

## Out of scope (deferred)

- Translating the persona name to Devanagari on the OG card (font subset limitation, same reason existing card is ASCII-only).
- Per-gender share-card variants.
- Storing/analytics-ing gender ratio (no DB by design).

## Open questions

None. Implementation can proceed.
