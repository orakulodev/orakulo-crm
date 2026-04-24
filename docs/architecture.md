# Orakulo CRM — Architecture

**Versão:** 1.0 | **Data:** 2026-04-17

---

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 15 (App Router, SSR) |
| Linguagem | TypeScript 5 |
| Estilo | Tailwind CSS v4 + tokens IDV Orakulo |
| Componentes | Shadcn UI |
| Tabela | TanStack Table v8 |
| Dados assíncronos | TanStack Query v5 |
| Formulários | React Hook Form + Zod |
| Banco | Supabase (PostgreSQL + Storage) |
| Auth | Supabase Auth (email/senha, usuário único) |
| Métricas | Recharts |
| PWA | next-pwa |
| Áudio | Web Audio API + Supabase Storage |
| Transcrição | Whisper API via n8n workflow |

**Por que SSR (não SSG):** CRM tem autenticação, dados dinâmicos, API routes para webhooks e upload de áudio.

---

## Estrutura de Pastas

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
│       └── index.ts                # Lead, Interaction, Lista, Proposta
├── .env.local
├── .env.local.example
├── next.config.ts
├── tailwind.config.ts
└── package.json
```

---

## Banco de Dados (Supabase — PostgreSQL)

```sql
-- Listas de prospecção (campanhas)
CREATE TABLE listas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  descricao TEXT,
  ativa BOOLEAN DEFAULT true,
  criado_em TIMESTAMPTZ DEFAULT now()
);

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
  valor_contrato NUMERIC,
  criado_em TIMESTAMPTZ DEFAULT now(),
  atualizado_em TIMESTAMPTZ DEFAULT now()
);

-- Interações (timeline de cada lead)
CREATE TABLE interacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL,         -- call|note|status_change|meeting|doc_sent|whatsapp
  conteudo TEXT,
  audio_url TEXT,
  transcricao TEXT,
  duracao_segundos INTEGER,
  status_call TEXT,           -- atendeu|nao_atendeu|ocupado|caixa_postal|agendou
  criado_em TIMESTAMPTZ DEFAULT now()
);

-- Propostas
CREATE TABLE propostas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id),
  pdf_url TEXT,
  conteudo_json JSONB,
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

## Integrações

### Rotas Webhook (Next.js API Routes)

| Direção | Endpoint | Função |
|---|---|---|
| CRM → n8n | `POST /api/webhooks/n8n/call-audio` | Envia áudio para transcrição |
| CRM → n8n | `POST /api/webhooks/n8n/status-change` | Notifica mudança de status |
| n8n → CRM | `POST /api/webhooks/inbound/transcricao` | Recebe transcrição do áudio |
| n8n → CRM | `POST /api/webhooks/inbound/whatsapp-stats` | Recebe métricas de disparo |
| n8n → CRM | `POST /api/webhooks/inbound/lead-create` | Cria lead via scraping |

### Google Calendar API
- OAuth2, conta Google do Kevin
- Token salvo no `.env.local`
- Readonly — sem escrita

### Normalização de Telefone (`lib/phone.ts`)
```ts
// Aceita: "11 99999-9999", "(11)999999999", "5511999999999"
// Retorna: "+5511999999999"
export function normalizePhone(input: string): string
export function formatPhone(normalized: string): string // "(11) 99999-9999"
```

---

## Variáveis de Ambiente (.env.local)

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

# OpenAI (Whisper)
OPENAI_API_KEY=

# App
NEXTAUTH_SECRET=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Decisões Técnicas Registradas

| Decisão | Escolha | Motivo |
|---|---|---|
| SSR vs SSG | SSR | CRM tem dados dinâmicos, auth, API routes |
| Auth | Supabase Auth | Já usa Supabase, usuário único, zero overhead |
| Tabela | TanStack Table | Melhor suporte a edição inline e keyboard nav |
| Áudio | Web Audio API | Sem deps externas |
| Transcrição | Whisper via n8n | Kevin já tem n8n com templates |
| PDF | n8n workflow (Docx template) | Kevin tem n8n rodando |
| Deploy inicial | localhost | Sem burocracia de infra |
| Deploy final | `orakulo.dev/crm` via NGINX | Mesmo domínio |
| Fonte | Geist | Identidade consistente com orakulo-site |
| Normalização telefone | `lib/phone.ts` própria | Controle total, sem dep externa |

---

## Rotas

```
/                   → redirect → /pipeline
/login              → autenticação Supabase
/pipeline           → kanban do funil
/leads              → tabela principal (modo planilha)
/leads/[id]         → perfil detalhado do lead
/calls              → log de ligações + gravações
/agenda             → Google Agenda (visão do dia/semana)
/metricas           → dashboard KPIs + simulador
/propostas          → criação de documentos/PDF
/configuracoes      → webhooks, integrações, perfil
```
