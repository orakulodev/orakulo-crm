import type { Lead, LeadStatus } from "./types"

export function derivarStatus(lead: Pick<Lead, "disparo_at" | "r1_at" | "diagnostico_at" | "r2_at">): LeadStatus {
  if (lead.r2_at) return "r2"
  if (lead.diagnostico_at) return "diagnostico"
  if (lead.r1_at) return "r1"
  if (lead.disparo_at) return "contactado"
  return "novo"
}
