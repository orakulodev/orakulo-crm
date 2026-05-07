"use client"

import { useMemo } from "react"
import { RelatorioForm } from "@/components/relatorio/RelatorioForm"
import { getOrCreateRelatorio } from "@/lib/queries/relatorios"

export default function RelatorioData({ params }: { params: { data: string } }) {
  const relatorio = useMemo(() => getOrCreateRelatorio(params.data), [params.data])
  return <RelatorioForm initial={relatorio} />
}
