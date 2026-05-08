import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Save, RotateCcw } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { SectionCard } from "@/components/admin/SectionCard";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { MobilePreviewFrame } from "@/components/admin/MobilePreviewFrame";
import { useSetTopbarActions } from "@/components/admin/AdminLayout";
import { useFunnelScreens } from "@/hooks/useFunnelScreens";
import { saveScreen } from "@/services/funnelService";
import { getActiveScreens, type FunnelScreen } from "@/data/funnelConfig";
import { toast } from "@/hooks/use-toast";

export default function EditorPage() {
  const { screens: loaded, setScreens, source } = useFunnelScreens();
  const [screens, setLocal] = useState<FunnelScreen[]>(loaded);
  const [selectedId, setSelectedId] = useState(loaded[0]?.id ?? "intro");
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  // sincroniza quando o backend responde
  useEffect(() => { setLocal(loaded); }, [loaded]);

  async function handleSave() {
    setSaving(true);
    const target = screens.find((s) => s.id === selectedId);
    let ok = true;
    if (target) {
      const r = await saveScreen(target);
      ok = r.ok;
    }
    setScreens(screens);
    setSaving(false);
    setDirty(false);
    toast({
      title: ok ? "Tela salva" : "Salvo localmente",
      description: ok ? "Sincronizada com o backend." : "Backend indisponível — alterações ficam locais.",
    });
  }

  function handleReset() {
    const fresh = getActiveScreens();
    setLocal(fresh);
    setScreens(fresh);
    setDirty(false);
  }

  useSetTopbarActions(
    <>
      <button className="admin-btn-secondary inline-flex items-center gap-1.5" onClick={handleReset}>
        <RotateCcw className="w-4 h-4" /> Restaurar padrão
      </button>
      <button className="admin-btn-primary inline-flex items-center gap-1.5" disabled={saving} onClick={handleSave}>
        <Save className="w-4 h-4" /> {saving ? "Salvando..." : "Salvar tela"}
      </button>
    </>,
  );

  const selected = useMemo(
    () => screens.find((s) => s.id === selectedId) ?? screens[0],
    [screens, selectedId],
  );

  function updateContent(field: "headline" | "subtitle" | "buttonText", value: string) {
    setLocal((arr) =>
      arr.map((st) =>
        st.id === selectedId
          ? { ...st, content: { ...st.content, [field]: value } }
          : st,
      ),
    );
    setDirty(true);
  }

  function updateCtaLabel(value: string) {
    setLocal((arr) =>
      arr.map((st) =>
        st.id === selectedId
          ? { ...st, cta: { ...(st.cta ?? { type: "next", label: "" }), label: value } }
          : st,
      ),
    );
    setDirty(true);
  }

  function updateStatus(enabled: boolean) {
    setLocal((arr) =>
      arr.map((st) =>
        st.id === selectedId ? { ...st, status: enabled ? "active" : "disabled" } : st,
      ),
    );
    setDirty(true);
  }

  function move(idx: number, dir: -1 | 1) {
    setLocal((arr) => {
      const next = [...arr];
      const j = idx + dir;
      if (j < 0 || j >= next.length) return arr;
      [next[idx], next[j]] = [next[j], next[idx]];
      return next.map((s, i) => ({ ...s, order: i + 1 }));
    });
    setDirty(true);
  }

  if (!selected) return null;

  return (
    <>
      <PageHeader
        title="Editor de etapas"
        description="Edite títulos, subtítulos e CTAs do funil atual. Reorganize a ordem ou desative etapas."
        right={
          dirty
            ? <StatusBadge variant="warning">rascunho não salvo</StatusBadge>
            : <StatusBadge variant="neutral">{source === "supabase" ? "backend" : "config"}</StatusBadge>
        }
      />

      <div className="grid gap-5 grid-cols-1 xl:grid-cols-[320px_1fr_auto]">
        <SectionCard title="Etapas" padded={false}>
          <ul>
            {screens.map((s, i) => (
              <li
                key={s.id}
                className="flex items-center justify-between gap-2 px-4 py-3 cursor-pointer transition"
                style={{
                  background: selectedId === s.id ? "var(--admin-surface-3)" : "transparent",
                  borderBottom: i < screens.length - 1 ? "1px solid var(--admin-border)" : "none",
                }}
                onClick={() => setSelectedId(s.id)}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono" style={{ color: "var(--admin-muted-2)" }}>{String(i + 1).padStart(2, "0")}</span>
                    <span className="text-sm font-semibold truncate">{s.name}</span>
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: "var(--admin-muted)" }}>{s.type}</div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {s.status !== "active" && <StatusBadge variant="neutral">{s.status}</StatusBadge>}
                  <button className="admin-btn-ghost p-1.5" onClick={(e) => { e.stopPropagation(); move(i, -1); }} aria-label="Subir">
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button className="admin-btn-ghost p-1.5" onClick={(e) => { e.stopPropagation(); move(i, 1); }} aria-label="Descer">
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard
          title={`Editando: ${selected.name}`}
          description={`Tipo: ${selected.type}`}
          right={
            <label className="inline-flex items-center gap-2 text-xs font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={selected.status === "active"}
                onChange={(e) => updateStatus(e.target.checked)}
              />
              Etapa ativa
            </label>
          }
        >
          <div className="space-y-4">
            <div>
              <label className="admin-label block mb-1.5">Título</label>
              <input
                className="admin-input"
                value={selected.content.headline ?? ""}
                onChange={(e) => updateContent("headline", e.target.value)}
              />
            </div>
            <div>
              <label className="admin-label block mb-1.5">Subtítulo</label>
              <textarea
                className="admin-input"
                rows={3}
                value={selected.content.subtitle ?? ""}
                onChange={(e) => updateContent("subtitle", e.target.value)}
              />
            </div>
            <div>
              <label className="admin-label block mb-1.5">Texto do CTA</label>
              <input
                className="admin-input"
                value={selected.content.buttonText ?? selected.cta?.label ?? ""}
                onChange={(e) => {
                  updateContent("buttonText", e.target.value);
                  updateCtaLabel(e.target.value);
                }}
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2 text-xs" style={{ color: "var(--admin-muted)" }}>
              <div><span className="admin-label">Próxima tela:</span> <span className="font-mono">{selected.nextScreen ?? "—"}</span></div>
              <div><span className="admin-label">CTA tipo:</span> <span className="font-mono">{selected.cta?.type ?? "—"}</span></div>
              <div><span className="admin-label">Evento view:</span> <span className="font-mono">{selected.events?.view ?? "—"}</span></div>
              <div><span className="admin-label">Pixels:</span> <span className="font-mono">{selected.pixels?.length ?? 0}</span></div>
              <div><span className="admin-label">Regras:</span> <span className="font-mono">{selected.rules?.length ?? 0}</span></div>
              <div><span className="admin-label">Opções:</span> <span className="font-mono">{selected.options?.length ?? 0}</span></div>
            </div>

            <div
              className="text-xs p-3 rounded-xl"
              style={{ background: "var(--admin-yellow-soft)", color: "var(--admin-yellow)" }}
            >
              Texto, CTA e status são persistidos no backend ao clicar em Salvar tela. Eventos, pixels e regras seguem na configuração base por enquanto.
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Preview" description="Renderização real em /dark">
          <div className="flex justify-center">
            <MobilePreviewFrame>
              <iframe src="/dark" title="Preview" className="w-full h-full border-0" />
            </MobilePreviewFrame>
          </div>
        </SectionCard>
      </div>
    </>
  );
}
