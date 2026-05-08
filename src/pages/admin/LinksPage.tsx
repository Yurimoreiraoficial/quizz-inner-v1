import { useState } from "react";
import { Save } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { SectionCard } from "@/components/admin/SectionCard";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { useSetTopbarActions } from "@/components/admin/AdminLayout";
import { loadState, saveState, type LinksConfig } from "@/data/admin/store";

export default function LinksPage() {
  const [state, setState] = useState(() => loadState());
  const [dirty, setDirty] = useState(false);

  useSetTopbarActions(
    <button
      className="admin-btn-primary inline-flex items-center gap-1.5"
      disabled={!dirty}
      onClick={() => { saveState(state); setDirty(false); }}
    >
      <Save className="w-4 h-4" /> Salvar
    </button>,
  );

  function update<K extends keyof LinksConfig>(k: K, v: LinksConfig[K]) {
    setState((s) => ({ ...s, links: { ...s.links, [k]: v } }));
    setDirty(true);
  }

  const pixelStatus = (v: string) => v.trim()
    ? <StatusBadge variant="success">configurado</StatusBadge>
    : <StatusBadge variant="warning">não configurado</StatusBadge>;

  return (
    <>
      <PageHeader title="Links e Pixels" description="Centralize as URLs e os IDs de tracking usados pelo funil." />

      <div className="grid gap-5 grid-cols-1 xl:grid-cols-2">
        <SectionCard title="Links principais">
          <div className="space-y-4">
            <div>
              <label className="admin-label block mb-1.5">Checkout base URL</label>
              <input className="admin-input" value={state.links.checkoutBaseUrl} onChange={(e) => update("checkoutBaseUrl", e.target.value)} />
            </div>
            <div>
              <label className="admin-label block mb-1.5">WhatsApp base URL</label>
              <input className="admin-input" value={state.links.whatsappBaseUrl} onChange={(e) => update("whatsappBaseUrl", e.target.value)} />
            </div>
          </div>
        </SectionCard>

        <SectionCard title="UTMs padrão" description="Aplicadas quando o visitante chega sem UTMs.">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="admin-label block mb-1.5">Source</label>
              <input className="admin-input" value={state.links.defaultUtmSource} onChange={(e) => update("defaultUtmSource", e.target.value)} />
            </div>
            <div>
              <label className="admin-label block mb-1.5">Medium</label>
              <input className="admin-input" value={state.links.defaultUtmMedium} onChange={(e) => update("defaultUtmMedium", e.target.value)} />
            </div>
            <div>
              <label className="admin-label block mb-1.5">Campaign</label>
              <input className="admin-input" value={state.links.defaultUtmCampaign} onChange={(e) => update("defaultUtmCampaign", e.target.value)} />
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Pixels e tracking" className="xl:col-span-2">
          <div className="grid gap-5 sm:grid-cols-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="admin-label">GTM ID</label>
                {pixelStatus(state.links.gtmId)}
              </div>
              <input className="admin-input" placeholder="GTM-XXXXXX" value={state.links.gtmId} onChange={(e) => update("gtmId", e.target.value)} />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="admin-label">Meta Pixel</label>
                {pixelStatus(state.links.metaPixelId)}
              </div>
              <input className="admin-input" placeholder="ID numérico" value={state.links.metaPixelId} onChange={(e) => update("metaPixelId", e.target.value)} />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="admin-label">GA4 ID</label>
                {pixelStatus(state.links.ga4Id)}
              </div>
              <input className="admin-input" placeholder="G-XXXXXXX" value={state.links.ga4Id} onChange={(e) => update("ga4Id", e.target.value)} />
            </div>
          </div>

          <div className="flex items-center gap-2 mt-5">
            <button
              className="admin-btn-secondary"
              onClick={() => { console.info("[admin] evento de teste disparado", { ts: Date.now(), links: state.links }); }}
            >
              Disparar evento de teste
            </button>
            <span className="text-xs" style={{ color: "var(--admin-muted)" }}>
              Olhe o console do navegador para ver o payload.
            </span>
          </div>
        </SectionCard>
      </div>
    </>
  );
}
