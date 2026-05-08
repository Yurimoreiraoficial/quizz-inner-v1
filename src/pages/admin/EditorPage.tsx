import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Save, RotateCcw } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { SectionCard } from "@/components/admin/SectionCard";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { MobilePreviewFrame } from "@/components/admin/MobilePreviewFrame";
import { useSetTopbarActions } from "@/components/admin/AdminLayout";
import { loadState, saveState, resetState, type AdminState, type StepDraft } from "@/data/admin/store";

export default function EditorPage() {
  const [state, setState] = useState<AdminState>(() => loadState());
  const [selectedId, setSelectedId] = useState(state.steps[0]?.id ?? "intro");
  const [dirty, setDirty] = useState(false);

  useSetTopbarActions(
    <>
      <button
        className="admin-btn-secondary inline-flex items-center gap-1.5"
        onClick={() => { setState(resetState()); setDirty(false); }}
      >
        <RotateCcw className="w-4 h-4" /> Restaurar padrão
      </button>
      <button
        className="admin-btn-primary inline-flex items-center gap-1.5"
        onClick={() => { saveState(state); setDirty(false); }}
      >
        <Save className="w-4 h-4" /> Salvar rascunho
      </button>
    </>,
  );

  useEffect(() => { if (dirty) saveState(state); }, [state, dirty]);

  const selected = useMemo(() => state.steps.find((s) => s.id === selectedId)!, [state, selectedId]);

  function update(field: keyof StepDraft, value: string | boolean) {
    setState((s) => ({
      ...s,
      steps: s.steps.map((st) => (st.id === selectedId ? { ...st, [field]: value } : st)),
    }));
    setDirty(true);
  }

  function move(idx: number, dir: -1 | 1) {
    setState((s) => {
      const next = [...s.steps];
      const j = idx + dir;
      if (j < 0 || j >= next.length) return s;
      [next[idx], next[j]] = [next[j], next[idx]];
      return { ...s, steps: next };
    });
    setDirty(true);
  }

  return (
    <>
      <PageHeader
        title="Editor de etapas"
        description="Edite títulos, subtítulos e CTAs do funil atual. Reorganize a ordem ou desative etapas."
        right={dirty ? <StatusBadge variant="warning">rascunho local</StatusBadge> : <StatusBadge variant="neutral">sem alterações</StatusBadge>}
      />

      <div className="grid gap-5 grid-cols-1 xl:grid-cols-[320px_1fr_auto]">
        <SectionCard title="Etapas" padded={false}>
          <ul>
            {state.steps.map((s, i) => (
              <li
                key={s.id}
                className="flex items-center justify-between gap-2 px-4 py-3 cursor-pointer transition"
                style={{
                  background: selectedId === s.id ? "var(--admin-surface-3)" : "transparent",
                  borderBottom: i < state.steps.length - 1 ? "1px solid var(--admin-border)" : "none",
                }}
                onClick={() => setSelectedId(s.id)}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono" style={{ color: "var(--admin-muted-2)" }}>{String(i + 1).padStart(2, "0")}</span>
                    <span className="text-sm font-semibold truncate">{s.title}</span>
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: "var(--admin-muted)" }}>{s.type}</div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {!s.enabled && <StatusBadge variant="neutral">off</StatusBadge>}
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
          title={`Editando: ${selected.title}`}
          description={`Tipo: ${selected.type}`}
          right={
            <label className="inline-flex items-center gap-2 text-xs font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={selected.enabled}
                onChange={(e) => update("enabled", e.target.checked)}
              />
              Etapa ativa
            </label>
          }
        >
          <div className="space-y-4">
            <div>
              <label className="admin-label block mb-1.5">Título</label>
              <input className="admin-input" value={selected.title} onChange={(e) => update("title", e.target.value)} />
            </div>
            <div>
              <label className="admin-label block mb-1.5">Subtítulo</label>
              <textarea
                className="admin-input"
                rows={3}
                value={selected.subtitle}
                onChange={(e) => update("subtitle", e.target.value)}
              />
            </div>
            <div>
              <label className="admin-label block mb-1.5">Texto do CTA</label>
              <input className="admin-input" value={selected.cta} onChange={(e) => update("cta", e.target.value)} />
            </div>

            <div
              className="text-xs p-3 rounded-xl"
              style={{ background: "var(--admin-yellow-soft)", color: "var(--admin-yellow)" }}
            >
              As alterações ficam salvas como rascunho local. A publicação automatizada será plugada em uma próxima fase.
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
