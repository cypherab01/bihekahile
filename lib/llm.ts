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
    approved: `${input.job.charAt(0).toUpperCase() + input.job.slice(1)} ho, salary pani thik — Sushma ko chhora le yo profile padhera depression ma jancha. Proposal ko line lagcha — actual line. Tara ahile dekhi humble bhayera basa.`,
    conditional: `${input.job.charAt(0).toUpperCase() + input.job.slice(1)} ta thik tara ${input.vehicle === 'scooter' || input.vehicle === 'none' ? 'scooter chadhera 28 ma — Bishal ko Fortuner 3 barsa puranai bhaisakyo' : 'salary ramro chaina'}. Basically tenant with a job title. Rishta meeting ma half kura luka-aune ho.`,
    disappointed: `${input.job === 'freelancer' ? 'Freelancer — code for "WiFi sangai bekaar"' : 'Yo CV pani CV ho?'}. Aaja bholi ko bachha haru UPSC dindai chhan, timi laptop boki coffee shop ma berauchhau. Geeta aunty laai call ja-na bhayo — news ramro hoina.`,
    emergency: `Yo CV padhera aunty ko chiya thanda bhayo. Job chaina, bani-byabahaar pani prasna, basic survival pani audit garnu parne. Priest call gareko cha — for you, not the marriage.`,
  }

  const flags: string[] = []
  if (input.salaryBand === '<30k')
    flags.push('Salary basically charity case')
  if (input.cooking === 'cant')
    flags.push('Daal-bhaat pani aaudaina — future divorce confirmed')
  if (input.drinksSmokes === 'regularly')
    flags.push('Khulasta piune-khane — aunties have noticed')
  if (input.drinksSmokes === 'secret')
    flags.push('Aamabuwa lai luka-aune — coward AND guilty')
  if (input.ownsHouse === 'no')
    flags.push('Rent ma — tenant with extra steps')
  if (input.vehicle === 'none')
    flags.push('Vehicle chaina, walking partner')
  if (input.maritalStatus === 'single' && input.age >= 28)
    flags.push(`${input.age} ma single — log ke kahenge?`)
  if (input.job === 'unemployed')
    flags.push('Bekaar adult — existential threat')
  if (input.job === 'freelancer')
    flags.push('"Freelancer" — WiFi sangai bekaar')
  if (flags.length < 2)
    flags.push('Kura luka-aune jasto — aunty smells deception')

  return {
    score: s,
    verdict,
    parentReaction: reactions[verdict],
    proposalEstimate:
      verdict === 'approved'
        ? 'Pacha-cha jana — sincere haru. Geeta aunty matra kohi mathi sochirakkhi cha.'
        : verdict === 'conditional'
          ? 'Dui jana — duitai desperate aunty haru bata.'
          : verdict === 'disappointed'
            ? 'Ek jana — dur ko relative jasle kohi chinchhainan.'
            : 'Zero — aamabuwa le Dashain cancel garne kura garchhan.',
    redFlags: flags.slice(0, 4),
  }
}
