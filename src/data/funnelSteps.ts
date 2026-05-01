import type { FunnelStepBase } from "@/types/funnel";

// Ordem das etapas do funil. Edite aqui para reorganizar.
export const funnelSteps: FunnelStepBase[] = [
  { id: "intro",        type: "intro",                showBack: false, showProgress: false },
  { id: "uso_ia",       type: "single_choice",        showBack: true,  showProgress: true },
  { id: "insert_50ias", type: "insert",               showBack: true,  showProgress: true },
  { id: "mercado",      type: "single_choice",        showBack: true,  showProgress: true },
  { id: "insert_help",  type: "insert",               showBack: true,  showProgress: true },
  { id: "tarefas",      type: "slider_group_market",  showBack: true,  showProgress: true },
  { id: "insert_proof", type: "insert",               showBack: true,  showProgress: true },
  { id: "dores",        type: "slider_group_pain",    showBack: true,  showProgress: true },
  { id: "loading",      type: "loading",              showBack: false, showProgress: true },
  { id: "lead",         type: "lead_capture",         showBack: true,  showProgress: true },
  { id: "final",        type: "final",                showBack: false, showProgress: false },
];

// Helper para encontrar o índice por id
export const indexOfStep = (id: string) => funnelSteps.findIndex((s) => s.id === id);
