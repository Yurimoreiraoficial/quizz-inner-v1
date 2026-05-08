import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { SectionCard } from "@/components/admin/SectionCard";
import { StatCard } from "@/components/admin/StatCard";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { useSetTopbarActions } from "@/components/admin/AdminLayout";
import { useFunnelScreens } from "@/hooks/useFunnelScreens";
import { loadAnalytics, type FunnelAnalytics } from "@/services/analyticsService";

function exportCsv(rows: Record<string, unknown>[]) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => JSON.stringify(r[h] ?? "")).join(",")),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "analytics-funil.csv"; a.click();
  URL.revokeObjectURL(url);
}

export default function AnalyticsFunilPage() {
  const { screens } = useFunnelScreens();
  const [analytics, setAnalytics] = useState<FunnelAnalytics | null>(null);

  useEffect(() => {
    void loadAnalytics().then(setAnalytics);
  }, []);

  const viewsByScreen = new Map(analytics?.byScreen.map((s) => [s.screen_key, s.views]) ?? []);
  const hasRealData = (analytics?.totalSessions ?? 0) > 0;

  const computed = screens.map((s, i) => {
    const views = viewsByScreen.get(s.id) ?? 0;
    const next = screens[i + 1];
    const nextViews = next ? viewsByScreen.get(next.id) ?? 0 : 0;
    const completion = views > 0 && next ? Math.min(nextViews / views, 1) : 0;
    return { id: s.id, name: s.name, visitors: views, completion };
  });

  const max = Math.max(1, ...computed.map((s) => s.visitors));

  const rows = computed.map((s) => ({
    etapa: s.name,
    visitantes: s.visitors,
    conclusao_pct: Math.round(s.completion * 100),
  }));

  useSetTopbarActions(
    <button className="admin-btn-secondary inline-flex items-center gap-1.5" onClick={() => exportCsv(rows)}>
      <Download className="w-4 h-4" /> Exportar CSV
    </button>,
  );

  return (
    <>
      <PageHeader
        title="Analytics do funil"
        description="Conversão por etapa, drop-off e tendência. Dados reais do backend."
        right={
          hasRealData
            ? <StatusBadge variant="success">dados reais</StatusBadge>
            : <StatusBadge variant="warning">aguardando volume</StatusBadge>
        }
      />

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-4 mb-6">
        <StatCard
          label="Sessões"
          value={(analytics?.totalSessions ?? 0).toLocaleString("pt-BR")}
          hint="visitantes únicos"
        />
        <StatCard
          label="Leads capturados"
          value={(analytics?.totalLeads ?? 0).toLocaleString("pt-BR")}
          hint="conversão final"
        />
        <StatCard
          label="Etapas configuradas"
          value={String(screens.length)}
          hint="fonte: funnelConfig"
        />
        <StatCard
          label="Conclusão estimada"
          value={(() => {
            const intro = computed[0]?.visitors ?? 0;
            const final = computed[computed.length - 1]?.visitors ?? 0;
            if (!intro) return "—";
            return `${Math.round((final / intro) * 100)}%`;
          })()}
          hint="primeira → última"
        />
      </div>

      <SectionCard title="Funil por etapa" className="mb-5">
        <div className="space-y-3">
          {computed.map((s) => {
            const pct = (s.visitors / max) * 100;
            return (
              <div key={s.id}>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="font-medium">{s.name}</span>
                  <span style={{ color: "var(--admin-muted)" }}>
                    {s.visitors.toLocaleString("pt-BR")} · {Math.round(s.completion * 100)}% concluem
                  </span>
                </div>
                <div className="h-2.5 rounded-full overflow-hidden" style={{ background: "var(--admin-surface-3)" }}>
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "var(--admin-blue)" }} />
                </div>
              </div>
            );
          })}
        </div>
      </SectionCard>

      <SectionCard padded={false} title="Drop-off por etapa">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Etapa</th>
              <th>Visitantes</th>
              <th>Conclusão</th>
              <th>Drop-off</th>
            </tr>
          </thead>
          <tbody>
            {computed.map((s) => (
              <tr key={s.id}>
                <td className="font-medium">{s.name}</td>
                <td>{s.visitors.toLocaleString("pt-BR")}</td>
                <td>{Math.round(s.completion * 100)}%</td>
                <td>
                  <StatusBadge variant={s.completion < 0.7 ? "warning" : "neutral"}>
                    {Math.round((1 - s.completion) * 100)}%
                  </StatusBadge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </SectionCard>
    </>
  );
}
