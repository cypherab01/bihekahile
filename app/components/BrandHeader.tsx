import { APP_NAME, APP_NAME_LATIN, APP_TAGLINE } from '@/lib/brand'

interface Props {
  compact?: boolean
}

export function BrandHeader({ compact = false }: Props) {
  if (compact) {
    return (
      <header className="flex items-baseline justify-center gap-2 pt-4 pb-3">
        <h1 className="font-deva text-xl font-bold text-ink leading-none">
          {APP_NAME}
        </h1>
        <span className="text-[11px] uppercase tracking-widest text-marigold-deep font-semibold">
          {APP_NAME_LATIN}
        </span>
      </header>
    )
  }

  return (
    <header className="text-center pt-5 pb-3 sm:pt-7 sm:pb-4">
      <h1 className="font-deva text-3xl sm:text-4xl font-bold text-ink leading-tight">
        {APP_NAME}
      </h1>
      <p className="mt-0.5 text-[13px] sm:text-sm text-ink-soft tracking-wide">
        <span className="font-semibold text-marigold-deep">
          {APP_NAME_LATIN}
        </span>{' '}
        — {APP_TAGLINE}
      </p>
    </header>
  )
}
