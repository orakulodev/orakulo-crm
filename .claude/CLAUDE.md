# orakulo-crm — Instruções para Claude

## Contexto do Projeto

CRM pessoal do Kevin Nunes (Orakulo) para gerenciar prospecção ativa (cold call + WhatsApp API), pipeline de vendas, follow-ups e métricas. Usuário único, sem multitenancy.

**Documentação completa:**
- [docs/prd.md](../docs/prd.md) — Requisitos de produto, módulos, UX crítica
- [docs/architecture.md](../docs/architecture.md) — Stack, estrutura de pastas, banco de dados, integrações
- [docs/idv.md](../docs/idv.md) — Identidade visual, tokens CSS, tipografia

## Stack (resumo rápido)

- **Framework:** Next.js 15, App Router, SSR
- **Linguagem:** TypeScript 5
- **Estilo:** Tailwind CSS v4 + tokens IDV Orakulo (ver `src/app/globals.css`)
- **Componentes:** Shadcn UI
- **Tabela:** TanStack Table v8 (edição inline, keyboard nav)
- **Dados:** TanStack Query v5 + Supabase (PostgreSQL)
- **Auth:** Supabase Auth (email/senha, usuário único)
- **Forms:** React Hook Form + Zod

## Regras de Desenvolvimento

### Nunca quebrar
- Normalização de telefone: sempre usar `lib/phone.ts` — formato final `+55XXXXXXXXXXX`
- Salvamento otimista com debounce 500ms em todas as edições inline
- Navegação por teclado na tabela (Tab, Shift+Tab, setas, Enter, Escape)

### Padrões de código
- Componentes Server por padrão; `'use client'` somente quando necessário (interatividade, hooks)
- API Routes em `src/app/api/` para webhooks — nunca expor service role key no client
- Variáveis de ambiente: `NEXT_PUBLIC_` apenas para o que o browser precisa

### Banco de dados
- Nunca usar `SELECT *` — sempre listar colunas
- Migrations via Supabase MCP (`mcp__claude_ai_Supabase__apply_migration`)
- Status do lead: `novo | contactado | r1 | diagnostico | r2 | fechado | perdido` (lowercase, sem acentos)

### Integrações
- n8n via webhooks (nunca direct API call do frontend)
- Google Calendar: readonly, OAuth2, token em `.env.local`
- Supabase Storage buckets: `calls`, `reunioes`, `propostas`

## Sprints Ativos

Sprint 1 ativo (semana de 2026-04-17):
- Setup Next.js 15 + Supabase + Tailwind + Shadcn
- Migrações SQL (leads, listas, interacoes)
- Auth básico (login email/senha)
- Layout: sidebar + rotas principais

## Comandos Úteis

```bash
# Dev
pnpm dev

# Type check
rtk tsc --noEmit

# Lint
rtk lint

# Build
rtk next build
```

## Variáveis de Ambiente necessárias

Ver `.env.local.example` na raiz. Nunca commitar `.env.local`.
