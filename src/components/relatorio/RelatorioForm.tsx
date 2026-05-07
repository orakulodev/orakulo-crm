"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import type { RelatorioDiario } from "@/lib/types"
import { saveRelatorio, listRelatorios } from "@/lib/queries/relatorios"
import { InputNumericoSetinha } from "./InputNumericoSetinha"
import { PreviewWhatsApp } from "./PreviewWhatsApp"

interface Props {
  initial: RelatorioDiario
}

function formatDataExibicao(data: string): string {
  const [ano, mes, dia] = data.split("-")
  const d = new Date(Number(ano), Number(mes) - 1, Number(dia))
  return d.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" })
}

function hojeISO(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

export function RelatorioForm({ initial }: Props) {
  const router = useRouter()
  const [r, setR] = useState<RelatorioDiario>(initial)
  const [historico, setHistorico] = useState<RelatorioDiario[]>([])

  useEffect(() => {
    setHistorico(listRelatorios().slice(0, 30))
  }, [])

  const update = useCallback(<K extends keyof RelatorioDiario>(key: K, value: RelatorioDiario[K]) => {
    setR((prev) => {
      const next = { ...prev, [key]: value }
      // Auto-soma de total_reunioes se não foi editado manualmente
      if ((key === "ligacoes_reunioes" || key === "disparos_reunioes" || key === "follows_reunioes") && !next.total_reunioes_manual) {
        next.total_reunioes = (next.ligacoes_reunioes ?? 0) + (next.disparos_reunioes ?? 0) + (next.follows_reunioes ?? 0)
      }
      if (key === "total_reunioes") {
        next.total_reunioes_manual = true
      }
      saveRelatorio(next)
      return next
    })
  }, [])

  const ehHoje = r.data === hojeISO()

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-lt-border)] bg-[var(--color-lt-surface)]">
        <div>
          <h1 className="text-[20px] font-bold text-[var(--color-lt-text-bright)]">Relatório Diário</h1>
          <p className="text-[12px] text-[var(--color-lt-text-muted)] mt-0.5 capitalize">{formatDataExibicao(r.data)}</p>
        </div>
        <div className="flex items-center gap-2">
          {!ehHoje && (
            <button
              onClick={() => router.push(`/relatorio/${hojeISO()}`)}
              className="px-3 py-1.5 text-[12px] font-medium border border-[var(--color-lt-border)] rounded-md text-[var(--color-lt-text-muted)] hover:text-[var(--color-lt-text-base)] hover:bg-[var(--color-lt-surface-fade)]"
            >
              Hoje →
            </button>
          )}
        </div>
      </div>

      {/* Body split */}
      <div className="flex-1 overflow-auto">
        <div className="flex gap-0 h-full min-h-0">
          {/* Formulário */}
          <div className="w-1/2 border-r border-[var(--color-lt-border)] overflow-auto p-6 flex flex-col gap-5">
            {/* Ligações */}
            <section>
              <h2 className="text-[11px] font-semibold tracking-[0.08em] uppercase text-[var(--color-lt-text-muted)] mb-2">
                📞 Ligações
              </h2>
              <div className="bg-[var(--color-lt-surface)] border border-[var(--color-lt-border)] rounded-lg px-4 py-1">
                <InputNumericoSetinha label="Ligações" value={r.ligacoes_qtd} onChange={(v) => update("ligacoes_qtd", v)} />
                <InputNumericoSetinha label="Conexões" value={r.ligacoes_conexoes} onChange={(v) => update("ligacoes_conexoes", v)} />
                <InputNumericoSetinha label="Decisores" value={r.ligacoes_decisores} onChange={(v) => update("ligacoes_decisores", v)} />
                <InputNumericoSetinha label="Reuniões" value={r.ligacoes_reunioes} onChange={(v) => update("ligacoes_reunioes", v)} />
              </div>
            </section>

            {/* Disparos */}
            <section>
              <h2 className="text-[11px] font-semibold tracking-[0.08em] uppercase text-[var(--color-lt-text-muted)] mb-2">
                🚀 Disparos
              </h2>
              <div className="bg-[var(--color-lt-surface)] border border-[var(--color-lt-border)] rounded-lg px-4 py-1">
                <InputNumericoSetinha label="Qtd de Disparo" value={r.disparos_qtd} onChange={(v) => update("disparos_qtd", v)} />
                <InputNumericoSetinha label="Decisores gerados" value={r.disparos_decisores} onChange={(v) => update("disparos_decisores", v)} />
                <InputNumericoSetinha label="Reuniões geradas" value={r.disparos_reunioes} onChange={(v) => update("disparos_reunioes", v)} />
              </div>
            </section>

            {/* Follows */}
            <section>
              <h2 className="text-[11px] font-semibold tracking-[0.08em] uppercase text-[var(--color-lt-text-muted)] mb-2">
                🔁 Follows
              </h2>
              <div className="bg-[var(--color-lt-surface)] border border-[var(--color-lt-border)] rounded-lg px-4 py-1">
                <InputNumericoSetinha label="Qtd de Follows" value={r.follows_qtd} onChange={(v) => update("follows_qtd", v)} />
                <InputNumericoSetinha label="Decisores gerados" value={r.follows_decisores} onChange={(v) => update("follows_decisores", v)} />
                <InputNumericoSetinha label="Reuniões geradas" value={r.follows_reunioes} onChange={(v) => update("follows_reunioes", v)} />
              </div>
            </section>

            {/* Geral do dia */}
            <section>
              <h2 className="text-[11px] font-semibold tracking-[0.08em] uppercase text-[var(--color-lt-text-muted)] mb-2">
                🎯 Geral do Dia
              </h2>
              <div className="bg-[var(--color-lt-surface)] border border-[var(--color-lt-border)] rounded-lg px-4 py-1">
                <InputNumericoSetinha
                  label="Total Reuniões"
                  value={r.total_reunioes}
                  onChange={(v) => update("total_reunioes", v)}
                />
              </div>
              <div className="mt-3 flex flex-col gap-3">
                <div>
                  <label className="text-[12px] font-medium text-[var(--color-lt-text-muted)] block mb-1">Melhor horário</label>
                  <input
                    type="text"
                    value={r.melhor_horario}
                    onChange={(e) => update("melhor_horario", e.target.value)}
                    placeholder="ex: 10h-12h"
                    className="w-full text-[13px] border border-[var(--color-lt-border)] rounded-md px-3 py-1.5 bg-[var(--color-lt-page-bg)] text-[var(--color-lt-text-base)] placeholder:text-[var(--color-lt-text-muted)] focus:outline-none focus:border-[var(--color-orakulo-primary)]"
                  />
                </div>
                <div>
                  <label className="text-[12px] font-medium text-[var(--color-lt-text-muted)] block mb-1">Principal dificuldade</label>
                  <textarea
                    value={r.principal_dificuldade}
                    onChange={(e) => update("principal_dificuldade", e.target.value)}
                    placeholder="Descreva o principal obstáculo do dia..."
                    rows={3}
                    className="w-full text-[13px] border border-[var(--color-lt-border)] rounded-md px-3 py-1.5 bg-[var(--color-lt-page-bg)] text-[var(--color-lt-text-base)] placeholder:text-[var(--color-lt-text-muted)] focus:outline-none focus:border-[var(--color-orakulo-primary)] resize-none"
                  />
                </div>
                <div>
                  <label className="text-[12px] font-medium text-[var(--color-lt-text-muted)] block mb-1">Horas prospectando</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min={0}
                      step={0.5}
                      value={r.horas_prospectando || ""}
                      onChange={(e) => update("horas_prospectando", parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      className="w-24 text-[13px] border border-[var(--color-lt-border)] rounded-md px-3 py-1.5 bg-[var(--color-lt-page-bg)] text-[var(--color-lt-text-base)] focus:outline-none focus:border-[var(--color-orakulo-primary)] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <span className="text-[13px] text-[var(--color-lt-text-muted)]">horas</span>
                  </div>
                </div>
                <div>
                  <label className="text-[12px] font-medium text-[var(--color-lt-text-muted)] block mb-1">Meta do dia foi atingida?</label>
                  <textarea
                    value={r.meta_atingida}
                    onChange={(e) => update("meta_atingida", e.target.value)}
                    placeholder="Sim / Não / Sim, mas..."
                    rows={2}
                    className="w-full text-[13px] border border-[var(--color-lt-border)] rounded-md px-3 py-1.5 bg-[var(--color-lt-page-bg)] text-[var(--color-lt-text-base)] placeholder:text-[var(--color-lt-text-muted)] focus:outline-none focus:border-[var(--color-orakulo-primary)] resize-none"
                  />
                </div>
              </div>
            </section>

            {/* Histórico */}
            {historico.length > 0 && (
              <section>
                <h2 className="text-[11px] font-semibold tracking-[0.08em] uppercase text-[var(--color-lt-text-muted)] mb-2">
                  Histórico
                </h2>
                <div className="flex flex-col gap-0.5">
                  {historico.map((h) => {
                    const [a, m, d] = h.data.split("-")
                    const dt = new Date(Number(a), Number(m) - 1, Number(d))
                    const label = dt.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "2-digit" })
                    return (
                      <button
                        key={h.data}
                        onClick={() => router.push(`/relatorio/${h.data}`)}
                        className={`text-left px-3 py-1.5 rounded text-[12px] ${h.data === r.data ? "bg-[var(--color-lt-surface-fade)] text-[var(--color-lt-text-bright)] font-medium" : "text-[var(--color-lt-text-muted)] hover:bg-[var(--color-lt-surface-fade)]"}`}
                      >
                        <span className="capitalize">{label}</span>
                        <span className="ml-2 text-[var(--color-lt-text-muted)]">
                          · {h.ligacoes_qtd} lig · {h.ligacoes_conexoes} conex · {h.total_reunioes} reun
                        </span>
                      </button>
                    )
                  })}
                </div>
              </section>
            )}
          </div>

          {/* Preview */}
          <div className="w-1/2 p-6 overflow-auto">
            <PreviewWhatsApp relatorio={r} />
          </div>
        </div>
      </div>
    </div>
  )
}
