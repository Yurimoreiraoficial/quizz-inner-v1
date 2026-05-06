import { createContext, useContext, useEffect, useMemo, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useFunnelState, type FunnelController } from "@/hooks/useFunnelState";
import { funnelSteps, indexOfPath } from "@/data/funnelSteps";

const FunnelContext = createContext<FunnelController | null>(null);

interface FunnelProviderProps {
  children: ReactNode;
}

function detectBasePath(pathname: string): string {
  return pathname.startsWith("/dark") ? "/dark" : "";
}

function getStepSlug(pathname: string, basePath: string): string | null {
  const stripped = pathname.replace(basePath, "").replace(/^\/+|\/+$/g, "");
  if (!stripped) return null;
  return stripped.split("/")[0];
}

export function FunnelProvider({ children }: FunnelProviderProps) {
  const controller = useFunnelState();
  const location = useLocation();
  const navigate = useNavigate();

  const basePath = detectBasePath(location.pathname);
  // Sincroniza o índice interno do controller com a URL atual.
  const slug = getStepSlug(location.pathname, basePath);
  const urlIndex = slug ? indexOfPath(slug) : -1;

  useEffect(() => {
    if (urlIndex >= 0 && urlIndex !== controller.state.currentStepIndex) {
      controller.goToIndex(urlIndex);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlIndex]);

  // Quando o controller muda de índice (via goNext/goBack), navegar para a URL correspondente.
  // Só age se a rota atual já pertence ao funil (evita interferir com /notfound, etc.).
  useEffect(() => {
    if (urlIndex < 0) return;
    const target = funnelSteps[controller.state.currentStepIndex];
    if (!target) return;
    const desiredPath = `${basePath}/${target.path}`;
    if (location.pathname !== desiredPath) {
      navigate(desiredPath, { replace: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [controller.state.currentStepIndex]);

  const value = useMemo(() => controller, [controller]);

  return <FunnelContext.Provider value={value}>{children}</FunnelContext.Provider>;
}

export function useFunnel(): FunnelController {
  const ctx = useContext(FunnelContext);
  if (!ctx) throw new Error("useFunnel deve ser usado dentro de <FunnelProvider>");
  return ctx;
}