# Auditoria — Inner Funil Builder MVP

## Fonte de verdade
- `src/data/funnelConfig.ts` é a fonte canônica de telas, ordem, tipos, CTAs, eventos, pixels, regras e URLs do funil **Quiz Inner V1**.
- `src/data/funnelSteps.ts` apenas referencia ids/tipos para o runtime do funil público.
- `src/data/admin/store.ts` agora deriva todos os defaults de `funnelConfig` (sem labels duplicados). Continua usando `localStorage` como fallback temporário do MVP.

## Camada de serviços (`src/services/`)
| Serviço | Responsabilidade |
|---|---|
| `funnelService.ts` | `loadFunnel`, `loadScreens`, `saveScreen`, `saveLinks`, `loadAbTests`, `saveAbTest`, `getCurrentFunnelId` |
| `leadService.ts` | `saveLead` (Supabase, best-effort) |
| `analyticsService.ts` | `loadAnalytics` (sessões, leads, views por tela) |
| `funnelTrackingService.ts` | `trackEvent` (console + localStorage + Supabase `funnel_events`) |

Todos os serviços são best-effort: se Supabase falhar, retornam fallback baseado em `funnelConfig` para não quebrar a UI.

## Persistência
- Eventos do funil público são gravados automaticamente em `funnel_events` (via `trackEvent`).
- Leads são gravados em `funnel_leads` ao submeter `LeadCaptureStep` (via `useFunnelState.submitLead`).
- Edição de telas / links / A/B no admin: pronto para chamar `saveScreen`, `saveLinks`, `saveAbTest`. As páginas admin existentes seguem usando `localStorage` (fallback) e podem ser migradas individualmente sem refatoração estrutural.

## Fora de escopo nesta fase
- Criação de novos funis, upload de arquivo, marketplace de templates, builder universal, múltiplos workspaces, drag-and-drop avançado.
- Visual público (`/` e `/dark`) permanece inalterado.
