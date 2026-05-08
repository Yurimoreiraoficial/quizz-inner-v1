// Tracking modular — Fase 1: console + localStorage; Fase 2: troca para Supabase
import type { EventName } from "@/types/funnel";
import { supabase } from "@/integrations/supabase/client";
import { getCurrentFunnelId } from "./funnelService";

const EVENTS_KEY = "innerai_events_v1";

interface EventRecord {
  sessionId: string | null;
  eventName: EventName;
  stepId?: string;
  stepIndex?: number;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

function pushLocal(rec: EventRecord) {
  try {
    const raw = localStorage.getItem(EVENTS_KEY);
    const arr: EventRecord[] = raw ? JSON.parse(raw) : [];
    arr.push(rec);
    // limita
    if (arr.length > 500) arr.splice(0, arr.length - 500);
    localStorage.setItem(EVENTS_KEY, JSON.stringify(arr));
  } catch {/* noop */}
}

export function trackEvent(
  sessionId: string | null,
  eventName: EventName,
  payload: { stepId?: string; stepIndex?: number; metadata?: Record<string, unknown> } = {}
) {
  const rec: EventRecord = {
    sessionId,
    eventName,
    stepId: payload.stepId,
    stepIndex: payload.stepIndex,
    metadata: payload.metadata,
    createdAt: new Date().toISOString(),
  };
  if (typeof window !== "undefined") {
    // eslint-disable-next-line no-console
    console.log("[track]", eventName, rec);
    pushLocal(rec);
  }
  // Fase 2: best-effort para Supabase. Não bloqueia a UI.
  void persistRemote(rec);
}

async function persistRemote(rec: EventRecord) {
  try {
    if (!rec.sessionId) return;
    const funnel_id = await getCurrentFunnelId();
    if (!funnel_id) return;
    await supabase.from("funnel_events").insert({
      funnel_id,
      session_id: rec.sessionId,
      event_name: rec.eventName,
      screen_key: rec.stepId ?? null,
      event_data: (rec.metadata ?? {}) as never,
    });
  } catch {
    /* offline-first: silenciar erro */
  }
}

export function getLocalEvents(): EventRecord[] {
  try {
    const raw = localStorage.getItem(EVENTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
