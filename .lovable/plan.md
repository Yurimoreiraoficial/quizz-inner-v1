
# Inner AI — Funil Builder (MVP v1)

Objetivo: criar uma área administrativa interna para operar o funil atual (o quiz dark já publicado). Nada de marketplace, multi-workspace, permissões avançadas ou criação universal de funis. Foco em **configurar, testar, medir e publicar** o funil que já existe.

## Design system (base oficial deste MVP)

Adicionar um novo tema **"admin"** isolado do tema do funil público (que continua usando os tokens atuais em `index.css`).

- Tokens novos em `src/styles/admin.css` usando as variáveis pedidas (`--bg`, `--surface`, `--border`, `--text`, `--blue`, `--green`, `--yellow`, `--purple`, `--red-soft`, `--shadow`, `--radius`, etc.).
- Aplicados via classe wrapper `.admin-theme` no layout do builder, para não vazar nas rotas `/` e `/dark` do funil público.
- Tipografia: Inter, títulos com `letter-spacing: -0.02em`, secundários em `--muted`, labels uppercase quando fizer sentido.
- Componentes shadcn reaproveitados (Button, Card, Input, Table, Badge, Dropdown, Tabs, Dialog, Accordion) com variantes/classes específicas do tema admin.

## Estrutura de rotas

Novo prefixo `/admin` no `App.tsx`. As rotas atuais (`/`, `/dark`) ficam intactas.

```text
/admin                       → redireciona p/ /admin/funis
/admin/funis                 → lista do funil atual (1 item)
/admin/funis/atual           → overview do funil
/admin/funis/atual/editor    → editar telas existentes (config-driven)
/admin/funis/atual/fluxo     → fluxo visual (read-only nesta fase)
/admin/funis/atual/ab        → testes A/B simples
/admin/funis/atual/analytics → analytics do funil
/admin/funis/atual/links     → links e pixels (UTMs, checkout, WhatsApp, GTM/Meta)
/admin/funis/atual/diagnostico → diagnóstico técnico (eventos, pixels, integrações)
/admin/templates             → placeholder “em breve”
/admin/experimentos          → lista de A/Bs
/admin/analytics             → analytics global
/admin/configuracoes         → conta + branding mínimo
```

## Layout shell

`src/components/admin/AdminLayout.tsx`:

- **Sidebar 260px** fixa, fundo branco, borda direita sutil
  - Logo (quadrado escuro com “IA” + “Inner AI” + small “FUNIL BUILDER”)
  - Workspace: Funis, Templates, Experimentos, Analytics, Configurações
  - Seção contextual (visível dentro de `/admin/funis/atual/*`): Editor, Fluxo visual, Testes A/B, Analytics, Links e Pixels, Diagnóstico técnico
  - Bloco de ajuda no rodapé
- **Topbar 66px**: breadcrumbs à esquerda, ações contextuais à direita (Salvar rascunho / Preview / Publicar / Exportar CSV conforme rota), avatar + “Yuri Moreira” + caret
- **Content** padding 28–30px, fundo `--bg`, cards brancos com `--shadow` e `--radius`

Componentes auxiliares: `AdminSidebar`, `AdminTopbar`, `Breadcrumbs`, `PageHeader`, `StatCard`, `SectionCard`, `DataTable`, `StatusBadge`, `EmptyState`, `MobilePreviewFrame`.

## Telas do MVP

### 1. Funis — lista
Tabela com 1 linha (o funil atual): nome, status (badge), conversão últimas 24h, leads, ações (Abrir / Preview / Publicar). Banner explicando que nesta fase só existe o funil atual.

### 2. Funil atual — overview
Cards: status de publicação, leads (24h/7d/30d), conversão, próximos passos. Atalhos para Editor, A/B, Analytics, Links.

### 3. Editor
Lista as etapas reais lidas de `src/data/funnelSteps.ts`, `marketOptions.ts`, `taskOptionsByMarket.ts`, `finalPageContent.ts`. Para cada etapa permite:
- editar título/subtítulo/CTA
- reordenar opções
- ativar/desativar etapa

Persistência local (localStorage) nesta fase, com aviso “rascunho local — publicação plugada em fase posterior”. Coluna direita: **MobilePreviewFrame** dark renderizando a etapa.

### 4. Fluxo visual (read-only)
Diagrama vertical das etapas (cards conectados por linhas SVG). Sem drag-and-drop avançado (fora de escopo). Permite clicar para abrir a etapa no Editor.

### 5. Testes A/B
Lista de experimentos. Form para criar A/B simples sobre 1 elemento (texto do CTA, headline, etc.) com split 50/50 e meta (cliques no checkout). Estados: rascunho, rodando, finalizado, com badges.

### 6. Analytics do funil
- KPIs: visitantes, leads, taxa de conclusão, CTR para checkout
- Gráfico de funil por etapa (barras), gráfico de linha (últimos 14 dias)
- Tabela das etapas com drop-off
- Botão **Exportar CSV** (gera client-side a partir dos dados em memória; marcado como “exemplo” enquanto não houver backend)

### 7. Links e Pixels
- Checkout base URL + query params padrão
- WhatsApp base URL
- UTMs default
- Pixels: GTM ID, Meta Pixel ID, GA4 ID — campos com validação básica e estado “não configurado / configurado”
- Botão de teste “Disparar evento de teste”

### 8. Diagnóstico técnico
Checklist automatizado renderizado a partir de checagens locais: pixels presentes, UTMs propagando, checkout URL respondendo (HEAD via fetch best-effort), eventos disparando no console. Status verde/amarelo/vermelho com badges.

### 9. Analytics global / Configurações / Templates / Experimentos
Versões mínimas: Templates e Experimentos (global) já com **EmptyState** “em breve”. Configurações com nome do workspace, avatar, e bloco de marca (cores apenas leitura no MVP). Analytics global = mesmo dashboard agregando o único funil.

## Dados e persistência

Sem backend nesta fase. Toda configuração editada no admin vive em `localStorage` sob chaves `inner.admin.*`. Métricas são derivadas dos eventos já enviados por `funnelTrackingService` (mock/exemplo claramente sinalizado). Quando exibirmos números de exemplo, sempre o badge **“exemplo”** ao lado.

## Fora de escopo (explicitamente)
Marketplace de templates, múltiplos workspaces, permissões, upload de documento para gerar funis, criação universal de novos funis, drag-and-drop avançado, backend/Cloud.

## Plano de entrega (ordem)

1. Tokens admin + `AdminLayout` + Sidebar + Topbar + rotas e redirect
2. Tela Funis (lista) + overview do funil atual + EmptyStates globais
3. Editor de etapas (config-driven, localStorage) + MobilePreviewFrame
4. Links e Pixels + Diagnóstico técnico
5. Analytics do funil + Exportar CSV
6. Testes A/B (UI + persistência local) + Fluxo visual read-only
7. Configurações + Templates/Experimentos placeholders + polish

Cada passo entrega uma tela navegável e revisável antes do próximo.

## Detalhes técnicos

- Novo arquivo `src/styles/admin.css` importado em `src/main.tsx`. Escopo via `.admin-theme { ... tokens ... }` aplicado no `<div>` raiz do `AdminLayout`.
- `tailwind.config.ts`: adicionar cores `admin.*` (bg, surface, border, blue, green, yellow, purple, red, etc.) lendo `var(--admin-*)` para uso direto em classes Tailwind.
- Sidebar usa shadcn `Sidebar` apenas se ajudar; caso contrário componente próprio (mais simples para sidebar fixa de 260px).
- Tabelas usam shadcn `Table` com header `bg-[hsl(var(--admin-surface-2))]`.
- Badges via novo `StatusBadge` com variantes: `info | success | warning | experiment | neutral | danger`.
- Preview mobile reaproveita os componentes reais do funil dentro de uma moldura: importa `SingleChoiceStep`, `LeadCaptureStep`, etc., dentro de um wrapper com classe `dark` para forçar o tema escuro do funil público.
- Nenhuma alteração nos arquivos do funil público (`src/pages/Index.tsx`, `IndexDark.tsx`, componentes do funil) além de eventualmente expor pequenas props para reuso no preview, sem mudar comportamento.
- Sem dependências novas. Gráficos com `recharts` (já comum no shadcn) — se ainda não estiver no projeto, adiciono via `bun add recharts` no passo do Analytics.

