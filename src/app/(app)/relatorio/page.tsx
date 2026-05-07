import { redirect } from "next/navigation"

function hojeISO() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

export default function RelatorioPage() {
  redirect(`/relatorio/${hojeISO()}`)
}
