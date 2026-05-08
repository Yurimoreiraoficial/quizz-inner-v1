/**
 * Analytics do funil — calculadas client-side a partir de eventos reais.
 *
 * Lê funnel_events / funnel_leads / funnel_screens / ab_tests+variants e
 * devolve macros, micro-conversão por etapa, rotas finais, A/B e segmentos.
 * Aplica filtros (período, origem, campanha, mercado, variante, tema, rota).
 */
import { supabase } from "@/integrations/supabase/client";
import { getCurrentFunnelId } from "./funnelService";
import { funnelConfig, type FunnelScreen } from "@/data/funnelConfig";

// ----------------------------------------------------------------
// Types
// ----------------------------------------------------------------
export type ScreenStatus = "entrada" | "saudavel" | "atencao" | "risco" | "critico";
export type RouteFilter = "todos" | "checkout" | "whatsapp" | "ultra";
export type ThemeFilter = "todos" | "dark" | "light";

export interface AnalyticsFilters {
  rangeDays: 7 | 15 | 30 | 0;       // 0 = customizado
  startDate?: string;                // ISO
  endDate?: string;                  // ISO
  source?: string;                   // utm_source
  campaign?: string;                 // utm_campaign
  mercado?: string;                  // segmento
  variantId?: string;                // ab_variant
  theme?: ThemeFilter;
  route?: RouteFilter;
}

export interface MacroStats {
  visitors: number;
  starts: number;
  leads: number;
  checkoutClicks: number;
  whatsappClicks: number;
  purchases: number;
  revenue: number;
  cac?: number;
  roas?: number;
}

export interface ScreenMicroRow {
  screen_key: string;
  name: string;
  type: string;
  users: number;
  lossPct: number;        // perda vs etapa anterior
  convPrevPct: number;    // conversão vs etapa anterior
  convAccPct: number;     // conversão acumulada
  avgTimeSec: number;
  mainAction: string;
  status: ScreenStatus;
}

export interface RouteStats {
  checkout: number;
  whatsapp: number;
  ultra: number;
}

export interface AbVariantStats {
  test_id: string;
  test_name: string;
  variant_id: string;
  variant_label: string;
  visitors: number;
  leads: number;
  checkout: number;
  whatsapp: number;
  purchases: number;
  conversion: number; // métrica principal (lead/visitors por padrão)
}

export interface SegmentRow { label: string; count: number; share: number }

export interface SegmentStats {
  mercado: SegmentRow[];
  uso_ia: SegmentRow[];
  tarefas: SegmentRow[];
  dores: SegmentRow[];
  interesse_ultra: SegmentRow[];
  plano: SegmentRow[];
}

export interface AvailableFilters {
  sources: string[];
  campaigns: string[];
  mercados: string[];
  variants: { id: string; label: string }[];
}

export interface FunnelAnalytics {
  filters: AnalyticsFilters;
  available: AvailableFilters;
  macros: MacroStats;
  byScreen: ScreenMicroRow[];
  routes: RouteStats;
  abVariants: AbVariantStats[];
  segments: SegmentStats;
  totalEvents: number;
  // legacy compat (a UI antiga ainda lê):
  totalSessions: number;
  totalLeads: number;
}

// ----------------------------------------------------------------
// Mapas de eventos canônicos x legados
// ----------------------------------------------------------------
const EV_FUNNEL_VIEW   = new Set(["funnel_view"]);
const EV_FUNNEL_START  = new Set(["funnel_start", "quiz_started"]);
const EV_SCREEN_VIEW   = new Set(["screen_view", "step_viewed"]);
const EV_LEAD          = new Set(["lead_submit", "lead_submitted"]);
const EV_CHECKOUT      = new Set(["checkout_click", "checkout_clicked"]);
const EV_WHATSAPP      = new Set(["whatsapp_click", "whatsapp_clicked"]);
const EV_ULTRA         = new Set(["ultra_interest"]);
const EV_PURCHASE      = new Set(["purchase"]);

// ----------------------------------------------------------------
// API
// ----------------------------------------------------------------
const empty: FunnelAnalytics = {
  filters: { rangeDays: 30, theme: "todos", route: "todos" },
  available: { sources: [], campaigns: [], mercados: [], variants: [] },
  macros: { visitors: 0, starts: 0, leads: 0, checkoutClicks: 0, whatsappClicks: 0, purchases: 0, revenue: 0 },
  byScreen: [],
  routes: { checkout: 0, whatsapp: 0, ultra: 0 },
  abVariants: [],
  segments: { mercado: [], uso_ia: [], tarefas: [], dores: [], interesse_ultra: [], plano: [] },
  totalEvents: 0,
  totalSessions: 0,
  totalLeads: 0,
};

export async function loadAnalytics(filters: AnalyticsFilters = { rangeDays: 30, theme: "todos", route: "todos" }): Promise<FunnelAnalytics> {
  try {
    const funnel_id = await getCurrentFunnelId();
    if (!funnel_id) return empty;

    const range = computeRange(filters);
    const screensCfg = funnelConfig.screens;

    // Buscar dados em paralelo
    const eventsQ = supabase
      .from("funnel_events")
      .select("session_id, screen_key, event_name, event_data, source, medium, campaign, device, ab_test_id, variant_id, lead_id, created_at")
      .eq("funnel_id", funnel_id)
      .gte("created_at", range.start.toISOString())
      .lte("created_at", range.end.toISOString())
      .order("created_at", { ascending: true })
      .limit(10000);

    const leadsQ = supabase
      .from("funnel_leads")
      .select("id, session_id, answers, source, medium, campaign, created_at")
      .eq("funnel_id", funnel_id)
      .gte("created_at", range.start.toISOString())
      .lte("created_at", range.end.toISOString())
      .limit(5000);

    const screensQ = supabase
      .from("funnel_screens")
      .select("screen_key, name, type, order_index")
      .eq("funnel_id", funnel_id)
      .order("order_index", { ascending: true });

    const abQ = supabase
      .from("ab_tests")
      .select("id, name, screen_key, status, ab_variants(id, label, status)")
      .eq("funnel_id", funnel_id);

    const [evRes, leadsRes, screensRes, abRes] = await Promise.all([eventsQ, leadsQ, screensQ, abQ]);

    const screensRows = (screensRes.data ?? []) as Array<{ screen_key: string; name: string; type: string; order_index: number }>;
    const orderedScreens = screensRows.length
      ? screensRows.sort((a, b) => a.order_index - b.order_index).map((r) => ({ id: r.screen_key, name: r.name, type: r.type } as Pick<FunnelScreen, "id" | "name" | "type">))
      : screensCfg.map((s) => ({ id: s.id, name: s.name, type: s.type }));

    type EvRow = {
      session_id: string;
      screen_key: string | null;
      event_name: string;
      event_data: Record<string, unknown> | null;
      source: string | null;
      medium: string | null;
      campaign: string | null;
      device: string | null;
      variant_id: string | null;
      ab_test_id: string | null;
      lead_id: string | null;
      created_at: string;
    };

    let events = ((evRes.data ?? []) as EvRow[]).filter((e) => {
      // Filtra preview
      const preview = (e.event_data as Record<string, unknown> | null)?.preview === true;
      if (preview) return false;
      return true;
    });

    // Catálogo de filtros disponíveis (calculado antes dos filtros aplicáveis)
    const available: AvailableFilters = {
      sources: uniq(events.map((e) => e.source).filter(Boolean) as string[]),
      campaigns: uniq(events.map((e) => e.campaign).filter(Boolean) as string[]),
      mercados: uniq(((leadsRes.data ?? []) as Array<{ answers: Record<string, unknown> | null }>)
        .map((l) => readPath(l.answers, "summary.mercado") as string | undefined)
        .filter(Boolean) as string[]),
      variants: ((abRes.data ?? []) as Array<{ ab_variants: Array<{ id: string; label: string }> }>)
        .flatMap((t) => t.ab_variants ?? [])
        .map((v) => ({ id: v.id, label: v.label })),
    };

    // Aplica filtros
    if (filters.source)   events = events.filter((e) => e.source === filters.source);
    if (filters.campaign) events = events.filter((e) => e.campaign === filters.campaign);
    if (filters.variantId) events = events.filter((e) => e.variant_id === filters.variantId);
    if (filters.theme && filters.theme !== "todos") {
      events = events.filter((e) => ((e.event_data as Record<string, unknown> | null)?.theme ?? "dark") === filters.theme);
    }

    // Filtra leads de acordo (mercado)
    let leads = (leadsRes.data ?? []) as Array<{ id: string; session_id: string; answers: Record<string, unknown> | null; source: string | null; campaign: string | null }>;
    if (filters.source)   leads = leads.filter((l) => l.source === filters.source);
    if (filters.campaign) leads = leads.filter((l) => l.campaign === filters.campaign);
    if (filters.mercado)  leads = leads.filter((l) => readPath(l.answers, "summary.mercado") === filters.mercado);

    // Sessões válidas após filtros
    let validSessions = new Set(events.map((e) => e.session_id));

    // Filtro por rota final: precisa ter disparado o evento correspondente
    if (filters.route && filters.route !== "todos") {
      const target = filters.route === "checkout" ? EV_CHECKOUT : filters.route === "whatsapp" ? EV_WHATSAPP : EV_ULTRA;
      const sessionsWithRoute = new Set(events.filter((e) => target.has(e.event_name)).map((e) => e.session_id));
      validSessions = new Set([...validSessions].filter((s) => sessionsWithRoute.has(s)));
      events = events.filter((e) => validSessions.has(e.session_id));
      leads = leads.filter((l) => validSessions.has(l.session_id));
    }

    // ---------- Macros ----------
    const sessionsWith = (set: Set<string>) =>
      new Set(events.filter((e) => set.has(e.event_name)).map((e) => e.session_id)).size;

    const visitors = validSessions.size; // qualquer evento conta como visitante
    const starts   = sessionsWith(EV_FUNNEL_START) || sessionsWith(EV_SCREEN_VIEW); // fallback
    const leadsCount   = sessionsWith(EV_LEAD);
    const checkoutClicks = events.filter((e) => EV_CHECKOUT.has(e.event_name)).length;
    const whatsappClicks = events.filter((e) => EV_WHATSAPP.has(e.event_name)).length;
    const purchases = events.filter((e) => EV_PURCHASE.has(e.event_name)).length;
    const revenue = events
      .filter((e) => EV_PURCHASE.has(e.event_name))
      .reduce((acc, e) => acc + Number((e.event_data as Record<string, unknown> | null)?.value ?? 0), 0);

    const macros: MacroStats = { visitors, starts, leads: leadsCount, checkoutClicks, whatsappClicks, purchases, revenue };

    // ---------- Por tela (micro-conversão) ----------
    // Conta sessões únicas que viram cada tela (ev SCREEN_VIEW por screen_key)
    const usersByScreen = new Map<string, Set<string>>();
    const timesByScreen = new Map<string, number[]>();
    // Para tempo médio: pareia screen_view consecutivos da mesma sessão
    const sessionEvents = new Map<string, EvRow[]>();
    for (const e of events) {
      if (!sessionEvents.has(e.session_id)) sessionEvents.set(e.session_id, []);
      sessionEvents.get(e.session_id)!.push(e);
    }
    for (const [, list] of sessionEvents) {
      list.sort((a, b) => a.created_at.localeCompare(b.created_at));
      let lastScreen: string | null = null;
      let lastTs: number | null = null;
      for (const ev of list) {
        if (EV_SCREEN_VIEW.has(ev.event_name) && ev.screen_key) {
          if (!usersByScreen.has(ev.screen_key)) usersByScreen.set(ev.screen_key, new Set());
          usersByScreen.get(ev.screen_key)!.add(ev.session_id);
          const ts = new Date(ev.created_at).getTime();
          if (lastScreen && lastTs != null) {
            const dt = (ts - lastTs) / 1000;
            if (dt > 0 && dt < 60 * 30) {
              if (!timesByScreen.has(lastScreen)) timesByScreen.set(lastScreen, []);
              timesByScreen.get(lastScreen)!.push(dt);
            }
          }
          lastScreen = ev.screen_key;
          lastTs = ts;
        }
      }
    }

    const firstUsers = usersByScreen.get(orderedScreens[0]?.id ?? "")?.size ?? visitors;
    const byScreen: ScreenMicroRow[] = orderedScreens.map((s, i) => {
      const users = usersByScreen.get(s.id)?.size ?? 0;
      const prevUsers = i === 0 ? users : usersByScreen.get(orderedScreens[i - 1].id)?.size ?? 0;
      const lossPct = i === 0 ? 0 : prevUsers ? Math.max(0, (1 - users / prevUsers) * 100) : 0;
      const convPrevPct = i === 0 ? 100 : prevUsers ? (users / prevUsers) * 100 : 0;
      const convAccPct = firstUsers ? (users / firstUsers) * 100 : 0;
      const times = timesByScreen.get(s.id) ?? [];
      const avgTimeSec = times.length ? times.reduce((a, b) => a + b, 0) / times.length : 0;
      const status: ScreenStatus =
        i === 0 ? "entrada" :
        lossPct < 10 ? "saudavel" :
        lossPct < 20 ? "atencao" :
        lossPct < 35 ? "risco" : "critico";
      const mainAction =
        s.type === "lead_capture" ? "Envio do formulário" :
        s.type === "final" ? "Checkout / WhatsApp" :
        s.type === "single_choice" ? "Seleção de opção" :
        s.type === "slider_group_market" || s.type === "slider_group_pain" ? "Sliders" :
        s.type === "loading" ? "Aguardar" :
        "Avançar";
      return { screen_key: s.id, name: s.name, type: s.type, users, lossPct, convPrevPct, convAccPct, avgTimeSec, mainAction, status };
    });

    // ---------- Rotas finais ----------
    const routes: RouteStats = {
      checkout: new Set(events.filter((e) => EV_CHECKOUT.has(e.event_name)).map((e) => e.session_id)).size,
      whatsapp: new Set(events.filter((e) => EV_WHATSAPP.has(e.event_name)).map((e) => e.session_id)).size,
      ultra: new Set(events.filter((e) => EV_ULTRA.has(e.event_name)).map((e) => e.session_id)).size,
    };

    // ---------- A/B ----------
    type AbTestRow = { id: string; name: string; status: string; ab_variants: Array<{ id: string; label: string }> };
    const abTests = (abRes.data ?? []) as AbTestRow[];
    const abVariants: AbVariantStats[] = abTests.flatMap((t) =>
      (t.ab_variants ?? []).map((v) => {
        const evs = events.filter((e) => e.variant_id === v.id);
        const sessions = new Set(evs.map((e) => e.session_id));
        const visit = sessions.size;
        const lead = new Set(evs.filter((e) => EV_LEAD.has(e.event_name)).map((e) => e.session_id)).size;
        const co = evs.filter((e) => EV_CHECKOUT.has(e.event_name)).length;
        const wp = evs.filter((e) => EV_WHATSAPP.has(e.event_name)).length;
        const pu = evs.filter((e) => EV_PURCHASE.has(e.event_name)).length;
        return {
          test_id: t.id,
          test_name: t.name,
          variant_id: v.id,
          variant_label: v.label,
          visitors: visit,
          leads: lead,
          checkout: co,
          whatsapp: wp,
          purchases: pu,
          conversion: visit ? (lead / visit) * 100 : 0,
        };
      }),
    );

    // ---------- Segmentos por respostas (a partir de leads.answers.summary) ----------
    const segments = computeSegments(leads);

    return {
      filters,
      available,
      macros,
      byScreen,
      routes,
      abVariants,
      segments,
      totalEvents: events.length,
      totalSessions: visitors,
      totalLeads: leads.length,
    };
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("[analytics] loadAnalytics failed", err);
    return empty;
  }
}

// ----------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------
function computeRange(f: AnalyticsFilters): { start: Date; end: Date } {
  const end = f.endDate ? new Date(f.endDate) : new Date();
  if (f.rangeDays === 0 && f.startDate) {
    return { start: new Date(f.startDate), end };
  }
  const days = f.rangeDays || 30;
  const start = new Date(end);
  start.setDate(start.getDate() - days);
  return { start, end };
}

function uniq<T>(arr: T[]): T[] { return Array.from(new Set(arr)); }

function readPath(obj: unknown, path: string): unknown {
  if (!obj || typeof obj !== "object") return undefined;
  return path.split(".").reduce<unknown>((acc, k) => {
    if (acc && typeof acc === "object" && k in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[k];
    }
    return undefined;
  }, obj);
}

function bucketize(values: string[]): SegmentRow[] {
  const map = new Map<string, number>();
  for (const v of values) map.set(v, (map.get(v) ?? 0) + 1);
  const total = values.length || 1;
  return Array.from(map.entries())
    .map(([label, count]) => ({ label, count, share: (count / total) * 100 }))
    .sort((a, b) => b.count - a.count);
}

function computeSegments(leads: Array<{ answers: Record<string, unknown> | null }>): SegmentStats {
  const mercado: string[] = [];
  const usoIa: string[] = [];
  const tarefas: string[] = [];
  const dores: string[] = [];
  const ultra: string[] = [];
  const plano: string[] = [];
  for (const l of leads) {
    const m = readPath(l.answers, "summary.mercado") as string | undefined;
    const u = readPath(l.answers, "summary.uso_ia") as string | undefined;
    const tps = readPath(l.answers, "summary.tarefas_principais") as string[] | undefined;
    const dps = readPath(l.answers, "summary.dores_principais") as string[] | undefined;
    const uf = readPath(l.answers, "summary.ultra_flag") as boolean | undefined;
    const pl = readPath(l.answers, "summary.plano_sugerido") as string | undefined;
    if (m) mercado.push(m);
    if (u) usoIa.push(u);
    if (Array.isArray(tps)) tarefas.push(...tps);
    if (Array.isArray(dps)) dores.push(...dps);
    if (uf != null) ultra.push(uf ? "Interesse Ultra" : "Sem interesse");
    if (pl) plano.push(pl);
  }
  return {
    mercado: bucketize(mercado),
    uso_ia: bucketize(usoIa),
    tarefas: bucketize(tarefas),
    dores: bucketize(dores),
    interesse_ultra: bucketize(ultra),
    plano: bucketize(plano),
  };
}
