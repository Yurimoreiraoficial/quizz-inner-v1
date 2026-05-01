import type { Market } from "@/types/funnel";

export interface Testimonial {
  name: string;
  role: string;
  text: string;
}

// 5 depoimentos por mercado
export const testimonialsByMarket: Record<Market, Testimonial[]> = {
  tecnologia: [
    { name: "Lucas A.", role: "Tech Lead", text: "Substituiu três assinaturas. Reviso código e pesquiso muito mais rápido com várias IAs em um lugar só." },
    { name: "Marina S.", role: "Eng. de Software", text: "A Tecnologia Fusion escolhe o modelo certo. Pareceu mágica nos primeiros dias." },
    { name: "Rafael P.", role: "Product Manager", text: "Uso para PRDs, análise de feedback e roadmap. Ganho horas todo dia." },
    { name: "Camila T.", role: "Dev Sênior", text: "Os assistentes personalizados deixaram tarefas repetitivas quase automáticas." },
    { name: "Bruno O.", role: "CTO", text: "Padronizamos o uso de IA na empresa toda com a Inner. Custo previsível e ótimo." },
  ],
  educacao: [
    { name: "Profa. Helena", role: "Pesquisadora", text: "Analiso artigos longos em minutos. Mudou minha rotina de revisão." },
    { name: "Prof. Diego", role: "Professor universitário", text: "Crio avaliações e materiais didáticos muito mais ricos." },
    { name: "Renata C.", role: "Coordenadora pedagógica", text: "Os slides automáticos economizaram tardes inteiras de trabalho." },
    { name: "Felipe M.", role: "Mestrando", text: "Pesquisa cruzada entre diferentes IAs me dá perspectivas que eu não teria sozinho." },
    { name: "Aline G.", role: "Tutora EAD", text: "Atendimento aos alunos ficou bem mais rápido e personalizado." },
  ],
  juridico: [
    { name: "Dra. Patrícia L.", role: "Advogada", text: "Analiso contratos de 80 páginas em minutos. Indispensável." },
    { name: "Dr. Roberto F.", role: "Sócio em escritório", text: "A pesquisa de jurisprudência ficou muito mais rápida e ampla." },
    { name: "Juliana R.", role: "Advogada tributarista", text: "Pareceres saem em uma fração do tempo, com qualidade." },
    { name: "Dr. Eduardo M.", role: "Contencioso", text: "Uso para revisar peças e clarear argumentação. Excelente." },
    { name: "Mariana V.", role: "Compliance", text: "Centralizar várias IAs em uma assinatura faz total sentido." },
  ],
  negocios: [
    { name: "Sergio N.", role: "Diretor de Operações", text: "Analiso relatórios em minutos e tomo decisões mais embasadas." },
    { name: "Carla F.", role: "Gerente de Projetos", text: "Atas, follow-ups e apresentações ficaram triviais." },
    { name: "André S.", role: "Founder", text: "Substituí múltiplas ferramentas e ganhei velocidade no estratégico." },
    { name: "Fernanda P.", role: "Head Comercial", text: "Pitchs e propostas saem mais consistentes e personalizados." },
    { name: "Tiago R.", role: "CFO", text: "Custo previsível e produtividade sobe muito. Vale demais." },
  ],
  marketing: [
    { name: "Beatriz M.", role: "Head de Marketing", text: "Produzimos mais conteúdo e melhor com a Inner. Substituiu várias ferramentas." },
    { name: "Lucas R.", role: "Social Media", text: "Crio copy, ideias e legendas em escala sem perder a voz da marca." },
    { name: "Paula T.", role: "Estrategista", text: "Briefings, planejamento e benchmark ficaram muito mais ágeis." },
    { name: "Henrique B.", role: "Performance", text: "Variantes de criativos e copy em minutos. Melhor que ferramentas separadas." },
    { name: "Luana A.", role: "Conteúdo", text: "Reduzi a troca entre ferramentas e ganhei foco no que importa." },
  ],
  design: [
    { name: "Rodrigo S.", role: "Designer", text: "A organização de referências e briefings ficou bem mais fluida." },
    { name: "Isabela K.", role: "Diretora de Arte", text: "Concepção e roteiros se tornaram muito mais rápidos." },
    { name: "Marcelo D.", role: "Motion Designer", text: "Uso para roteiros e referências. Vale demais o investimento." },
    { name: "Talita G.", role: "Designer Gráfico", text: "Geração de imagens cobre boa parte do meu trabalho exploratório." },
    { name: "Pedro N.", role: "UX Designer", text: "Pesquisa, síntese e wireframes em fluxo único. Sensacional." },
  ],
  outro: [
    { name: "Cliente verificado", role: "Profissional liberal", text: "Centralizar várias IAs num só lugar foi a melhor escolha de produtividade do ano." },
    { name: "Cliente verificado", role: "Empreendedor", text: "Ganhei tempo em todas as frentes do meu negócio." },
    { name: "Cliente verificado", role: "Consultor", text: "Análises mais rápidas e melhores. Excelente custo-benefício." },
    { name: "Cliente verificado", role: "Autônomo", text: "Reduzi custos e melhorei entregas. Vale muito a pena." },
    { name: "Cliente verificado", role: "Profissional", text: "Não voltaria a ter assinaturas separadas. Inner resolve." },
  ],
};
