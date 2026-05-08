/**
 * Tracking central do Inner AI — Funil Builder.
 *
 * - `trackFunnelEvent(eventName, data?)` é o ponto único de tracking.
 * - Eventos vão para `funnel_events` (Supabase) com contexto completo
 *   (UTMs, device, theme, referrer, public_url, ab_test/variant…).
 * - Falhas nunca bloqueiam a UI do funil; caem em fallback local.
 * - Preview interno (rotas /admin) NÃO dispara eventos reais.
 */
import type { EventName } from "@/types/funnel";
import { supabase } from "@/integrations/supabase/client";
import { getCurrentFunnelId } from "./funnelService";
import { getStoredUtms } from "@/hooks/useUtmParams";

// ----------------------------------------------------------------
// Eventos canônicos
// ----------------------------------------------------------------
export type FunnelEventName =
  | "funnel_view"
  | "screen_view"
  | "funnel_start"
  | "screen_answer"
  | "screen_next"
  | "screen_back"
  | "lead_submit"
  | "result_view"
  | "checkout_click"
  | "whatsapp_click"
  | "ultra_interest"
  | "ab_variant_view";

export interface TrackFunnelEventData {
  screen_key?: string | null;
  lead_id?: string | null;
  ab_test_id?: string | null;
  variant_id?: string | null;
  /** Payload livre de evento (será mesclado em event_data). */
  payload?: Record<string, unknown>;
  /** Marca explicitamente como preview (não envia ao Supabase). */
  preview?: boolean;
  /** Override do session_id (default: gerado/persistido em localStorage). */
  sessionId?: string | null;
}

// ----------------------------------------------------------------
// Session id persistente
// ----------------------------------------------------------------
const SESSION_KEY = "innerai_session_id_v1";
const EVENTS_KEY = "innerai_events_v1";
const LEAD_ID_KEY = "innerai_lead_id_v1";

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `s_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return newId();
  try {
    let sid = localStorage.getItem(SESSION_KEY);
    if (!sid) {
      sid = newId();
      localStorage.setItem(SESSION_KEY, sid);
    }
    return sid;
  } catch {
    return newId();
  }
}

/** Lead ativo da sessão atual (associado automaticamente aos próximos eventos). */
export function getActiveLeadId(): string | null {
  if (typeof window === "undefined") return null;
  try { return localStorage.getItem(LEAD_ID_KEY); } catch { return null; }
}

export function setActiveLeadId(id: string | null) {
  if (typeof window === "undefined") return;
  try {
    if (id) localStorage.setItem(LEAD_ID_KEY, id);
    else localStorage.removeItem(LEAD_ID_KEY);
  } catch {/* noop */}
}

// ----------------------------------------------------------------
// Contexto (device, theme, url, preview)
// ----------------------------------------------------------------
function detectDevice(): "mobile" | "tablet" | "desktop" {
  if (typeof navigator === "undefined") return "desktop";
  const ua = navigator.userAgent;
  if (/Tablet|iPad/i.test(ua)) return "tablet";
  if (/Mobi|Android|iPhone|iPod/i.test(ua)) return "mobile";
  return "desktop";
}

function detectTheme(): "light" | "dark" {
  if (typeof document === "undefined") return "dark";
  if (document.documentElement.classList.contains("dark")) return "dark";
  if (document.documentElement.classList.contains("light")) return "light";
  // O funil público "/dark" usa tema escuro por padrão.
  if (typeof location !== "undefined" && location.pathname.startsWith("/dark")) return "dark";
  return "light";
}

/** Preview interno: rotas do admin ou flag global. Eventos não vão pro backend. */
export function isPreviewContext(): boolean {
  if (typeof window === "undefined") return true;
  const w = window as unknown as { __INNER_PREVIEW__?: boolean };
  if (w.__INNER_PREVIEW__) return true;
  const p = window.location.pathname;
  if (p.startsWith("/admin")) return true;
  const params = new URLSearchParams(window.location.search);
  if (params.get("preview") === "1") return true;
  return false;
}

function publicUrl(): string {
  if (typeof window === "undefined") return "";
  return window.location.origin + window.location.pathname;
}

// ----------------------------------------------------------------
// Persistência local (fallback)
// ----------------------------------------------------------------
interface LocalEventRecord {
  funnel_id: string | null;
  session_id: string;
  event_name: string;
  screen_key: string | null;
  event_data: Record<string, unknown>;
  ab_test_id: string | null;
  variant_id: string | null;
  lead_id: string | null;
  source: string | null;
  medium: string | null;
  campaign: string | null;
  device: string;
  theme: string;
  public_url: string;
  preview: boolean;
  created_at: string;
}

function pushLocal(rec: LocalEventRecord) {
  try {
    const raw = localStorage.getItem(EVENTS_KEY);
    const arr: LocalEventRecord[] = raw ? JSON.parse(raw) : [];
    arr.push(rec);
    if (arr.length > 500) arr.splice(0, arr.length - 500);
    localStorage.setItem(EVENTS_KEY, JSON.stringify(arr));
  } catch {/* noop */}
}

export function getLocalEvents(): LocalEventRecord[] {
  try {
    const raw = localStorage.getItem(EVENTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// ----------------------------------------------------------------
// API principal
// ----------------------------------------------------------------
export function trackFunnelEvent(
  eventName: FunnelEventName | string,
  data: TrackFunnelEventData = {},
): void {
  // Build context — síncrono, nunca lança.
  const utms = getStoredUtms();
  const sessionId = data.sessionId ?? getOrCreateSessionId();
  const preview = data.preview ?? isPreviewContext();
  const leadId = data.lead_id ?? getActiveLeadId();

  const rec: LocalEventRecord = {
    funnel_id: null, // resolvido async
    session_id: sessionId,
    event_name: String(eventName),
    screen_key: data.screen_key ?? null,
    event_data: {
      ...(data.payload ?? {}),
      referrer: utms.referrer ?? (typeof document !== "undefined" ? document.referrer : undefined),
      utm_term: utms.utm_term ?? null,
      utm_content: utms.utm_content ?? null,
      preview,
    },
    ab_test_id: data.ab_test_id ?? null,
    variant_id: data.variant_id ?? null,
    lead_id: leadId,
    source: utms.utm_source ?? null,
    medium: utms.utm_medium ?? null,
    campaign: utms.utm_campaign ?? null,
    device: detectDevice(),
    theme: detectTheme(),
    public_url: publicUrl(),
    preview,
    created_at: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    // eslint-disable-next-line no-console
    console.log("[track]", rec.event_name, { preview, screen: rec.screen_key });
    pushLocal(rec);
  }

  // Preview interno: não envia ao backend.
  if (preview) return;

  // Best-effort para Supabase. Nunca bloqueia.
  void persistRemote(rec);
}

async function persistRemote(rec: LocalEventRecord) {
  try {
    const funnel_id = await getCurrentFunnelId();
    if (!funnel_id) return;
    const { error } = await supabase.from("funnel_events").insert({
      funnel_id,
      session_id: rec.session_id,
      event_name: rec.event_name,
      screen_key: rec.screen_key,
      event_data: rec.event_data as never,
      ab_test_id: rec.ab_test_id,
      variant_id: rec.variant_id,
      lead_id: rec.lead_id,
      source: rec.source,
      medium: rec.medium,
      campaign: rec.campaign,
      device: rec.device,
    });
    if (error) {
      // eslint-disable-next-line no-console
      console.warn("[track] supabase insert error", error.message);
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn("[track] persistRemote failed", e);
  }
}

// ----------------------------------------------------------------
// Compat layer — mapeia eventos legados para os canônicos
// ----------------------------------------------------------------
const LEGACY_MAP: Record<EventName, FunnelEventName> = {
  quiz_started:     "funnel_start",
  step_viewed:      "screen_view",
  option_selected:  "screen_answer",
  slider_changed:   "screen_answer",
  back_clicked:     "screen_back",
  lead_submitted:   "lead_submit",
  result_viewed:    "result_view",
  checkout_clicked: "checkout_click",
  whatsapp_clicked: "whatsapp_click",
  quiz_completed:   "funnel_view",
};

/**
 * @deprecated use `trackFunnelEvent` diretamente. Mantido para compat
 * com os call sites atuais (useFunnelState, Index, FinalResultPage).
 */
export function trackEvent(
  sessionId: string | null,
  eventName: EventName,
  payload: { stepId?: string; stepIndex?: number; metadata?: Record<string, unknown> } = {},
) {
  trackFunnelEvent(LEGACY_MAP[eventName] ?? eventName, {
    sessionId: sessionId ?? undefined,
    screen_key: payload.stepId ?? null,
    payload: {
      ...(payload.metadata ?? {}),
      ...(payload.stepIndex != null ? { step_index: payload.stepIndex } : {}),
      legacy_event: eventName,
    },
  });
}
