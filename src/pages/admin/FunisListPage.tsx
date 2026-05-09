import { Link } from "react-router-dom";
import { Eye, Rocket } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { SectionCard } from "@/components/admin/SectionCard";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { useSetTopbarActions } from "@/components/admin/AdminLayout";

export default function FunisListPage() {
  useSetTopbarActions(
    <button className="admin-btn-secondary" disabled title="Em breve">+ Novo funil</button>,
  );

  return (
    <>
      <PageHeader
        title="Funis"
        description="Operação do funil atual já existente. Nesta fase do MVP, o foco é configurar, testar e medir esta versão."
      />

      <div
        className="admin-card-soft p-4 mb-5 flex items-start gap-3"
        style={{ background: "var(--admin-blue-soft)", borderColor: "rgba(37, 99, 235, 0.15)" }}
      >
        <div className="w-2 h-2 rounded-full mt-2" style={{ background: "var(--admin-blue)" }} />
        <div>
          <p className="text-sm font-semibold" style={{ color: "var(--admin-blue)" }}>
            MVP: apenas o funil atual
          </p>
          <p className="text-xs mt-1" style={{ color: "var(--admin-text)" }}>
            Criação de novos funis, marketplace de templates e múltiplos workspaces estão fora do escopo desta versão.
          </p>
        </div>
      </div>

      <SectionCard padded={false}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Funil</th>
              <th>Status</th>
              <th>Conversão (24h)</th>
              <th>Leads (7d)</th>
              <th>Última edição</th>
              <th style={{ textAlign: "right" }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <div className="font-semibold">Quiz Inner — versão dark</div>
                <div className="text-xs mt-0.5" style={{ color: "var(--admin-muted)" }}>
                  /dark · 11 etapas
                </div>
              </td>
              <td><StatusBadge variant="success">Publicado</StatusBadge></td>
              <td>
                <span className="font-semibold">—</span>
                <StatusBadge variant="neutral" className="ml-2">exemplo</StatusBadge>
              </td>
              <td>
                <span className="font-semibold">—</span>
                <StatusBadge variant="neutral" className="ml-2">exemplo</StatusBadge>
              </td>
              <td style={{ color: "var(--admin-muted)" }}>Hoje</td>
              <td style={{ textAlign: "right" }}>
                <div className="inline-flex items-center gap-2">
                  <a href="/dark" target="_blank" rel="noreferrer" className="admin-btn-ghost inline-flex items-center gap-1.5">
                    <Eye className="w-4 h-4" /> Preview
                  </a>
                  <Link to="/admin/funis/atual/analytics" className="admin-btn-primary inline-flex items-center gap-1.5">
                    <Rocket className="w-4 h-4" /> Abrir
                  </Link>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </SectionCard>
    </>
  );
}