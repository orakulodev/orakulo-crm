"use client"

import { KeyboardEvent } from "react"

interface Props {
  value: number
  onChange: (v: number) => void
  min?: number
  step?: number
  label: string
}

export function InputNumericoSetinha({ value, onChange, min = 0, step = 1, label }: Props) {
  function inc(delta: number) {
    onChange(Math.max(min, value + delta))
  }

  function handleKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowUp") { e.preventDefault(); inc(e.shiftKey ? 10 : step) }
    if (e.key === "ArrowDown") { e.preventDefault(); inc(e.shiftKey ? -10 : -step) }
  }

  return (
    <div className="flex items-center justify-between py-1.5 border-b border-[var(--color-lt-border)] last:border-0">
      <span className="text-[13px] text-[var(--color-lt-text-base)]">{label}</span>
      <div className="flex items-center gap-0 border border-[var(--color-lt-border)] rounded-md overflow-hidden">
        <button
          onClick={() => inc(-step)}
          className="px-2.5 py-1 text-[14px] text-[var(--color-lt-text-muted)] hover:bg-[var(--color-lt-surface-fade)] hover:text-[var(--color-lt-text-bright)] font-medium leading-none"
        >
          −
        </button>
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Math.max(min, Number(e.target.value) || 0))}
          onKeyDown={handleKey}
          className="w-12 text-center text-[13px] font-[tabular-nums] font-semibold text-[var(--color-lt-text-bright)] bg-transparent border-x border-[var(--color-lt-border)] py-1 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
        />
        <button
          onClick={() => inc(step)}
          className="px-2.5 py-1 text-[14px] text-[var(--color-lt-text-muted)] hover:bg-[var(--color-lt-surface-fade)] hover:text-[var(--color-lt-text-bright)] font-medium leading-none"
        >
          +
        </button>
      </div>
    </div>
  )
}
