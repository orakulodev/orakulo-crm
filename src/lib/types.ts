export type LeadStatus = "novo" | "contactado" | "r1" | "diagnostico" | "r2"

export interface Lead {
  id: string
  lista_id: string
  nome: string
  categoria: string
  nota: number | null
  avaliacoes: number | null
  sobre: string
  telefone: string
  sites: string[]
  perfil_gmn: string
  decisor: string
  disparo_at: string | null   // ISO string
  r1_at: string | null
  diagnostico_at: string | null
  r2_at: string | null
  resultado: "—" | "Fechado" | "Perdido"
  observacao: string
}

export interface Lista {
  id: string
  nome: string
  descricao: string
  criado_em: string
}

export interface RelatorioDiario {
  id: string
  data: string            // YYYY-MM-DD
  operador: string
  ligacoes_qtd: number
  ligacoes_conexoes: number
  ligacoes_decisores: number
  ligacoes_reunioes: number
  disparos_qtd: number
  disparos_decisores: number
  disparos_reunioes: number
  follows_qtd: number
  follows_decisores: number
  follows_reunioes: number
  total_reunioes: number
  total_reunioes_manual: boolean
  melhor_horario: string
  principal_dificuldade: string
  horas_prospectando: number
  meta_atingida: string
}
