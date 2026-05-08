import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutGrid, FileStack, FlaskConical, BarChart3, Settings,
  Pencil, GitBranch, SplitSquareHorizontal, Link2, Stethoscope, LifeBuoy,
} from "lucide-react";
import { AdminLogo } from "./AdminLogo";

const workspace = [
  { to: "/admin/funis",         label: "Funis",          icon: LayoutGrid },
  { to: "/admin/templates",     label: "Templates",      icon: FileStack },
  { to: "/admin/experimentos",  label: "Experimentos",   icon: FlaskConical },
  { to: "/admin/analytics",     label: "Analytics",      icon: BarChart3 },
  { to: "/admin/configuracoes", label: "Configurações",  icon: Settings },
];

const contextual = [
  { to: "/admin/funis/atual",            label: "Visão geral",        icon: LayoutGrid, end: true },
  { to: "/admin/funis/atual/editor",     label: "Editor",             icon: Pencil },
  { to: "/admin/funis/atual/fluxo",      label: "Fluxo visual",       icon: GitBranch },
  { to: "/admin/funis/atual/ab",         label: "Testes A/B",         icon: SplitSquareHorizontal },
  { to: "/admin/funis/atual/analytics",  label: "Analytics",          icon: BarChart3 },
  { to: "/admin/funis/atual/links",      label: "Links e Pixels",     icon: Link2 },
  { to: "/admin/funis/atual/diagnostico",label: "Diagnóstico técnico",icon: Stethoscope },
];

export function AdminSidebar() {
  const { pathname } = useLocation();
  const showContext = pathname.startsWith("/admin/funis/atual");

  return (
    <aside
      className="flex flex-col shrink-0 sticky top-0 h-screen"
      style={{
        width: 260,
        background: "var(--admin-surface)",
        borderRight: "1px solid var(--admin-border)",
      }}
    >
      <div className="px-5 py-5">
        <AdminLogo />
      </div>

      <div className="px-3 flex-1 overflow-y-auto">
        <div className="px-3 pb-2 admin-label">Workspace</div>
        <nav className="flex flex-col gap-0.5 mb-6">
          {workspace.map((it) => (
            <NavLink
              key={it.to}
              to={it.to}
              className={({ isActive }) => `admin-nav-item ${isActive ? "active" : ""}`}
            >
              <it.icon /> {it.label}
            </NavLink>
          ))}
        </nav>

        {showContext && (
          <>
            <div className="px-3 pb-2 admin-label">Funil atual</div>
            <nav className="flex flex-col gap-0.5">
              {contextual.map((it) => (
                <NavLink
                  key={it.to}
                  to={it.to}
                  end={it.end}
                  className={({ isActive }) => `admin-nav-item ${isActive ? "active" : ""}`}
                >
                  <it.icon /> {it.label}
                </NavLink>
              ))}
            </nav>
          </>
        )}
      </div>

      <div className="p-4">
        <div
          className="rounded-2xl p-4"
          style={{ background: "var(--admin-surface-2)", border: "1px solid var(--admin-border)" }}
        >
          <div className="flex items-center gap-2 mb-2">
            <LifeBuoy className="w-4 h-4" style={{ color: "var(--admin-text)" }} />
            <span className="text-sm font-semibold">Precisa de ajuda?</span>
          </div>
          <p className="text-xs leading-relaxed mb-3" style={{ color: "var(--admin-muted)" }}>
            Documentação interna e referências rápidas para operar o funil atual.
          </p>
          <a href="#" className="admin-link text-xs">Abrir guia →</a>
        </div>
      </div>
    </aside>
  );
}