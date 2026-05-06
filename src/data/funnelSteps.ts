import type { FunnelStepBase } from "@/types/funnel";

export interface FunnelStepWithPath extends FunnelStepBase {
  /** Slug usado na URL (sem barras). */
  path: string;
}

// Ordem das etapas do funil. Edite aqui para reorganizar.
export const funnelSteps: FunnelStepWithPath[] = [
  { id: "intro",        path: "intro",         type: "intro",                showBack: false, showProgress: false },
  { id: "uso_ia",       path: "uso-ia",        type: "single_choice",        showBack: true,  showProgress: true },
  { id: "insert_50ias", path: "ias",           type: "insert",               showBack: true,  showProgress: true },
  { id: "mercado",      path: "mercado",       type: "single_choice",        showBack: true,  showProgress: true },
  { id: "insert_help",  path: "ajuda",         type: "insert",               showBack: true,  showProgress: true },
  { id: "tarefas",      path: "tarefas",       type: "slider_group_market",  showBack: true,  showProgress: true },
  { id: "insert_proof", path: "prova-social",  type: "insert",               showBack: true,  showProgress: true },
  { id: "dores",        path: "dores",         type: "slider_group_pain",    showBack: true,  showProgress: true },
  { id: "loading",      path: "analisando",    type: "loading",              showBack: false, showProgress: true },
  { id: "lead",         path: "contato",       type: "lead_capture",         showBack: true,  showProgress: true },
  { id: "final",        path: "resultado",     type: "final",                showBack: false, showProgress: false },
];

// Helper para encontrar o índice por id
export const indexOfStep = (id: string) => funnelSteps.findIndex((s) => s.id === id);

// Helper para encontrar o índice por path/slug
export const indexOfPath = (path: string) => funnelSteps.findIndex((s) => s.path === path);
