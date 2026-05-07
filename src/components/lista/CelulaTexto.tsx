"use client"

import { useState, useRef, useEffect, KeyboardEvent } from "react"

interface Props {
  value: string
  onCommit: (v: string) => void
  placeholder?: string
  className?: string
  readOnly?: boolean
}

export function CelulaTexto({ value, onCommit, placeholder = "—", className = "", readOnly = false }: Props) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) inputRef.current?.focus()
  }, [editing])

  function commit() {
    setEditing(false)
    if (draft !== value) onCommit(draft)
  }

  function handleKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || (e.key === "Enter" && e.ctrlKey)) { e.preventDefault(); commit() }
    if (e.key === "Escape") { setEditing(false); setDraft(value) }
    if (e.key === "Tab") { commit() }
  }

  if (readOnly) {
    return (
      <span className={`block text-[13px] text-[var(--color-lt-text-muted)] ${className}`}>
        {value || placeholder}
      </span>
    )
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={handleKey}
        className="w-full text-[13px] bg-white border border-[var(--color-orakulo-primary)] rounded px-1.5 py-0.5 outline-none text-[var(--color-lt-text-bright)]"
      />
    )
  }

  return (
    <span
      onDoubleClick={() => { if (!readOnly) { setDraft(value); setEditing(true) } }}
      onClick={() => { if (!readOnly) { setDraft(value); setEditing(true) } }}
      className={`block text-[13px] cursor-text text-[var(--color-lt-text-base)] min-h-[20px] ${className}`}
    >
      {value || <span className="text-[var(--color-lt-text-muted)]">{placeholder}</span>}
    </span>
  )
}
