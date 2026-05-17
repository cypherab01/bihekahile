import { APP_NAME, APP_NAME_LATIN, APP_TAGLINE } from '@/lib/brand'

export function BrandHeader() {
  return (
    <header className="text-center pt-8 pb-4">
      <h1 className="font-deva text-4xl font-bold text-ink">{APP_NAME}</h1>
      <p className="mt-1 text-sm text-ink-soft tracking-wide">
        <span className="font-semibold text-marigold-deep">
          {APP_NAME_LATIN}
        </span>{' '}
        — {APP_TAGLINE}
      </p>
    </header>
  )
}
