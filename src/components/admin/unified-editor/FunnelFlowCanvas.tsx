import { useState, useRef, useEffect, MouseEvent as ReactMouseEvent } from "react";
import type { FunnelScreen } from "@/data/funnelConfig";
import type { FunnelAnalytics, ScreenMicroRow } from "@/services/analyticsService";
import { type AbTest, type VariantPerformance, pickWinner } from "@/services/abService";
import { ArrowRight, ZoomIn, ZoomOut, Maximize, Activity, BarChart3, Globe, ShieldCheck, MessageCircle, ShoppingCart, CheckCircle2 } from "lucide-react";
import type { FlowSelection } from "@/pages/admin/UnifiedFunnelEditorPage";
import { loadState } from "@/data/admin/store";

export function FunnelFlowCanvas({
  screens,
  analytics,
  abTests,
  abPerf,
  selection,
  onSelect,
}: {
  screens: FunnelScreen[];
  analytics: FunnelAnalytics | null;
  abTests: AbTest[];
  abPerf: Record<string, VariantPerformance[]>;
  selection: FlowSelection;
  onSelect: (s: FlowSelection) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const [scale, setScale] = useState(0.75);
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const scaleRef = useRef(scale);
  const positionRef = useRef(position);

  useEffect(() => {
    scaleRef.current = scale;
    positionRef.current = position;
  }, [scale, position]);

  const handleMouseDown = (e: ReactMouseEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: ReactMouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const zoomSensitivity = 0.005;
        const delta = -e.deltaY * zoomSensitivity;
        const newScale = Math.min(Math.max(0.1, scaleRef.current + delta), 3);

        const rect = el.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const scaleChange = newScale - scaleRef.current;
        const newX = positionRef.current.x - ((mouseX - positionRef.current.x) * scaleChange) / scaleRef.current;
        const newY = positionRef.current.y - ((mouseY - positionRef.current.y) * scaleChange) / scaleRef.current;

        setScale(newScale);
        setPosition({ x: newX, y: newY });
      } else {
        // Pan
        setPosition((prev) => ({
          x: prev.x - e.deltaX,
          y: prev.y - e.deltaY,
        }));
      }
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const handleZoomIn = () => setScale((s) => Math.min(s + 0.1, 3));
  const handleZoomOut = () => setScale((s) => Math.max(s - 0.1, 0.1));

  const handleFit = () => {
    if (!containerRef.current) return;
    const container = containerRef.current.getBoundingClientRect();
    const comfortableScale = 0.75;
    setScale(comfortableScale);
    const startX = 80;
    const startY = (container.height / 2) - (150 * comfortableScale);
    setPosition({ x: startX, y: startY });
  };

  useEffect(() => {
    if (screens.length > 0) {
      const t = setTimeout(() => handleFit(), 200);
      return () => clearTimeout(t);
    }
  }, [screens.length]);

  const globalState = loadState();
  const pixelId = globalState.links.metaPixelId || "—";
  const utmSource = globalState.links.defaultUtmSource || "—";

  const Connector = ({ isHighlighted }: { isHighlighted?: boolean }) => (
    <div className={`flex items-center transition-all duration-300 ${isHighlighted ? 'text-[var(--admin-blue)] opacity-100 scale-x-110' : 'text-[var(--admin-border-strong)] opacity-60'} z-0`}>
      <div className={`w-6 h-[2px] bg-current rounded-full`} />
      <ArrowRight className={`w-4 h-4 mx-0.5 shrink-0`} strokeWidth={3} />
      <div className={`w-6 h-[2px] bg-current rounded-full`} />
    </div>
  );

  return (
    <div className="relative w-full h-full overflow-hidden bg-[var(--admin-surface-2)]">
      {/* Zoom Controls */}
      <div className="absolute top-4 left-4 z-50 flex items-center gap-1 bg-[var(--admin-surface)] p-1 rounded-lg border border-[var(--admin-border)] shadow-sm text-[var(--admin-text)]">
        <button onClick={handleZoomOut} className="p-1.5 hover:bg-[var(--admin-surface-2)] rounded">
          <ZoomOut className="w-4 h-4" />
        </button>
        <span className="text-[10px] font-bold w-12 text-center">{Math.round(scale * 100)}%</span>
        <button onClick={handleZoomIn} className="p-1.5 hover:bg-[var(--admin-surface-2)] rounded">
          <ZoomIn className="w-4 h-4" />
        </button>
        <div className="w-px h-4 bg-[var(--admin-border)] mx-1" />
        <button
          onClick={handleFit}
          className="flex items-center gap-1.5 px-2 py-1.5 hover:bg-[var(--admin-surface-2)] rounded text-[10px] font-bold uppercase tracking-wider"
        >
          <Maximize className="w-3.5 h-3.5" /> Ajustar foco
        </button>
      </div>

      {/* Pannable Canvas */}
      <div
        ref={containerRef}
        className={`w-full h-full outline-none ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          backgroundImage: "radial-gradient(circle, var(--admin-border) 1.5px, transparent 1.5px)",
          backgroundSize: `${32 * scale}px ${32 * scale}px`,
          backgroundPosition: `${position.x}px ${position.y}px`,
        }}
      >
        <div
          ref={contentRef}
          className="absolute flex items-center gap-10 p-24 origin-top-left w-max"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          }}
        >
          {/* Start Node */}
          <div className="flex flex-col items-center">
            <button 
              onClick={() => onSelect({ type: "start" })}
              className={`w-64 rounded-xl p-5 text-left transition-all z-10 relative bg-[var(--admin-surface)] shadow-sm border border-[var(--admin-border)] hover:shadow-md ${
                selection?.type === "start" ? "ring-2 ring-[var(--admin-blue)] shadow-lg" : ""
              }`}
            >
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[var(--admin-blue)] mb-3">
                <ShieldCheck className="w-3.5 h-3.5" /> Configuração Global
              </div>
              <div className="font-bold text-lg mb-4">Início do Funil</div>
              
              <div className="space-y-2 py-3 border-t border-[var(--admin-border)]">
                <div className="flex justify-between text-[11px]">
                  <span className="text-[var(--admin-muted)]">Pixel ID:</span>
                  <span className="font-semibold text-[var(--admin-text)] truncate max-w-[120px]">{pixelId}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-[var(--admin-muted)]">UTM Source:</span>
                  <span className="font-semibold text-[var(--admin-text)] truncate max-w-[120px]">{utmSource}</span>
                </div>
              </div>
              
              <div className="absolute top-1/2 left-full -translate-y-1/2 flex items-center -mr-10">
                 <Connector isHighlighted={selection?.type === "start"} />
              </div>
            </button>
          </div>

          {screens.map((screen, idx) => {
            const test = abTests?.find((t) => t.screen_key === screen.id && t.status !== "completed");
            const micro = analytics?.micro?.find((m) => m.screen_key === screen.id);
            const isLast = idx === screens.length - 1;
            
            const isSelected = (selection?.type === "screen" && selection.id === screen.id) || 
                             (selection?.type === "variant" && test && selection.testId === test.id);

            return (
              <div key={screen.id} className="relative flex items-center gap-10">
                {test ? (
                  <ABBranch
                    screen={screen}
                    test={test}
                    perf={abPerf[test.id] || []}
                    selection={selection}
                    stepNumber={idx + 1}
                    onSelect={onSelect}
                  />
                ) : (
                  <StepNode
                    screen={screen}
                    micro={micro}
                    selection={selection}
                    stepNumber={idx + 1}
                    onSelect={onSelect}
                  />
                )}

                {!isLast && (
                  <div className="z-0">
                    <Connector isHighlighted={isSelected} />
                  </div>
                )}
              </div>
            );
          })}

          {/* Connection to exits */}
          <div className="z-0 -ml-4">
            <Connector isHighlighted={selection?.type === "screen" && selection.id === screens[screens.length-1]?.id} />
          </div>

          <div className="relative flex flex-col gap-12 py-4 z-10">
            <div className="absolute top-[2rem] left-0 w-[2px] h-[calc(100%-2rem-1.5rem)] bg-[var(--admin-border-strong)] opacity-60 -z-10" />

            {/* WhatsApp Block */}
            <div className="relative flex items-center">
              <div className="absolute top-1/2 left-0 w-8 h-[2px] bg-[var(--admin-border-strong)] opacity-60 -z-10" />
              <div className="absolute top-1/2 left-8 -translate-y-1/2">
                <ArrowRight className="w-4 h-4 text-[var(--admin-border-strong)] opacity-60" strokeWidth={3} />
              </div>
              
              <div className="ml-14">
                <ExitNode
                  type="whatsapp"
                  title="Saída · WhatsApp"
                  description="Clique para falar com time"
                  clicks={analytics?.macros.whatsappClicks || 0}
                  convGeral={(analytics?.macros.whatsappClicks || 0) / (analytics?.macros.visitors || 1)}
                  selection={selection}
                  onSelect={onSelect}
                  linksConfig={globalState.links}
                />
              </div>
            </div>

            {/* Checkout Block */}
            <div className="relative flex items-center">
              <div className="absolute top-1/2 left-0 w-8 h-[2px] bg-[var(--admin-border-strong)] opacity-60 -z-10" />
              <div className="absolute top-1/2 left-8 -translate-y-1/2">
                <ArrowRight className="w-4 h-4 text-[var(--admin-border-strong)] opacity-60" strokeWidth={3} />
              </div>
              
              <div className="ml-14 flex items-center gap-10">
                <ExitNode
                  type="checkout"
                  title="Saída · Checkout"
                  description="Clique no botão de assinatura"
                  clicks={analytics?.macros.checkoutClicks || 0}
                  convGeral={(analytics?.macros.checkoutClicks || 0) / (analytics?.macros.visitors || 1)}
                  selection={selection}
                  onSelect={onSelect}
                  linksConfig={globalState.links}
                />

                <div className="z-0">
                  <Connector isHighlighted={selection?.type === "exit" && selection.id === "checkout"} />
                </div>

                <ExitNode
                  type="purchase"
                  title="Compra confirmada"
                  description="Assinatura concluída"
                  clicks={analytics?.macros.purchases || 0}
                  convGeral={(analytics?.macros.purchases || 0) / (analytics?.macros.visitors || 1)}
                  receita={analytics?.macros.revenue || 0}
                  selection={selection}
                  onSelect={onSelect}
                  linksConfig={globalState.links}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StepNode({
  screen,
  micro,
  selection,
  stepNumber,
  onSelect,
}: {
  screen: FunnelScreen;
  micro?: ScreenMicroRow;
  selection: FlowSelection;
  stepNumber: number;
  onSelect: (s: FlowSelection) => void;
}) {
  const isSelected = selection?.type === "screen" && selection.id === screen.id;
  
  const views = micro ? micro.views : 0;
  const rate = micro ? micro.completion_rate : 0;
  const avanco = views > 0 ? (rate * 100).toFixed(1) + "%" : "—";
  
  let status = "—";
  let statusColor = "text-[var(--admin-muted)]";
  if (views > 0) {
    if (rate > 0.8) { status = "Saudável"; statusColor = "text-green-500"; }
    else if (rate > 0.6) { status = "Atenção"; statusColor = "text-yellow-500"; }
    else if (rate > 0.4) { status = "Risco"; statusColor = "text-orange-500"; }
    else { status = "Crítico"; statusColor = "text-red-500"; }
  }

  const pixelConfig = (screen.content as any).metaEventConfig || { trigger: "—", metaEvent: "—" };
  const triggerLabels: Record<string, string> = {
    view: "Vis. Página", click: "Cl. Botão", answer: "Resp. Perg.", 
    submit: "Env. Form", whatsapp: "Cl. Whats", checkout: "Cl. Check", purchase: "Compra"
  };

  const description = screen.content.headline || "Sem descrição";

  return (
    <button
      onClick={() => onSelect({ type: "screen", id: screen.id })}
      className={`relative w-[280px] min-h-[220px] rounded-xl p-5 text-left transition-all bg-[var(--admin-surface)] z-10 hover:-translate-y-1 hover:shadow-lg ${
        isSelected ? "ring-2 ring-[var(--admin-blue)] shadow-xl" : "border border-[var(--admin-border)] shadow-sm"
      }`}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--admin-muted)]">
          Etapa {stepNumber}
        </div>
        <div className={`text-[10px] font-bold px-1.5 py-0.5 rounded bg-[var(--admin-surface-2)] ${statusColor}`}>
          {status}
        </div>
      </div>
      
      <div className="font-bold text-sm mb-1 truncate">{screen.name}</div>
      <div className="text-[11px] text-[var(--admin-muted)] mb-4 italic line-clamp-3 overflow-hidden leading-relaxed">
        "{description}"
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4 p-2.5 bg-[var(--admin-surface-2)] rounded-lg">
        <div>
          <div className="text-[9px] text-[var(--admin-muted)] uppercase font-bold">Views</div>
          <div className="text-xs font-bold">{views > 0 ? views.toLocaleString("pt-BR") : "—"}</div>
        </div>
        <div>
          <div className="text-[9px] text-[var(--admin-muted)] uppercase font-bold">Avanço</div>
          <div className="text-xs font-bold">{avanco}</div>
        </div>
      </div>

      <div className="pt-3 border-t border-[var(--admin-border)] border-dashed space-y-1.5">
        <div className="flex justify-between items-center text-[10px]">
          <span className="text-[var(--admin-muted)]">Gatilho:</span>
          <span className="font-semibold">{triggerLabels[pixelConfig.trigger] || pixelConfig.trigger}</span>
        </div>
        <div className="flex justify-between items-center text-[10px]">
          <span className="text-[var(--admin-muted)]">Meta:</span>
          <span className="font-bold text-blue-500">
            {pixelConfig.metaEvent === "Evento customizado" ? pixelConfig.customEventName : pixelConfig.metaEvent}
          </span>
        </div>
      </div>
    </button>
  );
}

function ABBranch({
  screen,
  test,
  perf,
  selection,
  stepNumber,
  onSelect,
}: {
  screen: FunnelScreen;
  test: AbTest;
  perf: VariantPerformance[];
  selection: FlowSelection;
  stepNumber: number;
  onSelect: (s: FlowSelection) => void;
}) {
  const winner = pickWinner(perf);

  return (
    <div className="relative flex flex-col gap-6 py-6 z-10">
      <div className="absolute top-1/2 left-0 w-[2px] h-[calc(100%-4rem)] bg-[var(--admin-border-strong)] opacity-60 -translate-y-1/2 -z-10" />
      <div className="absolute top-1/2 right-0 w-[2px] h-[calc(100%-4rem)] bg-[var(--admin-border-strong)] opacity-60 -translate-y-1/2 -z-10" />

      {test.variants.map((v) => {
        const isSelected = selection?.type === "variant" && selection.testId === test.id && selection.variantId === v.id;
        const p = perf?.find(p => p.variant_id === v.id);
        const views = p?.visitors || 0;
        const rate = p && p.visitors > 0 ? (p.checkout_clicks / p.visitors) : 0;
        const avanco = views > 0 ? (rate * 100).toFixed(1) + "%" : "—";
        const isWinner = winner?.variant_id === v.id;
        
        const pixelConfig = (screen.content as any).metaEventConfig || { trigger: "—", metaEvent: "—" };
        const triggerLabels: Record<string, string> = {
          view: "Vis. Página", click: "Cl. Botão", answer: "Resp. Perg.", 
          submit: "Env. Form", whatsapp: "Cl. Whats", checkout: "Cl. Check", purchase: "Compra"
        };

        const description = screen.content.headline || "Sem descrição";

        return (
          <div key={v.id} className="relative flex items-center">
            <div className="absolute top-1/2 -left-10 w-10 h-[2px] bg-[var(--admin-border-strong)] opacity-60 -z-10" />
            <div className="absolute top-1/2 -right-10 w-10 h-[2px] bg-[var(--admin-border-strong)] opacity-60 -z-10" />

            <button
              onClick={() => onSelect({ type: "variant", testId: test.id, variantId: v.id })}
              className={`relative w-[280px] min-h-[220px] rounded-xl p-5 text-left transition-all bg-[var(--admin-surface)] hover:-translate-y-1 hover:shadow-lg ${
                isSelected ? "ring-2 ring-[var(--admin-purple)] shadow-xl" : 
                isWinner ? "border-2 border-[var(--admin-blue)] shadow-sm" : "border border-[var(--admin-border)] shadow-sm"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--admin-muted)]">
                  Etapa {stepNumber}{v.label}
                </span>
                {isWinner && <span className="text-[10px] font-bold text-[var(--admin-blue)] px-2 py-0.5 rounded bg-blue-50">Vencedora</span>}
              </div>
              
              <div className="font-bold text-sm mb-1 truncate">{screen.name}</div>
              <div className="text-[11px] text-[var(--admin-muted)] mb-4 line-clamp-3 overflow-hidden leading-relaxed">
                {description}
              </div>
              
              <div className="grid grid-cols-2 gap-2 mb-4 p-2.5 bg-[var(--admin-surface-2)] rounded-lg">
                <div>
                  <div className="text-[9px] text-[var(--admin-muted)] uppercase font-bold">Views</div>
                  <div className="text-xs font-bold">{views > 0 ? views.toLocaleString("pt-BR") : "—"}</div>
                </div>
                <div>
                  <div className="text-[9px] text-[var(--admin-muted)] uppercase font-bold">Avanço</div>
                  <div className="text-xs font-bold">{avanco}</div>
                </div>
              </div>

              <div className="pt-3 border-t border-[var(--admin-border)] border-dashed space-y-1.5">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-[var(--admin-muted)]">Gatilho:</span>
                  <span className="font-semibold">{triggerLabels[pixelConfig.trigger] || pixelConfig.trigger}</span>
                </div>
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-[var(--admin-muted)]">Meta:</span>
                  <span className="font-bold text-blue-500">
                    {pixelConfig.metaEvent === "Evento customizado" ? pixelConfig.customEventName : pixelConfig.metaEvent}
                  </span>
                </div>
              </div>
            </button>
          </div>
        );
      })}
    </div>
  );
}

function ExitNode({
  type,
  title,
  description,
  clicks,
  convGeral,
  receita,
  selection,
  onSelect,
  linksConfig
}: {
  type: "whatsapp" | "checkout" | "purchase";
  title: string;
  description: string;
  clicks: number;
  convGeral: number;
  receita?: number;
  selection: FlowSelection;
  onSelect: (s: FlowSelection) => void;
  linksConfig: any;
}) {
  const isSelected = selection?.type === "exit" && selection.id === type;
  const isPurchase = type === "purchase";
  const isWhatsApp = type === "whatsapp";
  const isCheckout = type === "checkout";
  
  let badgeClass = "bg-[var(--admin-surface-2)] text-[var(--admin-muted)]";
  if (type === "whatsapp") badgeClass = "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20";
  if (type === "checkout") badgeClass = "bg-blue-500/10 text-blue-600 border border-blue-500/20";
  if (type === "purchase") badgeClass = "bg-green-500/10 text-green-600 border border-green-500/20 font-bold";

  const trigger = isWhatsApp ? "Clique no WhatsApp" : isCheckout ? "Clique no Checkout" : "Compra Confirmada";
  const metaEvent = isWhatsApp ? (linksConfig.whatsappEventMeta || "Contact") : isCheckout ? (linksConfig.checkoutEventMeta || "InitiateCheckout") : "Purchase";
  const link = isWhatsApp ? (linksConfig.whatsappBaseUrl || "—") : isCheckout ? (linksConfig.checkoutBaseUrl || "—") : "—";
  const status = (isWhatsApp && linksConfig.whatsappBaseUrl) || (isCheckout && linksConfig.checkoutBaseUrl) || isPurchase ? "Configurado" : "Pendente";

  return (
    <button
      onClick={() => onSelect({ type: "exit", id: type })}
      className={`relative w-[280px] min-h-[220px] rounded-xl p-5 text-left transition-all bg-[var(--admin-surface)] z-10 hover:-translate-y-1 hover:shadow-lg ${
        isSelected 
          ? isPurchase ? "ring-2 ring-green-500 shadow-xl" : "ring-2 ring-[var(--admin-blue)] shadow-xl" 
          : "border border-[var(--admin-border)] shadow-sm"
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md ${badgeClass}`}>
          {type === "whatsapp" && "WhatsApp"}
          {type === "checkout" && "Checkout"}
          {type === "purchase" && "Compra"}
        </span>
        <div className="flex items-center gap-1">
          <div className={`w-1.5 h-1.5 rounded-full ${status === "Configurado" ? "bg-green-500" : "bg-red-500"}`} />
          <span className="text-[9px] font-bold text-[var(--admin-muted)] uppercase tracking-tighter">{status}</span>
        </div>
      </div>
      
      <div className="font-bold text-sm mb-1 text-[var(--admin-text)]">{title}</div>
      <div className="text-[11px] text-[var(--admin-muted)] mb-4 line-clamp-2 h-[2.2em]">
        {description}
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4 p-2.5 bg-[var(--admin-surface-2)] rounded-lg">
        <div>
          <div className="text-[9px] text-[var(--admin-muted)] uppercase font-bold">{isPurchase ? "Compras" : "Cliques"}</div>
          <div className="text-xs font-bold">{clicks > 0 ? clicks.toLocaleString("pt-BR") : "—"}</div>
        </div>
        <div>
          <div className="text-[9px] text-[var(--admin-muted)] uppercase font-bold">Conversão</div>
          <div className="text-xs font-bold">{clicks > 0 ? (convGeral * 100).toFixed(1) + "%" : "—"}</div>
        </div>
      </div>

      {isWhatsApp && (
        <div className="space-y-1.5 pt-3 border-t border-[var(--admin-border)] border-dashed">
          <div className="flex justify-between items-center text-[10px]">
            <span className="text-[var(--admin-muted)]">Link:</span>
            <span className="font-semibold text-[var(--admin-text)] truncate max-w-[150px]">{link}</span>
          </div>
          <div className="flex justify-between items-center text-[10px]">
            <span className="text-[var(--admin-muted)]">Gatilho:</span>
            <span className="font-semibold">{trigger}</span>
          </div>
          <div className="flex justify-between items-center text-[10px]">
            <span className="text-[var(--admin-muted)]">Meta:</span>
            <span className="font-bold text-blue-500">{metaEvent}</span>
          </div>
        </div>
      )}

      {receita !== undefined && receita > 0 && (
        <div className="pt-3 border-t border-[var(--admin-border)] border-dashed">
          <div className="flex justify-between items-center text-[10px]">
            <span className="text-[var(--admin-muted)]">Receita Gerada:</span>
            <span className="font-bold text-green-600">R$ {(receita / 100).toFixed(2).replace(".", ",")}</span>
          </div>
        </div>
      )}
    </button>
  );
}
