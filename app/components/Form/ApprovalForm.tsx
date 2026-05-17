'use client'

import { FormField } from './FormField'
import {
  SALARY_OPTIONS,
  JOB_OPTIONS,
  COUNTRY_OPTIONS,
  HOUSE_OPTIONS,
  VEHICLE_OPTIONS,
  COOKING_OPTIONS,
  DRINKS_OPTIONS,
  MARITAL_OPTIONS,
} from './FORM_OPTIONS'
import {
  ApprovalInputSchema,
  type ApprovalInput,
  type AiOutput,
} from '@/lib/schemas'
import { useState } from 'react'

interface Props {
  onResult: (input: ApprovalInput, output: AiOutput) => void
}

export function ApprovalForm({ onResult }: Props) {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    const raw = Object.fromEntries(fd.entries())
    const candidate = { ...raw, age: Number(raw.age) }
    const parsed = ApprovalInputSchema.safeParse(candidate)
    if (!parsed.success) {
      setError('Please answer all required questions.')
      return
    }
    setPending(true)
    try {
      const res = await fetch('/api/score', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(parsed.data),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || `HTTP ${res.status}`)
      }
      const out: AiOutput = await res.json()
      onResult(parsed.data, out)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setPending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <FormField
        type="number"
        name="age"
        label="Age"
        required
        min={16}
        max={80}
        defaultValue={25}
      />
      <FormField
        type="select"
        name="maritalStatus"
        label="Marital status"
        required
        options={MARITAL_OPTIONS}
      />
      <FormField
        type="select"
        name="country"
        label="Where do you live?"
        required
        options={COUNTRY_OPTIONS}
      />
      <FormField
        type="select"
        name="job"
        label="What do you do?"
        required
        options={JOB_OPTIONS}
      />
      <FormField
        type="select"
        name="salaryBand"
        label="Monthly salary (NPR)"
        required
        options={SALARY_OPTIONS}
      />
      <FormField
        type="select"
        name="ownsHouse"
        label="Own a house?"
        required
        options={HOUSE_OPTIONS}
      />
      <FormField
        type="select"
        name="vehicle"
        label="Vehicle"
        required
        options={VEHICLE_OPTIONS}
      />
      <FormField
        type="select"
        name="cooking"
        label="Daal-bhaat skill"
        required
        options={COOKING_OPTIONS}
      />
      <FormField
        type="select"
        name="drinksSmokes"
        label="Drinks / smokes?"
        required
        options={DRINKS_OPTIONS}
      />
      <FormField
        type="text"
        name="caste"
        label="Caste"
        helper={
          <>
            Optional. We won&apos;t store this. Leave blank —{' '}
            <em>none of aunty&apos;s business.</em>
          </>
        }
      />

      {error && (
        <p role="alert" className="text-sm text-sindoor">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="relative overflow-hidden w-full rounded-xl bg-marigold-deep px-5 py-3.5 font-semibold text-white shadow-soft transition-colors hover:bg-marigold disabled:opacity-60"
      >
        {pending && (
          <span
            aria-hidden
            className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent"
          />
        )}
        <span className="relative">
          {pending ? 'Aunty is judging…' : 'Calculate Aunty Approval'}
        </span>
      </button>
    </form>
  )
}
