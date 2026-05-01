import type { FunnelState } from "@/types/funnel";
import { links } from "@/data/designTokens";

export function buildWhatsappUrl(state: FunnelState): string {
  const tarefas = state.tarefasPrincipais.length
    ? state.tarefasPrincipais.join(", ")
    : "—";
  const dores = state.doresPrincipais.length
    ? state.doresPrincipais.join(", ")
    : "—";

  const message = [
    `Olá, meu nome é ${state.nome ?? ""}. Acabei de fazer o diagnóstico da Inner AI.`,
    `Meu mercado: ${state.mercadoLabel ?? "—"}.`,
    `Uso atual de IA: ${state.usoIALabel ?? "—"}.`,
    `Minhas principais tarefas: ${tarefas}.`,
    `Minhas principais dores: ${dores}.`,
    `Meu nível de encaixe indicado foi: ${state.nivelEncaixe ?? "—"}.`,
    `Plano sugerido: ${state.planoSugerido ?? "—"}.`,
    "",
    "Podem me ajudar a entender qual plano faz mais sentido para meu caso?",
  ].join("\n");

  // base já contém ?phone=...
  const sep = links.whatsappBase.includes("?") ? "&" : "?";
  return `${links.whatsappBase}${sep}text=${encodeURIComponent(message)}`;
}
