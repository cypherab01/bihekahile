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

type Verdict = AiOutput['verdict']
type Gender = ApprovalInput['gender']

const REACTIONS: Record<Verdict, Record<Gender, string>> = {
  approved: {
    woman:
      'Doctor, ghar aafno, daal-bhaat pakauna aaucha — Geeta aunty ko bhanji Anjali yo CV padhera apnai sagaai cancel garchhe. Proposal ko line — actual line. Tara humble bhayera basa, perfect chhori haru pani jhuto agreement ma dubeko cha.',
    man: 'Doctor ho, ghar aafno, gaadi chha — Sushma ko chhora Bishal yo CV padhera depression ma janchha. Proposal ko line — actual line — Pokhara samma. Tara humble bhayera basa, perfect keto haru pani aaja bholi tax fraud ma fanseko cha.',
    skip: 'Yo CV ramro cha — tero batch ma kasailai DM ma screenshot ja-na thaalisko. Proposal ko line lagcha — actual line. Tara humble bhayera basa, aaja ko ramro CV bholi ko regret ho.',
  },
  conditional: {
    woman:
      'Workable cha tara 28 ma scooter? Anjali ko Tesla lease ho — at least pretension cha. Cooking basic — rishta-meeting ko taste-test ma fail-fanseu hai. Half kura luka-aune ho — we both know it.',
    man: 'Workable cha tara 28 ma scooter — Bishal ko Fortuner 3 barsa puranai bhaisakyo. Salary cha but ghar chaina, basically tenant with a job title. Rishta meeting ma half kura luka-aune ho — we both know it.',
    skip: 'Workable cha tara basics ma cha gap. Ghar chaina, gaadi sano, salary middle — basically pretension ko tenant. Rishta meeting ma half kura luka-aune ho — we both know it.',
  },
  disappointed: {
    woman:
      'Freelancer, ghar chaina — Anjali ko bachha le tero photo dekhera "aunty ko didi ho?" bhaneko cha. Geeta aunty laai call ja-na bhayo. Save the date for Dashain ko sympathy chiya — already booked cha.',
    man: 'Freelancer — code for "WiFi sangai bekaar". Aaja bholi ka bachha haru UPSC clear gardai chhan, timi cafe ma laptop ma stare gardai. Bishal le tero LinkedIn block gareko cha — second-hand embarrassment bata. Geeta aunty samma news pugiskyo.',
    skip: 'Yo CV padhera aunty le chiya bich ma chodi-yin. Job ramro chaina, ghar chaina — tero batch ko WhatsApp group ma sahanubhuti emoji aaucha. Geeta aunty laai news pugiskyo.',
  },
  emergency: {
    woman:
      'Yo CV padhera aunty ko chiya thanda bhayo. Job chaina, ghar chaina, bani-byabahaar pani audit. 35 ma ek-bigha jamin ko biraalo sangai Dashain ko trailer dekhaa-cha aunty le. Priest call gariskeko — for you, not the marriage.',
    man: 'Yo CV padhera aunty ko chiya thanda bhayo. Job chaina, ghar chaina, gaadi chaina, bani-byabahaar pani prasna. Bihe ta dur ko kura — life insurance ko nominee section khali ho. Aamabuwa le pre-grief gareko cha already. Priest call gareko — for you, not the marriage.',
    skip: 'Yo CV padhera aunty ko chiya thanda bhayo. Job chaina, ghar chaina, bani-byabahaar pani audit garnu parne avastha. 40 ma cat sangai Dashain — aunty le pahile nai dekhi sakeko cha. Priest call gareko — for you, not the marriage.',
  },
}

const PROPOSAL_ESTIMATE: Record<Verdict, string> = {
  approved:
    'Pacha-cha jana — sincere haru. Geeta aunty matra kohi mathi sochirakkhi cha.',
  conditional: 'Dui jana — duitai desperate aunty haru bata.',
  disappointed: 'Ek jana — dur ko relative jasle kohi chinchhainan.',
  emergency: 'Zero — aamabuwa le Dashain cancel garne kura garchhan.',
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

  const verdict: Verdict =
    s >= 75
      ? 'approved'
      : s >= 50
        ? 'conditional'
        : s >= 25
          ? 'disappointed'
          : 'emergency'

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
    parentReaction: REACTIONS[verdict][input.gender],
    proposalEstimate: PROPOSAL_ESTIMATE[verdict],
    redFlags: flags.slice(0, 4),
  }
}
