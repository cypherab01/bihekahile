'use client'

import { useEffect, useState } from 'react'
import { BrandHeader } from '@/app/components/BrandHeader'
import { Footer } from '@/app/components/Footer'
import { ApprovalForm } from '@/app/components/Form/ApprovalForm'
import { ResultCard } from '@/app/components/Result/ResultCard'
import type { AiOutput, ApprovalInput } from '@/lib/schemas'

interface Snapshot {
  input: ApprovalInput
  output: AiOutput
}

const STORAGE_KEY = 'bihe-kahile:last-result'

export default function Home() {
  const [snap, setSnap] = useState<Snapshot | null>(null)

  useEffect(() => {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (raw) {
      try {
        setSnap(JSON.parse(raw))
      } catch {}
    }
  }, [])

  function handleResult(input: ApprovalInput, output: AiOutput) {
    const next = { input, output }
    setSnap(next)
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {}
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  function handleRestart() {
    setSnap(null)
    try {
      sessionStorage.removeItem(STORAGE_KEY)
    } catch {}
  }

  return (
    <main className="mx-auto w-full max-w-md px-5 flex-1">
      <BrandHeader />
      <div className="pt-2">
        {snap ? (
          <ResultCard
            input={snap.input}
            output={snap.output}
            onRestart={handleRestart}
          />
        ) : (
          <section className="rounded-3xl border border-card-border bg-card/80 backdrop-blur p-6 shadow-soft">
            <h2 className="text-xl font-semibold text-ink mb-1">
              Let aunty judge.
            </h2>
            <p className="text-sm text-ink-soft mb-5">
              Answer honestly. We won&apos;t tell aamabuwa.
            </p>
            <ApprovalForm onResult={handleResult} />
          </section>
        )}
      </div>
      <Footer />
    </main>
  )
}
