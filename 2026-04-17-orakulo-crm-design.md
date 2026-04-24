# Orakulo CRM — PRD + Architecture Design
**Data:** 2026-04-17  
**Autor:** Kevin Nunes (Orakulo)  
**Status:** Aprovado para implementação  
**Versão:** 1.0

---

## 1. Visão Geral

CRM de uso pessoal do Kevin, fundador da Orakulo, para gerenciar prospecção ativa (cold call + WhatsApp API), pipeline de vendas, follow-ups e métricas da operação. Substitui Google Sheets + notas dispersas por uma interface rápida, integrada com Supabase, n8n e Google Agenda.

**Filosofia:** leve, rápido, sem features desnecessárias. Interface inspirada em planilhas (navegação por teclado), porém com inteligência de CRM.

**Usuário único:** Kevin Nunes. Sem multitenancy, sem RBAC complexo.

---

## 2. Contexto de Negócio

### Operação atual
- **Canal principal:** prospecção por cold call + WhatsApp API oficial (disparos)
- **Nicho:** imobiliárias (expansão futura para outros segmentos)
- **Fluxo:** Scraping Google Maps → lista de leads → cold call → R1 → Diagnóstico → R2 → Fechamento
- **Dor:** Google Sheets não tem anotações rápidas por teclado, não normaliza telefones, não integra com n8n/Agenda, não grava chamadas

### Integrações vivas
| Sistema | Papel |
|---|---|
| **Supabase** | Banco de dados principal (PostgreSQL) |
| **n8n** | Automações, webhooks, disparos WhatsApp |
| **Google Agenda** | Visualização de reuniões R1/R2 |
| **WhatsApp API oficial** | Canal de follow-up e disparo |

---

## 3. Stack Técnica

### Desenvolvimento inicial: localhost
O CRM começa como aplicação local. Sem VPS, sem Docker complexo na fase inicial. Quando estiver maduro, sobe para `orakulo.dev/crm` via NGINX reverse proxy no Hetzner.

### Framework
| Camada | Tecnologia |
|---|---|
| Framework | **Next.js 15** (App Router, SSR habilitado — não SSG, pois tem backend) |
| Linguagem | TypeScript 5 |
| Estilo | **Tailwind CSS v4** + tokens IDV Orakulo |
| Componentes base | **Shadcn UI** |
| Tabela | **TanStack Table v8** (navegação por teclado, edição inline) |
| Dados assíncronos | **TanStack Query v5** |
| Formulários | **React Hook Form + Zod** |
| Banco | **Supabase** (PostgreSQL + Storage para áudios) |
| Auth | **Supabase Auth** (senha simples, usuário único) |
| Métricas/gráficos | **Recharts** |
| PWA | **next-pwa** (instala no celular) |
| Áudio | **Web Audio API** (gravação) + **Supabase Storage** (upload) |
| Transcrição | **Whisper API** (OpenAI) ou **n8n workflow** |

### Por que Next.js com SSR e não SSG?
O site `orakulo.dev` usa SSG (output estático). O CRM **não pode ser SSG** — tem autenticação, dados dinâmicos, API routes para webhooks e upload de áudio. Fica como app separado.

---

## 4. Identidade Visual

### Base: Orakulo IDV
Mesmos tokens do `orakulo-site/src/app/globals.css`, adaptados para interface densa de CRM.

```css
/* Cores principais */
--color-lt-page-bg: #f9f4f2;     /* fundo geral */
--color-lt-surface: #ffffff;      /* cards, tabela */
--color-lt-surface-fade: #f0ece8; /* hover de linha, zebra */
--color-lt-border: #e2ddd8;       /* bordas */
--color-lt-text-bright: #1a1a1a;  /* títulos */
--color-lt-text-base: #3d3d3d;    /* texto corpo */
--color-lt-text-muted: #777777;   /* labels, placeholders */
--color-primary: #ff7800;          /* laranja Orakulo */
--color-primary-hover: #e06900;

/* Status de pipeline (novos tokens) */
--color-status-new: #e8f4ff;        /* Novo lead */
--color-status-contacted: #fff8e1;  /* Contactado */
--color-status-r1: #fff3e0;         /* R1 agendada */
--color-status-diagnosed: #f3e5f5;  /* Diagnóstico enviado */
--color-status-r2: #e8f5e9;         /* R2 agendada */
--color-status-closed: #e0f2f1;     /* Fechado */
--color-status-lost: #fce4ec;       /* Perdido */
```

### Tipografia
- **Fonte principal:** `Geist` (mesma do site) — fallback: `-apple-system, sans-serif`
- **Fonte numérica (tabela):** `font-variant-numeric: tabular-nums` para alinhamento de colunas
- **Hierarquia:**
  - Labels/eyebrows: `11px, weight 600, tracking 0.08em, muted`
  - Corpo de tabela: `13px, weight 400`
  - Títulos de seção: `15px, weight 600`
  - H1 de página: `20px, weight 700`

### Filosofia visual
- Interface **densa mas respirável** — padding compacto como Notion/Linear, não espaçoso como marketing site
- Bordas `1px solid var(--color-lt-border)` em todos os containers
- Sem sombras pesadas — apenas `box-shadow: 0 1px 3px rgba(0,0,0,0.08)` em cards
- Accent laranja **somente** em: status ativo, botão primário, indicadores de foco, badge de notificação
- Modo dark: suporte futuro via classe `.dark` (mesmos tokens dk do site)

---

## 5. Arquitetura de Módulos

### 5.1 Mapa de Rotas

```
/                   → redirect → /pipeline
/login              → autenticação Supabase
/pipeline           → visão kanban/lista do funil de vendas
/leads              → tabela principal de leads (modo planilha)
/leads/[id]         → perfil detalhado do lead
/calls              → log de ligações + gravações
/agenda             → integração Google Agenda (visão do dia/semana)
/metricas           → dashboard de KPIs e simulador
/propostas          → criação de documentos via n8n/template
/configuracoes      → webhooks, integrações, perfil
```

### 5.2 Módulos

#### M1 — Leads (Tabela Planilha)
Tela central. Lista todos os leads com colunas editáveis inline, navegação por teclado (Tab, Shift+Tab, setas), similar ao Google Sheets.

**Colunas padrão:**
| Campo | Tipo | Notas |
|---|---|---|
| `empresa` | texto | Nome da empresa |
| `categoria` | select | ex: imobiliária, advocacia |
| `telefone` | texto | Armazenado normalizado: `+55XXXXXXXXXXX` |
| `telefone_display` | computed | Exibição formatada: `(11) 9xxxx-xxxx` |
| `decisor` | texto | Nome do dono/decisor |
| `status` | select | Novo → Contactado → R1 → Diagnóstico → R2 → Fechado → Perdido |
| `origem` | select | Google Maps, indicação, manual |
| `lista` | select/tag | Agrupamento de campanhas (ex: "SP Imob Jan") |
| `observacoes` | texto longo | Última observação (resumo) |
| `ultimo_contato` | datetime | Atualizado automaticamente |
| `proximo_follow` | date | Data do próximo follow-up |
| `criado_em` | datetime | Auto |

**Comportamentos críticos:**
- **Clique no telefone → copia para clipboard** (toast de confirmação)
- **Normalização automática de telefone:** qualquer formato digitado é convertido para `+55XXXXXXXXXXX` via função utilitária
- **Navegação por teclado:** Enter para editar célula, Tab para próxima, seta para linha adjacente, Escape para cancelar
- **Salvamento otimista:** cada edição salva no Supabase sem precisar clicar em "Salvar"
- **Import CSV:** drag-and-drop de arquivo CSV (exportado do scraper do Google Maps)
- **Export CSV:** botão de exportação com filtros aplicados
- **Troca de lista:** dropdown no topo para alternar entre campanhas/listas de prospecção

#### M2 — Histórico de Interações (por lead)
Em `/leads/[id]`, timeline cronológica de todas as interações com o lead.

**Tipos de interação:**
- `CALL` — ligação (com ou sem gravação)
- `NOTE` — anotação livre
- `STATUS_CHANGE` — mudança de status
- `MEETING` — reunião (R1 ou R2)
- `DOC_SENT` — documento/diagnóstico enviado
- `WHATSAPP` — mensagem enviada via API

**Adição rápida de nota (durante call):**
- Atalho `N` abre modal flutuante de anotação sem sair da tela atual
- Campo de texto com autofocus, salva com `Ctrl+Enter`
- Timestamp automático

#### M3 — Log de Ligações + Gravação de Áudio
Tela `/calls` e integrada no perfil do lead.

**Fluxo de gravação:**
1. Usuário clica "Iniciar gravação" (Web Audio API, microfone do notebook)
2. Áudio gravado em memória (`.webm` ou `.ogg`)
3. Ao finalizar: upload automático para Supabase Storage (`bucket: calls/`)
4. Trigger n8n via webhook: envia áudio para transcrição (Whisper API ou serviço escolhido)
5. Transcrição retorna via webhook e é salva na interação correspondente

**Log de chamadas:**
- Data/hora automática
- Duração da gravação
- Status do call: atendeu / não atendeu / ocupado / caixa postal / agendou R1
- Campo de observação rápida

#### M4 — Pipeline Kanban
`/pipeline` — visão visual do funil com cards de lead por coluna de status.

**Colunas:** Novo → Contactado → R1 → Diagnóstico → R2 → Fechado

Cada card mostra: empresa, telefone (clicável para copiar), último contato, próximo follow-up.

Drag-and-drop entre colunas (atualiza `status` no Supabase).

#### M5 — Agenda (Google Calendar)
`/agenda` — embed ou integração via Google Calendar API.

- Visão de hoje e próximos 7 dias
- Filtra apenas eventos com tag/palavra-chave de reunião (configurável)
- Link para Google Calendar ao clicar no evento
- Sidebar com lista de leads que têm `proximo_follow` = hoje

#### M6 — Propostas / Documentos
`/propostas` — criação de documento de diagnóstico/proposta para entregar após R1.

**Fluxo:**
1. Kevin seleciona um lead
2. Preenche campos do template (dores identificadas, solução proposta, investimento)
3. Sistema gera PDF via: n8n workflow (template Docx → PDF) ou biblioteca `pdf-lib`/`react-pdf`
4. PDF salvo no Supabase Storage e link registrado na timeline do lead
5. Status do lead atualizado para "Diagnóstico enviado"

**Template inicial:** simples, com logo Orakulo, campos de texto e tabela de investimento.

#### M7 — Métricas + Simulador
`/metricas` — dashboard de KPIs operacionais.

**KPIs exibidos:**
| Métrica | Descrição |
|---|---|
| Ligações hoje / semana / mês | Total de calls registrados |
| Taxa de atendimento | % calls atendidos / total |
| Taxa de conversão R1 | % leads que chegaram em R1 |
| Taxa de fechamento | % R1 → fechado |
| Disparos WhatsApp | Recebido do n8n via webhook |
| Receita do mês | Soma de fechamentos (valor manual no lead) |

**Simulador de meta:**
- Input: "Quantas vendas quero fazer no mês?"
- Sistema calcula: quantas R2 preciso → quantas R1 → quantos contactados → quantas ligações necessárias
- Baseado nas taxas reais históricas dos últimos 30 dias

**Gráficos:** Recharts — linha de ligações por dia, barra de conversão por etapa do funil.

---

## 6. Banco de Dados (Supabase — PostgreSQL)

### Tabelas principais

```sql
-- Leads
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa TEXT NOT NULL,
  categoria TEXT,
  telefone TEXT,              -- sempre +55XXXXXXXXXXX
  decisor TEXT,
  status TEXT DEFAULT 'novo', -- novo|contactado|r1|diagnostico|r2|fechado|perdido
  origem TEXT DEFAULT 'manual',
  lista_id UUID REFERENCES listas(id),
  observacoes TEXT,
  ultimo_contato TIMESTAMPTZ,
  proximo_follow DATE,
  valor_contrato NUMERIC,     -- preenchido quando fechado
  criado_em TIMESTAMPTZ DEFAULT now(),
  atualizado_em TIMESTAMPTZ DEFAULT now()
);

-- Listas de prospecção (campanhas)
CREATE TABLE listas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,         -- ex: "SP Imob Jan/26"
  descricao TEXT,
  ativa BOOLEAN DEFAULT true,
  criado_em TIMESTAMPTZ DEFAULT now()
);

-- Interações (timeline de cada lead)
CREATE TABLE interacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL,         -- call|note|status_change|meeting|doc_sent|whatsapp
  conteudo TEXT,              -- observação/descrição
  audio_url TEXT,             -- Supabase Storage URL
  transcricao TEXT,           -- retorno do Whisper
  duracao_segundos INTEGER,   -- duração do áudio
  status_call TEXT,           -- atendeu|nao_atendeu|ocupado|caixa_postal|agendou
  criado_em TIMESTAMPTZ DEFAULT now()
);

-- Propostas/Documentos
CREATE TABLE propostas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id),
  pdf_url TEXT,
  conteudo_json JSONB,        -- campos preenchidos no template
  enviado BOOLEAN DEFAULT false,
  criado_em TIMESTAMPTZ DEFAULT now()
);

-- Métricas WhatsApp (recebidas do n8n via webhook)
CREATE TABLE metricas_whatsapp (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  disparos INTEGER DEFAULT 0,
  respostas INTEGER DEFAULT 0,
  data DATE DEFAULT CURRENT_DATE,
  payload_raw JSONB
);
```

### Supabase Storage Buckets
| Bucket | Conteúdo |
|---|---|
| `calls` | Gravações de ligações (`.webm`) |
| `reunioes` | Gravações de reuniões (upload manual) |
| `propostas` | PDFs gerados |

---

## 7. Integrações

### 7.1 n8n Webhooks
O CRM expõe e consome webhooks do n8n via API Routes do Next.js.

| Direção | Endpoint | Função |
|---|---|---|
| CRM → n8n | `POST /api/webhooks/n8n/call-audio` | Envia áudio para transcrição |
| CRM → n8n | `POST /api/webhooks/n8n/status-change` | Notifica mudança de status do lead |
| n8n → CRM | `POST /api/webhooks/inbound/transcricao` | Recebe transcrição do áudio |
| n8n → CRM | `POST /api/webhooks/inbound/whatsapp-stats` | Recebe métricas de disparo |
| n8n → CRM | `POST /api/webhooks/inbound/lead-create` | Cria lead a partir de scraping externo |

### 7.2 Google Calendar API
- OAuth2 com conta Google do Kevin (token salvo no Supabase ou `.env.local`)
- Leitura de eventos dos próximos 7 dias
- Sem escrita (readonly)

### 7.3 Normalização de Telefone
Função utilitária `lib/phone.ts`:
```ts
// Aceita: "11 99999-9999", "(11)999999999", "5511999999999", "11999999999"
// Retorna sempre: "+5511999999999"
export function normalizePhone(input: string): string
export function formatPhone(normalized: string): string // "(11) 99999-9999"
```

---

## 8. Funcionalidades de UX Críticas

### Navegação por teclado na tabela
- `Tab` / `Shift+Tab` — move entre células editáveis
- `↑` `↓` — move entre linhas (mesma coluna)
- `Enter` — entra em modo edição da célula
- `Escape` — cancela edição
- `Ctrl+Enter` — confirma edição e desce para próxima linha
- `N` (global) — abre modal de nova nota para lead selecionado
- `C` (global) — abre modal de registro de call

### Clique no telefone
- Click simples → copia `+5511999999999` para clipboard
- Toast: "Número copiado!"
- Ícone de cópia aparece no hover

### Salvamento otimista
- Toda edição inline salva imediatamente (debounce 500ms)
- Indicador sutil de "salvando..." na linha editada
- Rollback visual em caso de erro

### Import de lista
- Drag-and-drop ou clique para upload de CSV
- Preview das primeiras 5 linhas para mapeamento de colunas
- Normalização automática de telefones no import
- Duplicata detectada por telefone: alerta antes de importar

---

## 9. Estrutura de Pastas do Projeto

```
orakulo-crm/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   └── login/page.tsx
│   │   ├── (app)/
│   │   │   ├── layout.tsx          # sidebar + nav principal
│   │   │   ├── pipeline/page.tsx
│   │   │   ├── leads/
│   │   │   │   ├── page.tsx        # tabela principal
│   │   │   │   └── [id]/page.tsx   # perfil do lead
│   │   │   ├── calls/page.tsx
│   │   │   ├── agenda/page.tsx
│   │   │   ├── metricas/page.tsx
│   │   │   ├── propostas/page.tsx
│   │   │   └── configuracoes/page.tsx
│   │   ├── api/
│   │   │   └── webhooks/
│   │   │       ├── inbound/
│   │   │       │   ├── transcricao/route.ts
│   │   │       │   ├── whatsapp-stats/route.ts
│   │   │       │   └── lead-create/route.ts
│   │   │       └── n8n/
│   │   │           ├── call-audio/route.ts
│   │   │           └── status-change/route.ts
│   │   └── globals.css             # tokens IDV Orakulo
│   ├── components/
│   │   ├── ui/                     # Shadcn components
│   │   ├── leads/
│   │   │   ├── LeadsTable.tsx      # TanStack Table, edição inline
│   │   │   ├── LeadRow.tsx
│   │   │   ├── LeadProfile.tsx
│   │   │   ├── InteractionTimeline.tsx
│   │   │   └── ImportModal.tsx
│   │   ├── calls/
│   │   │   ├── AudioRecorder.tsx   # Web Audio API
│   │   │   └── CallLogForm.tsx
│   │   ├── pipeline/
│   │   │   └── KanbanBoard.tsx
│   │   ├── metricas/
│   │   │   ├── KPICard.tsx
│   │   │   ├── FunnelChart.tsx
│   │   │   └── Simulator.tsx
│   │   ├── propostas/
│   │   │   └── PropostaEditor.tsx
│   │   └── layout/
│   │       ├── Sidebar.tsx
│   │       └── TopBar.tsx
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts           # browser client
│   │   │   └── server.ts           # server client (API routes)
│   │   ├── phone.ts                # normalizePhone, formatPhone
│   │   ├── calendar.ts             # Google Calendar OAuth2
│   │   └── utils.ts
│   ├── hooks/
│   │   ├── useLeads.ts
│   │   ├── useInteractions.ts
│   │   └── useAudioRecorder.ts
│   └── types/
│       └── index.ts                # Lead, Interaction, Lista, Proposta...
├── .env.local                      # SUPABASE_URL, SUPABASE_ANON_KEY, GOOGLE_CLIENT_ID...
├── next.config.ts
├── tailwind.config.ts
└── package.json
```

---

## 10. Roadmap de Sprints (localhost first)

### Sprint 1 — Fundação (Semana 1)
- [ ] Setup Next.js 15 + Supabase + Tailwind + Shadcn
- [ ] Migrações SQL (leads, listas, interações)
- [ ] Auth básico (login com email/senha via Supabase)
- [ ] Layout: sidebar + rotas principais

### Sprint 2 — Core: Tabela de Leads (Semana 2)
- [ ] LeadsTable com TanStack Table
- [ ] Edição inline por teclado
- [ ] Normalização de telefone + clique para copiar
- [ ] Import CSV
- [ ] Troca de lista/campanha

### Sprint 3 — Interações e Calls (Semana 3)
- [ ] Timeline de interações por lead
- [ ] Modal de nota rápida (atalho `N`)
- [ ] Log de chamada com status
- [ ] Gravação de áudio (Web Audio API)
- [ ] Upload para Supabase Storage

### Sprint 4 — Pipeline + Agenda (Semana 4)
- [ ] Kanban com drag-and-drop
- [ ] Integração Google Calendar (readonly)
- [ ] Sidebar de follow-ups do dia

### Sprint 5 — Métricas + Webhooks n8n (Semana 5)
- [ ] Dashboard de KPIs
- [ ] Simulador de meta
- [ ] Endpoints de webhook (inbound/outbound)
- [ ] Recepção de transcrições

### Sprint 6 — Propostas + PWA (Semana 6)
- [ ] Editor de proposta com template
- [ ] Geração de PDF
- [ ] Configuração PWA (instala no celular)

### Futuro (pós-estabilização)
- [ ] Deploy em `orakulo.dev/crm` via NGINX proxy
- [ ] Gravação de reuniões (upload manual + transcrição)
- [ ] Templates de contrato
- [ ] Dark mode

---

## 11. Variáveis de Ambiente (.env.local)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Google Calendar
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback

# n8n
N8N_WEBHOOK_BASE_URL=
N8N_WEBHOOK_SECRET=

# OpenAI (Whisper — opcional, pode usar n8n como intermediário)
OPENAI_API_KEY=

# App
NEXTAUTH_SECRET=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 12. Decisões Técnicas Registradas

| Decisão | Escolha | Motivo |
|---|---|---|
| SSR vs SSG | SSR (Next.js padrão) | CRM tem dados dinâmicos, auth, API routes |
| Auth | Supabase Auth | Já usa Supabase, usuário único, zero overhead |
| Tabela | TanStack Table | Melhor suporte a edição inline e keyboard nav |
| Áudio | Web Audio API nativa | Sem deps externas para gravação |
| Transcrição | Whisper via n8n | Kevin já tem n8n, evita chamada direta do frontend |
| PDF | n8n workflow (Docx template) | Kevin tem n8n com templates rodando |
| Deploy inicial | localhost | Sem burocracia de infra na fase de construção |
| Deploy final | `orakulo.dev/crm` via NGINX proxy | Mesmo domínio, concentra SEO e credibilidade |
| Fonte | Geist | Identidade consistente com orakulo-site |
| Normalização telefone | Função própria `lib/phone.ts` | Controle total, sem dep externa |

---

*Documento gerado em sessão de brainstorming em 2026-04-17. Pronto para implementação em novo projeto `orakulo-crm`.*
