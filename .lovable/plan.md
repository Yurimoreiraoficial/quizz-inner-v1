# Adicionar aliases `/stepN` redirecionando para os slugs do funil

O dropdown de rotas do editor Lovable lista entradas genéricas `/step1`, `/step2`, … que não existem no app e por isso caem em 404. Para que esses atalhos funcionem, vou registrar em `src/App.tsx` rotas-alias que redirecionam para o slug correspondente em português, gerando o mapeamento direto a partir de `funnelSteps` (sem duplicar listas).

## Mapeamento

```
/step1  → /intro            /dark/step1  → /dark/intro
/step2  → /uso-ia           /dark/step2  → /dark/uso-ia
/step3  → /ias              /dark/step3  → /dark/ias
/step4  → /mercado          /dark/step4  → /dark/mercado
/step5  → /ajuda            /dark/step5  → /dark/ajuda
/step6  → /tarefas          /dark/step6  → /dark/tarefas
/step7  → /prova-social     /dark/step7  → /dark/prova-social
/step8  → /dores            /dark/step8  → /dark/dores
/step9  → /analisando       /dark/step9  → /dark/analisando
/step10 → /contato          /dark/step10 → /dark/contato
/step11 → /resultado        /dark/step11 → /dark/resultado
```

A ordem segue exatamente `funnelSteps`, então qualquer reordenação futura continua refletindo automaticamente nos aliases.

## Alterações

**`src/App.tsx`** — adicionar, junto às rotas existentes, um bloco gerado por `funnelSteps.map((step, i) => ...)` que cria:

- `<Route path="/step{i+1}" element={<Navigate to="/{step.path}" replace />} />`
- `<Route path="/dark/step{i+1}" element={<Navigate to="/dark/{step.path}" replace />} />`

Os redirects usam `replace` para não poluir o histórico do navegador.

Nada mais muda: rotas reais, `FunnelProvider`, `NotFound` e o restante do funil ficam intactos.

## Fora do escopo

- Não vou alterar o dropdown do editor Lovable (ele é parte da UI do Lovable, não do projeto).
- Não vou renomear os slugs em português nem mudar a lógica do funil.
