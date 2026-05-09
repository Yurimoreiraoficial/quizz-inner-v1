import { useEffect, useRef } from "react";
import type { FunnelScreen } from "@/data/funnelConfig";

/**
 * Preview mobile in-page do funil dark.
 * Utiliza um iframe apontando para a aplicação real com ?preview=1.
 */
export function LivePreview({ screen }: { screen: FunnelScreen }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Envia as atualizações em tempo real (ex: quando o usuário edita a headline)
  // para o iframe via postMessage sem precisar recarregar a página.
  useEffect(() => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: "INNER_PREVIEW_UPDATE", screen },
        "*"
      );
    }
  }, [screen]);

  return (
    <div className="w-full h-full bg-black overflow-hidden flex flex-col">
      <iframe
        ref={iframeRef}
        // Quando a etapa muda, o iframe recarrega na etapa correta.
        // O `preview=1` desativa disparos de pixel e tracking no funnelTrackingService.ts
        src={`/dark?preview=1&screen=${screen.id}`}
        className="w-full h-full border-0"
        title="Live Preview"
      />
    </div>
  );
}
