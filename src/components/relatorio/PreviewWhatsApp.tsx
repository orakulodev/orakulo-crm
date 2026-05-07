"use client"

import type { RelatorioDiario } from "@/lib/types"
import { gerarTextoWhatsapp } from "@/lib/relatorio-template"
import { BotaoCopiarWhatsApp } from "./BotaoCopiarWhatsApp"

interface Props {
  relatorio: RelatorioDiario
}

export function PreviewWhatsApp({ relatorio }: Props) {
  const texto = gerarTextoWhatsapp(relatorio)

  return (
    <div className="flex flex-col gap-3 h-full">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold tracking-[0.08em] text-[var(--color-lt-text-muted)] uppercase">
          Preview WhatsApp
        </span>
        <BotaoCopiarWhatsApp texto={texto} />
      </div>
      <div className="flex-1 bg-[#ece5dd] rounded-lg p-4 overflow-auto">
        <div className="bg-white rounded-xl p-4 shadow-sm max-w-sm">
          <pre className="text-[13px] text-[#1a1a1a] whitespace-pre-wrap font-[var(--font-sans)] leading-relaxed">
            {texto}
          </pre>
        </div>
      </div>
    </div>
  )
}
