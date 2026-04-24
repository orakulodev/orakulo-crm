"use client"

import { useState } from "react"
import { formatPhone } from "@/lib/phone"
import { Copy, Check, Plus, Search } from "lucide-react"
import { toast } from "sonner"

type LeadStatus = "novo" | "contactado" | "r1" | "diagnostico" | "r2" | "fechado" | "perdido"

interface Lead {
  id: string
  empresa: string
  categoria: string
  telefone: string
  decisor: string
  status: LeadStatus
  origem: string
  observacoes: string
  proximo_follow: string
  ultimo_contato: string
}

const STATUS_LABEL: Record<LeadStatus, string> = {
  novo: "Novo",
  contactado: "Contactado",
  r1: "R1",
  diagnostico: "Diagnóstico",
  r2: "R2",
  fechado: "Fechado",
  perdido: "Perdido",
}

const STATUS_COLOR: Record<LeadStatus, string> = {
  novo: "bg-[var(--color-status-new)] text-blue-700",
  contactado: "bg-[var(--color-status-contacted)] text-yellow-700",
  r1: "bg-[var(--color-status-r1)] text-orange-700",
  diagnostico: "bg-[var(--color-status-diagnosed)] text-purple-700",
  r2: "bg-[var(--color-status-r2)] text-green-700",
  fechado: "bg-[var(--color-status-closed)] text-teal-700",
  perdido: "bg-[var(--color-status-lost)] text-red-700",
}

const MOCK_LEADS: Lead[] = [
  { id: "1", empresa: "Imobiliária Silva & Cia", categoria: "Imobiliária", telefone: "+5511991234567", decisor: "Carlos Silva", status: "r1", origem: "Google Maps", observacoes: "Interesse em pacote completo de IA para atendimento", proximo_follow: "2026-04-19", ultimo_contato: "2026-04-17" },
  { id: "2", empresa: "RE/MAX Centro SP", categoria: "Imobiliária", telefone: "+5511987654321", decisor: "Ana Paula", status: "contactado", origem: "Google Maps", observacoes: "Pediu para ligar na sexta depois das 10h", proximo_follow: "2026-04-18", ultimo_contato: "2026-04-16" },
  { id: "3", empresa: "Construtora Horizonte", categoria: "Construtora", telefone: "+5511944332211", decisor: "João Horizonte", status: "novo", origem: "Google Maps", observacoes: "", proximo_follow: "", ultimo_contato: "" },
  { id: "4", empresa: "Loft Assessoria Imob.", categoria: "Imobiliária", telefone: "+5511933221100", decisor: "Marina Loft", status: "diagnostico", origem: "Indicação", observacoes: "Diagnóstico enviado por WhatsApp. Aguardando retorno", proximo_follow: "2026-04-20", ultimo_contato: "2026-04-15" },
  { id: "5", empresa: "Grupo Lar Premium", categoria: "Imobiliária", telefone: "+5511922110099", decisor: "Roberto Lar", status: "r2", origem: "Google Maps", observacoes: "R2 marcada para terça às 14h no meet", proximo_follow: "2026-04-22", ultimo_contato: "2026-04-14" },
  { id: "6", empresa: "Imóveis Paulista", categoria: "Imobiliária", telefone: "+5511911009988", decisor: "Fernanda Paulista", status: "fechado", origem: "Google Maps", observacoes: "Fechou R$ 3.500/mês. Onboarding agendado", proximo_follow: "", ultimo_contato: "2026-04-10" },
  { id: "7", empresa: "Casa & Cia Corretores", categoria: "Imobiliária", telefone: "+5511900998877", decisor: "Marcos Casa", status: "perdido", origem: "Google Maps", observacoes: "Achou caro, foi para concorrente", proximo_follow: "", ultimo_contato: "2026-04-08" },
  { id: "8", empresa: "Smart Imóveis SP", categoria: "Imobiliária", telefone: "+5511889988776", decisor: "Lucia Smart", status: "novo", origem: "Manual", observacoes: "", proximo_follow: "2026-04-18", ultimo_contato: "" },
]

function PhoneCell({ phone }: { phone: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(phone)
    setCopied(true)
    toast.success("Número copiado!")
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 group text-left font-[tabular-nums] text-[13px] text-[var(--color-lt-text-base)] hover:text-[var(--color-orakulo-primary)] transition-colors"
    >
      <span>{formatPhone(phone)}</span>
      <span className="opacity-0 group-hover:opacity-100 transition-opacity">
        {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
      </span>
    </button>
  )
}

export default function LeadsPage() {
  const [search, setSearch] = useState("")
  const [leads] = useState<Lead[]>(MOCK_LEADS)

  const filtered = leads.filter(
    (l) =>
      l.empresa.toLowerCase().includes(search.toLowerCase()) ||
      l.decisor.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-lt-border)] bg-[var(--color-lt-surface)]">
        <div>
          <h1 className="text-[20px] font-bold text-[var(--color-lt-text-bright)]">Leads</h1>
          <p className="text-[11px] font-semibold tracking-[0.08em] text-[var(--color-lt-text-muted)] uppercase mt-0.5">
            SP Imob Jan/26 · {leads.length} leads
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-lt-text-muted)]" />
            <input
              type="text"
              placeholder="Buscar empresa ou decisor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-[13px] border border-[var(--color-lt-border)] rounded-md bg-[var(--color-lt-page-bg)] text-[var(--color-lt-text-base)] placeholder:text-[var(--color-lt-text-muted)] focus:outline-none focus:border-[var(--color-orakulo-primary)] w-64"
            />
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--color-orakulo-primary)] hover:bg-[var(--color-orakulo-primary-hover)] text-white text-[13px] font-medium rounded-md transition-colors">
            <Plus size={14} />
            Novo lead
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 z-10">
            <tr className="bg-[var(--color-lt-surface)] border-b border-[var(--color-lt-border)]">
              {["Empresa", "Decisor", "Telefone", "Status", "Próx. Follow", "Observações"].map((h) => (
                <th
                  key={h}
                  className="px-4 py-2.5 text-left text-[11px] font-semibold tracking-[0.08em] text-[var(--color-lt-text-muted)] uppercase whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((lead, i) => (
              <tr
                key={lead.id}
                className={`border-b border-[var(--color-lt-border)] hover:bg-[var(--color-lt-surface-fade)] transition-colors cursor-pointer ${
                  i % 2 === 0 ? "bg-[var(--color-lt-surface)]" : "bg-[var(--color-lt-page-bg)]"
                }`}
              >
                <td className="px-4 py-2.5">
                  <div className="text-[13px] font-medium text-[var(--color-lt-text-bright)]">{lead.empresa}</div>
                  <div className="text-[11px] text-[var(--color-lt-text-muted)]">{lead.categoria}</div>
                </td>
                <td className="px-4 py-2.5 text-[13px] text-[var(--color-lt-text-base)]">{lead.decisor}</td>
                <td className="px-4 py-2.5">
                  {lead.telefone ? <PhoneCell phone={lead.telefone} /> : <span className="text-[var(--color-lt-text-muted)] text-[13px]">—</span>}
                </td>
                <td className="px-4 py-2.5">
                  <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-semibold ${STATUS_COLOR[lead.status]}`}>
                    {STATUS_LABEL[lead.status]}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-[13px] font-[tabular-nums] text-[var(--color-lt-text-muted)]">
                  {lead.proximo_follow
                    ? new Date(lead.proximo_follow + "T00:00").toLocaleDateString("pt-BR")
                    : "—"}
                </td>
                <td className="px-4 py-2.5 text-[13px] text-[var(--color-lt-text-muted)] max-w-xs truncate">
                  {lead.observacoes || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
