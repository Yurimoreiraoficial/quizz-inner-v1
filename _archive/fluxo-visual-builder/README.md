# Fluxo Visual Builder (Legacy Archive)

Este diretório contém uma cópia integral da estrutura técnica da interface de **Fluxo Visual** (Unified Funnel Editor) antes da sua simplificação/remoção planejada em Maio de 2026.

## 🎯 Objetivo Original
A tela de Fluxo Visual foi projetada para ser a central operacional definitiva do funil, unificando:
- **Visualização Estrutural**: Mapa mental interativo do funil (Canvas).
- **Métricas em Tempo Real**: Performance exibida diretamente nos cards (Views, Conversão, Status).
- **Preview de Alta Fidelidade**: Mockup mobile com renderização pixel-perfect e escala dinâmica.
- **Configuração Técnica**: Centralização de Pixels, UTMs e gatilhos de eventos Meta Ads.
- **Gestão de Saídas**: Configuração de links e eventos para WhatsApp e Checkout.

---

## 📂 Arquitetura Arquivada

### 1. Componentes (`components/`)
- **`unified-editor/FunnelFlowCanvas.tsx`**: O coração da interface. Implementa o canvas com zoom, pan, renderização de nós (StepNodes, ABBranch, ExitNodes) e lógica de conectores.
- **`unified-editor/SelectedStepEditorPanel.tsx`**: Painel lateral que renderiza o preview mobile. Contém a lógica de `dynamicScale` para ajustar o mockup à viewport.
- **`unified-editor/StartNodeEditorPanel.tsx`**: Editor do bloco "Início", gerencia Pixels, UTMs globais e diagnóstico técnico.
- **`unified-editor/ExitNodeEditorPanel.tsx`**: Editor das saídas de conversão (WhatsApp, Checkout).
- **`LivePreview.tsx`**: Wrapper de iframe que conecta o editor à versão pública do funil via `postMessage`.

### 2. Páginas (`pages/`)
- **`UnifiedFunnelEditorPage.tsx`**: Container principal que gerencia o estado de seleção (`FlowSelection`) e o carregamento inicial de Analytics e Testes A/B.

### 3. Lógica e Serviços (`services/` & `data/`)
- **`analyticsService.ts`**: Leitura de métricas granulares por etapa.
- **`abService.ts`**: Lógica de experimentos, variações e cálculo de vencedores.
- **`funnelService.ts`**: Persistência de dados no Supabase (tabela `funnels`).
- **`store.ts`**: Persistência local (LocalStorage) e sincronização de estado.
- **`flowBuilderTypes.ts`**: Definições de tipos para o grafo do fluxo.

---

## 🛠 Como Reativar no Futuro

1. **Restaurar Arquivos**: Mova os arquivos desta pasta de volta para as pastas originais em `src/`.
2. **Rotas**: Reative ou aponte a rota no `App.tsx` para o `UnifiedFunnelEditorPage`.
   - Rota original: `/admin/funis/atual/fluxo`
3. **Navegação**: Adicione novamente o link no `Sidebar` ou `AdminLayout`.
4. **Dependências**: Certifique-se de que `lucide-react`, `framer-motion` e `@tanstack/react-query` continuem instalados.

---

## 📊 Dados e Integrações
- **Supabase**: A página consome a tabela `funnels` para links globais e configuração de pixel.
- **Edge Functions / Analytics**: Utiliza o serviço de analytics para preencher as métricas nos cards.
- **Meta Pixel**: Integrado via `metaPixelService.ts` para disparos de eventos de visualização e resposta.

## 📝 Observações Importantes
- **Preview Mobile**: Utiliza um iframe com `?preview=1`. O parâmetro `preview=1` desativa o tracking de produção dentro do funil para não sujar os dados de analytics durante a edição.
- **Fidelidade Visual**: O conteúdo do celular acredita que tem 390px de largura. Qualquer alteração no layout do funil reflete instantaneamente aqui.
- **Zoom/Pan**: O canvas usa um sistema de coordenadas relativas baseado em CSS `transform: scale()` e `translate()`.

---
*Arquivado por: Antigravity AI*  
*Data: 09 de Maio de 2026*
