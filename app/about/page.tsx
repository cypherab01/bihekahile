import type { Metadata } from 'next'
import {
  DISCLAIMER,
  DOMAIN,
  APP_NAME_LATIN,
  PERSONA_NAME,
} from '@/lib/brand'

export const metadata: Metadata = {
  title: `About — ${APP_NAME_LATIN}`,
  description: 'About this app, what it is, and what it definitely is not.',
}

export default function AboutPage() {
  return (
    <main className="mx-auto w-full max-w-md px-5 flex-1 py-10">
      <a href="/" className="text-sm underline text-ink-soft">
        ← Back
      </a>
      <h1 className="mt-4 text-3xl font-bold text-ink">About</h1>

      <section className="mt-6 space-y-4 text-sm leading-relaxed text-ink">
        <p>
          <strong>{APP_NAME_LATIN}</strong> is a joke. A spicy joke. An AI plays
          a stereotypical Nepali aunty and gives your life choices a score out
          of 100, plus a list of &quot;red flags&quot; and an estimate of how
          many Dashain proposals you&apos;d get.
        </p>
        <p>
          Your judge today is <strong>{PERSONA_NAME}</strong>. She&apos;s seen
          things. Her tone shifts with your gender — different cousins, different
          doomsday scenarios — but her severity does not. Same penalty for the
          same behavior, regardless of who you are.
        </p>
        <p>{DISCLAIMER}</p>

        <h2 className="text-base font-semibold mt-6">What we don&apos;t do</h2>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>We don&apos;t store your inputs or results.</li>
          <li>
            We don&apos;t use caste, religion, body, or gender double standards
            in the judgment.
          </li>
          <li>We don&apos;t pass your data to anyone.</li>
        </ul>

        <h2 className="text-base font-semibold mt-6">How it works</h2>
        <p>
          You answer a short form. The answers go to Google&apos;s Gemini
          model with a heavily constrained prompt that tells it to roast you,
          warmly. The result renders in your browser and the share card is
          generated on the server. That&apos;s it.
        </p>

        <p className="text-ink-soft text-xs pt-6">{DOMAIN}</p>
      </section>
    </main>
  )
}
