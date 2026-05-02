import type { Market, OptionItem } from "@/types/funnel";

export const aiUsageOptions: OptionItem[] = [
  { value: "pago_uma", label: "Sim. Pago uma ferramenta IA" },
  { value: "pago_varias", label: "Sim. Pago 2 ou mais ferramentas" },
  { value: "gratuitas", label: "Sim. Uso versões gratuitas" },
  { value: "nao_uso", label: "Ainda não uso ferramentas de IA" },
];

export const marketOptions: { value: Market; label: string }[] = [
  { value: "tecnologia", label: "Tecnologia / Software / TI" },
  { value: "educacao", label: "Educação / Pesquisa" },
  { value: "juridico", label: "Jurídico / Serviços Legais" },
  { value: "negocios", label: "Negócios / Gestão" },
  { value: "marketing", label: "Marketing / Comunicação" },
  { value: "design", label: "Design / Audiovisual" },
  { value: "outro", label: "Outro mercado" },
];

// Bullets da tela 5 — “A Inner pode te ajudar com”
export const innerHelpsByMarket: Record<Market, string[]> = {
  juridico: [
    "Análise de contratos e documentos longos",
    "Pesquisa jurídica e jurisprudência",
    "Apoio para peças, pareceres e comunicação com clientes",
  ],
  educacao: [
    "Análise de artigos acadêmicos longos",
    "Produção de avaliações e aulas usando IA",
    "Apresentações de slides geradas rapidamente",
  ],
  tecnologia: [
    "Explicação, revisão e melhoria de códigos",
    "Pesquisa técnica e comparação de soluções",
    "Criação de assistentes para apoiar tarefas recorrentes",
  ],
  negocios: [
    "Análise de relatórios e documentos estratégicos",
    "Apoio em planejamento, processos e tomada de decisão",
    "Criação de apresentações, atas e materiais executivos",
  ],
  marketing: [
    "Criação de copys, campanhas e conteúdos",
    "Planejamento de pautas, briefings e ideias",
    "Apoio em pesquisa, benchmark e estratégia",
  ],
  design: [
    "Apoio em ideias, roteiros e conceitos criativos",
    "Organização de referências e briefings visuais",
    "Criação de imagens em uso moderado no plano PRO",
  ],
  outro: [
    "Organizar ideias e transformar demandas em entregas",
    "Analisar documentos, textos e informações com mais clareza",
    "Usar diferentes IAs em uma única plataforma",
  ],
};

// Subheadlines da tela de prova social (tela 7)
export const socialProofSubBy: Record<Market, string> = {
  juridico: "Profissionais do direito ganham horas analisando contratos e pesquisando jurisprudência.",
  educacao: "Educadores e pesquisadores aceleram análises e produzem materiais com mais qualidade.",
  tecnologia: "Times de tecnologia revisam código, pesquisam e documentam mais rápido.",
  negocios: "Líderes e gestores tomam decisões \ncom mais clareza e velocidade.",
  marketing: "Equipes de marketing criam mais conteúdo, com mais consistência e profundidade.",
  design: "Profissionais criativos aceleram conceitos, briefings e produção visual.",
  outro: "Profissionais de diferentes áreas usam várias IAs centralizadas em um só lugar.",
};

export const finalSocialSubBy: Record<Market, string> = {
  juridico: "Veja como advogados e times jurídicos estão usando a Inner no dia a dia.",
  educacao: "Veja como educadores e pesquisadores transformaram suas rotinas.",
  tecnologia: "Veja como devs e times de produto estão usando a Inner.",
  negocios: "Veja como gestores e líderes estão acelerando entregas com IA.",
  marketing: "Veja como times de marketing produzem mais e melhor com a Inner.",
  design: "Veja como criativos e estúdios usam a Inner no fluxo de trabalho.",
  outro: "Veja como profissionais de várias áreas usam a Inner.",
};
