import type { FunnelState } from "@/types/funnel";
import { links } from "@/data/designTokens";
import { funnelConfig, getScreen } from "@/data/funnelConfig";

export function buildCheckoutUrl(state: Pick<FunnelState, "nome" | "whatsapp">): string {
  /**
   * Fonte do checkout: tela `final` em funnelConfig (cta.href) → defaultCheckoutUrl
   * → fallback para o token legado em designTokens.links. Mantém compatibilidade
   * sem mudar comportamento atual.
   */
  const finalScreen = getScreen("final", funnelConfig);
  const base =
    (finalScreen?.cta?.href && finalScreen.cta.href.length > 0 ? finalScreen.cta.href : null) ??
    (funnelConfig.defaultCheckoutUrl && funnelConfig.defaultCheckoutUrl.length > 0
      ? funnelConfig.defaultCheckoutUrl
      : null) ??
    links.checkoutBase;

  const url = new URL(base);
  if (state.nome) url.searchParams.set("name", state.nome);
  if (state.whatsapp) url.searchParams.set("phone", state.whatsapp);
  return url.toString();
}
