import { GoogleGenAI } from '@google/genai'
import {
  AiOutputSchema,
  type AiOutput,
  type ApprovalInput,
} from '@/lib/schemas'
import { buildSystemPrompt, buildUserPrompt } from '@/lib/prompt'

const DEFAULT_MODEL = 'gemini-3.1-flash-lite'

export interface LlmClient {
  generate(args: {
    model: string
    systemInstruction: string
    contents: string
  }): Promise<string>
}

let injected: LlmClient | null = null

export function __setLlmClientForTests(c: LlmClient | null) {
  injected = c
}

function getClient(): LlmClient {
  if (injected) return injected
  const key = process.env.GEMINI_API_KEY
  if (!key) throw new Error('GEMINI_API_KEY is not set')
  const ai = new GoogleGenAI({ apiKey: key })
  return {
    async generate({ model, systemInstruction, contents }) {
      const resp = await ai.models.generateContent({
        model,
        contents,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          temperature: 0.9,
          maxOutputTokens: 600,
        },
      })
      return resp.text ?? ''
    },
  }
}

function extractJson(text: string): string {
  const trimmed = text.trim()
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) return trimmed
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]+?)```/)
  if (fenced) return fenced[1].trim()
  const start = trimmed.indexOf('{')
  const end = trimmed.lastIndexOf('}')
  if (start >= 0 && end > start) return trimmed.slice(start, end + 1)
  return trimmed
}

async function callOnce(input: ApprovalInput): Promise<AiOutput> {
  const client = getClient()
  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL
  const text = await client.generate({
    model,
    systemInstruction: buildSystemPrompt(),
    contents: buildUserPrompt(input),
  })
  const json = extractJson(text)
  const parsed = JSON.parse(json)
  return AiOutputSchema.parse(parsed)
}

export async function callAunty(input: ApprovalInput): Promise<AiOutput> {
  if (process.env.USE_MOCK_AUNTY === 'true') {
    return mockAunty(input)
  }
  try {
    return await callOnce(input)
  } catch (firstErr) {
    try {
      return await callOnce(input)
    } catch (secondErr) {
      throw new Error(
        `Aunty refused to answer twice. First: ${(firstErr as Error).message}. Second: ${(secondErr as Error).message}`,
      )
    }
  }
}

export function mockAunty(input: ApprovalInput): AiOutput {
  let s = 50
  if (input.job === 'doctor' || input.job === 'engineer') s += 15
  if (input.job === 'government' || input.job === 'bank') s += 12
  if (input.job === 'unemployed') s -= 30
  if (input.salaryBand === '200k+') s += 15
  if (input.salaryBand === '<30k') s -= 10
  if (input.ownsHouse === 'yes') s += 8
  if (input.cooking === 'aama-jasto') s += 8
  if (input.cooking === 'cant') s -= 8
  if (
    input.drinksSmokes === 'regularly' ||
    input.drinksSmokes === 'secret'
  )
    s -= 12
  if (input.country !== 'nepal') s += 6
  s = Math.max(0, Math.min(100, s))

  const verdict: AiOutput['verdict'] =
    s >= 75
      ? 'approved'
      : s >= 50
        ? 'conditional'
        : s >= 25
          ? 'disappointed'
          : 'emergency'

  const reactions: Record<AiOutput['verdict'], string> = {
    approved: `${input.job.charAt(0).toUpperCase() + input.job.slice(1)} with an actual salary. Aunty has had worse Mondays. The proposals will arrive whether you want them or not — bichara, even the Sharma cousin will be interested.`,
    conditional: `${input.job.charAt(0).toUpperCase() + input.job.slice(1)} is acceptable, but the rest reads like a half-finished CV. We will need to lie strategically before any rishta meeting. Dukha lagyo, but workable.`,
    disappointed: `On paper, you exist. In practice, the neighbors are already drafting their gossip. Aunty's friend Geeta's son is doing better at half your age, and that comparison will be repeated at every family puja for a decade.`,
    emergency: `Aamabuwa has stopped attending the puja. The priest has been called. The family WhatsApp group is in mourning. Marriage is no longer the goal — survival is.`,
  }

  const flags: string[] = []
  if (input.salaryBand === '<30k')
    flags.push('Salary borderline charity case')
  if (input.cooking === 'cant')
    flags.push('Cannot make daal-bhaat. Will starve in-laws.')
  if (input.drinksSmokes === 'regularly')
    flags.push('Drinks openly. Aunties have noticed.')
  if (input.drinksSmokes === 'secret')
    flags.push('Hides drinking from parents — coward AND drunk')
  if (input.ownsHouse === 'no') flags.push('Rents like a college student')
  if (input.vehicle === 'none') flags.push('No vehicle. Walking partner.')
  if (input.maritalStatus === 'single' && input.age >= 28)
    flags.push(`${input.age} and unmarried. Log ke kahenge?`)
  if (input.job === 'unemployed')
    flags.push('Unemployed adult. Existential threat.')
  if (input.job === 'freelancer')
    flags.push('"Freelancer" — code for unemployed with a router')
  if (flags.length < 2)
    flags.push('Aunty smells deception in the answers')

  return {
    score: s,
    verdict,
    parentReaction: reactions[verdict],
    proposalEstimate:
      verdict === 'approved'
        ? 'Five or six. All sincere.'
        : verdict === 'conditional'
          ? 'Two. Both from desperate aunties.'
          : verdict === 'disappointed'
            ? 'One. From a distant cousin nobody likes.'
            : 'Zero. Aamabuwa cancelled Dashain.',
    redFlags: flags.slice(0, 4),
  }
}
