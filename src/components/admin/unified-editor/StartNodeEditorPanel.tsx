import { useEffect, useState } from "react";
import { Save, CheckCircle2, AlertTriangle, XCircle, RefreshCw } from "lucide-react";
import { loadState, saveState, type LinksConfig } from "@/data/admin/store";
import { loadFunnel, saveLinks } from "@/services/funnelService";
import { toast } from "@/hooks/use-toast";
import { StatusBadge } from "@/components/admin/StatusBadge";
import type { FlowSelection } from "@/pages/admin/UnifiedFunnelEditorPage";
import type { FunnelScreen } from "@/data/funnelConfig";
import type { AbTest } from "@/services/abService";
import type { FunnelAnalytics } from "@/services/analyticsService";

type CheckStatus = "ok" | "warn" | "fail";
type Check = { 
  id: string; 
  label: string; 
  description: string; 
  status: CheckStatus; 
  action?: FlowSelection;
  suggestion?: string;
  shortLabel: string;
};

export function StartNodeEditorPanel({
  onSelect,
  screens,
  abTests,
  analytics
}: {
  onSelect: (s: FlowSelection) => void;
  screens: FunnelScreen[];
  abTests: AbTest[];
  analytics: FunnelAnalytics | null;
}) {
  const [state, setState] = useState(() => loadState());
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [checks, setChecks] = useState<Check[] | null>(null);
  const [checking, setChecking] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Hydrate from backend (funnels table) on mount
  useEffect(() => {
    void loadFunnel().then(({ remote }) => {
      if (!remote) return;
      setState((s) => ({
        ...s,
        links: {
          ...s.links,
          checkoutBaseUrl: (remote.checkout_url as string) || s.links.checkoutBaseUrl,
          whatsappBaseUrl: remote.whatsapp_number
            ? `https://api.whatsapp.com/send/?phone=${remote.whatsapp_number}`
            : s.links.whatsappBaseUrl,
          metaPixelId: (remote.meta_pixel_id as string) || s.links.metaPixelId,
          ga4Id: (remote.google_tag_id as string) || s.links.ga4Id,
          gtmId: (remote.gtm_id as string) || s.links.gtmId,
        },
      }));
    });
  }, []);

  async function handleSave() {
    setSaving(true);
    saveState(state); // fallback local
    const phone = state.links.whatsappBaseUrl.match(/phone=(\d+)/)?.[1] ?? "";
    const r = await saveLinks({
      checkoutUrl: state.links.checkoutBaseUrl,
      whatsappNumber: phone,
      metaPixelId: state.links.metaPixelId,
      ga4Id: state.links.ga4Id,
      gtmId: state.links.gtmId,
    });
    setSaving(false);
    setDirty(false);
    toast({
      title: r.ok ? "Links salvos" : "Salvo localmente",
      description: r.ok ? "Sincronizado com o backend." : "Backend indisponível — alterações ficam locais.",
    });
    runDiagnostics();
  }

  function update<K extends keyof LinksConfig>(k: K, v: LinksConfig[K]) {
    setState((s) => ({ ...s, links: { ...s.links, [k]: v } }));
    setDirty(true);
  }

  const runDiagnostics = async () => {
    setChecking(true);
    const results: Check[] = [];

    // Pixels
    results.push({
      id: "meta", label: "Meta Pixel", shortLabel: "Meta Pixel",
      description: state.links.metaPixelId ? "Configurado" : "Não configurado",
      status: state.links.metaPixelId ? "ok" : "warn",
    });
    
    // UTMs
    const utmOk = !!(state.links.defaultUtmSource && state.links.defaultUtmMedium && state.links.defaultUtmCampaign);
    results.push({
      id: "utm", label: "UTMs padrão", shortLabel: "UTM",
      description: utmOk ? "Preenchidas" : "Faltam parâmetros",
      status: utmOk ? "ok" : "warn",
    });

    // Checkout
    const chkOk = !!state.links.checkoutBaseUrl;
    results.push({
      id: "checkout", label: "Link de Checkout", shortLabel: "Checkout",
      description: chkOk ? "URL válida" : "Ausente",
      status: chkOk ? "ok" : "fail",
      action: { type: "exit", id: "checkout" }
    });

    // WhatsApp
    const wppOk = !!state.links.whatsappBaseUrl;
    results.push({
      id: "whatsapp", label: "Número do WhatsApp", shortLabel: "WhatsApp",
      description: wppOk ? "Configurado" : "Ausente",
      status: wppOk ? "ok" : "warn",
      action: { type: "exit", id: "whatsapp" }
    });

    // AB Tests
    const activeTests = abTests.filter(t => t.status !== "completed");
    if (activeTests.length > 0) {
      const invalidTests = activeTests.filter(t => t.variants.length < 2);
      results.push({
        id: "ab", label: "Testes A/B", shortLabel: "A/B",
        description: invalidTests.length === 0 ? "Válidos" : "Incompletos",
        status: invalidTests.length === 0 ? "ok" : "fail",
        action: invalidTests.length > 0 ? { type: "screen", id: invalidTests[0].screen_key } : undefined
      });
    } else {
      results.push({
        id: "ab", label: "Testes A/B", shortLabel: "A/B",
        description: "Sem testes ativos",
        status: "ok",
      });
    }

    setChecks(results);
    setChecking(false);
  };

  useEffect(() => {
    runDiagnostics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screens, abTests]);

  const pixelStatus = (v: string) => v.trim()
    ? <StatusBadge variant="success">configurado</StatusBadge>
    : <StatusBadge variant="warning">não configurado</StatusBadge>;

  function statusIconCompact(s: CheckStatus) {
    if (s === "ok") return <div className="w-2 h-2 rounded-full bg-[var(--admin-green)]" />;
    if (s === "warn") return <div className="w-2 h-2 rounded-full bg-[var(--admin-yellow)]" />;
    return <div className="w-2 h-2 rounded-full bg-[var(--admin-red-text)]" />;
  }

  const okCount = checks?.filter((c) => c.status === "ok").length ?? 0;
  const warnCount = checks?.filter((c) => c.status === "warn").length ?? 0;
  const failCount = checks?.filter((c) => c.status === "fail").length ?? 0;

  const geralStatus = failCount > 0 
    ? { label: "Revisar item crítico", color: "var(--admin-red-text)", bg: "var(--admin-red-bg)" }
    : warnCount > 0 
      ? { label: "Publicável com atenção", color: "var(--admin-yellow)", bg: "rgba(234, 179, 8, 0.1)" }
      : { label: "Pronto para publicar", color: "var(--admin-green)", bg: "rgba(34, 197, 94, 0.1)" };

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar bg-[var(--admin-surface)] h-full p-8 relative">
      <div className="space-y-8">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--admin-muted)] mb-1">
              Configurações do funil
            </div>
            <div className="font-bold text-xl text-[var(--admin-text)]">Início</div>
            <p className="text-xs text-[var(--admin-muted)] mt-1">
              Defina pixels, tracking e UTMs padrão usados em todo o funil.
            </p>
          </div>
          
          <button
            onClick={handleSave}
            disabled={!dirty || saving}
            className={`admin-btn-primary inline-flex items-center gap-1.5 ${!dirty && !saving ? "opacity-50" : ""}`}
          >
            <Save className="w-4 h-4" /> {saving ? "Salvando..." : "Salvar configurações"}
          </button>
        </div>

        {/* Diagnóstico Técnico Compacto */}
        <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] shadow-sm rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-semibold text-sm">Diagnóstico rápido</h3>
              <p className="text-[11px] text-[var(--admin-muted)]">Validação essencial antes de publicar.</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="text-xs text-[var(--admin-muted)] hover:text-[var(--admin-text)] px-2 py-1 rounded transition-colors" onClick={() => setShowDetails(!showDetails)}>
                {showDetails ? "Ocultar" : "Ver detalhes"}
              </button>
              <button className="p-1.5 text-[var(--admin-muted)] hover:bg-[var(--admin-surface-2)] hover:text-[var(--admin-text)] rounded transition-colors" onClick={runDiagnostics}>
                <RefreshCw className={`w-3.5 h-3.5 ${checking ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-lg mb-3" style={{ backgroundColor: geralStatus.bg, color: geralStatus.color }}>
            <div className="font-bold text-xs">{geralStatus.label}</div>
            <div className="text-[10px] font-semibold tracking-wide">
              {okCount} OK · {warnCount} Atenção · {failCount} Crítico
            </div>
          </div>

          {!showDetails ? (
            <div className="flex flex-wrap gap-1.5">
              {(checks ?? []).map((c) => (
                <div key={c.id} className="flex items-center gap-1.5 px-2 py-1 rounded bg-[var(--admin-surface-2)] border border-[var(--admin-border)] text-[10px] font-medium text-[var(--admin-text)]">
                  {statusIconCompact(c.status)}
                  {c.shortLabel}
                </div>
              ))}
            </div>
          ) : (
            <ul className="mt-2 space-y-1">
              {(checks ?? []).map((c) => (
                <li key={c.id} className="flex items-center justify-between p-2 rounded-md bg-[var(--admin-surface-2)] border border-[var(--admin-border)] text-xs">
                  <div className="flex items-center gap-2">
                    {statusIconCompact(c.status)}
                    <span className="font-semibold text-[var(--admin-text)]">{c.shortLabel}:</span>
                    <span className="text-[var(--admin-muted)]">{c.description}</span>
                  </div>
                  {c.status !== "ok" && c.action && (
                    <button 
                      onClick={() => c.action && onSelect(c.action)}
                      className="text-[10px] text-[var(--admin-blue)] hover:underline ml-2 whitespace-nowrap"
                    >
                      Corrigir
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] shadow-sm rounded-2xl p-5">
          <h3 className="font-semibold text-sm mb-4">Pixel e Tracking</h3>
          
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="admin-label">Meta Pixel ID</label>
                {pixelStatus(state.links.metaPixelId)}
              </div>
              <input 
                className="admin-input" 
                placeholder="ID numérico" 
                value={state.links.metaPixelId} 
                onChange={(e) => update("metaPixelId", e.target.value)} 
              />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="admin-label">GTM ID</label>
                {pixelStatus(state.links.gtmId)}
              </div>
              <input 
                className="admin-input" 
                placeholder="GTM-XXXXXX" 
                value={state.links.gtmId} 
                onChange={(e) => update("gtmId", e.target.value)} 
              />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="admin-label">Google Tag ID / GA4</label>
                {pixelStatus(state.links.ga4Id)}
              </div>
              <input 
                className="admin-input" 
                placeholder="G-XXXXXXX" 
                value={state.links.ga4Id} 
                onChange={(e) => update("ga4Id", e.target.value)} 
              />
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[var(--admin-border)]">
              <div>
                <div className="text-sm font-semibold text-[var(--admin-text)]">Disparar eventos em preview</div>
                <div className="text-xs text-[var(--admin-muted)]">Bloqueia disparo de pixel durante a edição</div>
              </div>
              <div className="w-10 h-5 bg-gray-300 rounded-full relative cursor-not-allowed opacity-50">
                <div className="w-4 h-4 bg-white rounded-full absolute top-0.5 left-0.5" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] shadow-sm rounded-2xl p-5">
          <h3 className="font-semibold text-sm mb-4">UTM Padrão</h3>
          <p className="text-xs text-[var(--admin-muted)] mb-4">
            Aplicadas automaticamente quando o visitante chega sem UTMs, garantindo tracking nas saídas de Checkout e WhatsApp.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="admin-label block mb-1.5">utm_source</label>
              <input className="admin-input" value={state.links.defaultUtmSource} onChange={(e) => update("defaultUtmSource", e.target.value)} />
            </div>
            <div>
              <label className="admin-label block mb-1.5">utm_medium</label>
              <input className="admin-input" value={state.links.defaultUtmMedium} onChange={(e) => update("defaultUtmMedium", e.target.value)} />
            </div>
            <div>
              <label className="admin-label block mb-1.5">utm_campaign</label>
              <input className="admin-input" value={state.links.defaultUtmCampaign} onChange={(e) => update("defaultUtmCampaign", e.target.value)} />
            </div>
            <div>
              <label className="admin-label block mb-1.5">utm_content</label>
              <input className="admin-input" placeholder="(opcional)" />
            </div>
            <div>
              <label className="admin-label block mb-1.5">utm_term</label>
              <input className="admin-input" placeholder="(opcional)" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
