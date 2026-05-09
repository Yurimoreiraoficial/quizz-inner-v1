import { ChevronRight, ChevronDown } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const labelMap: Record<string, string> = {
  admin: "Workspace",
  funis: "Funis",
  atual: "Funil atual",
  editor: "Editor",
  fluxo: "Fluxo visual",
  ab: "Testes A/B",
  analytics: "Analytics",
  links: "Links e Pixels",
  diagnostico: "Diagnóstico técnico",
};

function useCrumbs() {
  const { pathname } = useLocation();
  const parts = pathname.split("/").filter(Boolean);
  const crumbs: { label: string; to: string }[] = [];
  let acc = "";
  parts.forEach((p) => {
    acc += "/" + p;
    crumbs.push({ label: labelMap[p] ?? p, to: acc });
  });
  return crumbs;
}

export function AdminTopbar({ actions }: { actions?: React.ReactNode }) {
  const crumbs = useCrumbs();
  return (
    <header
      className="flex items-center justify-between sticky top-0 z-20 px-7"
      style={{
        height: 66,
        background: "var(--admin-surface)",
        borderBottom: "1px solid var(--admin-border)",
      }}
    >
      <nav className="flex items-center gap-1.5 text-sm" aria-label="Breadcrumb">
        {crumbs.map((c, i) => (
          <div key={c.to} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight className="w-3.5 h-3.5" style={{ color: "var(--admin-muted-2)" }} />}
            {i === crumbs.length - 1 ? (
              <span className="font-semibold" style={{ color: "var(--admin-text)" }}>{c.label}</span>
            ) : (
              <Link to={c.to} style={{ color: "var(--admin-muted)" }} className="hover:underline">{c.label}</Link>
            )}
          </div>
        ))}
      </nav>

      <div className="flex items-center gap-3">
        {actions}
        <div className="admin-divider" style={{ width: 1, height: 28 }} />
        <button className="flex items-center gap-2 px-1.5 py-1 rounded-xl hover:bg-[var(--admin-surface-3)] transition">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold"
            style={{ background: "var(--admin-dark)" }}
          >
            Y
          </div>
          <span className="text-sm font-semibold">Yuri Moreira</span>
          <ChevronDown className="w-4 h-4" style={{ color: "var(--admin-muted)" }} />
        </button>
      </div>
    </header>
  );
}