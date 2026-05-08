/**
 * Serviço de testes A/B para o funil Quiz Inner V1.
 *
 * - Carrega testes ativos + variantes (Supabase).
 * - Atribui variante "sticky" por session_id (localStorage).
 * - Aplica overrides em campos do funil (headline, subtitle, buttonText, cta.label, resultBullets).
 * - Mede performance por variante via funnel_events.
 *
 * Regras de segurança:
 *  - Se o teste estiver "paused"/"draft"/"completed", não aplica.
 *  - Se houver dois testes ativos no mesmo screen+field, vence o mais recente.
 *  - Falhas nunca quebram o funil (cai no default).
 */
import { supabase } from "@/integrations/supabase/client";
import { getCurrentFunnelId } from "./funnelService";
import {
  trackFunnelEvent,
  getOrCreateSessionId,
  isPreviewContext,
} from "./funnelTrackingService";

export type AbMetric = "lead_submit" | "checkout_click" | "whatsapp_click" | "purchase";
export type AbStatus = "draft" | "active" | "paused" | "completed";

export interface AbVariant {
  id: string;
  ab_test_id: string;
  label: string;
  value: Record<string, unknown> & { value?: unknown };
  split_percentage: number;
  status: string;
}

export interface AbTest {
  id: string;
  funnel_id: string;
  screen_key: string;
  field_key: string;
  metric: AbMetric | string;
  status: AbStatus | string;
  name: string;
  variants: AbVariant[];
}

const ASSIGN_KEY = "innerai_ab_assignments_v1";

// ----------------------------------------------------------------
// Cache em memória de testes ativos
// ----------------------------------------------------------------
let _activeCache: AbTest[] | null = null;
let _loadingPromise: Promise<AbTest[]> | null = null;

export function clearAbCache() {
  _activeCache = null;
  _loadingPromise = null;
}

export async function loadActiveAbTests(): Promise<AbTest[]> {
  if (_activeCache) return _activeCache;
  if (_loadingPromise) return _loadingPromise;
  _loadingPromise = (async () => {
    try {
      const funnel_id = await getCurrentFunnelId();
      if (!funnel_id) return [];
      const { data, error } = await supabase
        .from("ab_tests")
        .select("*, ab_variants(*)")
        .eq("funnel_id", funnel_id)
        .eq("status", "active");
      if (error || !data) return [];
      const tests: AbTest[] = data.map((row: Record<string, unknown>) => ({
        id: String(row.id),
        funnel_id: String(row.funnel_id),
        screen_key: String(row.screen_key),
        field_key: String(row.field_key),
        metric: String(row.metric ?? "checkout_click"),
        status: String(row.status ?? "draft"),
        name: String(row.name ?? ""),
        variants: ((row.ab_variants as unknown[]) ?? []).map((v) => {
          const r = v as Record<string, unknown>;
          return {
            id: String(r.id),
            ab_test_id: String(r.ab_test_id),
            label: String(r.label ?? ""),
            value: (r.value as Record<string, unknown>) ?? {},
            split_percentage: Number(r.split_percentage ?? 50),
            status: String(r.status ?? "active"),
          };
        }),
      }));
      _activeCache = tests;
      return tests;
    } catch {
      return [];
    } finally {
      _loadingPromise = null;
    }
  })();
  return _loadingPromise;
}

export async function loadAllAbTests(): Promise<AbTest[]> {
  try {
    const funnel_id = await getCurrentFunnelId();
    if (!funnel_id) return [];
    const { data, error } = await supabase
      .from("ab_tests")
      .select("*, ab_variants(*)")
      .eq("funnel_id", funnel_id)
      .order("created_at", { ascending: false });
    if (error || !data) return [];
    return data.map((row: Record<string, unknown>) => ({
      id: String(row.id),
      funnel_id: String(row.funnel_id),
      screen_key: String(row.screen_key),
      field_key: String(row.field_key),
      metric: String(row.metric ?? "checkout_click"),
      status: String(row.status ?? "draft"),
      name: String(row.name ?? ""),
      variants: ((row.ab_variants as unknown[]) ?? []).map((v) => {
        const r = v as Record<string, unknown>;
        return {
          id: String(r.id),
          ab_test_id: String(r.ab_test_id),
          label: String(r.label ?? ""),
          value: (r.value as Record<string, unknown>) ?? {},
          split_percentage: Number(r.split_percentage ?? 50),
          status: String(r.status ?? "active"),
        };
      }),
    }));
  } catch {
    return [];
  }
}

// ----------------------------------------------------------------
// Atribuição sticky por session
// ----------------------------------------------------------------
type Assignments = Record<string, string>; // test_id -> variant_id

function readAssignments(): Assignments {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(ASSIGN_KEY);
    return raw ? (JSON.parse(raw) as Assignments) : {};
  } catch {
    return {};
  }
}

function writeAssignments(a: Assignments) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(ASSIGN_KEY, JSON.stringify(a)); } catch {/* noop */}
}

function pickVariant(test: AbTest): AbVariant | null {
  const variants = test.variants.filter((v) => v.status === "active");
  if (variants.length === 0) return null;
  const total = variants.reduce((acc, v) => acc + (v.split_percentage || 0), 0) || 100;
  let r = Math.random() * total;
  for (const v of variants) {
    r -= v.split_percentage || 0;
    if (r <= 0) return v;
  }
  return variants[variants.length - 1];
}

/** Garante uma variante para o teste, persistindo na sessão. Dispara `ab_variant_view` na 1ª vez. */
export function getOrAssignVariant(test: AbTest): AbVariant | null {
  if (test.status !== "active") return null;
  const assigns = readAssignments();
  const existingId = assigns[test.id];
  let variant = test.variants.find((v) => v.id === existingId) ?? null;
  let isNew = false;
  if (!variant) {
    variant = pickVariant(test);
    if (!variant) return null;
    assigns[test.id] = variant.id;
    writeAssignments(assigns);
    isNew = true;
  }
  if (isNew && !isPreviewContext()) {
    trackFunnelEvent("ab_variant_view", {
      ab_test_id: test.id,
      variant_id: variant.id,
      screen_key: test.screen_key,
      sessionId: getOrCreateSessionId(),
      payload: { field_key: test.field_key, metric: test.metric, variant_label: variant.label },
    });
  }
  return variant;
}

// ----------------------------------------------------------------
// Overrides aplicáveis no funil público
// ----------------------------------------------------------------
export interface ScreenOverrides {
  headline?: string;
  subtitle?: string;
  buttonText?: string;
  ctaLabel?: string;
  resultBullets?: string[];
  /** ids: { test_id, variant_id, field_key } usados — para tracking nos eventos da tela. */
  applied: Array<{ test_id: string; variant_id: string; field_key: string }>;
}

/** Resolve overrides ativos para uma tela específica. */
export function resolveScreenOverrides(
  screen_key: string,
  tests: AbTest[],
): ScreenOverrides {
  const out: ScreenOverrides = { applied: [] };
  // Dois testes no mesmo field — aplica o que tiver variante atribuída mais recentemente.
  // Aqui pegamos por field_key e ignoramos duplicados (apenas o primeiro encontrado).
  const seenFields = new Set<string>();
  for (const test of tests) {
    if (test.screen_key !== screen_key) continue;
    if (test.status !== "active") continue;
    if (seenFields.has(test.field_key)) continue;
    const variant = getOrAssignVariant(test);
    if (!variant) continue;
    const raw = (variant.value as { value?: unknown }).value ?? variant.value;
    seenFields.add(test.field_key);
    out.applied.push({
      test_id: test.id,
      variant_id: variant.id,
      field_key: test.field_key,
    });
    switch (test.field_key) {
      case "headline":
        if (typeof raw === "string") out.headline = raw;
        break;
      case "subtitle":
        if (typeof raw === "string") out.subtitle = raw;
        break;
      case "buttonText":
      case "cta.label":
        if (typeof raw === "string") {
          out.buttonText = raw;
          out.ctaLabel = raw;
        }
        break;
      case "resultBullets":
        if (Array.isArray(raw)) out.resultBullets = raw.map(String);
        else if (typeof raw === "string") out.resultBullets = raw.split("\n").filter(Boolean);
        break;
      default:
        break;
    }
  }
  return out;
}

// ----------------------------------------------------------------
// CRUD do admin
// ----------------------------------------------------------------
export interface SaveAbInput {
  id?: string;
  name: string;
  screen_key: string;
  field_key: string;
  metric: AbMetric | string;
  status: AbStatus | string;
  variants: Array<{
    id?: string;
    label: string;
    value: unknown;
    split_percentage: number;
    status?: string;
  }>;
}

export async function saveAbTestFull(input: SaveAbInput): Promise<{ ok: boolean; id: string | null; error?: string }> {
  const funnel_id = await getCurrentFunnelId();
  if (!funnel_id) return { ok: false, id: null, error: "funnel_id_missing" };

  // Valida soma dos splits.
  const sum = input.variants.reduce((acc, v) => acc + (v.split_percentage || 0), 0);
  if (Math.round(sum) !== 100) {
    return { ok: false, id: null, error: `splits_sum_invalid:${sum}` };
  }

  // Bloqueia dois testes ativos no mesmo screen+field.
  if (input.status === "active") {
    const { data: dup } = await supabase
      .from("ab_tests")
      .select("id")
      .eq("funnel_id", funnel_id)
      .eq("screen_key", input.screen_key)
      .eq("field_key", input.field_key)
      .eq("status", "active");
    if (dup && dup.some((d) => d.id !== input.id)) {
      return { ok: false, id: null, error: "duplicate_active_test" };
    }
  }

  const payload = {
    funnel_id,
    name: input.name,
    screen_key: input.screen_key,
    field_key: input.field_key,
    metric: input.metric,
    status: input.status,
    ...(input.id ? { id: input.id } : {}),
  };
  const { data, error } = await supabase
    .from("ab_tests")
    .upsert(payload)
    .select("id")
    .maybeSingle();
  if (error || !data) return { ok: false, id: null, error: error?.message ?? "ab_test_upsert_failed" };
  const test_id = data.id;

  // Limpa variantes existentes e re-insere (simples para MVP).
  await supabase.from("ab_variants").delete().eq("ab_test_id", test_id);
  if (input.variants.length > 0) {
    const rows = input.variants.map((v) => ({
      ab_test_id: test_id,
      label: v.label,
      value: { value: v.value } as never,
      split_percentage: v.split_percentage,
      status: v.status ?? "active",
    }));
    const { error: vErr } = await supabase.from("ab_variants").insert(rows);
    if (vErr) return { ok: false, id: test_id, error: vErr.message };
  }
  clearAbCache();
  return { ok: true, id: test_id };
}

export async function deleteAbTest(id: string): Promise<{ ok: boolean }> {
  await supabase.from("ab_variants").delete().eq("ab_test_id", id);
  const { error } = await supabase.from("ab_tests").delete().eq("id", id);
  clearAbCache();
  return { ok: !error };
}

export async function setAbStatus(id: string, status: AbStatus): Promise<{ ok: boolean }> {
  const { error } = await supabase.from("ab_tests").update({ status }).eq("id", id);
  clearAbCache();
  return { ok: !error };
}

// ----------------------------------------------------------------
// Performance por variante (funnel_events)
// ----------------------------------------------------------------
export interface VariantPerformance {
  variant_id: string;
  label: string;
  split_percentage: number;
  visitors: number;
  leads: number;
  checkout_clicks: number;
  whatsapp_clicks: number;
  purchases: number;
  revenue: number;
  conversion_rate: number; // métrica principal / visitors
}

export const MIN_VOLUME_FOR_WINNER = 100;

export async function loadAbPerformance(test: AbTest): Promise<VariantPerformance[]> {
  try {
    const { data, error } = await supabase
      .from("funnel_events")
      .select("event_name,variant_id,session_id,event_data")
      .eq("ab_test_id", test.id);
    if (error || !data) {
      return test.variants.map(emptyPerf);
    }
    return test.variants.map((v) => {
      const events = data.filter((e) => e.variant_id === v.id);
      const sessions = new Set(events.map((e) => e.session_id));
      const count = (name: string) => events.filter((e) => e.event_name === name).length;
      const visitors = sessions.size;
      const leads = count("lead_submit");
      const checkout_clicks = count("checkout_click");
      const whatsapp_clicks = count("whatsapp_click");
      const purchases = count("purchase");
      const revenue = events
        .filter((e) => e.event_name === "purchase")
        .reduce((acc, e) => {
          const ed = (e.event_data ?? {}) as Record<string, unknown>;
          const val = Number(ed.value ?? ed.revenue ?? 0);
          return acc + (Number.isFinite(val) ? val : 0);
        }, 0);
      let metricCount = 0;
      switch (test.metric) {
        case "lead_submit": metricCount = leads; break;
        case "checkout_click": metricCount = checkout_clicks; break;
        case "whatsapp_click": metricCount = whatsapp_clicks; break;
        case "purchase": metricCount = purchases; break;
      }
      const conversion_rate = visitors > 0 ? (metricCount / visitors) * 100 : 0;
      return {
        variant_id: v.id,
        label: v.label,
        split_percentage: v.split_percentage,
        visitors,
        leads,
        checkout_clicks,
        whatsapp_clicks,
        purchases,
        revenue,
        conversion_rate,
      };
    });
  } catch {
    return test.variants.map(emptyPerf);
  }
}

function emptyPerf(v: AbVariant): VariantPerformance {
  return {
    variant_id: v.id,
    label: v.label,
    split_percentage: v.split_percentage,
    visitors: 0,
    leads: 0,
    checkout_clicks: 0,
    whatsapp_clicks: 0,
    purchases: 0,
    revenue: 0,
    conversion_rate: 0,
  };
}

/** Aponta a variante vencedora se houver volume mínimo. */
export function pickWinner(perf: VariantPerformance[]): VariantPerformance | null {
  if (perf.length < 2) return null;
  const totalVisitors = perf.reduce((a, p) => a + p.visitors, 0);
  if (totalVisitors < MIN_VOLUME_FOR_WINNER) return null;
  const ranked = [...perf].sort((a, b) => b.conversion_rate - a.conversion_rate);
  if (ranked[0].conversion_rate <= ranked[1].conversion_rate) return null;
  return ranked[0];
}