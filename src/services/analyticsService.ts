/**
 * Carrega analytics agregadas do funil a partir do Supabase.
 * Caso não haja dados, devolve estrutura vazia para o admin renderizar fallback.
 */
import { supabase } from "@/integrations/supabase/client";
import { getCurrentFunnelId } from "./funnelService";

export interface ScreenStat {
  screen_key: string;
  views: number;
}

export interface FunnelAnalytics {
  totalSessions: number;
  totalLeads: number;
  byScreen: ScreenStat[];
}

const empty: FunnelAnalytics = { totalSessions: 0, totalLeads: 0, byScreen: [] };

export async function loadAnalytics(): Promise<FunnelAnalytics> {
  try {
    const funnel_id = await getCurrentFunnelId();
    if (!funnel_id) return empty;

    const [{ data: events }, { count: leadCount }] = await Promise.all([
      supabase
        .from("funnel_events")
        .select("session_id, screen_key, event_name")
        .eq("funnel_id", funnel_id)
        .limit(5000),
      supabase
        .from("funnel_leads")
        .select("id", { count: "exact", head: true })
        .eq("funnel_id", funnel_id),
    ]);

    const sessions = new Set<string>();
    const screenCounts = new Map<string, number>();
    for (const e of events ?? []) {
      if (e.session_id) sessions.add(e.session_id);
      if (e.screen_key && e.event_name === "step_viewed") {
        screenCounts.set(e.screen_key, (screenCounts.get(e.screen_key) ?? 0) + 1);
      }
    }
    return {
      totalSessions: sessions.size,
      totalLeads: leadCount ?? 0,
      byScreen: Array.from(screenCounts.entries()).map(([screen_key, views]) => ({
        screen_key,
        views,
      })),
    };
  } catch {
    return empty;
  }
}
