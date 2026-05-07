"use client"

import { useState } from "react"
import { Copy, Check } from "lucide-react"
import { toast } from "sonner"
import { formatPhone } from "@/lib/phone"
import { CelulaTexto } from "./CelulaTexto"

interface Props {
  value: string
  onCommit: (v: string) => void
}

export function CelulaTelefone({ value, onCommit }: Props) {
  const [copied, setCopied] = useState(false)

  function handleCopy(e: React.MouseEvent) {
    e.stopPropagation()
    navigator.clipboard.writeText(value)
    setCopied(true)
    toast.success("Número copiado!")
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex items-center gap-1 group">
      <CelulaTexto
        value={value}
        onCommit={onCommit}
        placeholder="—"
        className="font-[tabular-nums]"
      />
      {value && (
        <button
          onClick={handleCopy}
          className="opacity-0 group-hover:opacity-100 shrink-0 text-[var(--color-lt-text-muted)] hover:text-[var(--color-orakulo-primary)]"
        >
          {copied ? <Check size={11} className="text-green-500" /> : <Copy size={11} />}
        </button>
      )}
    </div>
  )
}
