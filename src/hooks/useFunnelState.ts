// Estado central do funil + ações para steps
import { useCallback, useMemo, useRef, useState } from "react";
import type { FunnelState, QuizAnswer, AiUsage, Market, SliderValue, FrequencyValue, FitLevel, RecommendedPlan } from "@/types/funnel";
import { funnelSteps } from "@/data/funnelSteps";
import { trackEvent } from "@/services/funnelTrackingService";
import { calculateFit } from "@/utils/calculateFit";
import { getStoredUtms } from "@/hooks/useUtmParams";
import { taskOptionsByMarket, painOptions } from "@/data/taskOptionsByMarket";

const initial: FunnelState = {
  currentStepIndex: 0,
  sessionId: null,
  leadId: null,
  tarefas: {},
  dores: {},
  ultraFlag: false,
  tarefasPrincipais: [],
  doresPrincipais: [],
  utms: {},
  answers: [],
};

function newSessionId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `s_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function useFunnelState() {
  const [state, setState] = useState<FunnelState>(initial);
  const startedRef = useRef(false);

  const currentStep = funnelSteps[state.currentStepIndex];

  const ensureSession = useCallback(() => {
    if (!state.sessionId) {
      const sid = newSessionId();
      const utms = getStoredUtms();
      setState((s) => ({ ...s, sessionId: sid, utms }));
      if (!startedRef.current) {
        startedRef.current = true;
        trackEvent(sid, "quiz_started", { stepId: "intro", stepIndex: 0, metadata: { utms } });
      }
      return sid;
    }
    return state.sessionId;
  }, [state.sessionId]);

  const goToIndex = useCallback((idx: number) => {
    setState((s) => ({ ...s, currentStepIndex: idx }));
    const next = funnelSteps[idx];
    if (next) {
      trackEvent(state.sessionId, "step_viewed", { stepId: next.id, stepIndex: idx });
    }
  }, [state.sessionId]);

  const goNext = useCallback(() => {
    const sid = ensureSession();
    const nextIdx = Math.min(state.currentStepIndex + 1, funnelSteps.length - 1);
    setState((s) => ({ ...s, currentStepIndex: nextIdx }));
    const next = funnelSteps[nextIdx];
    if (next) trackEvent(sid, "step_viewed", { stepId: next.id, stepIndex: nextIdx });
  }, [state.currentStepIndex, ensureSession]);

  const goBack = useCallback(() => {
    const prevIdx = Math.max(state.currentStepIndex - 1, 0);
    trackEvent(state.sessionId, "back_clicked", {
      stepId: currentStep?.id, stepIndex: state.currentStepIndex,
    });
    setState((s) => ({ ...s, currentStepIndex: prevIdx }));
  }, [state.currentStepIndex, currentStep, state.sessionId]);

  const recordAnswer = useCallback((a: QuizAnswer) => {
    setState((s) => ({
      ...s,
      answers: [...s.answers.filter((x) => x.questionId !== a.questionId), a],
    }));
  }, []);

  const setUsoIA = useCallback((value: AiUsage, label: string) => {
    setState((s) => ({ ...s, usoIA: value, usoIALabel: label }));
    recordAnswer({
      questionId: "uso_ia", questionLabel: "Qual seu uso de IA hoje?",
      answerValue: value, answerLabel: label,
    });
    trackEvent(state.sessionId, "option_selected", {
      stepId: "uso_ia", stepIndex: state.currentStepIndex,
      metadata: { question_id: "uso_ia", answer: label },
    });
  }, [recordAnswer, state.sessionId, state.currentStepIndex]);

  const setMercado = useCallback((value: Market, label: string) => {
    setState((s) => ({ ...s, mercado: value, mercadoLabel: label }));
    recordAnswer({
      questionId: "mercado", questionLabel: "Em que mercado você atua hoje?",
      answerValue: value, answerLabel: label,
    });
    trackEvent(state.sessionId, "option_selected", {
      stepId: "mercado", stepIndex: state.currentStepIndex,
      metadata: { question_id: "mercado", answer: label },
    });
  }, [recordAnswer, state.sessionId, state.currentStepIndex]);

  const setTarefa = useCallback((taskId: string, label: string, value: SliderValue) => {
    setState((s) => ({ ...s, tarefas: { ...s.tarefas, [taskId]: value } }));
    trackEvent(state.sessionId, "slider_changed", {
      stepId: "tarefas", stepIndex: state.currentStepIndex,
      metadata: { question_id: "tarefas", task: label, value },
    });
  }, [state.sessionId, state.currentStepIndex]);

  const setDor = useCallback((painId: string, label: string, value: FrequencyValue) => {
    setState((s) => ({ ...s, dores: { ...s.dores, [painId]: value } }));
    trackEvent(state.sessionId, "slider_changed", {
      stepId: "dores", stepIndex: state.currentStepIndex,
      metadata: { question_id: "dores", pain: label, value },
    });
  }, [state.sessionId, state.currentStepIndex]);

  // Calcula fit + finaliza tarefas/dores principais quando avançamos da tela 6/8
  const finalizeTasksAndPains = useCallback(() => {
    setState((s) => {
      const fit = calculateFit({ tarefas: s.tarefas, mercado: s.mercado });
      const taskList = s.mercado ? taskOptionsByMarket[s.mercado] : [];
      const tarefasPrincipais = taskList
        .filter((t) => s.tarefas[t.id] === "Muito" || s.tarefas[t.id] === "Às vezes")
        .map((t) => t.label);
      const doresPrincipais = painOptions
        .filter((p) => s.dores[p.id] === "Muito" || s.dores[p.id] === "Às vezes")
        .map((p) => p.label);
      // salva respostas consolidadas
      const taskAnswers: QuizAnswer[] = taskList.map((t) => ({
        questionId: `tarefa_${t.id}`,
        questionLabel: t.label,
        answerValue: s.tarefas[t.id] ?? "Nunca",
        answerLabel: s.tarefas[t.id] ?? "Nunca",
      }));
      const painAnswers: QuizAnswer[] = painOptions.map((p) => ({
        questionId: `dor_${p.id}`,
        questionLabel: p.label,
        answerValue: s.dores[p.id] ?? "Nunca",
        answerLabel: s.dores[p.id] ?? "Nunca",
      }));
      const merged = [
        ...s.answers.filter((a) => !a.questionId.startsWith("tarefa_") && !a.questionId.startsWith("dor_")),
        ...taskAnswers,
        ...painAnswers,
      ];
      return {
        ...s,
        answers: merged,
        tarefasPrincipais,
        doresPrincipais,
        ultraFlag: fit.ultraFlag,
        nivelEncaixe: fit.nivelEncaixe as FitLevel,
        planoSugerido: fit.planoSugerido as RecommendedPlan,
      };
    });
  }, []);

  const submitLead = useCallback((nome: string, whatsapp: string) => {
    const leadId = newSessionId();
    setState((s) => ({ ...s, nome, whatsapp, leadId }));
    trackEvent(state.sessionId, "lead_submitted", {
      stepId: "lead", stepIndex: state.currentStepIndex,
      metadata: { has_name: !!nome, phone_len: whatsapp.replace(/\D/g, "").length },
    });
    trackEvent(state.sessionId, "quiz_completed", { stepId: "lead", stepIndex: state.currentStepIndex });
    // TODO Fase 2: persistir lead em Supabase
    return leadId;
  }, [state.sessionId, state.currentStepIndex]);

  const progress = useMemo(() => {
    const total = funnelSteps.length - 1; // exclui final
    return Math.min(state.currentStepIndex / total, 1);
  }, [state.currentStepIndex]);

  return {
    state,
    setState,
    currentStep,
    goNext,
    goBack,
    goToIndex,
    ensureSession,
    setUsoIA,
    setMercado,
    setTarefa,
    setDor,
    finalizeTasksAndPains,
    submitLead,
    progress,
  };
}

export type FunnelController = ReturnType<typeof useFunnelState>;
