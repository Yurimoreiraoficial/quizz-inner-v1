/* localStorage helpers para o admin do MVP. */
import { funnelSteps } from "@/data/funnelSteps";
import { funnelConfig, getScreen } from "@/data/funnelConfig";

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

/** Lê labels da fonte de verdade (funnelConfig). */
function labelsFor(id: string): { title: string; subtitle: string; cta: string } {
  const s = getScreen(id, funnelConfig);
  return {
    title: s?.content.headline ?? id,
    subtitle: s?.content.subtitle ?? "",
    cta: s?.content.buttonText ?? s?.cta?.label ?? "",
  };
}

function defaults(): AdminState {
  return {
    steps: funnelSteps.map((s) => {
      const cfg = getScreen(s.id, funnelConfig);
      return {
        id: s.id,
        type: s.type,
        enabled: cfg?.status !== "disabled" && cfg?.status !== "paused",
        ...labelsFor(s.id),
      };
    }),
    finalCta: getScreen("final", funnelConfig)?.content.buttonText ?? "Assinar Plano PRO",
    links: {
      checkoutBaseUrl: funnelConfig.defaultCheckoutUrl,
      whatsappBaseUrl: `https://api.whatsapp.com/send/?phone=${funnelConfig.defaultWhatsappNumber}`,
      defaultUtmSource: "quiz",
      defaultUtmMedium: "funnel",
      defaultUtmCampaign: "inner-pro",
      gtmId: funnelConfig.tracking.gtmId,
      metaPixelId: funnelConfig.tracking.metaPixelId,
      ga4Id: funnelConfig.tracking.googleTagId,
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