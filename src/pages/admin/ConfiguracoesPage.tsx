import { useState } from "react";
import { Save } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { SectionCard } from "@/components/admin/SectionCard";
import { useSetTopbarActions } from "@/components/admin/AdminLayout";
import { loadState, saveState } from "@/data/admin/store";

export default function ConfiguracoesPage() {
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

  return (
    <>
      <PageHeader title="Configurações" description="Workspace, perfil e branding mínimo do MVP." />

      <div className="grid gap-5 grid-cols-1 xl:grid-cols-2">
        <SectionCard title="Workspace">
          <div>
            <label className="admin-label block mb-1.5">Nome do workspace</label>
            <input
              className="admin-input"
              value={state.workspaceName}
              onChange={(e) => { setState({ ...state, workspaceName: e.target.value }); setDirty(true); }}
            />
          </div>
        </SectionCard>

        <SectionCard title="Perfil">
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-white text-lg font-semibold"
              style={{ background: "var(--admin-dark)" }}
            >
              Y
            </div>
            <div>
              <div className="font-semibold">Yuri Moreira</div>
              <div className="text-xs" style={{ color: "var(--admin-muted)" }}>Operador do MVP</div>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Branding" description="Cores leitura no MVP. Edição no próximo ciclo." className="xl:col-span-2">
          <div className="flex flex-wrap gap-3">
            {[
              { l: "Texto", v: "#171717" },
              { l: "Azul", v: "#2563eb" },
              { l: "Verde", v: "#16a34a" },
              { l: "Amarelo", v: "#b7791f" },
              { l: "Roxo", v: "#7c3aed" },
              { l: "Vermelho", v: "#991b1b" },
            ].map((c) => (
              <div key={c.l} className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ border: "1px solid var(--admin-border)" }}>
                <span className="w-5 h-5 rounded-full" style={{ background: c.v }} />
                <span className="text-xs">{c.l}</span>
                <span className="text-xs font-mono" style={{ color: "var(--admin-muted)" }}>{c.v}</span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </>
  );
}
