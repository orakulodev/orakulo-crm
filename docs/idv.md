# Orakulo CRM — Identidade Visual (IDV)

**Versão:** 1.0 | **Data:** 2026-04-17

---

## Filosofia Visual

Interface **densa mas respirável** — padding compacto como Notion/Linear, não espaçoso como marketing site. Accent laranja **somente** em: status ativo, botão primário, indicadores de foco, badge de notificação.

---

## Tokens CSS (`src/app/globals.css`)

```css
:root {
  /* Fundo e superfícies */
  --color-lt-page-bg: #f9f4f2;
  --color-lt-surface: #ffffff;
  --color-lt-surface-fade: #f0ece8;  /* hover de linha, zebra */

  /* Bordas */
  --color-lt-border: #e2ddd8;

  /* Textos */
  --color-lt-text-bright: #1a1a1a;  /* títulos */
  --color-lt-text-base: #3d3d3d;    /* texto corpo */
  --color-lt-text-muted: #777777;   /* labels, placeholders */

  /* Primário — laranja Orakulo */
  --color-primary: #ff7800;
  --color-primary-hover: #e06900;

  /* Status de pipeline */
  --color-status-new: #e8f4ff;
  --color-status-contacted: #fff8e1;
  --color-status-r1: #fff3e0;
  --color-status-diagnosed: #f3e5f5;
  --color-status-r2: #e8f5e9;
  --color-status-closed: #e0f2f1;
  --color-status-lost: #fce4ec;
}
```

---

## Tipografia

**Fonte principal:** `Geist` (mesma do orakulo-site). Fallback: `-apple-system, sans-serif`

**Fonte numérica:** `font-variant-numeric: tabular-nums` — alinhamento de colunas na tabela

**Hierarquia:**

| Elemento | Tamanho | Weight | Cor |
|---|---|---|---|
| Labels / eyebrows | 11px | 600 | muted (`#777`) |
| Corpo de tabela | 13px | 400 | base (`#3d3d3d`) |
| Títulos de seção | 15px | 600 | bright (`#1a1a1a`) |
| H1 de página | 20px | 700 | bright (`#1a1a1a`) |

---

## Regras Visuais

- Bordas: `1px solid var(--color-lt-border)` em todos os containers
- Sombra máxima: `box-shadow: 0 1px 3px rgba(0,0,0,0.08)` — sem sombras pesadas
- Accent laranja **somente** em: botão primário, indicador de célula em edição, badge de notificação, status ativo
- Modo dark: suporte futuro via classe `.dark` (tokens `dk` já existem no orakulo-site)

---

## Mapeamento de Status → Cor

| Status | Token | Hex |
|---|---|---|
| Novo | `--color-status-new` | `#e8f4ff` |
| Contactado | `--color-status-contacted` | `#fff8e1` |
| R1 agendada | `--color-status-r1` | `#fff3e0` |
| Diagnóstico | `--color-status-diagnosed` | `#f3e5f5` |
| R2 agendada | `--color-status-r2` | `#e8f5e9` |
| Fechado | `--color-status-closed` | `#e0f2f1` |
| Perdido | `--color-status-lost` | `#fce4ec` |

---

## Componentes-chave de UI

### Tabela de Leads
- Linha com hover: `background: var(--color-lt-surface-fade)`
- Célula em edição: border `1px solid var(--color-primary)` + fundo branco
- Zebra striping: linhas pares com `--color-lt-surface-fade`
- Font size: 13px, tabular-nums para colunas numéricas

### Cards do Kanban
- Fundo: `var(--color-lt-surface)`
- Border-left: 3px da cor do status
- Border radius: 6px
- Sombra: `0 1px 3px rgba(0,0,0,0.08)`

### Sidebar
- Fundo: `var(--color-lt-surface)`
- Border-right: `1px solid var(--color-lt-border)`
- Item ativo: accent laranja no ícone + texto bold
- Width: 220px (fixo)

### Botão Primário
- Background: `var(--color-primary)` → hover `var(--color-primary-hover)`
- Texto: branco
- Border radius: 6px
- Height: 32px (compacto)

### Toast de confirmação
- Posição: bottom-right
- Texto: "Número copiado!" com ícone ✓
- Fundo escuro neutro, texto branco
- Duração: 2s
