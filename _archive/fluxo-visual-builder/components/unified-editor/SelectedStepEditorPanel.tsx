import { useEffect, useState, useRef } from "react";
import type { FunnelScreen } from "@/data/funnelConfig";
import type { FunnelAnalytics } from "@/services/analyticsService";
import { type AbTest, type VariantPerformance } from "@/services/abService";
import type { FlowSelection } from "@/pages/admin/UnifiedFunnelEditorPage";
import { LivePreview } from "@/components/admin/LivePreview";

export function SelectedStepEditorPanel({
  screens,
  abTests,
  selection,
}: {
  screens: FunnelScreen[];
  analytics: FunnelAnalytics | null;
  abTests: AbTest[];
  abPerf: Record<string, VariantPerformance[]>;
  selection: FlowSelection;
  onRefresh: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dynamicScale, setDynamicScale] = useState(0.8);

  // Calcula a escala ideal para caber na altura da viewport sem scroll
  useEffect(() => {
    const calculateScale = () => {
      if (!containerRef.current) return;
      
      const viewportHeight = window.innerHeight;
      const headerHeight = 110; // Espaço aproximado da topbar + header do painel
      const padding = 80; // Espaçamento interno desejado (top + bottom)
      const availableHeight = viewportHeight - headerHeight - padding;
      
      const nativeFrameHeight = 844 + 40; // Altura nativa do iPhone + bezels
      const idealScale = Math.min(0.8, availableHeight / nativeFrameHeight);
      
      setDynamicScale(idealScale);
    };

    calculateScale();
    window.addEventListener("resize", calculateScale);
    return () => window.removeEventListener("resize", calculateScale);
  }, []);

  if (!selection) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6 text-[var(--admin-muted)] opacity-50">
        <p className="font-semibold mb-1 text-sm uppercase tracking-widest">Nenhuma seleção</p>
        <p className="text-[10px]">Selecione uma etapa para pré-visualizar.</p>
      </div>
    );
  }

  // Encontrar tela
  const screenId = selection.type === "screen" ? selection.id : abTests?.find(t => t.id === selection.testId)?.screen_key;
  const screen = screens?.find(s => s.id === screenId);
  
  if (!screen) return null;

  const test = abTests?.find(t => t.screen_key === screen.id && t.status !== "completed");

  // Build the specific screen object to preview
  let previewScreen = screen;
  if (selection.type === "variant" && test) {
    const variant = test.variants.find(v => v.id === selection.variantId);
    if (variant && variant.overrides) {
      previewScreen = {
        ...screen,
        content: {
          ...screen.content,
          ...(variant.overrides.headline ? { headline: variant.overrides.headline } : {}),
          ...(variant.overrides.subtitle ? { subtitle: variant.overrides.subtitle } : {}),
          ...(variant.overrides.buttonText ? { buttonText: variant.overrides.buttonText } : {}),
        },
        ...(variant.overrides.ctaLabel ? { cta: { ...(screen.cta || { type: "next", label: "" }), label: variant.overrides.ctaLabel } as FunnelScreen["cta"] } : {})
      };
    }
  }

  // CONFIGURAÇÃO DE FIDELIDADE (Viewport 390x844 - NÃO ALTERAR)
  const nativeWidth = 390;
  const nativeHeight = 844;
  const bezel = 20; 

  const frameWidth = nativeWidth + (bezel * 2);
  const frameHeight = nativeHeight + (bezel * 2);
  const scaledWidth = frameWidth * dynamicScale;
  const scaledHeight = frameHeight * dynamicScale;

  return (
    <div className="flex flex-col h-full bg-[var(--admin-surface)] overflow-hidden">
      {/* Header Fino - Fixo no topo do painel */}
      <div className="px-6 py-4 shrink-0 bg-white border-b border-[var(--admin-border)] z-20">
        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--admin-blue)] mb-1">
          Preview Mobile
        </div>
        <div className="font-bold text-base text-slate-900 truncate">
          {screen.name}
        </div>
      </div>

      {/* Área de Visualização com Altura Dinâmica e Sem Scroll Inútil */}
      <div 
        ref={containerRef}
        className="flex-1 bg-slate-50 flex flex-col items-center justify-center p-4 relative min-h-0"
      >
        {/* Wrapper que centraliza o mockup e respeita o espaço escalado */}
        <div 
          className="flex flex-col items-center justify-center transition-all duration-300 ease-in-out"
          style={{ 
            width: scaledWidth, 
            height: scaledHeight,
            position: 'relative'
          }}
        >
          {/* Mockup Real Escalado e Centralizado */}
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 origin-center"
            style={{ 
              transform: `scale(${dynamicScale})`,
              width: frameWidth,
              height: frameHeight
            }}
          >
            {/* Frame do Aparelho */}
            <div 
              className="relative bg-[#000] rounded-[60px] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.45)] ring-1 ring-white/10"
              style={{ width: frameWidth, height: frameHeight, padding: `${bezel}px` }}
            >
              {/* Viewport Mobile Fixa (390x844) */}
              <div 
                className="w-full h-full rounded-[48px] overflow-hidden bg-[#070707] relative z-10"
                style={{ width: nativeWidth, height: nativeHeight }}
              >
                <LivePreview screen={previewScreen} />
              </div>

              {/* Detalhes de Hardware */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-8 bg-black rounded-b-[24px] z-20" />
              <div className="absolute -left-1 top-32 w-1.5 h-16 bg-slate-800 rounded-l-md" />
              <div className="absolute -left-1 top-52 w-1.5 h-16 bg-slate-800 rounded-l-md" />
              <div className="absolute -right-1 top-44 w-1.5 h-24 bg-slate-800 rounded-r-md" />
            </div>
          </div>
        </div>

        {/* Info Badge Flutuante (Opcional, apenas para feedback visual) */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 opacity-40 hover:opacity-100 transition-opacity">
          <span className="px-2 py-0.5 bg-slate-200 rounded text-[9px] font-bold text-slate-500 uppercase">
             Scale: {Math.round(dynamicScale * 100)}%
          </span>
          <span className="px-2 py-0.5 bg-slate-200 rounded text-[9px] font-bold text-slate-500 uppercase">
             {nativeWidth}x{nativeHeight}
          </span>
        </div>
      </div>
      
      {/* Footer Minimalista */}
      <div className="px-6 py-2 bg-white border-t border-[var(--admin-border)] shrink-0">
         <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400">
            <div className="w-1 h-1 rounded-full bg-blue-400" />
            <span>Fidelidade Real Ativa</span>
         </div>
      </div>
    </div>
  );
}
