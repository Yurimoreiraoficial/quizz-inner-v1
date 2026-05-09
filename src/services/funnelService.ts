/**
 * Camada de acesso ao funil.
 *
 * Estratégia MVP:
 *  - `funnelConfig` é a fonte de verdade inicial (defaults, ordem, tipos, CTAs).
 *  - Supabase é o backend persistente (tabelas funnels / funnel_screens / ab_tests / ab_variants).
 *  - `localStorage` (via `src/data/admin/store.ts`) é fallback temporário enquanto o admin
 *    não tem fluxo completo de salvar online.
 *
 * Todas as funções fazem best-effort: se o Supabase falhar, retornam o equivalente em config.
 */
import { supabase } from "@/integrations/supabase/client";
import {
  funnelConfig,
  getActiveScreens,
  type FunnelConfig,
  type FunnelScreen,
} from "@/data/funnelConfig";

const FUNNEL_SLUG = funnelConfig.id; // "quiz-inner-v1"

let _funnelIdCache: string | null = null;

export async function getCurrentFunnelId(): Promise<string | null> {
  if (_funnelIdCache) return _funnelIdCache;
  const { data, error } = await supabase
    .from("funnels")
    .select("id")
    .eq("slug", FUNNEL_SLUG)
    .maybeSingle();
  if (error || !data) return null;
  _funnelIdCache = data.id;
  return data.id;
}

/** Retorna metadados do funil (status, urls, pixels). Cai para funnelConfig em caso de erro. */
export async function loadFunnel(): Promise<{
  id: string | null;
  config: FunnelConfig;
  remote?: Record<string, unknown>;
}> {
  try {
    const { data, error } = await supabase
      .from("funnels")
      .select("*")
      .eq("slug", FUNNEL_SLUG)
      .maybeSingle();
    if (error || !data) return { id: null, config: funnelConfig };
    _funnelIdCache = data.id;
    return { id: data.id, config: funnelConfig, remote: data };
  } catch {
    return { id: null, config: funnelConfig };
  }
}

/** Carrega telas. Se Supabase tiver dados, usa; senão devolve as do funnelConfig. */
export async function loadScreens(): Promise<FunnelScreen[]> {
  const id = await getCurrentFunnelId();
  if (!id) return getActiveScreens();
  try {
    const { data, error } = await supabase
      .from("funnel_screens")
      .select("*")
      .eq("funnel_id", id)
      .order("order_index", { ascending: true });
    if (error || !data || data.length === 0) return getActiveScreens();
    return data.map(mapRowToScreen);
  } catch {
    return getActiveScreens();
  }
}

/** Salva uma tela editada (upsert por screen_key). */
export async function saveScreen(screen: FunnelScreen): Promise<{ ok: boolean }> {
  const id = await getCurrentFunnelId();
  if (!id) return { ok: false };
  const { error } = await supabase
    .from("funnel_screens")
    .update({
      name: screen.name,
      type: screen.type,
      status: screen.status,
      order_index: screen.order,
      content: { ...screen.content, options: screen.options } as never,
      cta: (screen.cta ?? {}) as never,
      events: (screen.events ?? {}) as never,
      pixels: (screen.pixels ?? []) as never,
      rules: (screen.rules ?? []) as never,
      next_screen_key: screen.nextScreen,
    })
    .eq("funnel_id", id)
    .eq("screen_key", screen.id);
  return { ok: !error };
}

export interface FunnelLinksPayload {
  checkoutUrl?: string;
  whatsappNumber?: string;
  whatsappMessage?: string;
  metaPixelId?: string;
  ga4Id?: string;
  gtmId?: string;
  publicUrl?: string;
}

/** Salva links/pixels no funil. */
export async function saveLinks(p: FunnelLinksPayload): Promise<{ ok: boolean }> {
  const id = await getCurrentFunnelId();
  if (!id) return { ok: false };
  const { error } = await supabase
    .from("funnels")
    .update({
      checkout_url: p.checkoutUrl,
      whatsapp_number: p.whatsappNumber,
      whatsapp_message: p.whatsappMessage,
      meta_pixel_id: p.metaPixelId,
      google_tag_id: p.ga4Id,
      gtm_id: p.gtmId,
      public_url: p.publicUrl,
    })
    .eq("id", id);
  return { ok: !error };
}

// ============================================================
// A/B
// ============================================================

export async function loadAbTests() {
  const id = await getCurrentFunnelId();
  if (!id) return [];
  const { data, error } = await supabase
    .from("ab_tests")
    .select("*, ab_variants(*)")
    .eq("funnel_id", id)
    .order("created_at", { ascending: false });
  if (error) return [];
  return data ?? [];
}

export async function saveAbTest(test: {
  id?: string;
  name: string;
  screen_key: string;
  field_key: string;
  metric?: string;
  status?: string;
}) {
  const funnel_id = await getCurrentFunnelId();
  if (!funnel_id) return { ok: false, id: null as string | null };
  const payload = {
    funnel_id,
    name: test.name,
    screen_key: test.screen_key,
    field_key: test.field_key,
    metric: test.metric ?? "cta_click",
    status: test.status ?? "draft",
    ...(test.id ? { id: test.id } : {}),
  };
  const { data, error } = await supabase
    .from("ab_tests")
    .upsert(payload)
    .select("id")
    .maybeSingle();
  return { ok: !error, id: data?.id ?? null };
}

// ============================================================
// Helpers internos
// ============================================================

function mapRowToScreen(row: Record<string, unknown>): FunnelScreen {
  return {
    id: String(row.screen_key),
    order: Number(row.order_index ?? 0),
    name: String(row.name ?? ""),
    type: row.type as FunnelScreen["type"],
    status: (row.status ?? "active") as FunnelScreen["status"],
    content: (row.content ?? {}) as FunnelScreen["content"],
    options: (row.content as any)?.options || undefined,
    cta: (row.cta ?? undefined) as FunnelScreen["cta"],
    events: (row.events ?? undefined) as FunnelScreen["events"],
    pixels: (row.pixels ?? []) as FunnelScreen["pixels"],
    rules: (row.rules ?? []) as never,
    nextScreen: (row.next_screen_key ?? null) as string | null,
  };
}
