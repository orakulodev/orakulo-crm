"use client"

import { useState, useCallback } from "react"
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
  type ColumnDef,
} from "@tanstack/react-table"
import { Plus, Search } from "lucide-react"
import { toast } from "sonner"
import type { Lead } from "@/lib/types"
import { derivarStatus } from "@/lib/derivar-status"
import { formatPhone } from "@/lib/phone"
import { CelulaTexto } from "./CelulaTexto"
import { CelulaTelefone } from "./CelulaTelefone"
import { CelulaToggleData } from "./CelulaToggleData"
import { CelulaPopover } from "./CelulaPopover"

const STATUS_LABEL: Record<string, string> = {
  novo: "Novo",
  contactado: "Disp.",
  r1: "R1",
  diagnostico: "Diag.",
  r2: "R2",
}

const STATUS_COLOR: Record<string, string> = {
  novo: "bg-[var(--color-status-new)] text-blue-700",
  contactado: "bg-[var(--color-status-contacted)] text-yellow-700",
  r1: "bg-[var(--color-status-r1)] text-orange-700",
  diagnostico: "bg-[var(--color-status-diagnosed)] text-purple-700",
  r2: "bg-[var(--color-status-r2)] text-green-700",
}

const RESULTADO_COLOR: Record<string, string> = {
  "—": "",
  "Fechado": "text-teal-700 font-semibold",
  "Perdido": "text-red-600",
}

const ch = createColumnHelper<Lead>()

interface Props {
  listaId: string
  listaNome: string
  initialLeads: Lead[]
}

export function ListaTable({ listaId, listaNome, initialLeads }: Props) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads)
  const [search, setSearch] = useState("")
  const [visao, setVisao] = useState<"compacta" | "completa">(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("lista_visao") as "compacta" | "completa") || "compacta"
    }
    return "compacta"
  })

  const updateLead = useCallback((id: string, patch: Partial<Lead>) => {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)))
    // debounce + persistência (Supabase) entrará aqui no futuro
  }, [])

  function addLead() {
    const novo: Lead = {
      id: crypto.randomUUID(),
      lista_id: listaId,
      nome: "",
      categoria: "",
      nota: null,
      avaliacoes: null,
      sobre: "",
      telefone: "",
      sites: [],
      perfil_gmn: "",
      decisor: "",
      disparo_at: null,
      r1_at: null,
      diagnostico_at: null,
      r2_at: null,
      resultado: "—",
      observacao: "",
    }
    setLeads((prev) => [novo, ...prev])
  }

  function toggleVisao() {
    const next = visao === "compacta" ? "completa" : "compacta"
    setVisao(next)
    localStorage.setItem("lista_visao", next)
  }

  const colunasCompactas: ColumnDef<Lead, any>[] = [
    ch.accessor("nome", {
      header: "Nome / Categoria",
      cell: ({ row }) => (
        <div>
          <CelulaTexto
            value={row.original.nome}
            onCommit={(v) => updateLead(row.original.id, { nome: v })}
            className="font-medium text-[var(--color-lt-text-bright)]"
          />
          <CelulaTexto
            value={row.original.categoria}
            onCommit={(v) => updateLead(row.original.id, { categoria: v })}
            className="text-[11px] text-[var(--color-lt-text-muted)] mt-0.5"
            placeholder="categoria"
          />
        </div>
      ),
    }),
    ch.accessor("decisor", {
      header: "Decisor",
      cell: ({ row }) => (
        <CelulaTexto
          value={row.original.decisor}
          onCommit={(v) => updateLead(row.original.id, { decisor: v })}
          placeholder="—"
        />
      ),
    }),
    ch.accessor("telefone", {
      header: "Telefone",
      cell: ({ row }) => (
        <CelulaTelefone
          value={row.original.telefone}
          onCommit={(v) => updateLead(row.original.id, { telefone: v })}
        />
      ),
    }),
    ch.display({
      id: "status",
      header: "Status",
      cell: ({ row }) => {
        const l = row.original
        const status = derivarStatus(l)
        const res = l.resultado
        if (res !== "—") {
          return (
            <span className={`text-[12px] font-semibold ${RESULTADO_COLOR[res]}`}>{res}</span>
          )
        }
        return (
          <span className={`inline-flex px-1.5 py-0.5 rounded text-[11px] font-semibold ${STATUS_COLOR[status]}`}>
            {STATUS_LABEL[status]}
          </span>
        )
      },
    }),
    ch.accessor("disparo_at", {
      header: "Disparo",
      cell: ({ row }) => (
        <CelulaToggleData
          value={row.original.disparo_at}
          label="Disparo"
          onToggle={(v) => updateLead(row.original.id, { disparo_at: v })}
        />
      ),
    }),
    ch.accessor("r1_at", {
      header: "R1",
      cell: ({ row }) => (
        <CelulaToggleData
          value={row.original.r1_at}
          label="R1"
          onToggle={(v) => updateLead(row.original.id, { r1_at: v })}
        />
      ),
    }),
    ch.accessor("diagnostico_at", {
      header: "Diag.",
      cell: ({ row }) => (
        <CelulaToggleData
          value={row.original.diagnostico_at}
          label="Diagnóstico"
          onToggle={(v) => updateLead(row.original.id, { diagnostico_at: v })}
        />
      ),
    }),
    ch.accessor("r2_at", {
      header: "R2",
      cell: ({ row }) => (
        <CelulaToggleData
          value={row.original.r2_at}
          label="R2"
          onToggle={(v) => updateLead(row.original.id, { r2_at: v })}
        />
      ),
    }),
    ch.accessor("observacao", {
      header: "Observação",
      cell: ({ row }) => (
        <CelulaPopover
          value={row.original.observacao}
          onCommit={(v) => updateLead(row.original.id, { observacao: v })}
          placeholder="—"
        />
      ),
    }),
  ]

  const colunasExtras: ColumnDef<Lead, any>[] = [
    ch.accessor("nota", {
      header: "Nota",
      cell: ({ row }) => (
        <span className="text-[13px] font-[tabular-nums] text-[var(--color-lt-text-base)]">
          {row.original.nota != null ? `${row.original.nota}★` : "—"}
        </span>
      ),
    }),
    ch.accessor("avaliacoes", {
      header: "Aval.",
      cell: ({ row }) => (
        <span className="text-[13px] font-[tabular-nums] text-[var(--color-lt-text-muted)]">
          {row.original.avaliacoes ?? "—"}
        </span>
      ),
    }),
    ch.accessor("sobre", {
      header: "Sobre",
      cell: ({ row }) => (
        <CelulaPopover
          value={row.original.sobre}
          onCommit={(v) => updateLead(row.original.id, { sobre: v })}
          placeholder="—"
        />
      ),
    }),
    ch.accessor("sites", {
      header: "Sites",
      cell: ({ row }) => {
        const sites = row.original.sites
        if (!sites.length) return <span className="text-[var(--color-lt-text-muted)] text-[13px]">—</span>
        return (
          <div className="flex flex-wrap gap-1">
            {sites.map((s, i) => (
              <a key={i} href={s} target="_blank" rel="noopener noreferrer"
                className="text-[11px] px-1.5 py-0.5 rounded bg-[var(--color-lt-surface-fade)] text-[var(--color-orakulo-primary)] hover:underline">
                site
              </a>
            ))}
          </div>
        )
      },
    }),
    ch.accessor("perfil_gmn", {
      header: "GMN",
      cell: ({ row }) => {
        const url = row.original.perfil_gmn
        if (!url) return <span className="text-[var(--color-lt-text-muted)] text-[13px]">—</span>
        return (
          <a href={url} target="_blank" rel="noopener noreferrer"
            className="text-[12px] text-[var(--color-orakulo-primary)] hover:underline">
            GMN ↗
          </a>
        )
      },
    }),
    ch.accessor("resultado", {
      header: "Resultado",
      cell: ({ row }) => {
        const vals: Lead["resultado"][] = ["—", "Fechado", "Perdido"]
        return (
          <select
            value={row.original.resultado}
            onChange={(e) => updateLead(row.original.id, { resultado: e.target.value as Lead["resultado"] })}
            className={`text-[12px] bg-transparent border-none outline-none cursor-pointer font-medium ${RESULTADO_COLOR[row.original.resultado]}`}
          >
            {vals.map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
        )
      },
    }),
  ]

  const columns = visao === "compacta"
    ? colunasCompactas
    : [...colunasCompactas, ...colunasExtras]

  const table = useReactTable({
    data: leads,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: { globalFilter: search },
    onGlobalFilterChange: setSearch,
    globalFilterFn: (row, _, value) => {
      const s = value.toLowerCase()
      return row.original.nome.toLowerCase().includes(s) || row.original.decisor.toLowerCase().includes(s)
    },
  })

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-lt-border)] bg-[var(--color-lt-surface)]">
        <div>
          <h1 className="text-[20px] font-bold text-[var(--color-lt-text-bright)]">{listaNome}</h1>
          <p className="text-[11px] font-semibold tracking-[0.08em] text-[var(--color-lt-text-muted)] uppercase mt-0.5">
            {leads.length} leads
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-lt-text-muted)]" />
            <input
              type="text"
              placeholder="Buscar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-[13px] border border-[var(--color-lt-border)] rounded-md bg-[var(--color-lt-page-bg)] text-[var(--color-lt-text-base)] placeholder:text-[var(--color-lt-text-muted)] focus:outline-none focus:border-[var(--color-orakulo-primary)] w-52"
            />
          </div>
          <button
            onClick={toggleVisao}
            className="px-3 py-1.5 text-[12px] font-medium border border-[var(--color-lt-border)] rounded-md text-[var(--color-lt-text-muted)] hover:text-[var(--color-lt-text-base)] hover:bg-[var(--color-lt-surface-fade)]"
          >
            {visao === "compacta" ? "Completa ↓" : "Compacta ↑"}
          </button>
          <button
            onClick={addLead}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--color-orakulo-primary)] hover:bg-[var(--color-orakulo-primary-hover)] text-white text-[13px] font-medium rounded-md"
          >
            <Plus size={13} />
            Novo lead
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 z-10">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="bg-[var(--color-lt-surface)] border-b border-[var(--color-lt-border)]">
                {hg.headers.map((h) => (
                  <th key={h.id} className="px-4 py-2.5 text-left text-[11px] font-semibold tracking-[0.06em] text-[var(--color-lt-text-muted)] uppercase whitespace-nowrap">
                    {flexRender(h.column.columnDef.header, h.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row, i) => (
              <tr
                key={row.id}
                className={`border-b border-[var(--color-lt-border)] hover:bg-[var(--color-lt-surface-fade)] ${
                  i % 2 === 0 ? "bg-[var(--color-lt-surface)]" : "bg-[var(--color-lt-page-bg)]"
                }`}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-2 max-w-[240px]">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
            {table.getRowModel().rows.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="text-center py-12 text-[var(--color-lt-text-muted)] text-[13px]">
                  Nenhum lead encontrado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
