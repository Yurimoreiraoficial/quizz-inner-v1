/**
 * Analytics do funil — calculadas client-side a partir de eventos reais.
 */
import { supabase } from "@/integrations/supabase/client";
import { getCurrentFunnelId } from "./funnelService";
import { funnelConfig, type FunnelScreen } from "@/data/funnelConfig";
import { marketOptions } from "@/data/marketOptions";

// ----------------------------------------------------------------
// Types
// ----------------------------------------------------------------
export type ScreenStatus = "entrada" | "saudavel" | "atencao" | "risco" | "critico";
export type RouteFilter = "todos" | "checkout" | "whatsapp" | "ultra";
export type ThemeFilter = "todos" | "dark" | "light";

export interface AnalyticsFilters {
  rangeDays: 7 | 15 | 30 | 0;
  startDate?: string;
  endDate?: string;
  source?: string;
  campaign?: string;
  mercado?: string;
  variantId?: string;
  theme?: ThemeFilter;
  route?: RouteFilter;
  compareWithPrevious?: boolean;
}

export interface MacroStats {
  visitors: number;
  starts: number;
  leads: number;
  checkoutClicks: number;
  whatsappClicks: number;
  purchases: number;
  revenue: number;
  revenueToday?: number;
  revenueYesterday?: number;
  investment?: number;
  investmentToday?: number;
  investmentYesterday?: number;
  roas?: number;
  roasToday?: number;
  roasYesterday?: number;
  cac?: number;
  cacToday?: number;
  cacYesterday?: number;
  comparison?: {
    visitors?: number;
    starts?: number;
    leads?: number;
    checkoutClicks?: number;
    whatsappClicks?: number;
    purchases?: number;
    revenue?: number;
    investment?: number;
    roas?: number;
    cac?: number;
  };
}

export interface ScreenMicroRow {
  screen_key: string;
  name: string;
  type: string;
  users: number;
  lossPct: number;
  convPrevPct: number;
  convAccPct: number;
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
  conversion: number;
}

export interface SegmentRow { 
  label: string; 
  count: number; 
  share: number; 
  prevCount?: number;
  visitors: number;
  leads: number;
  offers: number;
  checkout: number;
  whatsapp: number;
  purchases: number;
  prevVisitors?: number;
  prevLeads?: number;
  prevPurchases?: number;
}

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
  totalSessions: number;
  totalLeads: number;
}

// ----------------------------------------------------------------
// Eventos
// ----------------------------------------------------------------
const EV_FUNNEL_VIEW   = new Set(["funnel_view", "quiz_completed", "result_view"]);
const EV_FUNNEL_START  = new Set(["funnel_start", "quiz_started", "screen_view_intro", "step_viewed_intro"]);
const EV_SCREEN_VIEW   = new Set(["screen_view", "step_viewed", "screen_view_intro"]);
const EV_LEAD          = new Set(["lead_submit", "lead_submitted", "lead_captured"]);
const EV_CHECKOUT      = new Set(["checkout_click", "checkout_clicked"]);
const EV_WHATSAPP      = new Set(["whatsapp_click", "whatsapp_clicked"]);
const EV_ULTRA         = new Set(["ultra_interest"]);
const EV_PURCHASE      = new Set(["purchase"]);

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
    let fetchStart = range.start;
    if (filters.compareWithPrevious) {
      const durationMs = range.end.getTime() - range.start.getTime();
      fetchStart = new Date(range.start.getTime() - durationMs);
    }

    const [evRes, leadsRes, screensRes, abRes] = await Promise.all([
      supabase.from("funnel_events").select("*").eq("funnel_id", funnel_id).gte("created_at", fetchStart.toISOString()).lte("created_at", range.end.toISOString()).order("created_at", { ascending: true }).limit(25000),
      supabase.from("funnel_leads").select("*").eq("funnel_id", funnel_id).gte("created_at", fetchStart.toISOString()).lte("created_at", range.end.toISOString()).limit(15000),
      supabase.from("funnel_screens").select("*").eq("funnel_id", funnel_id).order("order_index", { ascending: true }),
      supabase.from("ab_tests").select("*, ab_variants(*)").eq("funnel_id", funnel_id)
    ]);

    type EvRow = any;
    let events = (evRes.data ?? []) as EvRow[];
    events = events.filter(e => !(e.event_data as any)?.preview);

    const available: AvailableFilters = {
      sources: uniq(events.map(e => e.source).filter(Boolean)),
      campaigns: uniq(events.map(e => e.campaign).filter(Boolean)),
      mercados: uniq((leadsRes.data ?? []).map(l => readPath((l as any).answers, "summary.mercado")).filter(Boolean) as string[]),
      variants: (abRes.data ?? []).flatMap(t => (t as any).ab_variants ?? []).map(v => ({ id: v.id, label: v.label }))
    };

    if (filters.source) events = events.filter(e => e.source === filters.source);
    if (filters.campaign) events = events.filter(e => e.campaign === filters.campaign);
    if (filters.variantId) events = events.filter(e => e.variant_id === filters.variantId);
    if (filters.theme && filters.theme !== "todos") {
      events = events.filter(e => (e.event_data?.theme ?? "dark") === filters.theme);
    }

    let leads = (leadsRes.data ?? []) as any[];
    if (filters.source) leads = leads.filter(l => l.source === filters.source);
    if (filters.campaign) leads = leads.filter(l => l.campaign === filters.campaign);

    const isCurrent = (ts: string) => new Date(ts) >= range.start;
    const currEvs = events.filter(e => isCurrent(e.created_at));
    const currLeads = leads.filter(l => isCurrent(l.created_at));
    const prevEvs = filters.compareWithPrevious ? events.filter(e => !isCurrent(e.created_at)) : [];
    const prevLeads = filters.compareWithPrevious ? leads.filter(l => !isCurrent(l.created_at)) : [];

    const getMacros = (evList: EvRow[], leadList: any[]): MacroStats => {
      const sessions = new Set(evList.map(e => e.session_id));
      const leadSessions = new Set(leadList.map(l => l.session_id));
      const visitors = sessions.size;
      const starts = new Set(evList.filter(e => EV_FUNNEL_START.has(e.event_name) || EV_FUNNEL_VIEW.has(e.event_name) || e.screen_key === "intro").map(e => e.session_id)).size;
      const leadsCount = leadSessions.size;
      const checkout = evList.filter(e => EV_CHECKOUT.has(e.event_name)).length;
      const whatsapp = evList.filter(e => EV_WHATSAPP.has(e.event_name)).length;
      const purchases = evList.filter(e => EV_PURCHASE.has(e.event_name)).length;
      const revenue = evList.filter(e => EV_PURCHASE.has(e.event_name)).reduce((acc, e) => acc + Number(e.event_data?.value ?? 0), 0);
      return { visitors, starts, leads: leadsCount, checkoutClicks: checkout, whatsappClicks: whatsapp, purchases, revenue };
    };

    const macros = getMacros(currEvs, currLeads);
    if (filters.compareWithPrevious) macros.comparison = getMacros(prevEvs, prevLeads);

    const screensCfg = (screensRes.data ?? []).length ? (screensRes.data as any[]).map(r => ({ id: r.screen_key, name: r.name, type: r.type })) : funnelConfig.screens;
    const usersByScreen = new Map<string, Set<string>>();
    for (const e of currEvs) {
      if (EV_SCREEN_VIEW.has(e.event_name) && e.screen_key) {
        if (!usersByScreen.has(e.screen_key)) usersByScreen.set(e.screen_key, new Set());
        usersByScreen.get(e.screen_key)!.add(e.session_id);
      }
    }
    const firstUsers = usersByScreen.get(screensCfg[0]?.id)?.size ?? macros.visitors;
    const byScreen: ScreenMicroRow[] = screensCfg.map((s, i) => {
      const users = usersByScreen.get(s.id)?.size ?? 0;
      const prevU = i === 0 ? firstUsers : usersByScreen.get(screensCfg[i-1].id)?.size ?? 0;
      return {
        screen_key: s.id, name: s.name, type: s.type, users,
        lossPct: i === 0 ? 0 : (prevU ? (1 - users/prevU)*100 : 0),
        convPrevPct: i === 0 ? 100 : (prevU ? (users/prevU)*100 : 0),
        convAccPct: firstUsers ? (users/firstUsers)*100 : 0,
        avgTimeSec: 0, mainAction: "Avançar", status: "saudavel"
      };
    });

    const routes: RouteStats = {
      checkout: currEvs.filter(e => EV_CHECKOUT.has(e.event_name)).length,
      whatsapp: currEvs.filter(e => EV_WHATSAPP.has(e.event_name)).length,
      ultra: currEvs.filter(e => EV_ULTRA.has(e.event_name)).length,
    };

    const abVariants: AbVariantStats[] = (abRes.data ?? []).flatMap(t => (t as any).ab_variants.map(v => {
      const vEvs = currEvs.filter(e => e.variant_id === v.id);
      const vVis = new Set(vEvs.map(e => e.session_id)).size;
      const vLead = new Set(vEvs.filter(e => EV_LEAD.has(e.event_name)).map(e => e.session_id)).size;
      return {
        test_id: t.id, test_name: t.name, variant_id: v.id, variant_label: v.label,
        visitors: vVis, leads: vLead, checkout: 0, whatsapp: 0, purchases: 0, conversion: vVis ? (vLead/vVis)*100 : 0
      };
    }));

    const segments = computeSegments(currEvs, currLeads, prevEvs, prevLeads);

    return {
      filters, available, macros, byScreen, routes, abVariants, segments,
      totalEvents: currEvs.length, totalSessions: macros.visitors, totalLeads: macros.leads,
    };
  } catch (err) {
    console.warn("[analytics] error", err);
    return empty;
  }
}

function computeSegments(evs: any[], leads: any[], prevEvs: any[], prevLeads: any[]): SegmentStats {
  const getPerf = (evList: any[], leadList: any[]) => {
    const sessionToMarket = new Map<string, string>();
    const sessionToUsoIa = new Map<string, string>();
    
    // Contadores para segmentos extras
    const counters = {
      usoIa: new Map<string, number>(),
      tarefas: new Map<string, number>(),
      dores: new Map<string, number>(),
      ultra: new Map<string, number>(),
      plano: new Map<string, number>(),
    };

    for (const l of leadList) {
      const s = l.answers?.summary || {};
      if (s.mercado) sessionToMarket.set(l.session_id, s.mercado);
      if (s.uso_ia) {
        sessionToUsoIa.set(l.session_id, s.uso_ia);
        counters.usoIa.set(s.uso_ia, (counters.usoIa.get(s.uso_ia) || 0) + 1);
      }
      if (Array.isArray(s.tarefas_principais)) {
        s.tarefas_principais.forEach((t: string) => counters.tarefas.set(t, (counters.tarefas.get(t) || 0) + 1));
      }
      if (Array.isArray(s.dores_principais)) {
        s.dores_principais.forEach((d: string) => counters.dores.set(d, (counters.dores.get(d) || 0) + 1));
      }
      if (s.plano_sugerido) {
        counters.plano.set(s.plano_sugerido, (counters.plano.get(s.plano_sugerido) || 0) + 1);
      }
      const ultraLabel = s.ultra_flag ? "Perfil Ultra" : "Perfil Regular";
      counters.ultra.set(ultraLabel, (counters.ultra.get(ultraLabel) || 0) + 1);
    }

    // Fallback para eventos (Mercado / Uso IA no meio do funil)
    for (const e of evList) {
      if (e.event_name === "screen_answer" || e.event_name === "option_selected") {
        const qId = e.event_data?.question_id;
        const ans = e.event_data?.answer;
        if (qId === "mercado" && ans && !sessionToMarket.has(e.session_id)) sessionToMarket.set(e.session_id, ans);
        if (qId === "uso_ia" && ans && !sessionToUsoIa.has(e.session_id)) sessionToUsoIa.set(e.session_id, ans);
      }
    }

    const markets = new Map<string, any>();
    const getM = (label: string) => {
      if (!markets.has(label)) markets.set(label, { label, visitors: new Set(), leads: new Set(), offers: new Set(), checkout: 0, whatsapp: 0, purchases: 0 });
      return markets.get(label);
    };
    for (const opt of marketOptions) getM(opt.label);

    for (const e of evList) {
      const mLabel = sessionToMarket.get(e.session_id);
      if (mLabel) {
        const m = getM(mLabel);
        m.visitors.add(e.session_id);
        if (EV_LEAD.has(e.event_name)) m.leads.add(e.session_id);
        if (e.screen_key === "final") m.offers.add(e.session_id);
        if (EV_CHECKOUT.has(e.event_name)) m.checkout++;
        if (EV_WHATSAPP.has(e.event_name)) m.whatsapp++;
        if (EV_PURCHASE.has(e.event_name)) m.purchases++;
      }
    }

    const toRows = (map: Map<string, number>, total: number) => 
      Array.from(map.entries()).map(([label, count]) => ({
        label, count, share: total ? (count / total) * 100 : 0, visitors: 0, leads: count, offers: 0, checkout: 0, whatsapp: 0, purchases: 0
      }));

    return {
      markets: Array.from(markets.values()).map(m => ({ ...m, visitors: m.visitors.size, leads: m.leads.size, offers: m.offers.size, count: m.leads.size })),
      usoIa: toRows(counters.usoIa, leadList.length),
      tarefas: toRows(counters.tarefas, leadList.length),
      dores: toRows(counters.dores, leadList.length),
      ultra: toRows(counters.ultra, leadList.length),
      plano: toRows(counters.plano, leadList.length),
    };
  };

  const curr = getPerf(evs, leads);
  const prev = getPerf(prevEvs, prevLeads);

  const totalLeads = leads.length || 1;
  const mercado = curr.markets.map(c => {
    const p = prev.markets.find(x => x.label === c.label);
    return {
      ...c, share: (c.leads / totalLeads) * 100,
      prevVisitors: p?.visitors, prevLeads: p?.leads, prevPurchases: p?.purchases
    } as SegmentRow;
  }).sort((a, b) => (b.visitors || 0) - (a.visitors || 0));

  const sortByCount = (arr: any[]) => arr.sort((a, b) => b.count - a.count);

  return { 
    mercado, 
    uso_ia: sortByCount(curr.usoIa),
    tarefas: sortByCount(curr.tarefas),
    dores: sortByCount(curr.dores),
    interesse_ultra: sortByCount(curr.ultra),
    plano: sortByCount(curr.plano),
  };
}

function computeRange(f: AnalyticsFilters) {
  const end = f.endDate ? new Date(f.endDate) : new Date();
  const days = f.rangeDays || 30;
  const start = new Date(end);
  if (f.rangeDays !== 0) start.setDate(start.getDate() - days);
  else if (f.startDate) return { start: new Date(f.startDate), end };
  return { start, end };
}
function uniq<T>(arr: T[]): T[] { return Array.from(new Set(arr)); }
function readPath(obj: any, path: string): any {
  return path.split(".").reduce((acc, k) => acc?.[k], obj);
}
