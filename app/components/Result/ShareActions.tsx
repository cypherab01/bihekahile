'use client'

import { useState } from 'react'
import type { AiOutput, ApprovalInput } from '@/lib/schemas'
import { DOMAIN } from '@/lib/brand'

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

export function ShareActions({ output }: Props) {
  const [status, setStatus] = useState<string | null>(null)
  const [busy, setBusy] = useState<'story' | 'square' | null>(null)

  async function downloadCard(format: 'story' | 'square') {
    setStatus(null)
    setBusy(format)
    try {
      const res = await fetch(buildOgUrl(output, format))
      if (!res.ok) throw new Error('Failed to generate image')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `bihe-kahile-${format}-${output.score}.png`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      setStatus('Saved! Share it on FB / IG / WhatsApp.')
    } catch (err) {
      setStatus((err as Error).message)
    } finally {
      setBusy(null)
    }
  }

  async function share() {
    setStatus(null)
    const shareText = `Aunty gave me ${output.score}/100 on ${DOMAIN}. Try it.`
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      try {
        await navigator.share({
          title: 'Bihe Kahile?',
          text: shareText,
          url: `https://${DOMAIN}`,
        })
        return
      } catch {
        // fall through to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(`https://${DOMAIN}`)
      setStatus('Link copied to clipboard.')
    } catch {
      setStatus('Could not copy. Long-press the URL bar to share.')
    }
  }

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => downloadCard('story')}
          disabled={busy !== null}
          className="rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-white hover:bg-ink-soft disabled:opacity-60"
        >
          {busy === 'story' ? 'Saving…' : 'Download (story)'}
        </button>
        <button
          onClick={() => downloadCard('square')}
          disabled={busy !== null}
          className="rounded-xl bg-ink/90 px-4 py-2.5 text-sm font-semibold text-white hover:bg-ink-soft disabled:opacity-60"
        >
          {busy === 'square' ? 'Saving…' : 'Download (square)'}
        </button>
      </div>
      <button
        onClick={share}
        className="w-full rounded-xl bg-marigold-deep px-4 py-2.5 text-sm font-semibold text-white shadow-soft hover:bg-marigold"
      >
        Share aunty&apos;s verdict
      </button>
      {status && (
        <p className="text-xs text-ink-soft text-center">{status}</p>
      )}
    </div>
  )
}
