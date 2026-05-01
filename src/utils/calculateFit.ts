// Cálculo de fit baseado nas regras do brief
import type { FunnelState, FitLevel, RecommendedPlan, SliderValue } from "@/types/funnel";
import { taskOptionsByMarket } from "@/data/taskOptionsByMarket";

export interface FitResult {
  ultraFlag: boolean;
  nivelEncaixe: FitLevel;
  planoSugerido: RecommendedPlan;
}

export function calculateFit(state: Pick<FunnelState, "tarefas" | "mercado">): FitResult {
  let ultraFlag = false;
  if (state.mercado) {
    const tasks = taskOptionsByMarket[state.mercado];
    for (const t of tasks) {
      const v = state.tarefas[t.id] as SliderValue | undefined;
      if (!v) continue;
      // Imagens com "Muito" ativa Ultra
      if (t.imageHeavy && v === "Muito") ultraFlag = true;
      // Vídeos com "Às vezes" ou "Muito" ativa Ultra
      if (t.videoHeavy && (v === "Às vezes" || v === "Muito")) ultraFlag = true;
    }
  }

  const nivelEncaixe: FitLevel = ultraFlag ? "Médio" : "Alto";
  const planoSugerido: RecommendedPlan = ultraFlag
    ? "Plano PRO com avaliação do Plano Ultra"
    : "Plano PRO";

  return { ultraFlag, nivelEncaixe, planoSugerido };
}
