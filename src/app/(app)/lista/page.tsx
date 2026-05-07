import { redirect } from "next/navigation"
import { MOCK_LISTAS } from "@/lib/queries/listas"

export default function ListaPage() {
  redirect(`/lista/${MOCK_LISTAS[0].id}`)
}
