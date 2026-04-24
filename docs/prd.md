# Orakulo CRM — PRD (Product Requirements Document)

**Versão:** 1.0 | **Data:** 2026-04-17 | **Status:** Aprovado para implementação

---

## Visão Geral

CRM de uso pessoal do Kevin Nunes para gerenciar prospecção ativa (cold call + WhatsApp API), pipeline de vendas, follow-ups e métricas. Substitui Google Sheets + notas dispersas.

**Filosofia:** leve, rápido, sem features desnecessárias. Interface inspirada em planilhas (navegação por teclado), porém com inteligência de CRM. **Usuário único.**

---

## Contexto de Negócio

**Operação atual:**
- Canal principal: prospecção cold call + WhatsApp API oficial
- Nicho: imobiliárias (expansão futura)
- Fluxo: Scraping Google Maps → lista de leads → cold call → R1 → Diagnóstico → R2 → Fechamento

**Dores resolvidas pelo CRM:**
- Google Sheets não tem anotações rápidas por teclado
- Não normaliza telefones automaticamente
- Não integra com n8n/Agenda
- Não grava chamadas

---

## Módulos

### M1 — Leads (Tabela Planilha) `/leads`

Tela central. Lista todos os leads com colunas editáveis inline, navegação por teclado.

**Colunas:**

| Campo | Tipo | Notas |
|---|---|---|
| `empresa` | texto | Nome da empresa |
| `categoria` | select | ex: imobiliária, advocacia |
| `telefone` | texto | Armazenado: `+55XXXXXXXXXXX` |
| `decisor` | texto | Nome do dono/decisor |
| `status` | select | novo → contactado → r1 → diagnostico → r2 → fechado → perdido |
| `origem` | select | Google Maps, indicação, manual |
| `lista` | select/tag | Agrupamento de campanhas |
| `observacoes` | texto longo | Última observação |
| `ultimo_contato` | datetime | Auto-atualizado |
| `proximo_follow` | date | Data do próximo follow-up |

**Comportamentos críticos:**
- Clique no telefone → copia para clipboard (toast de confirmação)
- Normalização automática de telefone via `lib/phone.ts`
- Navegação por teclado: Enter (editar), Tab (próxima célula), ↑↓ (linhas), Escape (cancelar), Ctrl+Enter (confirmar e descer)
- Salvamento otimista com debounce 500ms
- Import CSV com drag-and-drop (preview 5 linhas + mapeamento de colunas)
- Export CSV com filtros aplicados
- Troca de lista/campanha via dropdown no topo

### M2 — Histórico de Interações `/leads/[id]`

Timeline cronológica de todas as interações com o lead.

**Tipos:** `CALL`, `NOTE`, `STATUS_CHANGE`, `MEETING`, `DOC_SENT`, `WHATSAPP`

**Anotação rápida durante call:**
- Atalho `N` → modal flutuante com autofocus
- Salva com `Ctrl+Enter`
- Timestamp automático

### M3 — Log de Ligações + Gravação de Áudio `/calls`

**Fluxo de gravação:**
1. Clica "Iniciar gravação" (Web Audio API)
2. Áudio gravado em memória (`.webm`)
3. Upload automático → Supabase Storage (`bucket: calls/`)
4. Webhook → n8n → Whisper API (transcrição)
5. Transcrição retorna via webhook e salva na interação

**Log de chamada:** data/hora, duração, status (atendeu / não atendeu / ocupado / caixa postal / agendou R1), observação rápida.

### M4 — Pipeline Kanban `/pipeline`

Colunas: Novo → Contactado → R1 → Diagnóstico → R2 → Fechado

Cards: empresa, telefone (clicável), último contato, próximo follow-up.

Drag-and-drop entre colunas (atualiza `status` no Supabase).

### M5 — Agenda `/agenda`

Integração Google Calendar API (readonly). Visão de hoje + próximos 7 dias. Filtra eventos de reunião. Sidebar com leads que têm `proximo_follow` = hoje.

### M6 — Propostas `/propostas`

1. Seleciona lead
2. Preenche template (dores, solução, investimento)
3. Gera PDF via n8n workflow (Docx → PDF) ou `pdf-lib`
4. PDF salvo no Supabase Storage, link na timeline
5. Status do lead → "Diagnóstico enviado"

### M7 — Métricas + Simulador `/metricas`

**KPIs:** ligações hoje/semana/mês, taxa de atendimento, taxa de conversão R1, taxa de fechamento, disparos WhatsApp, receita do mês.

**Simulador de meta:**
- Input: quantas vendas quero no mês?
- Output: quantas R2/R1/contactados/ligações necessárias (baseado em taxas reais dos últimos 30 dias)

**Gráficos (Recharts):** linha de ligações por dia, barra de conversão por etapa.

---

## UX Crítica — Atalhos Globais

| Tecla | Ação |
|---|---|
| `N` | Nova nota para lead selecionado |
| `C` | Registrar call |
| `Tab` / `Shift+Tab` | Navegar células da tabela |
| `↑` `↓` | Navegar linhas |
| `Enter` | Editar célula |
| `Escape` | Cancelar edição |
| `Ctrl+Enter` | Confirmar e descer |

---

## Roadmap de Sprints

| Sprint | Semana | Escopo |
|---|---|---|
| 1 | sem 1 (2026-04-17) | Setup + migrações SQL + auth + layout |
| 2 | sem 2 | LeadsTable + edição inline + import CSV |
| 3 | sem 3 | Interações + gravação áudio + webhooks |
| 4 | sem 4 | Kanban + Google Calendar |
| 5 | sem 5 | Métricas + webhooks n8n |
| 6 | sem 6 | Propostas PDF + PWA |
| Futuro | — | Deploy orakulo.dev/crm, dark mode, templates contrato |
