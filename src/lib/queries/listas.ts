import type { Lista, Lead } from "../types"

// --- Mock data (substituir por Supabase no futuro) ---

export const MOCK_LISTAS: Lista[] = [
  { id: "advocacia-sp-mai26", nome: "Advocacia SP — Mai/26", descricao: "Lista Google My Business", criado_em: "2026-05-01T00:00:00Z" },
  { id: "imobi-sp-jan26", nome: "Imobiliária SP — Jan/26", descricao: "", criado_em: "2026-01-10T00:00:00Z" },
]

export const MOCK_LEADS: Lead[] = [
  {
    id: "1", lista_id: "advocacia-sp-mai26",
    nome: "Advocacia Mello & Associados", categoria: "Advocacia", nota: 4.8, avaliacoes: 312,
    sobre: "Escritório focado em direito empresarial e trabalhista. 3 sócios.", telefone: "+5511991234567",
    sites: ["https://melloadvocacia.com.br"], perfil_gmn: "https://maps.google.com/?cid=1234",
    decisor: "Dr. Carlos Mello", disparo_at: "2026-05-06T10:00:00Z", r1_at: null, diagnostico_at: null, r2_at: null,
    resultado: "—", observacao: "Abriu o WhatsApp, não respondeu ainda",
  },
  {
    id: "2", lista_id: "advocacia-sp-mai26",
    nome: "Lopes Advogados", categoria: "Advocacia", nota: 4.5, avaliacoes: 178,
    sobre: "Especialistas em direito de família e inventários.", telefone: "+5511987654321",
    sites: [], perfil_gmn: "",
    decisor: "Dra. Ana Lopes", disparo_at: "2026-05-06T10:30:00Z", r1_at: "2026-05-06T15:00:00Z", diagnostico_at: null, r2_at: null,
    resultado: "—", observacao: "R1 feita — enviou diagnóstico por e-mail",
  },
  {
    id: "3", lista_id: "advocacia-sp-mai26",
    nome: "Ferreira & Cunha Advocacia", categoria: "Advocacia", nota: 4.2, avaliacoes: 89,
    sobre: "", telefone: "+5511944332211",
    sites: ["https://ferreiracunha.adv.br"], perfil_gmn: "",
    decisor: "", disparo_at: null, r1_at: null, diagnostico_at: null, r2_at: null,
    resultado: "—", observacao: "",
  },
  {
    id: "4", lista_id: "advocacia-sp-mai26",
    nome: "Studio Jurídico Ribeiro", categoria: "Advocacia", nota: 5.0, avaliacoes: 44,
    sobre: "Boutique de alto padrão, foco em M&A.", telefone: "+5511933221100",
    sites: [], perfil_gmn: "https://maps.google.com/?cid=5678",
    decisor: "Dr. Paulo Ribeiro", disparo_at: "2026-05-05T09:00:00Z", r1_at: "2026-05-05T14:00:00Z", diagnostico_at: "2026-05-06T11:00:00Z", r2_at: null,
    resultado: "—", observacao: "Diagnóstico aprovado. R2 marcada pra sexta 14h",
  },
  {
    id: "5", lista_id: "advocacia-sp-mai26",
    nome: "Alves Advogados Associados", categoria: "Advocacia", nota: 3.9, avaliacoes: 201,
    sobre: "Grande escritório, 12 advogados.", telefone: "+5511922110099",
    sites: ["https://alves.adv.br"], perfil_gmn: "",
    decisor: "Dra. Márcia Alves", disparo_at: "2026-05-04T10:00:00Z", r1_at: "2026-05-04T16:00:00Z", diagnostico_at: "2026-05-05T10:00:00Z", r2_at: "2026-05-06T14:00:00Z",
    resultado: "Fechado", observacao: "Fechou R$ 2.800/mês. Onboarding segunda-feira",
  },
  {
    id: "6", lista_id: "advocacia-sp-mai26",
    nome: "Branco & Silva Juridico", categoria: "Advocacia", nota: 4.1, avaliacoes: 67,
    sobre: "", telefone: "+5511911009988",
    sites: [], perfil_gmn: "",
    decisor: "Dr. Renato Branco", disparo_at: "2026-05-03T10:00:00Z", r1_at: null, diagnostico_at: null, r2_at: null,
    resultado: "Perdido", observacao: "Achou caro, já tem solução interna",
  },
]

export function getLeadsByLista(listaId: string): Lead[] {
  return MOCK_LEADS.filter((l) => l.lista_id === listaId)
}

export function getListaById(listaId: string): Lista | undefined {
  return MOCK_LISTAS.find((l) => l.id === listaId)
}
