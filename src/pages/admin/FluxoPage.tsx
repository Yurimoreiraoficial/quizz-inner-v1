import { Link } from "react-router-dom";
import { PageHeader } from "@/components/admin/PageHeader";
import { SectionCard } from "@/components/admin/SectionCard";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { useFunnelScreens } from "@/hooks/useFunnelScreens";

export default function FluxoPage() {
  const { screens, source } = useFunnelScreens();

  return (
    <>
      <PageHeader
        title="Fluxo visual"
        description="Visão sequencial das etapas do funil. Edição drag-and-drop fora de escopo nesta fase."
        right={<StatusBadge variant="info">{source === "supabase" ? "backend" : "config"}</StatusBadge>}
      />

      <SectionCard>
        <ol className="flex flex-col items-stretch gap-3 max-w-xl mx-auto">
          {screens.map((s, i) => (
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
                      <div className="text-sm font-semibold">{s.name}</div>
                      <div className="text-xs" style={{ color: "var(--admin-muted)" }}>{s.type}</div>
                    </div>
                  </div>
                  {s.status !== "active" && <StatusBadge variant="neutral">{s.status}</StatusBadge>}
                </div>
              </Link>
              {i < screens.length - 1 && (
                <div className="w-px h-5" style={{ background: "var(--admin-border-strong)" }} />
              )}
            </li>
          ))}
        </ol>
      </SectionCard>
    </>
  );
}
