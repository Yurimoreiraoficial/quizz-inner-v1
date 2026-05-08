import { Download } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { SectionCard } from "@/components/admin/SectionCard";
import { StatCard } from "@/components/admin/StatCard";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { useSetTopbarActions } from "@/components/admin/AdminLayout";
import { loadState } from "@/data/admin/store";

const sample = [
  { id: "intro",        visitors: 1000, completion: 0.86 },
  { id: "uso_ia",       visitors: 860,  completion: 0.74 },
  { id: "insert_50ias", visitors: 780,  completion: 0.92 },
  { id: "mercado",      visitors: 720,  completion: 0.81 },
  { id: "insert_help",  visitors: 690,  completion: 0.93 },
  { id: "tarefas",      visitors: 640,  completion: 0.69 },
  { id: "insert_proof", visitors: 530,  completion: 0.88 },
  { id: "dores",        visitors: 470,  completion: 0.72 },
  { id: "loading",      visitors: 405,  completion: 0.97 },
  { id: "lead",         visitors: 393,  completion: 0.61 },
  { id: "final",        visitors: 240,  completion: 0.18 },
];

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
  const state = loadState();
  const labelMap = new Map(state.steps.map((s) => [s.id, s.title]));
  const max = Math.max(...sample.map((s) => s.visitors));

  const rows = sample.map((s) => ({
    etapa: labelMap.get(s.id) ?? s.id,
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
        description="Conversão por etapa, drop-off e tendência. Conecte o backend para ver dados reais."
        right={<StatusBadge variant="warning">dados de exemplo</StatusBadge>}
      />

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-4 mb-6">
        <StatCard label="Visitantes" value="1.000" hint="últimos 14 dias" badge="exemplo" />
        <StatCard label="Leads capturados" value="240" hint="conversão final" badge="exemplo" />
        <StatCard label="Conclusão do quiz" value="24%" hint="visitantes → final" badge="exemplo" />
        <StatCard label="CTR para checkout" value="18%" badge="exemplo" />
      </div>

      <SectionCard title="Funil por etapa" className="mb-5">
        <div className="space-y-3">
          {sample.map((s) => {
            const pct = (s.visitors / max) * 100;
            return (
              <div key={s.id}>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="font-medium">{labelMap.get(s.id) ?? s.id}</span>
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
            {sample.map((s) => (
              <tr key={s.id}>
                <td className="font-medium">{labelMap.get(s.id) ?? s.id}</td>
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
