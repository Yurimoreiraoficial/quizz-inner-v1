import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { SectionCard } from "@/components/admin/SectionCard";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { EmptyState } from "@/components/admin/EmptyState";
import { loadState, saveState, type Experiment } from "@/data/admin/store";
import { useFunnelScreens } from "@/hooks/useFunnelScreens";
import { saveAbTest } from "@/services/funnelService";

const variantBadge: Record<Experiment["status"], React.ComponentProps<typeof StatusBadge>["variant"]> = {
  draft: "neutral", running: "experiment", finished: "success",
};
const variantLabel: Record<Experiment["status"], string> = {
  draft: "rascunho", running: "rodando", finished: "finalizado",
};

export default function AbPage() {
  const [state, setState] = useState(() => loadState());
  const [open, setOpen] = useState(false);
  const { screens } = useFunnelScreens();
  const [draft, setDraft] = useState<Omit<Experiment, "id" | "createdAt" | "status"> & { screenKey: string }>({
    name: "", element: "CTA principal", variantA: "", variantB: "", goal: "Cliques no checkout",
    screenKey: "final",
  });

  function persist(next: typeof state) { setState(next); saveState(next); }

  async function create() {
    if (!draft.name || !draft.variantA || !draft.variantB) return;
    const exp: Experiment = {
      name: draft.name,
      element: draft.element,
      variantA: draft.variantA,
      variantB: draft.variantB,
      goal: draft.goal,
      id: Math.random().toString(36).slice(2, 9),
      createdAt: new Date().toISOString(),
      status: "draft",
    };
    persist({ ...state, experiments: [exp, ...state.experiments] });
    // Best-effort: persistir também no backend
    void saveAbTest({
      name: draft.name,
      screen_key: draft.screenKey,
      field_key: draft.element,
      metric: draft.goal,
      status: "draft",
    });
    setOpen(false);
    setDraft({ name: "", element: "CTA principal", variantA: "", variantB: "", goal: "Cliques no checkout", screenKey: "final" });
  }

  function setStatus(id: string, status: Experiment["status"]) {
    persist({ ...state, experiments: state.experiments.map((e) => e.id === id ? { ...e, status } : e) });
  }

  function remove(id: string) {
    persist({ ...state, experiments: state.experiments.filter((e) => e.id !== id) });
  }

  return (
    <>
      <PageHeader
        title="Testes A/B"
        description="Experimente variações simples de copy ou CTA. Split 50/50."
        right={<button className="admin-btn-primary inline-flex items-center gap-1.5" onClick={() => setOpen(true)}><Plus className="w-4 h-4" /> Novo teste</button>}
      />

      {open && (
        <SectionCard title="Novo teste A/B" className="mb-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="admin-label block mb-1.5">Nome do teste</label>
              <input className="admin-input" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="Ex.: CTA final v1" />
            </div>
            <div>
              <label className="admin-label block mb-1.5">Tela do funil</label>
              <select
                className="admin-input"
                value={draft.screenKey}
                onChange={(e) => setDraft({ ...draft, screenKey: e.target.value })}
              >
                {screens.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="admin-label block mb-1.5">Elemento testado</label>
              <input className="admin-input" value={draft.element} onChange={(e) => setDraft({ ...draft, element: e.target.value })} />
            </div>
            <div>
              <label className="admin-label block mb-1.5">Variante A</label>
              <input className="admin-input" value={draft.variantA} onChange={(e) => setDraft({ ...draft, variantA: e.target.value })} placeholder="Texto original" />
            </div>
            <div>
              <label className="admin-label block mb-1.5">Variante B</label>
              <input className="admin-input" value={draft.variantB} onChange={(e) => setDraft({ ...draft, variantB: e.target.value })} placeholder="Nova proposta" />
            </div>
            <div className="sm:col-span-2">
              <label className="admin-label block mb-1.5">Meta</label>
              <input className="admin-input" value={draft.goal} onChange={(e) => setDraft({ ...draft, goal: e.target.value })} />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button className="admin-btn-ghost" onClick={() => setOpen(false)}>Cancelar</button>
            <button className="admin-btn-primary" onClick={create}>Criar teste</button>
          </div>
        </SectionCard>
      )}

      {state.experiments.length === 0 ? (
        <EmptyState
          title="Nenhum teste criado"
          description="Crie um teste A/B simples para validar uma mudança de copy ou de CTA antes de publicar."
        />
      ) : (
        <SectionCard padded={false}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Teste</th>
                <th>Elemento</th>
                <th>Variante A → B</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {state.experiments.map((e) => (
                <tr key={e.id}>
                  <td>
                    <div className="font-semibold">{e.name}</div>
                    <div className="text-xs mt-0.5" style={{ color: "var(--admin-muted)" }}>Meta: {e.goal}</div>
                  </td>
                  <td>{e.element}</td>
                  <td className="text-xs" style={{ color: "var(--admin-muted)" }}>
                    <div>"{e.variantA}"</div>
                    <div>vs</div>
                    <div>"{e.variantB}"</div>
                  </td>
                  <td><StatusBadge variant={variantBadge[e.status]}>{variantLabel[e.status]}</StatusBadge></td>
                  <td style={{ textAlign: "right" }}>
                    <div className="inline-flex items-center gap-2">
                      {e.status !== "running" && <button className="admin-btn-ghost" onClick={() => setStatus(e.id, "running")}>Iniciar</button>}
                      {e.status === "running" && <button className="admin-btn-ghost" onClick={() => setStatus(e.id, "finished")}>Finalizar</button>}
                      <button className="admin-btn-ghost" onClick={() => remove(e.id)} aria-label="Remover">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </SectionCard>
      )}
    </>
  );
}
