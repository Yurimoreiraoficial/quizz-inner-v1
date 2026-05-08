/* localStorage helpers para o admin do MVP. */
import { funnelSteps } from "@/data/funnelSteps";
import { finalPageContent } from "@/data/finalPageContent";

const KEY = "inner.admin.v1";

export type StepDraft = {
  id: string;
  type: string;
  enabled: boolean;
  title: string;
  subtitle: string;
  cta: string;
};

export type LinksConfig = {
  checkoutBaseUrl: string;
  whatsappBaseUrl: string;
  defaultUtmSource: string;
  defaultUtmMedium: string;
  defaultUtmCampaign: string;
  gtmId: string;
  metaPixelId: string;
  ga4Id: string;
};

export type Experiment = {
  id: string;
  name: string;
  element: string;
  variantA: string;
  variantB: string;
  goal: string;
  status: "draft" | "running" | "finished";
  createdAt: string;
};

export type AdminState = {
  steps: StepDraft[];
  finalCta: string;
  links: LinksConfig;
  experiments: Experiment[];
  workspaceName: string;
};

const defaultStepLabels: Record<string, { title: string; subtitle: string; cta: string }> = {
  intro:        { title: "Descubra como a IA pode ajudar você", subtitle: "Quiz rápido de 1 minuto", cta: "Começar quiz" },
  uso_ia:       { title: "Você já usa ferramentas de IA?", subtitle: "", cta: "Próximo" },
  insert_50ias: { title: "+50 IAs em uma única plataforma", subtitle: "", cta: "Próximo" },
  mercado:      { title: "Em qual mercado você atua?", subtitle: "", cta: "Próximo" },
  insert_help:  { title: "A Inner pode te ajudar com", subtitle: "", cta: "Próximo" },
  tarefas:      { title: "Em quais tarefas você quer apoio?", subtitle: "", cta: "Próximo" },
  insert_proof: { title: "Profissionais como você usam a Inner", subtitle: "", cta: "Próximo" },
  dores:        { title: "Quais dores são mais relevantes?", subtitle: "", cta: "Próximo" },
  loading:      { title: "Calculando seu plano...", subtitle: "", cta: "" },
  lead:         { title: "Receba seu plano personalizado", subtitle: "", cta: "Continuar" },
  final:        { title: finalPageContent.fusion.title, subtitle: finalPageContent.fusion.description, cta: "Assinar Plano PRO" },
};

function defaults(): AdminState {
  return {
    steps: funnelSteps.map((s) => ({
      id: s.id,
      type: s.type,
      enabled: true,
      ...defaultStepLabels[s.id],
    })),
    finalCta: "Assinar Plano PRO",
    links: {
      checkoutBaseUrl: "https://pay.innerai.com/",
      whatsappBaseUrl: "https://api.whatsapp.com/send/?phone=551152962293",
      defaultUtmSource: "quiz",
      defaultUtmMedium: "funnel",
      defaultUtmCampaign: "inner-pro",
      gtmId: "",
      metaPixelId: "",
      ga4Id: "",
    },
    experiments: [],
    workspaceName: "Inner AI",
  };
}

export function loadState(): AdminState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaults();
    const parsed = JSON.parse(raw) as Partial<AdminState>;
    const base = defaults();
    return {
      ...base,
      ...parsed,
      links: { ...base.links, ...(parsed.links ?? {}) },
      steps: parsed.steps && parsed.steps.length === base.steps.length ? parsed.steps : base.steps,
      experiments: parsed.experiments ?? [],
    };
  } catch {
    return defaults();
  }
}

export function saveState(s: AdminState) {
  localStorage.setItem(KEY, JSON.stringify(s));
}

export function resetState(): AdminState {
  const d = defaults();
  saveState(d);
  return d;
}