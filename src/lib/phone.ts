/**
 * Remove tudo que não for dígito
 */
function digits(s: string): string {
  return s.replace(/\D/g, "")
}

/**
 * Normaliza qualquer formato de telefone brasileiro para +55XXXXXXXXXXX
 * Aceita: "11 99999-9999", "(11)999999999", "5511999999999", "11999999999"
 */
export function normalizePhone(input: string): string {
  if (!input) return ""
  const d = digits(input)

  // Já tem código do país
  if (d.startsWith("55") && d.length >= 12) {
    return `+${d.slice(0, 13)}`
  }

  // Sem código do país — assume Brasil
  if (d.length >= 10) {
    return `+55${d.slice(0, 11)}`
  }

  return `+55${d}`
}

/**
 * Formata número normalizado para exibição: (11) 99999-9999
 */
export function formatPhone(normalized: string): string {
  const d = digits(normalized)
  // Remove 55 do início se houver
  const local = d.startsWith("55") ? d.slice(2) : d

  if (local.length === 11) {
    return `(${local.slice(0, 2)}) ${local.slice(2, 7)}-${local.slice(7)}`
  }
  if (local.length === 10) {
    return `(${local.slice(0, 2)}) ${local.slice(2, 6)}-${local.slice(6)}`
  }
  return normalized
}
