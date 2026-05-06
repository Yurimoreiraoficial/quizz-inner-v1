# Dividir cada tela do funil em uma página (rota) própria

Hoje todo o funil roda em `/` (e `/dark`) renderizando condicionalmente cada etapa via `step.id` dentro de `src/pages/Index.tsx`. Vou transformar cada etapa em uma rota dedicada (ex.: `/intro`, `/uso-ia`, `/mercado`, `/tarefas`, `/dores`, `/lead`, `/final`, etc.), mantendo o estado do funil compartilhado entre elas.

## O que muda para o usuário

- Cada tela passa a ter URL própria (permite voltar pelo navegador, compartilhar link, medir página por página em analytics).
- A navegação "Avançar/Voltar" do funil passa a usar o React Router (push/replace de rota) em vez de só mudar índice em memória.
- Versão `/dark` ganha rotas equivalentes com prefixo `/dark/...` (ex.: `/dark/intro`, `/dark/uso-ia`).
- Comportamento visual, animações e tracking permanecem iguais.

## Mapa de rotas proposto

```
/                    -> redireciona para /intro
/intro
/uso-ia
/insert-50ias
/mercado
/insert-help
/tarefas
/insert-proof
/dores
/loading
/lead
/final

/dark                -> redireciona para /dark/intro
/dark/intro
/dark/uso-ia
... (mesmas etapas, tema dark)
```

A ordem continua definida em `src/data/funnelSteps.ts` (adicionando o `path` de cada etapa), então reordenar etapas continua sendo um único ponto de edição.

## Como o estado é preservado

O estado do funil (respostas, sessionId, UTMs, lead, fit calculado) precisa sobreviver à troca de rota. Será movido para um **Context Provider** (`FunnelProvider`) montado acima das rotas, envolvendo o `useFunnelState` atual. Cada página consome via `useFunnel()`.

Para evitar perda de estado em refresh direto numa rota intermediária (ex.: usuário recarrega `/dores`), o estado será persistido em `sessionStorage` e reidratado no mount do provider. Se o usuário cair numa etapa sem ter as anteriores respondidas, ele é redirecionado para `/intro`.

## Detalhes técnicos

**Arquivos novos:**

- `src/context/FunnelContext.tsx` — Provider que expõe o controller atual de `useFunnelState` + persistência em `sessionStorage`.
- `src/components/FunnelRouteLayout.tsx` — wrapper que aplica `FunnelLayout` (header, progress, footer, animação) baseado no step atual derivado da rota.
- `src/pages/steps/` — uma página por etapa: `IntroPage.tsx`, `UsoIAPage.tsx`, `Insert50IAsPage.tsx`, `MercadoPage.tsx`, `InsertHelpPage.tsx`, `TarefasPage.tsx`, `InsertProofPage.tsx`, `DoresPage.tsx`, `LoadingPage.tsx`, `LeadPage.tsx`, `FinalPage.tsx`. Cada uma contém apenas o JSX que hoje vive dentro do bloco `step.id === "..."` correspondente em `Index.tsx`.
- `src/routes/funnelRoutes.tsx` — define a árvore de rotas (light e dark) a partir de `funnelSteps`.

**Arquivos alterados:**

- `src/data/funnelSteps.ts` — adicionar campo `path` em cada step.
- `src/hooks/useFunnelState.ts` — `goNext`/`goBack`/`goToIndex` passam a navegar via `useNavigate()` para o `path` da próxima/anterior etapa (em vez de só atualizar `currentStepIndex`). O índice atual é derivado da rota.
- `src/App.tsx` — substitui as rotas `/` e `/dark` por `<FunnelProvider>` envolvendo as rotas geradas em `funnelRoutes.tsx`. `/` redireciona para `/intro`; `/dark` redireciona para `/dark/intro`.
- `src/pages/Index.tsx` — removido (ou reduzido a um redirect para `/intro`) após migração.
- `src/pages/IndexDark.tsx` — vira um layout que aplica a classe `dark` no `<html>` e renderiza `<Outlet />` para as rotas filhas `/dark/*`.

**Tracking:** os eventos `step_viewed`, `option_selected`, etc. continuam disparando dos mesmos pontos (Provider/handlers), então nada muda no `funnelTrackingService`.

**Guardas de rota:** um pequeno hook `useStepGuard()` verifica pré-requisitos mínimos (ex.: `/mercado` exige `usoIA` definido); se faltar, redireciona para `/intro`. Isso evita estados inconsistentes em refresh ou link direto.

## Fora do escopo

- Não vou alterar conteúdo, copy, estilos ou lógica de negócio de nenhuma etapa.
- Não vou trocar `BrowserRouter` por outro router nem adicionar SSR.
- A versão `/dark` continua reutilizando os mesmos componentes de etapa — só muda o wrapper que ativa o tema.

## Pergunta rápida

Confirma os caminhos das URLs sugeridos acima? Se preferir outros nomes (ex.: `/1-intro`, `/quiz/intro`, ou nomes em inglês), me diga antes de eu implementar.   
Resposta: Use nomes das URLs em português.