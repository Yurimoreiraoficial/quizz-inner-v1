import { Link } from "react-router-dom";
import { BarChart3 } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { EmptyState } from "@/components/admin/EmptyState";

export default function AnalyticsGlobalPage() {
  return (
    <>
      <PageHeader title="Analytics global" description="Visão consolidada da operação." />
      <EmptyState
        icon={<BarChart3 className="w-5 h-5" />}
        title="Apenas o funil atual nesta fase"
        description="Com um único funil ativo, o analytics global espelha o do funil. Veja métricas detalhadas dentro do funil."
        action={<Link to="/admin/funis/atual/analytics" className="admin-btn-primary">Abrir analytics do funil</Link>}
      />
    </>
  );
}
