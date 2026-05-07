"use client"

import { useState, useRef, useEffect } from "react"

interface Props {
  value: string
  onCommit: (v: string) => void
  placeholder?: string
  maxPreview?: number
}

export function CelulaPopover({ value, onCommit, placeholder = "—", maxPreview = 40 }: Props) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState(value)
  const ref = useRef<HTMLDivElement>(null)
  const taRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (open) taRef.current?.focus()
  }, [open])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        if (draft !== value) onCommit(draft)
        setOpen(false)
      }
    }
    if (open) document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [open, draft, value, onCommit])

  const preview = value.length > maxPreview ? value.slice(0, maxPreview) + "…" : value

  if (!open) {
    return (
      <span
        onClick={() => { setDraft(value); setOpen(true) }}
        className="block text-[13px] cursor-pointer text-[var(--color-lt-text-base)] min-h-[20px]"
      >
        {value ? preview : <span className="text-[var(--color-lt-text-muted)]">{placeholder}</span>}
      </span>
    )
  }

  return (
    <div ref={ref} className="relative z-20">
      <textarea
        ref={taRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape") { setOpen(false); setDraft(value) }
          if (e.key === "Enter" && e.ctrlKey) { onCommit(draft); setOpen(false) }
        }}
        rows={4}
        className="absolute top-0 left-0 w-64 text-[13px] bg-white border border-[var(--color-orakulo-primary)] rounded p-2 outline-none text-[var(--color-lt-text-bright)] shadow-lg resize-none"
      />
    </div>
  )
}
