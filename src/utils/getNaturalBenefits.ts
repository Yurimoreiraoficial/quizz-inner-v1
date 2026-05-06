// Gera 3 bullets personalizados para a página final
import { taskOptionsByMarket, painOptions } from "@/data/taskOptionsByMarket";
import type { FunnelState, Market, SliderValue, FrequencyValue } from "@/types/funnel";

const intensity: Record<SliderValue, number> = { Nunca: 0, "Às vezes": 1, Muito: 2 };

// Bullet 1: por mercado + tarefa (id)
const taskBulletByMarket: Record<Market, Record<string, string>> = {
  tecnologia: {
    code: "Revisar, explicar e melhorar trechos de código com mais clareza, reduzindo o tempo gasto tentando entender problemas técnicos sozinho.",
    tech_research: "Pesquisar soluções, comparar abordagens e transformar documentação técnica em respostas mais objetivas para sua rotina de desenvolvimento.",
    automacoes: "Estruturar ideias de integrações, fluxos e automações simples com apoio de IA, antes de partir para a implementação.",
    imagens: "Criar apoios visuais, mockups e peças simples para comunicar melhor ideias técnicas, sem depender de múltiplas ferramentas.",
    videos: "Organizar roteiros, explicações e materiais de apoio para conteúdos técnicos, treinamentos ou demonstrações em vídeo.",
  },
  educacao: {
    longread: "Analisar artigos, PDFs e materiais extensos com mais velocidade, extraindo ideias centrais, argumentos e pontos relevantes para estudo ou pesquisa.",
    edu_planning: "Planejar aulas, avaliações, roteiros de estudo e conteúdos educacionais com mais estrutura e menos esforço operacional.",
    automacoes: "Organizar fluxos simples para ganhar tempo em tarefas recorrentes de ensino, pesquisa, revisão e preparação de materiais.",
    imagens: "Criar imagens, esquemas e materiais visuais de apoio para tornar explicações, aulas e conteúdos mais claros.",
    videos: "Estruturar roteiros, resumos e materiais para vídeos, aulas gravadas ou conteúdos educacionais com mais clareza.",
  },
  juridico: {
    contracts: "Analisar contratos, peças e documentos longos com mais agilidade, identificando pontos relevantes sem perder profundidade.",
    legal_research: "Apoiar pesquisas jurídicas, pareceres e teses com respostas mais organizadas, facilitando a construção de argumentos.",
    automacoes: "Estruturar tarefas jurídicas recorrentes, modelos de atendimento e fluxos de análise com apoio de assistentes personalizados.",
    imagens: "Criar materiais visuais simples para apresentações, comunicação com clientes ou explicação de temas jurídicos complexos.",
    videos: "Organizar roteiros e ideias para conteúdos jurídicos, vídeos explicativos ou materiais de autoridade profissional.",
  },
  negocios: {
    reports: "Transformar relatórios, indicadores e documentos estratégicos em análises mais claras para apoiar decisões melhores.",
    biz_strategy: "Planejar com mais profundidade, estruturando estratégias, cenários, briefings e decisões com apoio das melhores IAs.",
    automacoes: "Organizar processos, tarefas recorrentes e ideias de automação para ganhar eficiência sem complicar a operação.",
    imagens: "Criar apresentações, esquemas e peças visuais simples para comunicar ideias de negócio com mais clareza.",
    videos: "Estruturar roteiros, apresentações e conteúdos institucionais ou comerciais com mais velocidade.",
  },
  marketing: {
    copy: "Criar copys, posts, legendas e variações de campanha com mais velocidade, sem começar cada peça do zero.",
    mkt_strategy: "Estruturar briefings, campanhas, pautas e ideias com mais profundidade antes de partir para a execução.",
    automacoes: "Organizar fluxos simples de conteúdo, atendimento ou campanhas com apoio de IA para reduzir tarefas repetitivas.",
    imagens: "Criar ideias visuais, peças simples e referências criativas com apoio de IAs de imagem dentro da plataforma.",
    videos: "Acelerar roteiros, ideias, ganchos e estruturas para vídeos, anúncios e conteúdos audiovisuais.",
  },
  design: {
    creative_direction: "Desenvolver conceitos, roteiros e caminhos criativos com mais velocidade, sem depender apenas de brainstorming manual.",
    design_briefs: "Organizar referências, briefings e ideias visuais em uma base mais clara antes de executar o projeto.",
    imagens: "Criar imagens, composições e referências visuais com apoio das melhores IAs, especialmente quando precisar acelerar a fase conceitual.",
    videos: "Estruturar roteiros, cenas, ideias e materiais audiovisuais com mais rapidez, mantendo clareza criativa.",
    automacoes: "Organizar processos criativos recorrentes, padrões de briefing e fluxos simples para ganhar produtividade.",
  },
  outro: {
    writing: "Organizar ideias, revisar textos e transformar demandas soltas em entregas mais claras e bem estruturadas.",
    doc_analysis: "Analisar documentos, informações e materiais longos com mais clareza, chegando mais rápido ao que realmente importa.",
    automacoes: "Criar fluxos simples e assistentes para apoiar tarefas recorrentes da sua rotina profissional.",
    imagens: "Criar apoios visuais, imagens e peças simples para comunicar ideias com mais facilidade.",
    videos: "Estruturar ideias, roteiros e conteúdos audiovisuais com mais organização e menos retrabalho.",
  },
};

// Bullet 2: por dor (id)
const painBullet: Record<string, string> = {
  rework: "Reduzir a tentativa e erro ao usar IA, transformando pedidos soltos em comandos mais claros e respostas mais úteis.",
  doubt_tool: "Parar de perder tempo decidindo qual IA usar para cada tarefa, deixando a Inner direcionar sua demanda para o modelo mais adequado.",
  limits: "Reduzir a fricção de bater em limites, créditos ou bloqueios nas ferramentas gratuitas e manter uma rotina mais contínua de uso com IA.",
  tab_switching: "Centralizar pesquisa, escrita, análise, prompts, documentos, imagens e assistentes em uma plataforma única.",
};

// Prioridade de desempate de dores
const painPriority = ["doubt_tool", "rework", "limits", "tab_switching"];

// Bullet 3: por mercado
const marketBullet: Record<Market, string> = {
  tecnologia: "Apoiar sua rotina técnica com pesquisa, revisão de código, documentação, comparação de soluções e criação de assistentes para tarefas recorrentes.",
  educacao: "Apoiar sua rotina de estudo, ensino ou pesquisa com análise de materiais longos, estruturação de aulas, resumos e apresentações.",
  juridico: "Apoiar sua rotina jurídica com análise de documentos, organização de fundamentos, pesquisa, pareceres e comunicação mais clara com clientes.",
  negocios: "Apoiar sua rotina de gestão com análise de informações, planejamento, atas, apresentações e materiais executivos mais bem estruturados.",
  marketing: "Apoiar sua rotina de marketing com criação de copys, campanhas, briefings, conteúdos e pesquisas de mercado em uma única plataforma.",
  design: "Apoiar sua rotina criativa com organização de referências, conceitos, roteiros, briefings e ideias visuais antes da execução.",
  outro: "Apoiar sua rotina profissional com escrita, análise, organização de ideias, documentos e tarefas recorrentes em uma única plataforma.",
};

export function getNaturalBenefits(state: FunnelState): string[] {
  const market: Market = state.mercado ?? "outro";
  const bullets: string[] = [];

  // Bullet 1 — tarefa principal (maior intensidade; desempate pela ordem do mercado)
  const tasks = taskOptionsByMarket[market];
  let topTaskId: string | null = null;
  let topScore = -1;
  for (const t of tasks) {
    const v = state.tarefas[t.id];
    const score = v ? intensity[v] : 0;
    if (score > topScore) {
      topScore = score;
      topTaskId = t.id;
    }
  }
  if (topTaskId && topScore > 0) {
    const b = taskBulletByMarket[market]?.[topTaskId];
    if (b) bullets.push(b);
  }

  // Bullet 2 — dor principal (maior frequência; desempate por painPriority)
  let topPainId: string | null = null;
  let topPainScore = -1;
  for (const pid of painPriority) {
    const v = state.dores[pid] as FrequencyValue | undefined;
    const score = v ? intensity[v] : 0;
    if (score > topPainScore) {
      topPainScore = score;
      topPainId = pid;
    }
  }
  if (topPainId && topPainScore > 0) {
    const b = painBullet[topPainId];
    if (b) bullets.push(b);
  }

  // Bullet 3 — mercado
  bullets.push(marketBullet[market]);

  return bullets;
}
