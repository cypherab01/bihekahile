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
    approved: `Wah! ${input.job} ho, ramro keto/keti rahecha. Aja bholi ko time ma yesto manche pauna gahro cha. Pakka proposal pathaune.`,
    conditional: `Hmm. ${input.job} ta ramro ho tara euta-duita kura milauna parcha. Salary tira pani dhyaan pugnu paryo ni.`,
    disappointed: `Aunty malai dukha lagyo. ${input.job} bhanera bujhaucha tara saath ma ${input.drinksSmokes === 'regularly' ? 'piune-khane' : 'arko'} kura sune.`,
    emergency: `Yo ke ho? Buwa-aamalai ke bhanne? Pheri socha — aja bholi yo umer ma kheri yesto hunchha?`,
  }

  const flags: string[] = []
  if (input.salaryBand === '<30k') flags.push('Salary atti kam')
  if (input.cooking === 'cant') flags.push('Daal-bhaat pani aaudaina')
  if (input.drinksSmokes === 'regularly') flags.push('Piune-khane ko bani')
  if (input.drinksSmokes === 'secret')
    flags.push('Aamabuwa lai luka-aune adat')
  if (input.ownsHouse === 'no') flags.push('Aafno ghar chaina')
  if (input.vehicle === 'none') flags.push('Sawari sadhan ekdam chaina')
  if (input.maritalStatus === 'single' && input.age >= 28)
    flags.push(`${input.age} bhayo, bihe kahile?`)
  if (flags.length < 2) flags.push('Kura sunne aadat thorai cha jasto cha')

  return {
    score: s,
    verdict,
    parentReaction: reactions[verdict],
    proposalEstimate:
      verdict === 'approved'
        ? '5-8 proposals this Dashain'
        : verdict === 'conditional'
          ? '2-4 proposals'
          : verdict === 'disappointed'
            ? '1 proposal (from a dur ko relative)'
            : '0 proposals (aunty cancelling Dashain plans)',
    redFlags: flags.slice(0, 4),
  }
}
