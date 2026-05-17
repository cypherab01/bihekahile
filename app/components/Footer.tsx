import { DISCLAIMER, DOMAIN } from '@/lib/brand'

export function Footer() {
  return (
    <footer className="mt-6 pb-5 text-center text-[11px] text-ink-soft px-4 leading-snug">
      <p className="max-w-prose mx-auto">{DISCLAIMER}</p>
      <p className="mt-1.5">
        <a className="underline hover:text-marigold-deep" href="/about">
          About
        </a>
        <span className="mx-1.5">·</span>
        <span>{DOMAIN}</span>
      </p>
    </footer>
  )
}
