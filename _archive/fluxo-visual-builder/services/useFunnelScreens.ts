import { useEffect, useState } from "react";
import { funnelConfig, getActiveScreens, type FunnelScreen } from "@/data/funnelConfig";
import { loadScreens, loadFunnel } from "@/services/funnelService";

export type ScreenSource = "supabase" | "config" | "loading";

/**
 * Carrega telas do funil atual.
 * Prioridade: Supabase → funnelConfig (fallback). Nunca quebra a UI.
 */
export function useFunnelScreens() {
  const [screens, setScreens] = useState<FunnelScreen[]>(() => getActiveScreens());
  const [source, setSource] = useState<ScreenSource>("loading");
  const [funnelId, setFunnelId] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [{ id }, remote] = await Promise.all([loadFunnel(), loadScreens()]);
        if (!alive) return;
        setFunnelId(id);
        if (remote && remote.length > 0) {
          // Se backend devolveu telas válidas, usa-as. getActiveScreens é o default;
          // detectamos "veio do supabase" comparando com a config.
          const fromRemote =
            remote.length !== funnelConfig.screens.length ||
            remote.some((r, i) => r.id !== funnelConfig.screens[i]?.id ||
              r.name !== funnelConfig.screens[i]?.name);
          setScreens(remote.sort((a, b) => a.order - b.order));
          setSource(fromRemote ? "supabase" : "config");
        } else {
          setSource("config");
        }
      } catch {
        if (alive) setSource("config");
      }
    })();
    return () => { alive = false; };
  }, []);

  return { screens, setScreens, source, funnelId };
}
