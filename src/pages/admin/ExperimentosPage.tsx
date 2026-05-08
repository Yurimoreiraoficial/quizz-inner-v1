import { Link } from "react-router-dom";
import { FlaskConical } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { EmptyState } from "@/components/admin/EmptyState";

export default function ExperimentosPage() {
  return (
    <>
      <PageHeader title="Experimentos" description="Visão consolidada de testes A/B entre funis." />
      <EmptyState
        icon={<FlaskConical className="w-5 h-5" />}
        title="Apenas o funil atual nesta fase"
        description="Como há um único funil no MVP, gerencie os testes diretamente dentro do funil."
        action={<Link to="/admin/funis/atual/ab" className="admin-btn-primary">Abrir testes A/B do funil</Link>}
      />
    </>
  );
}
