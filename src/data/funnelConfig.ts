/**
 * Inner AI — Funil Builder
 * Configuração centralizada do funil atual ("Quiz Inner V1").
 *
 * Esta é a ÚNICA fonte de verdade para textos, opções, CTAs, eventos,
 * pixels e regras simples deste funil. Os componentes do funil público
 * continuam funcionando como hoje; em uma próxima fase passarão a ler
 * os textos a partir daqui (camada de configuração já preparada).
 *
 * Não altere a estrutura sem versionar (`id`, `version`).
 */

import { aiUsageOptions, marketOptions } from "./marketOptions";
import { finalPageContent } from "./finalPageContent";

// ============================================================
// Tipos
// ============================================================

export type ScreenStatus = "active" | "draft" | "paused" | "disabled";

export type ScreenType =
  | "opening"
  | "single_choice"
  | "insert"
  | "slider_group_market"
  | "slider_group_pain"
  | "loading"
  | "lead_capture"
  | "final";

export type CtaType = "next" | "submit" | "checkout" | "whatsapp" | "external" | "none";

export interface ScreenOption {
  /** valor salvo nas respostas */
  value: string;
  /** texto exibido */
  label: string;
  /** próxima tela quando esta opção é escolhida (override do nextScreen padrão) */
  nextScreen?: string | null;
  /** rótulo de evento extra ao escolher esta opção */
  event?: string;
}

export interface ScreenCta {
  type: CtaType;
  label: string;
  /** id da próxima tela quando type === "next" */
  destination?: string | null;
  /** alvo externo quando type === "external" / "checkout" / "whatsapp" */
  href?: string;
}

export interface ScreenEvents {
  /** disparado quando a tela aparece */
  view?: string;
  /** disparado no clique principal */
  click?: string;
  /** disparado ao concluir a tela */
  complete?: string;
  /** ações configuráveis (botões/links) por tela */
  actions?: ScreenAction[];
}

export type ActionDestinationType =
  | "next_screen"
  | "checkout"
  | "whatsapp"
  | "external_url";

export interface ScreenAction {
  action_key: string;
  action_label: string;
  destination_type: ActionDestinationType;
  destination_value: string;
  event_name: string;
  pixel_enabled: boolean;
  pixel_event_name?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  status: "active" | "inactive";
}

export interface PixelMapping {
  /** "meta" | "ga4" | "gtm" | string customizado */
  provider: string;
  /** nome do evento no provedor */
  event: string;
  /** payload extra (parâmetros) */
  params?: Record<string, string | number | boolean>;
}

export type RuleOperator =
  | "equals"
  | "not_equals"
  | "in"
  | "not_in"
  | "gte"
  | "lte"
  | "is_empty"
  | "is_not_empty";

export interface ScreenRule {
  /** caminho na resposta, ex: "uso_ia" ou "tarefas.criar_imagens" */
  field: string;
  operator: RuleOperator;
  value?: unknown;
  /** quando a regra é verdadeira, vai para esta tela */
  goTo: string;
}

export interface ScreenContent {
  headline?: string;
  subtitle?: string;
  buttonText?: string;
  /** textos auxiliares: micro-copys, bullets, legendas */
  extras?: Record<string, string | string[]>;
}

export interface FunnelScreen {
  id: string;
  order: number;
  name: string;
  type: ScreenType;
  status: ScreenStatus;
  content: ScreenContent;
  options?: ScreenOption[];
  cta?: ScreenCta;
  events?: ScreenEvents;
  pixels?: PixelMapping[];
  rules?: ScreenRule[];
  /** próxima tela padrão (quando nenhuma rule casa) */
  nextScreen: string | null;
}

export interface FunnelConfig {
  id: string;
  version: number;
  name: string;
  status: ScreenStatus;
  format: "quiz" | "form" | "vsl";
  publicUrl: string;
  designSystem: string;
  defaultCheckoutUrl: string;
  defaultWhatsappNumber: string;
  defaultWhatsappMessage: string;
  tracking: {
    metaPixelId: string;
    googleTagId: string;
    gtmId: string;
  };
  screens: FunnelScreen[];
}

// ============================================================
// Configuração do funil atual
// ============================================================

export const funnelConfig: FunnelConfig = {
  id: "quiz-inner-v1",
  version: 1,
  name: "Quiz Inner V1",
  status: "active",
  format: "quiz",
  publicUrl: "/dark",
  designSystem: "inner-quiz-dark",
  defaultCheckoutUrl: "https://pay.innerai.com/",
  defaultWhatsappNumber: "551152962293",
  defaultWhatsappMessage:
    "Olá! Vim pelo quiz da Inner e gostaria de falar com o time sobre o Plano Ultra.",
  tracking: {
    metaPixelId: "",
    googleTagId: "",
    gtmId: "",
  },
  screens: [
    {
      id: "intro",
      order: 1,
      name: "Intro",
      type: "opening",
      status: "active",
      content: {
        headline: "Descubra em menos de 1 minuto se a Inner é a melhor escolha para você.",
        subtitle: "+50 IAs. Uma única plataforma.",
        buttonText: "COMEÇAR AGORA",
      },
      cta: { type: "next", label: "Começar quiz", destination: "uso_ia" },
      events: { view: "screen_view_intro", click: "funnel_start" },
      pixels: [{ provider: "meta", event: "ViewContent", params: { content_name: "quiz_intro" } }],
      rules: [],
      nextScreen: "uso_ia",
    },

    {
      id: "uso_ia",
      order: 2,
      name: "Uso atual de IA",
      type: "single_choice",
      status: "active",
      content: {
        headline: "Você já utiliza alguma ferramenta de IA hoje?",
        subtitle: "",
        buttonText: "Próximo",
      },
      options: aiUsageOptions.map((o) => ({ value: o.value, label: o.label })),
      cta: { type: "next", label: "Próximo", destination: "insert_50ias" },
      events: { view: "screen_view_uso_ia", complete: "answer_uso_ia" },
      pixels: [],
      rules: [],
      nextScreen: "insert_50ias",
    },

    {
      id: "insert_50ias",
      order: 3,
      name: "Insert — +50 IAs",
      type: "insert",
      status: "active",
      content: {
        headline: "Use GPT-5, Claude, Gemini e +50 IAs Premium em uma só plataforma.",
        subtitle: "Tudo em um só lugar, sem precisar alternar entre várias assinaturas.",
        buttonText: "CONTINUAR",
      },
      cta: { type: "next", label: "Próximo", destination: "mercado" },
      events: { view: "screen_view_insert_50ias", click: "next_insert_50ias" },
      pixels: [],
      rules: [],
      nextScreen: "mercado",
    },

    {
      id: "mercado",
      order: 4,
      name: "Mercado de atuação",
      type: "single_choice",
      status: "active",
      content: {
        headline: "Em que mercado você atua hoje?",
        subtitle: "",
        buttonText: "Próximo",
      },
      options: marketOptions.map((o) => ({ value: o.value, label: o.label })),
      cta: { type: "next", label: "Próximo", destination: "insert_help" },
      events: { view: "screen_view_mercado", complete: "answer_mercado" },
      pixels: [],
      rules: [],
      nextScreen: "insert_help",
    },

    {
      id: "insert_help",
      order: 5,
      name: "Insert — A Inner pode te ajudar",
      type: "insert",
      status: "active",
      content: {
        headline: "Você está no lugar certo",
        subtitle: "",
        buttonText: "CONTINUAR",
        extras: { bulletsTitle: "A Inner pode te ajudar com:" },
      },
      cta: { type: "next", label: "Próximo", destination: "tarefas" },
      events: { view: "screen_view_insert_help", click: "next_insert_help" },
      pixels: [],
      rules: [],
      nextScreen: "tarefas",
    },

    {
      id: "tarefas",
      order: 6,
      name: "Tarefas por mercado",
      type: "slider_group_market",
      status: "active",
      content: {
        headline: "Marque o quanto você usa IA hoje para essas tarefas:",
        subtitle: "",
        buttonText: "CONTINUAR",
      },
      cta: { type: "next", label: "Próximo", destination: "insert_proof" },
      events: { view: "screen_view_tarefas", complete: "answer_tarefas" },
      pixels: [],
      rules: [],
      nextScreen: "insert_proof",
    },

    {
      id: "insert_proof",
      order: 7,
      name: "Insert — Prova social",
      type: "insert",
      status: "active",
      content: {
        headline: "Mais de 500 mil usuários",
        subtitle: "",
        buttonText: "CONTINUAR",
      },
      cta: { type: "next", label: "Próximo", destination: "dores" },
      events: { view: "screen_view_insert_proof", click: "next_insert_proof" },
      pixels: [],
      rules: [],
      nextScreen: "dores",
    },

    {
      id: "dores",
      order: 8,
      name: "Dores",
      type: "slider_group_pain",
      status: "active",
      content: {
        headline: "Marque com que frequência isso acontece na sua rotina.",
        subtitle: "",
        buttonText: "CONTINUAR",
      },
      cta: { type: "next", label: "Próximo", destination: "loading" },
      events: { view: "screen_view_dores", complete: "answer_dores" },
      pixels: [],
      rules: [],
      nextScreen: "loading",
    },

    {
      id: "loading",
      order: 9,
      name: "Loading — montando plano",
      type: "loading",
      status: "active",
      content: {
        headline: "Calculando seu plano personalizado...",
        subtitle: "Levamos alguns segundos para cruzar suas respostas.",
        buttonText: "",
      },
      cta: { type: "none", label: "" },
      events: { view: "screen_view_loading", complete: "loading_complete" },
      pixels: [],
      rules: [],
      nextScreen: "lead",
    },

    {
      id: "lead",
      order: 10,
      name: "Captura de lead",
      type: "lead_capture",
      status: "active",
      content: {
        headline: "Receba seu plano personalizado",
        subtitle: "Use seu melhor e-mail para receber o resumo do diagnóstico.",
        buttonText: "Continuar",
        extras: {
          microcopy: "Não enviamos spam. Você pode sair quando quiser.",
        },
      },
      cta: { type: "submit", label: "Continuar", destination: "final" },
      events: {
        view: "screen_view_lead",
        click: "lead_submit_attempt",
        complete: "lead_captured",
      },
      pixels: [
        { provider: "meta", event: "Lead" },
        { provider: "ga4", event: "generate_lead" },
      ],
      rules: [],
      nextScreen: "final",
    },

    {
      id: "final",
      order: 11,
      name: "Tela final — oferta",
      type: "final",
      status: "active",
      content: {
        headline: finalPageContent.fusion.title,
        subtitle: finalPageContent.fusion.description,
        buttonText: "Assinar Plano PRO",
        extras: {
          guaranteeMicro: finalPageContent.guarantee.micro,
          ultraAlertCta: finalPageContent.ultraAlert.cta,
        },
      },
      cta: {
        type: "checkout",
        label: "Assinar Plano PRO",
        href: "https://pay.innerai.com/",
      },
      events: {
        view: "screen_view_final",
        click: "checkout_click",
        complete: "checkout_redirect",
      },
      pixels: [
        { provider: "meta", event: "InitiateCheckout" },
        { provider: "ga4", event: "begin_checkout" },
      ],
      // Exemplo: visitantes com perfil "uso alto em imagem/vídeo" recebem alerta Ultra.
      // O componente atual já trata isso; a regra fica registrada para uso futuro
      // quando o motor de regras do builder for plugado.
      rules: [
        {
          field: "perfil_ultra",
          operator: "equals",
          value: true,
          goTo: "final",
        },
      ],
      nextScreen: null,
    },
  ],
};

// ============================================================
// Helpers de leitura — usar em qualquer componente do funil
// ============================================================

/** Retorna apenas as telas habilitadas (active|draft) na ordem correta. */
export function getActiveScreens(cfg: FunnelConfig = funnelConfig): FunnelScreen[] {
  return [...cfg.screens]
    .filter((s) => s.status !== "disabled" && s.status !== "paused")
    .sort((a, b) => a.order - b.order);
}

/** Encontra uma tela pelo id. */
export function getScreen(id: string, cfg: FunnelConfig = funnelConfig): FunnelScreen | undefined {
  return cfg.screens.find((s) => s.id === id);
}

/** Resolve a próxima tela aplicando rules antes do nextScreen padrão. */
export function resolveNextScreen(
  currentId: string,
  answers: Record<string, unknown>,
  cfg: FunnelConfig = funnelConfig,
): string | null {
  const screen = getScreen(currentId, cfg);
  if (!screen) return null;

  for (const rule of screen.rules ?? []) {
    if (evaluateRule(rule, answers)) return rule.goTo;
  }
  return screen.nextScreen;
}

function evaluateRule(rule: ScreenRule, answers: Record<string, unknown>): boolean {
  const value = getByPath(answers, rule.field);
  switch (rule.operator) {
    case "equals":        return value === rule.value;
    case "not_equals":    return value !== rule.value;
    case "in":            return Array.isArray(rule.value) && (rule.value as unknown[]).includes(value);
    case "not_in":        return Array.isArray(rule.value) && !(rule.value as unknown[]).includes(value);
    case "gte":           return typeof value === "number" && typeof rule.value === "number" && value >= rule.value;
    case "lte":           return typeof value === "number" && typeof rule.value === "number" && value <= rule.value;
    case "is_empty":      return value === undefined || value === null || value === "";
    case "is_not_empty":  return !(value === undefined || value === null || value === "");
    default:              return false;
  }
}

function getByPath(obj: Record<string, unknown>, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, k) => {
    if (acc && typeof acc === "object" && k in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[k];
    }
    return undefined;
  }, obj);
}
