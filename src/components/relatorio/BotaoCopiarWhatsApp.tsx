"use client"

import { useState } from "react"
import { Copy, Check } from "lucide-react"
import { toast } from "sonner"

interface Props {
  texto: string
}

export function BotaoCopiarWhatsApp({ texto }: Props) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(texto)
    setCopied(true)
    toast.success("Relatório copiado para a área de transferência!")
    setTimeout(() => setCopied(false), 3000)
  }

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#25d366] hover:bg-[#1ebe5d] text-white text-[12px] font-semibold rounded-md"
    >
      {copied ? <Check size={13} /> : <Copy size={13} />}
      {copied ? "Copiado!" : "Copiar para WhatsApp"}
    </button>
  )
}
