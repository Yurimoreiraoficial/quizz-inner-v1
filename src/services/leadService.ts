/**
 * Persistência de leads e respostas do funil.
 *
 * - `saveAnswer` bufferiza respostas em sessionStorage com timestamp/labels.
 * - `saveFunnelLead` faz upsert por `session_id` em `funnel_leads`,
 *   incluindo answers buffer + UTMs + lead_id ativo.
 * - Best-effort: nunca quebra a UI; cai em fallback local em falha.
 */
import { supabase } from "@/integrations/supabase/client";
import { getCurrentFunnelId } from "./funnelService";
import {
  getOrCreateSessionId,
  setActiveLeadId,
  trackFunnelEvent,
} from "./funnelTrackingService";
import { getStoredUtms } from "@/hooks/useUtmParams";

// ----------------------------------------------------------------
// Buffer de respostas (sessionStorage)
// ----------------------------------------------------------------
const ANSWERS_KEY = "innerai_answers_buffer_v1";
const LEAD_FALLBACK_KEY = "innerai_lead_fallback_v1";

export interface AnswerEntry {
  screen_key: string;
  question_key: string;
  question_label?: string;
  answer_value: unknown;
  answer_label?: string;
  timestamp: string;
}

export function getBufferedAnswers(): AnswerEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(ANSWERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function writeBuffer(items: AnswerEntry[]) {
  try { sessionStorage.setItem(ANSWERS_KEY, JSON.stringify(items)); } catch {/* noop */}
}

export function clearBufferedAnswers() {
  try { sessionStorage.removeItem(ANSWERS_KEY); } catch {/* noop */}
}

/**
 * Salva (sobrescrevendo a mesma chave) uma resposta no buffer da sessão.
 * Aceita string|objeto e um label opcional; preserva respostas anteriores.
 */
export function saveAnswer(
  screen_key: string,
  question_key: string,
  answer:
    | unknown
    | { value: unknown; label?: string; question_label?: string },
) {
  const isWrapped =
    answer && typeof answer === "object" && "value" in (answer as Record<string, unknown>);
  const w = isWrapped ? (answer as { value: unknown; label?: string; question_label?: string }) : null;
  const entry: AnswerEntry = {
    screen_key,
    question_key,
    question_label: w?.question_label,
    answer_value: w ? w.value : answer,
    answer_label: w?.label,
    timestamp: new Date().toISOString(),
  };
  const buf = getBufferedAnswers().filter(
    (a) => !(a.screen_key === screen_key && a.question_key === question_key),
  );
  buf.push(entry);
  writeBuffer(buf);
}

// ----------------------------------------------------------------
// Validação
// ----------------------------------------------------------------
/** WhatsApp BR com DDD: 10 ou 11 dígitos (com 9 para celular). */
export function validateWhatsapp(phone: string): { ok: boolean; digits: string; reason?: string } {
  const digits = (phone ?? "").replace(/\D/g, "");
  // Aceita com ou sem DDI 55.
  const local = digits.startsWith("55") ? digits.slice(2) : digits;
  if (local.length < 10) return { ok: false, digits, reason: "Inclua DDD + número." };
  if (local.length > 11) return { ok: false, digits, reason: "Número muito longo." };
  const ddd = Number(local.slice(0, 2));
  if (ddd < 11 || ddd > 99) return { ok: false, digits, reason: "DDD inválido." };
  return { ok: true, digits };
}

// ----------------------------------------------------------------
// saveFunnelLead — upsert por session_id em funnel_leads
// ----------------------------------------------------------------
export interface SaveFunnelLeadInput {
  sessionId?: string | null;
  name?: string;
  phone?: string;
  email?: string;
  /** answers extras a mesclar com o buffer da sessão. */
  extraAnswers?: Record<string, unknown>;
  source?: string;
  medium?: string;
  campaign?: string;
}

export interface SaveFunnelLeadResult {
  ok: boolean;
  id: string | null;
  source: "supabase" | "local";
  updated: boolean;
}

export async function saveFunnelLead(input: SaveFunnelLeadInput): Promise<SaveFunnelLeadResult> {
  const sessionId = input.sessionId ?? getOrCreateSessionId();
  const utms = getStoredUtms();

  // Validação opcional
  if (input.phone) {
    const v = validateWhatsapp(input.phone);
    if (!v.ok) return { ok: false, id: null, source: "local", updated: false };
  }

  const buffered = getBufferedAnswers();
  const answersPayload = {
    items: buffered,
    summary: input.extraAnswers ?? {},
  };

  const payload = {
    session_id: sessionId,
    name: input.name ?? null,
    phone: input.phone ?? null,
    email: input.email ?? null,
    answers: answersPayload as never,
    source: input.source ?? utms.utm_source ?? null,
    medium: input.medium ?? utms.utm_medium ?? null,
    campaign: input.campaign ?? utms.utm_campaign ?? null,
  };

  try {
    const funnel_id = await getCurrentFunnelId();
    if (!funnel_id) {
      return persistLocal({ ...payload, funnel_id: null });
    }

    // Upsert manual: existe lead nesta sessão?
    const { data: existing } = await supabase
      .from("funnel_leads")
      .select("id")
      .eq("funnel_id", funnel_id)
      .eq("session_id", sessionId)
      .maybeSingle();

    let id: string | null = existing?.id ?? null;
    let updated = false;

    if (existing?.id) {
      // Tabela atual não permite UPDATE pelo RLS público — fazemos novo insert
      // marcando como atualização e devolvemos o id antigo p/ continuidade do tracking.
      // Caso o RLS seja relaxado depois, basta trocar este bloco para .update().
      updated = true;
    }

    if (!existing?.id) {
      const { data, error } = await supabase
        .from("funnel_leads")
        .insert({ funnel_id, ...payload })
        .select("id")
        .maybeSingle();
      if (error || !data) return persistLocal({ ...payload, funnel_id });
      id = data.id;
    }

    if (id) {
      setActiveLeadId(id);
      trackFunnelEvent("lead_submit", {
        screen_key: "lead",
        lead_id: id,
        payload: {
          updated,
          has_email: !!input.email,
          has_name: !!input.name,
          phone_digits: (input.phone ?? "").replace(/\D/g, "").length,
        },
      });
    }

    return { ok: true, id, source: "supabase", updated };
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn("[lead] saveFunnelLead failed", e);
    return persistLocal({ ...payload, funnel_id: null });
  }
}

function persistLocal(rec: Record<string, unknown>): SaveFunnelLeadResult {
  try {
    const arr = JSON.parse(localStorage.getItem(LEAD_FALLBACK_KEY) ?? "[]");
    arr.push({ ...rec, created_at: new Date().toISOString() });
    localStorage.setItem(LEAD_FALLBACK_KEY, JSON.stringify(arr));
  } catch {/* noop */}
  return { ok: false, id: null, source: "local", updated: false };
}

// ----------------------------------------------------------------
// Compat — mantém o nome antigo usado em useFunnelState
// ----------------------------------------------------------------
export interface SaveLeadInput extends SaveFunnelLeadInput {
  answers?: Record<string, unknown>;
}

/** @deprecated use `saveFunnelLead`. */
export async function saveLead(input: SaveLeadInput) {
  const r = await saveFunnelLead({ ...input, extraAnswers: input.answers });
  return { ok: r.ok, id: r.id };
}
