import type { FunnelState } from "@/types/funnel";
import { links } from "@/data/designTokens";

export function buildCheckoutUrl(state: Pick<FunnelState, "nome" | "whatsapp">): string {
  const url = new URL(links.checkoutBase);
  if (state.nome) url.searchParams.set("name", state.nome);
  if (state.whatsapp) url.searchParams.set("phone", state.whatsapp);
  return url.toString();
}
