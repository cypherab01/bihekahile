import { DISCLAIMER, DOMAIN } from '@/lib/brand'

export function Footer() {
  return (
    <footer className="mt-12 pb-8 text-center text-xs text-ink-soft px-6">
      <p className="max-w-prose mx-auto">{DISCLAIMER}</p>
      <p className="mt-2">
        <a className="underline hover:text-marigold-deep" href="/about">
          About
        </a>
        <span className="mx-2">·</span>
        <span>{DOMAIN}</span>
      </p>
    </footer>
  )
}
