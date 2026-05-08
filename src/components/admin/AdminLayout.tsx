import { Outlet } from "react-router-dom";
import { AdminSidebar } from "./AdminSidebar";
import { AdminTopbar } from "./AdminTopbar";
import { createContext, useContext, useState, type ReactNode } from "react";

type TopbarCtx = { setActions: (n: ReactNode | null) => void };
const Ctx = createContext<TopbarCtx>({ setActions: () => {} });

export const useTopbarActions = () => useContext(Ctx);

export function AdminLayout() {
  const [actions, setActions] = useState<ReactNode | null>(null);

  return (
    <Ctx.Provider value={{ setActions }}>
      <div className="admin-theme flex w-full" style={{ minHeight: "100vh" }}>
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <AdminTopbar actions={actions} />
          <main className="flex-1" style={{ padding: "28px 30px", background: "var(--admin-bg)" }}>
            <Outlet />
          </main>
        </div>
      </div>
    </Ctx.Provider>
  );
}

/* Hook utilitário: define ações da topbar enquanto a página estiver montada */
import { useEffect } from "react";
export function useSetTopbarActions(node: ReactNode) {
  const { setActions } = useTopbarActions();
  useEffect(() => {
    setActions(node);
    return () => setActions(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [node]);
}