import type { RelatorioDiario } from "../types"

// Store em memória (substituir por Supabase no futuro)
const store: Map<string, RelatorioDiario> = new Map()

function relatorioVazio(data: string): RelatorioDiario {
  return {
    id: crypto.randomUUID(),
    data,
    operador: "Kevin",
    ligacoes_qtd: 0,
    ligacoes_conexoes: 0,
    ligacoes_decisores: 0,
    ligacoes_reunioes: 0,
    disparos_qtd: 0,
    disparos_decisores: 0,
    disparos_reunioes: 0,
    follows_qtd: 0,
    follows_decisores: 0,
    follows_reunioes: 0,
    total_reunioes: 0,
    total_reunioes_manual: false,
    melhor_horario: "",
    principal_dificuldade: "",
    horas_prospectando: 0,
    meta_atingida: "",
  }
}

export function getOrCreateRelatorio(data: string): RelatorioDiario {
  if (!store.has(data)) {
    store.set(data, relatorioVazio(data))
  }
  return store.get(data)!
}

export function saveRelatorio(r: RelatorioDiario): void {
  store.set(r.data, r)
}

export function listRelatorios(): RelatorioDiario[] {
  return Array.from(store.values()).sort((a, b) => b.data.localeCompare(a.data))
}
