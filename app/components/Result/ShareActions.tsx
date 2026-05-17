'use client'

import { useState } from 'react'
import type { AiOutput, ApprovalInput } from '@/lib/schemas'
import { DOMAIN, APP_NAME_LATIN } from '@/lib/brand'

interface Props {
  output: AiOutput
  input: ApprovalInput
}

function buildOgUrl(out: AiOutput, format: 'story' | 'square') {
  const p = new URLSearchParams({
    score: String(out.score),
    verdict: out.verdict,
    reaction: out.parentReaction,
    format,
  })
  return `/api/og?${p.toString()}`
}

function canShareFiles(files: File[]): boolean {
  if (typeof navigator === 'undefined') return false
  const nav = navigator as Navigator & {
    canShare?: (data: ShareData) => boolean
  }
  return (
    'share' in nav &&
    typeof nav.canShare === 'function' &&
    nav.canShare({ files })
  )
}

async function fetchAsFile(url: string, filename: string): Promise<File> {
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) throw new Error(`Image generation failed (${res.status})`)
  const blob = await res.blob()
  if (blob.size === 0) throw new Error('Image was empty. Try again.')
  return new File([blob], filename, { type: 'image/png' })
}

export function ShareActions({ output }: Props) {
  const [status, setStatus] = useState<string | null>(null)
  const [busy, setBusy] = useState<'story' | 'square' | 'share' | null>(null)

  async function getImage(format: 'story' | 'square') {
    setStatus(null)
    setBusy(format)
    try {
      const filename = `bihe-kahile-${format}-${output.score}.png`
      const file = await fetchAsFile(buildOgUrl(output, format), filename)

      // Mobile: native share sheet (Save to Photos / send to apps in one tap)
      if (canShareFiles([file])) {
        try {
          await navigator.share({
            files: [file],
            title: APP_NAME_LATIN,
          })
          setStatus('Shared!')
          return
        } catch (err) {
          // AbortError = user dismissed the sheet, that's fine
          if ((err as Error).name === 'AbortError') return
          // anything else falls through to the download path
        }
      }

      // Desktop / fallback: programmatic download
      const url = URL.createObjectURL(file)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.rel = 'noopener'
      document.body.appendChild(a)
      a.click()
      a.remove()
      setTimeout(() => URL.revokeObjectURL(url), 5000)
      setStatus('Saved! Share it on FB / IG / WhatsApp.')
    } catch (err) {
      setStatus((err as Error).message)
    } finally {
      setBusy(null)
    }
  }

  async function shareLink() {
    setStatus(null)
    setBusy('share')
    const shareText = `Aunty gave me ${output.score}/100 on ${DOMAIN}. Try it.`
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      try {
        await navigator.share({
          title: 'Bihe Kahile?',
          text: shareText,
          url: `https://${DOMAIN}`,
        })
        setBusy(null)
        return
      } catch {
        // fall through
      }
    }
    try {
      await navigator.clipboard.writeText(`https://${DOMAIN}`)
      setStatus('Link copied.')
    } catch {
      setStatus('Could not copy.')
    } finally {
      setBusy(null)
    }
  }

  const btn =
    'rounded-xl px-3 py-2 text-[13px] font-semibold transition-colors disabled:opacity-60 flex items-center justify-center'

  return (
    <div className="space-y-1.5">
      <div className="grid grid-cols-3 gap-1.5">
        <button
          onClick={() => getImage('story')}
          disabled={busy !== null}
          className={`${btn} bg-ink text-white hover:bg-ink-soft`}
        >
          {busy === 'story' ? '…' : 'Story'}
        </button>
        <button
          onClick={() => getImage('square')}
          disabled={busy !== null}
          className={`${btn} bg-ink text-white hover:bg-ink-soft`}
        >
          {busy === 'square' ? '…' : 'Square'}
        </button>
        <button
          onClick={shareLink}
          disabled={busy !== null}
          className={`${btn} bg-marigold-deep text-white shadow-soft hover:bg-marigold`}
        >
          {busy === 'share' ? '…' : 'Share'}
        </button>
      </div>
      {status && (
        <p className="text-[11px] text-ink-soft text-center">{status}</p>
      )}
    </div>
  )
}
