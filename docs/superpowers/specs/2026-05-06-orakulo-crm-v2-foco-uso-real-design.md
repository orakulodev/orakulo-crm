# Orakulo CRM v2 — Foco no Uso Real (Spec)

**Data:** 2026-05-06
**Autor:** Kevin Nunes (Orakulo) + Claude
**Status:** Aprovado — pronto para plano de implementação

---

## 1. Resumo

Refatoração do Orakulo CRM para refletir o uso real da operação de prospecção do Kevin: foco em **Lista (planilha)** + **Relatório Diário** + **Métricas**, com troca de fonte e remoção total de animações.

O sistema atual tem 7 rotas em stub (Pipeline, Leads, Ligações, Agenda, Métricas, Propostas, Configurações) seguindo o PRD original. A operação real do Kevin se resume hoje a duas atividades: alimentar uma lista de prospecção (cold call + disparo WhatsApp) e fechar o dia preenchendo um relatório no formato de notas. Esse spec reduz o escopo visível para o que ele usa, refatora a Lista para refletir as colunas que ele de fato preenche, cria o Relatório Diário (módulo novo) e refatora Métricas para serem 100% derivadas dos relatórios.

---

## 2. Objetivos

1. **Usabilidade tipo Sheets, visual tipo Notion/Linear**: navegação por teclado completa, edição inline, mas com densidade visual limpa (sem animações, sem ruído).
2. **Capturar o relatório diário no próprio sistema** com botão de "copiar para WhatsApp" gerando o texto formatado pronto.
3. **Métricas derivadas**: nada de entrada manual de KPI — tudo vem do Relatório Diário.
4. **Foco no que é usado hoje**: esconder/deletar módulos não usados (Pipeline, Agenda, Ligações, Propostas) sem perder o histórico de design no PRD.
5. **Trocar fonte para Inter** (mais legível em corpo de tabela 13px do que Geist) e remover toda animação.

---

## 3. Não-objetivos (out of scope deste spec)

- Templates de relatório configuráveis pelo usuário (fica para v3 — no MVP o template é fixo no código).
- Integração WhatsApp API / agente (próxima fase).
- Pipeline Kanban, Agenda Google Calendar, Propostas PDF, Gravação de áudio.
- Dark mode (fica preparado nos tokens, mas sem toggle de UI agora).
- Multi-usuário / colaboradores (single-user permanece — só o Kevin).

---

## 4. Decisões tomadas (com justificativa)

| # | Decisão | Justificativa |
|---|---|---|
| D1 | Fonte = **Inter** (Google Fonts) | Padrão de fato em CRMs densos (Linear, Stripe). Tabular nums nativo. Some como elemento de design. |
| D2 | **Zero animações** | `tw-animate-css` removido do build, todas as classes `transition-*`, `animate-*`, `duration-*`, `motion-*` excluídas. Hover muda cor instantaneamente. |
| D3 | Sidebar reduzido a **Lista / Relatório / Métricas / Configurações** | Reflete uso real. Outras páginas deletadas (recuperáveis via git). |
| D4 | **Status do lead vira derivado** dos timestamps `disparo_at`, `r1_at`, `diagnostico_at`, `r2_at` | Evita estado redundante. Coluna `status` legada permanece no banco mas não é exposta na UI. |
| D5 | **Listas como tabela própria** no banco | Cada campanha (ex: "Advocacia SP — Mai/26") tem id próprio, permite metadados (data criação, contagem de leads), filtragem limpa por FK. |
| D6 | **Template do relatório fixo no MVP** | Estrutura cobre 100% do exemplo do Kevin. Adicionar campo novo é uma migration de ~15 linhas. |
| D7 | **Métricas 100% derivadas dos relatórios diários** | Single source of truth. Kevin preenche relatório → métricas atualizam. |
| D8 | **Pages stub deletadas** (não escondidas) | Limpeza estrutural. Ficam no git history. |

---

## 5. Arquitetura

### 5.1 Stack (sem mudanças)

- Next.js 16 (App Router, Server Components default)
- TypeScript 5
- Tailwind CSS v4 + tokens IDV em `src/app/globals.css`
- Shadcn UI + componentes próprios
- TanStack Table v8 (Lista)
- TanStack Query v5 (cache + mutations otimistas)
- Supabase (PostgreSQL + Auth + Storage)
- React Hook Form + Zod (forms)
- Recharts (gráficos, com `isAnimationActive={false}`)

### 5.2 Estrutura de pastas alvo

```
src/
├── app/
│   ├── (app)/
│   │   ├── layout.tsx              # Sidebar enxuto
│   │   ├── lista/
│   │   │   ├── page.tsx            # Redireciona pra última lista usada
│   │   │   └── [listaId]/page.tsx  # Tabela da lista X
│   │   ├── relatorio/
│   │   │   ├── page.tsx            # Hoje (cria/abre)
│   │   │   └── [data]/page.tsx     # Relatório de data específica
│   │   ├── metricas/page.tsx
│   │   └── configuracoes/page.tsx
│   ├── globals.css                 # Inter + tokens IDV (sem tw-animate-css)
│   └── layout.tsx                  # Inter via next/font/google
├── components/
│   ├── lista/
│   │   ├── ListaTable.tsx          # TanStack Table
│   │   ├── ColunaHeader.tsx
│   │   ├── CelulaTexto.tsx         # edição inline genérica
│   │   ├── CelulaNumerica.tsx      # nota, avaliações
│   │   ├── CelulaTelefone.tsx      # exibe formatado, copia ao clicar
│   │   ├── CelulaToggleData.tsx    # Disparo / R1 / Diag / R2
│   │   ├── CelulaPopover.tsx       # Sobre, Observação (texto longo)
│   │   ├── CelulaSites.tsx         # url[] como chips
│   │   ├── ListaSelector.tsx       # dropdown de campanhas no header
│   │   ├── ToggleVisaoColunas.tsx  # Compacta / Completa
│   │   ├── ImportCsvDialog.tsx
│   │   └── useTabelaTeclado.ts     # hook centralizando atalhos
│   ├── relatorio/
│   │   ├── RelatorioForm.tsx       # painel esquerdo
│   │   ├── PreviewWhatsApp.tsx     # painel direito
│   │   ├── InputNumericoSetinha.tsx  # [- N +] com setas do teclado
│   │   ├── HistoricoRelatorios.tsx
│   │   └── BotaoCopiarWhatsApp.tsx
│   ├── metricas/
│   │   ├── KpiCard.tsx             # com barra de progresso vs meta
│   │   ├── GraficoLinhaPorDia.tsx
│   │   ├── GraficoFunilConversao.tsx
│   │   └── EditorMetas.tsx         # configura metas semana/mês
│   ├── layout/
│   │   └── Sidebar.tsx             # 4 itens (Lista/Relatório/Métricas/Config)
│   └── ui/                         # shadcn — mantém
└── lib/
    ├── phone.ts                    # já existe — manter
    ├── relatorio-template.ts       # gera string WhatsApp
    ├── derivar-status.ts           # timestamps → status
    ├── supabase/                   # client.ts, server.ts (existem)
    ├── queries/
    │   ├── listas.ts               # CRUD listas
    │   ├── leads.ts                # CRUD leads
    │   ├── relatorios.ts           # CRUD relatórios diários
    │   └── metricas.ts             # agregações + metas
    └── utils.ts
```

### 5.3 Fluxo de dados

```
Kevin abre /lista/[listaId]
  → query: fetch leads WHERE lista_id = X
  → renderiza TanStack Table
  → edita célula → mutation otimista (debounce 500ms) → Supabase
  → invalida cache (TanStack Query)

Kevin abre /relatorio (rota = "hoje")
  → query: fetch relatorios_diarios WHERE data = today
    → se existe: abre em modo edição
    → se não: cria registro vazio e abre
  → preenche campo → mutation otimista (debounce 500ms)
  → preview WhatsApp re-renderiza em tempo real

Kevin abre /metricas
  → query: agrega relatorios_diarios (hoje, semana, mês)
  → query: fetch metas (semana atual, mês atual)
  → renderiza KPI cards + Recharts
```

---

## 6. Modelo de dados

### 6.1 Migrations

**Migration 1: Tabela `listas` (nova).**

```sql
create table listas (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  descricao text,
  criado_em timestamptz default now()
);

create index idx_listas_criado_em on listas (criado_em desc);
```

**Migration 2: Refatorar `leads`.**

```sql
alter table leads add column nota numeric(2,1);
alter table leads add column avaliacoes int;
alter table leads add column sobre text;
alter table leads add column sites text[];
alter table leads add column perfil_gmn text;
alter table leads add column disparo_at timestamptz;
alter table leads add column r1_at timestamptz;
alter table leads add column diagnostico_at timestamptz;
alter table leads add column r2_at timestamptz;
alter table leads add column lista_id uuid references listas(id) on delete set null;

create index idx_leads_lista_id on leads (lista_id);
create index idx_leads_atualizado_em on leads (atualizado_em desc);
-- coluna `status` permanece (legacy), não é mais usada na UI
```

**Migration 3: Tabela `relatorios_diarios` (nova).**

```sql
create table relatorios_diarios (
  id uuid primary key default gen_random_uuid(),
  data date unique not null,
  operador text default 'Kevin',

  -- Ligações
  ligacoes_qtd int default 0,
  ligacoes_conexoes int default 0,
  ligacoes_decisores int default 0,
  ligacoes_reunioes int default 0,

  -- Disparos
  disparos_qtd int default 0,
  disparos_decisores int default 0,
  disparos_reunioes int default 0,

  -- Follows
  follows_qtd int default 0,
  follows_decisores int default 0,
  follows_reunioes int default 0,

  -- Geral do dia
  total_reunioes int default 0,        -- editável; default = soma das 3 acima
  melhor_horario text,
  principal_dificuldade text,
  horas_prospectando numeric(4,2),
  meta_atingida text,                  -- texto livre, aceita "Sim, mas..."

  criado_em timestamptz default now(),
  atualizado_em timestamptz default now()
);

create index idx_relatorios_data on relatorios_diarios (data desc);
```

**Migration 4: Tabela `metas` (nova).**

```sql
create table metas (
  id uuid primary key default gen_random_uuid(),
  periodo text check (periodo in ('semana','mes')) not null,
  inicio date not null,
  fim date not null,
  ligacoes_meta int,
  conexoes_meta int,
  reunioes_meta int,
  horas_meta numeric(4,2),
  unique (periodo, inicio)
);

create index idx_metas_periodo_inicio on metas (periodo, inicio desc);
```

### 6.2 Derivação de status

Função pura em `lib/derivar-status.ts`:

```ts
export type LeadDerivedStatus =
  | "novo" | "contactado" | "r1" | "diagnostico" | "r2" | "fechado" | "perdido"

export function derivarStatus(lead: Lead): LeadDerivedStatus {
  if (lead.r2_at) return "r2"
  if (lead.diagnostico_at) return "diagnostico"
  if (lead.r1_at) return "r1"
  if (lead.disparo_at) return "contactado"
  return "novo"
}
```

Estados `fechado` e `perdido` permanecem manuais (não há timestamp pra derivar) — vão como uma coluna extra "Resultado" só visível na visão Completa, valores: `—`, `Fechado`, `Perdido`.

---

## 7. Detalhamento dos módulos

### 7.1 Lista (`/lista/[listaId]`)

**Header:**
- ListaSelector (dropdown): nome da lista atual, ao clicar mostra outras + "+ Nova lista" + "Renomear" + "Excluir"
- Contagem: `8 leads`
- Toggle "Compacta ↔ Completa"
- Botão "Importar CSV"
- Botão "+ Novo lead"
- Campo de busca (filtra por Nome ou Decisor)

**Colunas (todas no banco):**

| Coluna | Tipo | Compacta | Completa | Editor |
|---|---|---|---|---|
| Nome | text | ✅ | ✅ | inline texto |
| Categoria | text (select livre) | ✅ | ✅ | combobox com criar-novo |
| Nota | numeric(2,1) 0–5 | ⛔ | ✅ | input numérico |
| Avaliações | int | ⛔ | ✅ | input numérico |
| Sobre | text | ⛔ | ✅ | popover textarea |
| Telefone | text | ✅ | ✅ | inline (entrada bruta, normalizada via `phone.ts`) |
| Tel. Formatado | derivado | ⛔ | ✅ | read-only |
| Sites | text[] | ⛔ | ✅ | chips com + e remover |
| Perfil GMN | text (URL) | ⛔ | ✅ | inline texto |
| Decisor | text | ✅ | ✅ | inline texto |
| Disparo | timestamptz \| null | ✅ | ✅ | toggle (clique) + shift+clique abre date picker |
| R1 | timestamptz \| null | ✅ | ✅ | idem |
| Diagnóstico | timestamptz \| null | ✅ | ✅ | idem |
| R2 | timestamptz \| null | ✅ | ✅ | idem |
| Resultado | enum (`—`/`Fechado`/`Perdido`) | ⛔ | ✅ | select |
| Observação | text | ✅ | ✅ | popover textarea |

**Atalhos (`useTabelaTeclado.ts`):**

| Tecla | Ação | Implementação |
|---|---|---|
| ↑ ↓ ← → | Navega célula | move foco; sem editar |
| Enter / F2 | Abre célula | foca input |
| Tab | Próxima célula + edição | wrap para próxima linha no fim |
| Shift+Tab | Anterior + edição | wrap reverso |
| Ctrl+Enter | Confirma e desce | salva + move foco abaixo |
| Escape | Cancela edição | restaura valor anterior |
| Delete / Backspace | (sem editar) limpa célula | mutation que seta null/'' |
| Ctrl+C / Ctrl+V | copia/cola | clipboard API |
| Ctrl+D | Preenche pra baixo | copia valor da linha acima |

**Salvamento:**
- Otimista com debounce 500ms (regra do `CLAUDE.md`)
- TanStack Query `useMutation` com `onMutate` aplicando local + `onError` revertendo
- Toast vermelho discreto se falhar

**Toggle Visão (Compacta/Completa):** preferência salva em `localStorage` chave `lista_visao`.

**Toggle de coluna individual:** botão "Colunas" no header abre popover com checkboxes de cada coluna; também salvo em localStorage.

### 7.2 Relatório Diário (`/relatorio` + `/relatorio/[data]`)

**Rota `/relatorio`:** redireciona para `/relatorio/<hoje>`. Se não existe relatório de hoje, cria um vazio antes de redirecionar.

**Layout split (50/50):**

**Painel esquerdo — Formulário:**

```
📊 Relatório Kevin — 06/05/2026

📞 Ligações
  Ligações:    [- 12 +]
  Conexões:    [-  5 +]
  Decisores:   [-  2 +]
  Reuniões:    [-  1 +]

🚀 Disparos
  Qtd:         [- 15 +]
  Decisores:   [-  3 +]
  Reuniões:    [-  1 +]

🔁 Follows
  Qtd:         [-  5 +]
  Decisores:   [-  2 +]
  Reuniões:    [-  1 +]

🎯 Geral do Dia
  Total Reuniões:    [- 3 +]    [auto-soma]
  Melhor horário:    [____________]
  Principal dificuldade:
    [textarea grande, ~4 linhas, expansível]
  Horas prospectando: [- 2.5 +]
  Meta atingida?
    [textarea curto, ~2 linhas]
```

**Painel direito — Preview WhatsApp:**

```
📊 Relatório Kevin – 06/05

📞 Ligações
➡ Ligações: 12
➡ Conexões: 5
➡ Decisores: 2
➡ Reuniões: 1

🚀 Disparos
➡ Qtd de Disparo: 15
➡ Decisores gerados: 3
➡ Reuniões geradas: 1

🔁 Follows
➡ Qtd de Follows: 5
➡ Decisores gerados: 2
➡ Reuniões geradas: 1

🎯 Geral do Dia
➡ Total Reuniões: 3
➡ Melhor horário com mais conexões: 10h-12h
➡ Principal dificuldade: ...
➡ Horas prospectando: 2,5h
➡ Meta do dia foi atingida? ...

[📋 Copiar para WhatsApp]
```

A função `gerarTextoWhatsapp(relatorio: RelatorioDiario)` em `lib/relatorio-template.ts` gera essa string. O botão usa `navigator.clipboard.writeText()` e dispara toast.

**Comportamento dos inputs numéricos (`InputNumericoSetinha`):**
- Visual: `[- N +]` com botões à esquerda/direita
- Setas ↑/↓ do teclado dentro do input incrementam/decrementam de 1
- Shift+seta = passo de 10
- Aceita digitação direta também
- `Total Reuniões` recalcula automaticamente quando os 3 reuniões dos grupos mudam, **a menos que** o usuário tenha override manualmente (flag interna `total_reunioes_manual`)

**Botões de ação no header:**
- "Hoje" (volta pra `/relatorio/<hoje>`)
- "Clonar de ontem" (copia campos textuais — melhor horário, principal dificuldade, meta — zera quantidades)
- "Copiar para WhatsApp"

**Histórico (abaixo do split):**
- Lista compacta dos últimos 30 relatórios
- Cada item: `Ter, 06/05 · 12 lig · 5 conex · 1 reun`
- Clica → vai pra `/relatorio/2026-05-06`

### 7.3 Métricas (`/metricas`)

**Topo — 3 colunas de KPI cards:**

```
┌─── Hoje ────┐  ┌─── Semana ──┐  ┌─── Mês ─────┐
│ Ligações    │  │ Ligações    │  │ Ligações    │
│   12        │  │   78 / 100  │  │  312 / 400  │
│   ━━━━━━░░  │  │   ━━━━━━━░  │  │   ━━━━━━━░  │
│             │  │   78%       │  │   78%       │
└─────────────┘  └─────────────┘  └─────────────┘
```

Cada card: 1 KPI principal (Ligações, Conexões, Reuniões, Horas) — total 4 KPIs por período × 3 períodos = 12 cards. Layout em grid 4×3 ou um picker de KPI.

**Decisão de layout:** fileira única horizontal por período (Hoje/Semana/Mês cada um com 4 mini-cards). Total: 3 fileiras de 4 cards.

**Barra de progresso:**
- Hoje: sem barra (não há meta diária na v1; mostra só valor)
- Semana/Mês: barra laranja 0–100% + texto `78 / 100 · 78%`
- Se atingiu meta: barra fica verde

**Seção "Gráficos":**
- Gráfico de linha (Recharts): Ligações × Conexões × Reuniões nos últimos 30 dias. `isAnimationActive={false}`.
- Gráfico de barras: funil mensal (Disparos → Decisores → Reuniões geradas). `isAnimationActive={false}`.

**Seção "Metas" (recolhível, no fim):**
- Form para metas semanal: Ligações, Conexões, Reuniões, Horas
- Form para metas mensal: idem
- Cada meta tem `inicio` e `fim` — no MVP, default é semana atual / mês atual
- Salvar cria/atualiza registro em `metas`

**Agregação (`lib/queries/metricas.ts`):**

```ts
async function fetchKpisHoje(): Promise<Kpis>
async function fetchKpisSemana(): Promise<Kpis & { meta?: Meta }>
async function fetchKpisMes(): Promise<Kpis & { meta?: Meta }>
async function fetchSerie30Dias(): Promise<Array<{ data: string; ligacoes: number; conexoes: number; reunioes: number }>>
async function fetchFunilMes(): Promise<{ disparos: number; decisores: number; reunioes: number }>
```

Tudo via SQL agregando `relatorios_diarios`. RPC functions no Supabase para ranges (semana ISO, mês corrente).

### 7.4 Configurações (`/configuracoes`)

Mantém estrutura atual mínima. Adiciona:
- Dados do operador (nome, default = "Kevin")
- Atalho rápido pra `/metricas` (editar metas)
- (Futuro: personalizar template de relatório)

---

## 8. IDV / Estilo

### 8.1 Fonte

`src/app/layout.tsx`:

```tsx
import { Inter } from "next/font/google"

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
})

// no <html className={inter.variable}>
```

`globals.css`:

```css
@theme inline {
  --font-sans: var(--font-inter);
}

@layer base {
  html {
    font-family: var(--font-inter), -apple-system, BlinkMacSystemFont, sans-serif;
    font-feature-settings: "tnum" 1, "ss01" 1;
  }
}
```

`docs/idv.md`: atualizar seção "Tipografia" para refletir Inter.

### 8.2 Animações — remoção total

**Arquivos com varredura:**
- `globals.css`: remover `@import "tw-animate-css";`
- `package.json`: remover `tw-animate-css` das dependencies
- Buscar e remover de todo o código:
  - `transition-*` (transition-colors, transition-opacity, transition-all)
  - `animate-*`
  - `duration-*`, `delay-*`, `ease-*`
  - `motion-*`
  - `@keyframes` em CSS custom

**Recharts:** todos os componentes recebem `isAnimationActive={false}`.

**Toggle/popover:** sem `data-state=open` animations — abre/fecha instantaneamente.

### 8.3 Tokens IDV

Mantidos como estão em `globals.css`. Nenhum token novo necessário pro MVP (laranja, surface, fade, border, status colors já cobrem).

---

## 9. Limpeza de código existente

**Deletar (arquivos e referências):**
- `src/app/(app)/pipeline/page.tsx`
- `src/app/(app)/agenda/page.tsx`
- `src/app/(app)/calls/page.tsx`
- `src/app/(app)/propostas/page.tsx`
- `src/app/(app)/leads/` (renomeado para `lista/`)

**Refatorar:**
- `src/components/layout/Sidebar.tsx` — 4 itens (Lista, Relatório, Métricas, Configurações)
- `src/app/(app)/leads/page.tsx` → `src/app/(app)/lista/[listaId]/page.tsx` (com redirect de `/lista` para a última lista usada)
- `src/app/(app)/metricas/page.tsx` — implementação real
- Remover `tw-animate-css` de `globals.css` e `package.json`

**Manter:**
- `src/lib/phone.ts`
- `src/lib/supabase/`
- `src/components/ui/` (shadcn)
- Toaster (sonner) — sem animação opcional, é OK

---

## 10. Fases de implementação (sugestão pro plano)

> O plano detalhado será criado pela skill `writing-plans` após aprovação deste spec.
> Fases sugeridas, cada uma terminando com commit funcional:

| Fase | Escopo | Critério de sucesso |
|---|---|---|
| **F0** | Fonte Inter + remoção `tw-animate-css` + sidebar enxuto + delete pages stub | Build passa, sidebar mostra 4 itens, sem `tw-animate-css` no `package.json` |
| **F1** | Migrations Supabase (listas, leads novos campos, relatorios_diarios, metas) | `mcp__claude_ai_Supabase__apply_migration` retorna ok pras 4 migrations |
| **F2** | `/lista/[listaId]` — TanStack Table + edição inline texto + telefone + atalhos teclado | Tabela renderiza, navega com setas, edita Nome/Decisor/Telefone/Observação |
| **F3** | `/lista/[listaId]` — toggles Disparo/R1/Diag/R2 + visão Compacta/Completa + Sites/Sobre/Nota/Avaliações/Perfil GMN | Todas as colunas funcionais |
| **F4** | `/lista` ListaSelector + criar/renomear/excluir lista + import CSV | Pode trocar de campanha, importar leads via CSV |
| **F5** | `/relatorio/[data]` — formulário + preview + copiar WhatsApp + histórico | Preenche, salva, copia o texto formatado igual ao exemplo |
| **F6** | `/metricas` — KPI cards + gráficos + editor de metas | Dados agregados dos relatórios renderizam |
| **F7** | Polish: toggle de colunas individual + Ctrl+D fill-down + Ctrl+C/V + estados de erro | Cobertura dos atalhos avançados |

Cada fase termina com `pnpm dev` testado manualmente + commit.

---

## 11. Riscos e perguntas em aberto

### Riscos

1. **TanStack Table v8 + atalhos custom:** API de focus/edit cell precisa ser implementada manualmente — não é built-in. **Mitigação:** começar simples (apenas Tab/Enter na F2), expandir em F7.
2. **Schema legado:** coluna `status` em `leads` continua existindo mas não usada. **Mitigação:** documentar como deprecated; remover em refactor futuro.
3. **`total_reunioes_manual` flag:** auto-soma sobrescrevendo input do usuário pode irritar. **Mitigação:** flag local interna detecta override; auto-soma só se nunca foi tocado manualmente.

### Perguntas que podem virar decisões depois

1. **Auth**: clients Supabase existem em `src/lib/supabase/`, mas não há tela de login nem middleware. **Decisão para o MVP**: roda local sem auth (chave anon do Supabase usada direto, RLS desligado nas tabelas novas). Auth + RLS viram tarefa de pré-deploy num spec separado.
2. **RLS no Supabase**: tabelas novas (`listas`, `relatorios_diarios`, `metas`) criadas com RLS desligado no MVP. Quando auth entrar, virar policy `auth.uid() is not null can all`.
3. **Backup**: alguma estratégia para o Supabase free tier? Fora do MVP — anotar pra v3.

---

## 12. Critérios de aceitação (DoD)

O Kevin consegue, ao final de todas as fases:

- [ ] Abrir `/lista/<minha-lista>`, importar um CSV de 50 leads, ver todos com telefone normalizado
- [ ] Navegar a tabela com setas, editar uma observação com Enter→texto→Ctrl+Enter
- [ ] Marcar Disparo / R1 / Diagnóstico / R2 com 1 clique, ver data automática
- [ ] Trocar entre visão Compacta e Completa
- [ ] Trocar de lista pelo dropdown do header
- [ ] Abrir `/relatorio` em qualquer hora do dia e ter um relatório de hoje aberto
- [ ] Preencher o relatório com inputs de setinha
- [ ] Copiar o relatório formatado para clipboard, colar no WhatsApp e ficar idêntico ao formato de exemplo
- [ ] Ver `/metricas` com KPI cards mostrando hoje/semana/mês baseado nos relatórios já preenchidos
- [ ] Setar metas semanal/mensal e ver as barras de progresso atualizarem
- [ ] Nenhuma animação visível em nenhuma tela (zero `transition`, zero fade, zero slide)
- [ ] Fonte Inter aplicada em todo o sistema, números em colunas alinhados (tabular-nums)

---

## 13. Próximo passo

Após aprovação deste spec, invocar `superpowers:writing-plans` para gerar o plano detalhado fase a fase, com:
- Comandos exatos por fase
- Ordem de arquivos a editar
- Pontos de commit
- Validações entre fases
