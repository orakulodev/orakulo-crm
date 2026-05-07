"use client"

import { Check } from "lucide-react"

interface Props {
  value: string | null
  label: string
  onToggle: (v: string | null) => void
}

function formatDataCurta(iso: string | null): string {
  if (!iso) return ""
  const d = new Date(iso)
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`
}

export function CelulaToggleData({ value, label, onToggle }: Props) {
  function handleClick() {
    if (value) {
      onToggle(null)
    } else {
      onToggle(new Date().toISOString())
    }
  }

  if (value) {
    return (
      <button
        onClick={handleClick}
        title={`Desmarcar ${label}`}
        className="flex items-center gap-1 text-[12px] font-medium text-[var(--color-orakulo-primary)] hover:text-red-500 font-[tabular-nums]"
      >
        <Check size={12} />
        {formatDataCurta(value)}
      </button>
    )
  }

  return (
    <button
      onClick={handleClick}
      title={`Marcar ${label}`}
      className="text-[12px] text-[var(--color-lt-text-muted)] hover:text-[var(--color-lt-text-base)] hover:underline"
    >
      —
    </button>
  )
}
