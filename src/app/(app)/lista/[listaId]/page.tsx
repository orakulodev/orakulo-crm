import { notFound } from "next/navigation"
import { ListaTable } from "@/components/lista/ListaTable"
import { getLeadsByLista, getListaById, MOCK_LISTAS } from "@/lib/queries/listas"

export default function ListaDetalhe({ params }: { params: { listaId: string } }) {
  const lista = getListaById(params.listaId) ?? MOCK_LISTAS[0]
  const leads = getLeadsByLista(lista.id)

  return <ListaTable listaId={lista.id} listaNome={lista.nome} initialLeads={leads} />
}
