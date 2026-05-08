/**
 * Persistência de leads do funil.
 * Best-effort: sempre tenta enviar ao Supabase, mas nunca quebra a UI.
 */
import { supabase } from "@/integrations/supabase/client";
import { getCurrentFunnelId } from "./funnelService";

export interface SaveLeadInput {
  sessionId: string | null;
  name?: string;
  phone?: string;
  email?: string;
  answers?: Record<string, unknown>;
  source?: string;
  medium?: string;
  campaign?: string;
}

export async function saveLead(input: SaveLeadInput): Promise<{ ok: boolean; id: string | null }> {
  try {
    const funnel_id = await getCurrentFunnelId();
    if (!funnel_id || !input.sessionId) return { ok: false, id: null };
    const { data, error } = await supabase
      .from("funnel_leads")
      .insert({
        funnel_id,
        session_id: input.sessionId,
        name: input.name ?? null,
        phone: input.phone ?? null,
        email: input.email ?? null,
        answers: (input.answers ?? {}) as never,
        source: input.source ?? null,
        medium: input.medium ?? null,
        campaign: input.campaign ?? null,
      })
      .select("id")
      .maybeSingle();
    return { ok: !error, id: data?.id ?? null };
  } catch {
    return { ok: false, id: null };
  }
}
