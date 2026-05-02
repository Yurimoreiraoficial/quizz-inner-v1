import type { Market } from "@/types/funnel";

// Opções de tarefas por mercado (Tela 6)
// As CHAVES (id) são consistentes entre mercados quando possível para regras Ultra
export interface TaskItem {
  id: string;        // chave estável
  label: string;     // exibido
  imageHeavy?: boolean; // marca de "imagem"
  videoHeavy?: boolean; // marca de "vídeo/audiovisual"
}

const commonImageVideo: TaskItem[] = [
  { id: "imagens", label: "Criação de imagens e peças visuais", imageHeavy: true },
  { id: "videos", label: "Vídeos ou conteúdo audiovisual", videoHeavy: true },
  { id: "automacoes", label: "Integrações e automações" },
];

export const taskOptionsByMarket: Record<Market, TaskItem[]> = {
  tecnologia: [
    { id: "code", label: "Explicação, revisão e melhoria de código" },
    { id: "tech_research", label: "Pesquisa técnica e documentação" },
    ...commonImageVideo,
  ],
  educacao: [
    { id: "longread", label: "Análise de artigos, PDFs e materiais longos" },
    { id: "edu_planning", label: "Planejamento de aulas, avaliações e conteúdos" },
    ...commonImageVideo,
  ],
  juridico: [
    { id: "contracts", label: "Análise de contratos, peças e documentos" },
    { id: "legal_research", label: "Pesquisa jurídica, pareceres e teses" },
    ...commonImageVideo,
  ],
  negocios: [
    { id: "reports", label: "Análise de relatórios, indicadores e documentos" },
    { id: "biz_strategy", label: "Planejamento, estratégia e tomada de decisão" },
    ...commonImageVideo,
  ],
  marketing: [
    { id: "copy", label: "Copy, posts e legendas" },
    { id: "mkt_strategy", label: "Estratégia, briefing e planejamento" },
    ...commonImageVideo,
  ],
  design: [
    { id: "creative_direction", label: "Roteiros, conceitos e direção criativa" },
    { id: "design_briefs", label: "Organização de referências e briefings" },
    ...commonImageVideo,
  ],
  outro: [
    { id: "writing", label: "Escrita, revisão e organização de ideias" },
    { id: "doc_analysis", label: "Análise de documentos e informações" },
    ...commonImageVideo,
  ],
};

// Tela 8 — Dores
export interface PainItem {
  id: string;
  label: string;
}

export const painOptions: PainItem[] = [
  { id: "rework", label: "Precisa refazer o pedido várias vezes para ficar bom" },
  { id: "doubt_tool", label: "Fica em dúvida qual a melhor IA para cada tarefa" },
  { id: "limits", label: "Bate rapidamente em limites e créditos" },
  { id: "tab_switching", label: "Fica mudando de abas e ferramenta várias vezes" },
];
