import { useEffect, useState } from "react";
import {
  loadActiveAbTests,
  resolveScreenOverrides,
  type ScreenOverrides,
  type AbTest,
} from "@/services/abService";
import { isPreviewContext } from "@/services/funnelTrackingService";

/**
 * Retorna overrides A/B aplicáveis à tela atual.
 * Em preview interno (admin), não aplica overrides nem atribui variantes.
 */
export function useAbOverrides(screenKey: string | undefined): ScreenOverrides {
  const [tests, setTests] = useState<AbTest[]>([]);

  useEffect(() => {
    if (isPreviewContext()) return;
    let cancelled = false;
    loadActiveAbTests().then((t) => { if (!cancelled) setTests(t); }).catch(() => {});
    return () => { cancelled = true; };
  }, []);

  if (!screenKey || isPreviewContext()) return { applied: [] };
  return resolveScreenOverrides(screenKey, tests);
}