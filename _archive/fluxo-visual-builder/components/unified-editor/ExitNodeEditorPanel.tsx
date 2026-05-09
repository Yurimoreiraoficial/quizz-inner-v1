import { useEffect, useState } from "react";
import { Save, ExternalLink, MessageCircle, BarChart3, ShieldCheck, Zap } from "lucide-react";
import type { FlowSelection } from "@/pages/admin/UnifiedFunnelEditorPage";
import type { FunnelAnalytics } from "@/services/analyticsService";
import { loadState, saveState, type LinksConfig } from "@/data/admin/store";
import { loadFunnel, saveLinks } from "@/services/funnelService";
import { toast } from "@/hooks/use-toast";

export function ExitNodeEditorPanel({
  selection,
  analytics
}: {
  selection: Extract<FlowSelection, { type: "exit" }>;
  analytics: FunnelAnalytics | null;
}) {
  const isWhatsApp = selection.id === "whatsapp";
  const isCheckout = selection.id === "checkout";
  const isPurchase = selection.id === "purchase";

  const [state, setState] = useState(() => loadState());
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  // Hydrate from backend
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
        },
      }));
    });
  }, []);

  async function handleSave() {
    setSaving(true);
    saveState(state);
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
      title: r.ok ? "Configurações salvas" : "Salvo localmente",
      description: r.ok ? "Sincronizado com o backend." : "Backend indisponível — alterações ficam locais.",
    });
  }

  function update<K extends keyof LinksConfig>(k: K, v: LinksConfig[K]) {
    setState((s) => ({ ...s, links: { ...s.links, [k]: v } }));
    setDirty(true);
  }

  const visitors = analytics?.macros.visitors || 1;

  let title = "";
  let subtitle = "";
  let clicks = 0;
  let convGeral = 0;

  if (isWhatsApp) {
    title = "Saída · WhatsApp";
    subtitle = "Informações da saída para contato direto com o time de vendas.";
    clicks = analytics?.macros.whatsappClicks || 0;
    convGeral = clicks / visitors;
  } else if (isCheckout) {
    title = "Saída · Checkout";
    subtitle = "Configure o link de checkout, evento, UTMs e testes de checkout.";
    clicks = analytics?.macros.checkoutClicks || 0;
    convGeral = clicks / visitors;
  } else if (isPurchase) {
    title = "Compra confirmada";
    subtitle = "Acompanhe a conversão final do checkout para compra.";
    clicks = analytics?.macros.purchases || 0;
    convGeral = clicks / visitors;
  }

  const receita = isPurchase ? analytics?.macros.revenue || 0 : undefined;
  const ticket = isPurchase && clicks > 0 ? receita! / clicks : undefined;

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar bg-[var(--admin-surface)] h-full p-8">
      <div className="space-y-8">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--admin-muted)] mb-1">
              Bloco de Conversão
            </div>
            <div className="font-bold text-xl text-[var(--admin-text)]">{title}</div>
            <p className="text-xs text-[var(--admin-muted)] mt-1">{subtitle}</p>
          </div>
          
          {isCheckout && (
            <button
              onClick={handleSave}
              disabled={!dirty || saving}
              className={`admin-btn-primary inline-flex items-center gap-1.5 ${!dirty && !saving ? "opacity-50" : ""}`}
            >
              <Save className="w-4 h-4" /> {saving ? "Salvando..." : "Salvar configurações"}
            </button>
          )}
        </div>

        {/* Métricas e Performance */}
        <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] shadow-sm rounded-2xl p-5">
          <h3 className="font-semibold text-sm mb-4">Métricas de Performance</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[var(--admin-surface-2)] p-4 rounded-xl border border-[var(--admin-border)]">
              <div className="text-xs text-[var(--admin-muted)] mb-1">
                {isPurchase ? "Compras totais" : "Cliques totais"}
              </div>
              <div className="font-bold text-lg text-[var(--admin-text)]">{clicks > 0 ? clicks.toLocaleString("pt-BR") : "—"}</div>
            </div>

            <div className="bg-[var(--admin-surface-2)] p-4 rounded-xl border border-[var(--admin-border)]">
              <div className="text-xs text-[var(--admin-muted)] mb-1">Conversão Geral</div>
              <div className="font-bold text-lg text-[var(--admin-text)]">
                {clicks > 0 ? (convGeral * 100).toFixed(1) + "%" : "—"}
              </div>
            </div>

            {isPurchase && (
              <>
                <div className="bg-[var(--admin-surface-2)] p-4 rounded-xl border border-[var(--admin-border)]">
                  <div className="text-xs text-[var(--admin-muted)] mb-1">Receita Gerada</div>
                  <div className="font-bold text-lg text-green-600">
                    {receita! > 0 ? `R$ ${(receita! / 100).toFixed(2).replace(".", ",")}` : "—"}
                  </div>
                </div>

                <div className="bg-[var(--admin-surface-2)] p-4 rounded-xl border border-[var(--admin-border)]">
                  <div className="text-xs text-[var(--admin-muted)] mb-1">Ticket Médio</div>
                  <div className="font-bold text-lg text-[var(--admin-text)]">
                    {ticket! > 0 ? `R$ ${(ticket! / 100).toFixed(2).replace(".", ",")}` : "—"}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* WhatsApp Information (Read-Only) */}
        {isWhatsApp && (
          <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] shadow-sm rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-[var(--admin-border)]">
              <MessageCircle className="w-5 h-5 text-emerald-500" />
              <h3 className="font-bold text-sm">Configuração de Saída</h3>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--admin-muted)]">Link Destino</div>
                  <div className="text-sm font-semibold text-[var(--admin-text)] flex items-center gap-2 break-all">
                    {state.links.whatsappBaseUrl || "Não configurado"}
                    {state.links.whatsappBaseUrl && <ExternalLink className="w-3 h-3 opacity-30" />}
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--admin-muted)]">Gatilho do Evento</div>
                  <div className="text-sm font-semibold text-[var(--admin-text)]">Clique no WhatsApp</div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--admin-muted)]">Evento Meta Ads</div>
                  <div className="text-sm font-bold text-blue-500">{state.links.whatsappEventMeta || "Contact"}</div>
                </div>
                
                <div className="space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--admin-muted)]">Status do Tracking</div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-sm font-semibold">Ativo e Monitorado</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-[var(--admin-border)] space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--admin-muted)]">Mensagem Atual</div>
                <p className="text-xs text-[var(--admin-muted)] leading-relaxed italic">
                  {state.links.whatsappMessage ? `"${state.links.whatsappMessage}"` : "Usando mensagem padrão da lógica do sistema."}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Checkout Fields (Maintain current but simplified) */}
        {isCheckout && (
          <>
            <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] shadow-sm rounded-2xl p-5">
              <h3 className="font-semibold text-sm mb-4">Link de Checkout</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="admin-label block mb-1.5">Checkout base URL</label>
                  <input 
                    className="admin-input" 
                    value={state.links.checkoutBaseUrl} 
                    onChange={(e) => update("checkoutBaseUrl", e.target.value)} 
                    placeholder="https://checkout.innerai.com/plano-pro"
                  />
                </div>
              </div>
            </div>

            <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] shadow-sm rounded-2xl p-5">
              <h3 className="font-semibold text-sm mb-4">Configuração de Eventos</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="admin-label block mb-1.5">Evento Meta Ads</label>
                  <select 
                    className="admin-input bg-white" 
                    value={state.links.checkoutEventMeta || "InitiateCheckout"}
                    onChange={(e) => update("checkoutEventMeta", e.target.value)}
                  >
                    <option value="InitiateCheckout">InitiateCheckout</option>
                    <option value="Lead">Lead</option>
                    <option value="ViewContent">ViewContent</option>
                    <option value="Subscribe">Subscribe</option>
                    <option value="Purchase">Purchase</option>
                  </select>
                </div>
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
