export type LeadStatus =
  | "novo"
  | "contactado"
  | "r1"
  | "diagnostico"
  | "r2"
  | "fechado"
  | "perdido"

export type InteractionType =
  | "call"
  | "note"
  | "status_change"
  | "meeting"
  | "doc_sent"
  | "whatsapp"

export type CallStatus =
  | "atendeu"
  | "nao_atendeu"
  | "ocupado"
  | "caixa_postal"
  | "agendou"

export interface Lista {
  id: string
  nome: string
  descricao: string | null
  ativa: boolean
  criado_em: string
}

export interface Lead {
  id: string
  empresa: string
  categoria: string | null
  telefone: string | null
  decisor: string | null
  status: LeadStatus
  origem: string
  lista_id: string | null
  lista?: Lista
  observacoes: string | null
  ultimo_contato: string | null
  proximo_follow: string | null
  valor_contrato: number | null
  criado_em: string
  atualizado_em: string
}

export interface Interaction {
  id: string
  lead_id: string
  tipo: InteractionType
  conteudo: string | null
  audio_url: string | null
  transcricao: string | null
  duracao_segundos: number | null
  status_call: CallStatus | null
  criado_em: string
}

export interface Proposta {
  id: string
  lead_id: string
  pdf_url: string | null
  conteudo_json: Record<string, unknown> | null
  enviado: boolean
  criado_em: string
}

export interface MetricaWhatsapp {
  id: string
  disparos: number
  respostas: number
  data: string
  payload_raw: Record<string, unknown> | null
}
