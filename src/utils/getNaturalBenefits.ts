// Transforma respostas em benefícios em linguagem natural
import { taskOptionsByMarket } from "@/data/taskOptionsByMarket";
import { painOptions } from "@/data/taskOptionsByMarket";
import type { FunnelState } from "@/types/funnel";

interface BenefitRule {
  match: (id: string, label: string) => boolean;
  benefit: string;
}

const taskRules: BenefitRule[] = [
  {
    match: (id, l) => /copy|posts|legendas|escrita|writing/i.test(id) || /copy|post|legenda|texto/i.test(l),
    benefit: "Criar textos, campanhas e ideias de conteúdo com mais velocidade e clareza.",
  },
  {
    match: (id, l) => /contracts|doc_analysis|longread|reports/i.test(id) || /document|contrato|pdf|relatóri/i.test(l),
    benefit: "Analisar documentos longos e transformar informações complexas em respostas mais claras.",
  },
  {
    match: (id, l) => /research/i.test(id) || /pesquisa/i.test(l),
    benefit: "Pesquisar, organizar e comparar informações com mais profundidade em menos tempo.",
  },
  {
    match: (id, l) => /code/i.test(id) || /códig|code/i.test(l),
    benefit: "Revisar, entender e melhorar códigos com apoio das principais IAs em uma única plataforma.",
  },
  {
    match: (id) => /imagens/i.test(id),
    benefit: "Criar imagens e peças visuais com apoio das melhores IAs do mercado.",
  },
  {
    match: (id) => /videos/i.test(id),
    benefit: "Acelerar a produção de roteiros e ideias para vídeos e conteúdo audiovisual.",
  },
  {
    match: (id, l) => /strategy|planning|planejamento|edu_planning|biz_strategy|mkt_strategy/i.test(id + l),
    benefit: "Planejar com mais profundidade — briefings, estratégias e tomada de decisão.",
  },
  {
    match: (id, l) => /creative_direction|design_briefs/i.test(id + l),
    benefit: "Organizar referências, conceitos e direção criativa em um fluxo mais ágil.",
  },
];

const painRules: BenefitRule[] = [
  {
    match: (id) => /tab_switching/.test(id),
    benefit: "Reduzir a troca constante entre ferramentas, centralizando várias IAs em um só lugar.",
  },
  {
    match: (id) => /doubt_tool/.test(id),
    benefit: "Usar a IA mais adequada para cada tipo de tarefa com menos tentativa e erro.",
  },
  {
    match: (id) => /rework/.test(id),
    benefit: "Chegar a respostas melhores com menos retrabalho na construção dos prompts.",
  },
  {
    match: (id) => /limits/.test(id),
    benefit: "Ter acesso a um conjunto mais amplo de IAs e recursos em uma única assinatura.",
  },
];

export function getNaturalBenefits(state: FunnelState): string[] {
  const benefits: string[] = [];

  if (state.mercado) {
    const tasks = taskOptionsByMarket[state.mercado];
    for (const t of tasks) {
      const v = state.tarefas[t.id];
      if (v === "Muito" || v === "Às vezes") {
        const rule = taskRules.find((r) => r.match(t.id, t.label));
        if (rule && !benefits.includes(rule.benefit)) benefits.push(rule.benefit);
      }
    }
  }

  for (const p of painOptions) {
    const v = state.dores[p.id];
    if (v === "Frequentemente" || v === "Às vezes") {
      const rule = painRules.find((r) => r.match(p.id, p.label));
      if (rule && !benefits.includes(rule.benefit)) benefits.push(rule.benefit);
    }
  }

  // Fallback se nada foi marcado
  if (benefits.length === 0) {
    benefits.push(
      "Acessar +50 IAs Premium em uma única plataforma.",
      "Ganhar tempo nas tarefas do dia a dia com a IA mais adequada para cada caso.",
      "Trocar várias assinaturas por uma única, com tudo centralizado."
    );
  }

  return benefits.slice(0, 5);
}
