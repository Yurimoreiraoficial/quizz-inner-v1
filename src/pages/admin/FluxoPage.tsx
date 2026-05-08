import { Link } from "react-router-dom";
import { PageHeader } from "@/components/admin/PageHeader";
import { SectionCard } from "@/components/admin/SectionCard";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { loadState } from "@/data/admin/store";

export default function FluxoPage() {
  const state = loadState();

  return (
    <>
      <PageHeader
        title="Fluxo visual"
        description="Visão sequencial das etapas do funil. Edição drag-and-drop fora de escopo nesta fase."
        right={<StatusBadge variant="info">read-only</StatusBadge>}
      />

      <SectionCard>
        <ol className="flex flex-col items-stretch gap-3 max-w-xl mx-auto">
          {state.steps.map((s, i) => (
            <li key={s.id} className="flex flex-col items-center">
              <Link
                to={`/admin/funis/atual/editor`}
                className="w-full rounded-2xl px-4 py-3 transition hover:bg-[var(--admin-surface-2)]"
                style={{ border: "1px solid var(--admin-border)", background: "var(--admin-surface)" }}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-semibold"
                      style={{ background: "var(--admin-surface-3)", color: "var(--admin-muted)" }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <div className="text-sm font-semibold">{s.title}</div>
                      <div className="text-xs" style={{ color: "var(--admin-muted)" }}>{s.type}</div>
                    </div>
                  </div>
                  {!s.enabled && <StatusBadge variant="neutral">off</StatusBadge>}
                </div>
              </Link>
              {i < state.steps.length - 1 && (
                <div className="w-px h-5" style={{ background: "var(--admin-border-strong)" }} />
              )}
            </li>
          ))}
        </ol>
      </SectionCard>
    </>
  );
}
