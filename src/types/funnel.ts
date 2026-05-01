// Types centrais do funil — fáceis de editar/expandir
export type Market =
  | "tecnologia"
  | "educacao"
  | "juridico"
  | "negocios"
  | "marketing"
  | "design"
  | "outro";

export type AiUsage =
  | "pago_uma"
  | "pago_varias"
  | "gratuitas"
  | "nao_uso";

export type FitLevel = "Alto" | "Médio";
export type RecommendedPlan = "Plano PRO" | "Plano PRO com avaliação do Plano Ultra";

export type SliderValue = "Nunca" | "Às vezes" | "Muito";
export type FrequencyValue = "Nunca" | "Raramente" | "Às vezes" | "Frequentemente";

export type StepType =
  | "intro"
  | "single_choice"
  | "insert"
  | "slider_group_market"
  | "slider_group_pain"
  | "loading"
  | "lead_capture"
  | "final";

export interface OptionItem {
  value: string;
  label: string;
}

export interface FunnelStepBase {
  id: string;
  type: StepType;
  showBack?: boolean;
  showProgress?: boolean;
}

export interface UTMs {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  fbclid?: string;
  gclid?: string;
  referrer?: string;
  device?: string;
  user_agent?: string;
}

export interface QuizAnswer {
  questionId: string;
  questionLabel: string;
  answerValue: string;
  answerLabel: string;
  metadata?: Record<string, unknown>;
}

export interface FunnelState {
  currentStepIndex: number;
  sessionId: string | null;
  leadId: string | null;
  usoIA?: AiUsage;
  usoIALabel?: string;
  mercado?: Market;
  mercadoLabel?: string;
  tarefas: Record<string, SliderValue>;          // taskKey -> value
  dores: Record<string, FrequencyValue>;          // painKey -> value
  nome?: string;
  whatsapp?: string;
  nivelEncaixe?: FitLevel;
  planoSugerido?: RecommendedPlan;
  ultraFlag: boolean;
  tarefasPrincipais: string[];                    // labels
  doresPrincipais: string[];                      // labels
  utms: UTMs;
  answers: QuizAnswer[];
}

export type EventName =
  | "quiz_started"
  | "step_viewed"
  | "option_selected"
  | "slider_changed"
  | "back_clicked"
  | "lead_submitted"
  | "result_viewed"
  | "checkout_clicked"
  | "whatsapp_clicked"
  | "quiz_completed";
