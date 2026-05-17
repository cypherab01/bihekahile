import { z } from 'zod'

export const SalaryBand = z.enum(['<30k', '30-80k', '80-200k', '200k+'])
export const Job = z.enum([
  'government',
  'bank',
  'engineer',
  'doctor',
  'it',
  'freelancer',
  'unemployed',
  'business',
  'abroad',
  'other',
])
export const Country = z.enum([
  'nepal',
  'usa',
  'australia',
  'uk',
  'gulf',
  'japan',
  'korea',
  'other',
])
export const OwnsHouse = z.enum(['yes', 'no', 'parents'])
export const Vehicle = z.enum(['none', 'scooter', 'bike', 'car', 'multiple'])
export const Cooking = z.enum(['cant', 'basic', 'good', 'aama-jasto'])
export const DrinksSmokes = z.enum([
  'never',
  'occasionally',
  'regularly',
  'secret',
])
export const MaritalStatus = z.enum(['single', 'dating', 'engaged', 'married'])
export const Gender = z.enum(['man', 'woman', 'skip'])

export const ApprovalInputSchema = z.object({
  salaryBand: SalaryBand,
  job: Job,
  country: Country,
  ownsHouse: OwnsHouse,
  vehicle: Vehicle,
  cooking: Cooking,
  drinksSmokes: DrinksSmokes,
  age: z.number().int().min(16).max(80),
  maritalStatus: MaritalStatus,
  gender: Gender,
  caste: z
    .string()
    .transform((s) => s.slice(0, 60))
    .default(''),
})

export type ApprovalInput = z.infer<typeof ApprovalInputSchema>

export const VerdictSchema = z.enum([
  'approved',
  'conditional',
  'disappointed',
  'emergency',
])
export type Verdict = z.infer<typeof VerdictSchema>

export const AiOutputSchema = z.object({
  score: z.number().int().min(0).max(100),
  verdict: VerdictSchema,
  parentReaction: z.string().min(20).max(600),
  proposalEstimate: z.string().min(3).max(160),
  redFlags: z.array(z.string().min(2).max(120)).min(1).max(6),
})

export type AiOutput = z.infer<typeof AiOutputSchema>
