import type { RelatorioDiario } from "./types"

export function gerarTextoWhatsapp(r: RelatorioDiario): string {
  const [ano, mes, dia] = r.data.split("-")
  const dataFormatada = `${dia}/${mes}`

  return `📊 Relatório ${r.operador} – ${dataFormatada}

📞 Ligações
➡ Ligações: ${r.ligacoes_qtd}
➡ Conexões: ${r.ligacoes_conexoes}
➡ Decisores: ${r.ligacoes_decisores}
➡ Reuniões: ${r.ligacoes_reunioes}

🚀 Disparos
➡ Qtd de Disparo: ${r.disparos_qtd}
➡ Decisores gerados: ${r.disparos_decisores}
➡ Reuniões geradas: ${r.disparos_reunioes}

🔁 Follows
➡ Qtd de Follows: ${r.follows_qtd}
➡ Decisores gerados: ${r.follows_decisores}
➡ Reuniões geradas: ${r.follows_reunioes}

🎯 Geral do Dia
➡ Total Reuniões: ${r.total_reunioes}
➡ Melhor horário com mais conexões: ${r.melhor_horario || "—"}
➡ Principal dificuldade: ${r.principal_dificuldade || "—"}
➡ Horas prospectando: ${r.horas_prospectando ? r.horas_prospectando.toString().replace(".", ",") + "h" : "—"}
➡ Meta do dia foi atingida? ${r.meta_atingida || "—"}`
}
