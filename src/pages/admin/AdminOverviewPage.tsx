import { Link } from "react-router-dom";
import { Pencil, BarChart3, Link2, SplitSquareHorizontal, ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { SectionCard } from "@/components/admin/SectionCard";
import { StatCard } from "@/components/admin/StatCard";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { MobilePreviewFrame } from "@/components/admin/MobilePreviewFrame";
import { useSetTopbarActions } from "@/components/admin/AdminLayout";

const shortcuts = [
  { to: "/admin/funis/atual/editor",    label: "Editar etapas",    icon: Pencil,                  desc: "Títulos, CTAs e ordem" },
  { to: "/admin/funis/atual/ab",        label: "Criar teste A/B",  icon: SplitSquareHorizontal,   desc: "Variantes de copy ou CTA" },
  { to: "/admin/funis/atual/analytics", label: "Ver analytics",    icon: BarChart3,               desc: "Conversão por etapa" },
  { to: "/admin/funis/atual/links",     label: "Links e Pixels",   icon: Link2,                   desc: "Checkout, UTMs e tracking" },
];

export default function AdminOverviewPage() {
  useSetTopbarActions(
    <>
      <a href="/dark" target="_blank" rel="noreferrer" className="admin-btn-secondary inline-flex items-center gap-1.5">
        <ExternalLink className="w-4 h-4" /> Preview
      </a>
      <button className="admin-btn-primary">Publicar funil</button>
    </>,
  );

  return (
    <>
      <PageHeader
        title="Quiz Inner — versão dark"
        description="Visão geral do funil atual. Toda configuração aqui afeta a versão pública em /dark."
        right={<StatusBadge variant="success">Publicado</StatusBadge>}
      />

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-4 mb-6">
        <StatCard label="Visitantes (24h)" value="—" hint="Aguardando volume." badge="exemplo" />
        <StatCard label="Leads (7d)" value="—" hint="Aguardando volume." badge="exemplo" />
        <StatCard label="Conversão para checkout" value="—" hint="Calculado nas próximas 24h." badge="exemplo" />
        <StatCard label="Etapas" value="11" hint="Última edição agora." />
      </div>

      <div className="grid gap-5 grid-cols-1 xl:grid-cols-3">
        <div className="xl:col-span-2 flex flex-col gap-5">
          <SectionCard title="Próximos passos" description="Atalhos para operar o funil atual.">
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
              {shortcuts.map((s) => (
                <Link
                  key={s.to}
                  to={s.to}
                  className="flex items-start gap-3 rounded-2xl p-4 transition hover:bg-[var(--admin-surface-2)]"
                  style={{ border: "1px solid var(--admin-border)" }}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: "var(--admin-surface-3)" }}
                  >
                    <s.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{s.label}</div>
                    <div className="text-xs mt-0.5" style={{ color: "var(--admin-muted)" }}>{s.desc}</div>
                  </div>
                </Link>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Status de integração">
            <ul className="space-y-3 text-sm">
              <li className="flex items-center justify-between">
                <span>Checkout principal</span>
                <StatusBadge variant="success">conectado</StatusBadge>
              </li>
              <li className="flex items-center justify-between">
                <span>WhatsApp do time</span>
                <StatusBadge variant="success">conectado</StatusBadge>
              </li>
              <li className="flex items-center justify-between">
                <span>Meta Pixel</span>
                <StatusBadge variant="warning">não configurado</StatusBadge>
              </li>
              <li className="flex items-center justify-between">
                <span>GA4 / GTM</span>
                <StatusBadge variant="warning">não configurado</StatusBadge>
              </li>
            </ul>
          </SectionCard>
        </div>

        <SectionCard title="Preview ao vivo" description="Versão pública em /dark.">
          <div className="flex justify-center">
            <MobilePreviewFrame>
              <iframe
                src="/dark"
                title="Preview do funil"
                className="w-full h-full border-0"
              />
            </MobilePreviewFrame>
          </div>
        </SectionCard>
      </div>
    </>
  );
}