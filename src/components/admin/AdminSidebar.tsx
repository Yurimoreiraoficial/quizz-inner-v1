import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutGrid, FileStack, FlaskConical, BarChart3, Settings,
  Pencil, GitBranch, SplitSquareHorizontal, Link2, Stethoscope,
} from "lucide-react";
import { AdminLogo } from "./AdminLogo";

const workspace = [
  { to: "/admin/funis",         label: "Funis",          icon: LayoutGrid },
];

const contextual = [
  { to: "/admin/funis/atual/fluxo",      label: "Fluxo visual",       icon: GitBranch },
  { to: "/admin/funis/atual/ab",         label: "Testes A/B",         icon: SplitSquareHorizontal },
  { to: "/admin/funis/atual/analytics",  label: "Analytics",          icon: BarChart3 },
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

    </aside>
  );
}