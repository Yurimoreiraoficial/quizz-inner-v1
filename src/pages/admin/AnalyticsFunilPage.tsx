import { useEffect, useMemo, useState } from "react";
import { Download, Inbox } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { SectionCard } from "@/components/admin/SectionCard";
import { StatCard } from "@/components/admin/StatCard";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { EmptyState } from "@/components/admin/EmptyState";
import { useSetTopbarActions } from "@/components/admin/AdminLayout";
import {
  loadAnalytics,
  type AnalyticsFilters,
  type FunnelAnalytics,
  type RouteFilter,
  type ScreenStatus,
  type ThemeFilter,
} from "@/services/analyticsService";

function exportCsv(rows: Record<string, unknown>[], filename = "analytics-funil.csv") {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => JSON.stringify(r[h] ?? "")).join(",")),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

const STATUS_VARIANT: Record<ScreenStatus, "info" | "success" | "warning" | "neutral" | "danger"> = {
  entrada: "info",
  saudavel: "success",
  atencao: "warning",
  risco: "warning",
  critico: "danger",
};
const STATUS_LABEL: Record<ScreenStatus, string> = {
  entrada: "Entrada",
  saudavel: "Saudável",
  atencao: "Atenção",
  risco: "Risco",
  critico: "Crítico",
};

function fmt(n: number) { return n.toLocaleString("pt-BR"); }
function pct(n: number) { return `${n.toFixed(1)}%`; }
function secs(n: number) {
  if (!n) return "—";
  if (n < 60) return `${n.toFixed(0)}s`;
  return `${Math.floor(n / 60)}m ${Math.round(n % 60)}s`;
}

export default function AnalyticsFunilPage() {
  const [filters, setFilters] = useState<AnalyticsFilters>({ rangeDays: 30, theme: "todos", route: "todos" });
  const [data, setData] = useState<FunnelAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    void loadAnalytics(filters).then((d) => { setData(d); setLoading(false); });
  }, [filters]);

  const csvRows = useMemo(() => (data?.byScreen ?? []).map((s) => ({
    etapa: s.name,
    tipo: s.type,
    usuarios: s.users,
    perda_pct: Number(s.lossPct.toFixed(1)),
    conv_prev_pct: Number(s.convPrevPct.toFixed(1)),
    conv_acc_pct: Number(s.convAccPct.toFixed(1)),
    tempo_medio_s: Number(s.avgTimeSec.toFixed(1)),
    acao: s.mainAction,
    status: s.status,
  })), [data]);

  useSetTopbarActions(
    <button className="admin-btn-secondary inline-flex items-center gap-1.5" onClick={() => exportCsv(csvRows)}>
      <Download className="w-4 h-4" /> Exportar CSV
    </button>,
  );

  const m = data?.macros;
  const hasEvents = (data?.totalEvents ?? 0) > 0;
  const max = Math.max(1, ...(data?.byScreen.map((s) => s.users) ?? [1]));

  function patch(p: Partial<AnalyticsFilters>) { setFilters((f) => ({ ...f, ...p })); }

  return (
    <>
      <PageHeader
        title="Analytics do funil"
        description="Conversão por etapa, A/B, rotas finais e segmentos — calculados em cima de dados reais."
        right={
          loading
            ? <StatusBadge variant="neutral">carregando</StatusBadge>
            : hasEvents
              ? <StatusBadge variant="success">dados reais</StatusBadge>
              : <StatusBadge variant="warning">aguardando volume</StatusBadge>
        }
      />

      {/* Filtros globais */}
      <SectionCard title="Filtros" className="mb-5">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
          <div>
            <label className="admin-label block mb-1.5">Período</label>
            <select className="admin-input" value={String(filters.rangeDays)} onChange={(e) => patch({ rangeDays: Number(e.target.value) as AnalyticsFilters["rangeDays"] })}>
              <option value="7">Últimos 7 dias</option>
              <option value="15">Últimos 15 dias</option>
              <option value="30">Últimos 30 dias</option>
              <option value="0">Customizado</option>
            </select>
          </div>
          {filters.rangeDays === 0 && (
            <>
              <div>
                <label className="admin-label block mb-1.5">De</label>
                <input type="date" className="admin-input" value={filters.startDate?.slice(0, 10) ?? ""} onChange={(e) => patch({ startDate: new Date(e.target.value).toISOString() })} />
              </div>
              <div>
                <label className="admin-label block mb-1.5">Até</label>
                <input type="date" className="admin-input" value={filters.endDate?.slice(0, 10) ?? ""} onChange={(e) => patch({ endDate: new Date(e.target.value).toISOString() })} />
              </div>
            </>
          )}
          <div>
            <label className="admin-label block mb-1.5">Origem</label>
            <select className="admin-input" value={filters.source ?? ""} onChange={(e) => patch({ source: e.target.value || undefined })}>
              <option value="">Todas</option>
              {(data?.available.sources ?? []).map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="admin-label block mb-1.5">Campanha</label>
            <select className="admin-input" value={filters.campaign ?? ""} onChange={(e) => patch({ campaign: e.target.value || undefined })}>
              <option value="">Todas</option>
              {(data?.available.campaigns ?? []).map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="admin-label block mb-1.5">Mercado</label>
            <select className="admin-input" value={filters.mercado ?? ""} onChange={(e) => patch({ mercado: e.target.value || undefined })}>
              <option value="">Todos</option>
              {(data?.available.mercados ?? []).map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="admin-label block mb-1.5">Variante A/B</label>
            <select className="admin-input" value={filters.variantId ?? ""} onChange={(e) => patch({ variantId: e.target.value || undefined })}>
              <option value="">Todas</option>
              {(data?.available.variants ?? []).map((v) => <option key={v.id} value={v.id}>{v.label}</option>)}
            </select>
          </div>
          <div>
            <label className="admin-label block mb-1.5">Tema</label>
            <select className="admin-input" value={filters.theme ?? "todos"} onChange={(e) => patch({ theme: e.target.value as ThemeFilter })}>
              <option value="todos">Todos</option>
              <option value="dark">Dark</option>
              <option value="light">Light</option>
            </select>
          </div>
          <div>
            <label className="admin-label block mb-1.5">Rota final</label>
            <select className="admin-input" value={filters.route ?? "todos"} onChange={(e) => patch({ route: e.target.value as RouteFilter })}>
              <option value="todos">Todas</option>
              <option value="checkout">Checkout</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="ultra">Ultra</option>
            </select>
          </div>
        </div>
      </SectionCard>

      {/* Cards macro */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 xl:grid-cols-6 mb-6">
        <StatCard label="Visitantes" value={fmt(m?.visitors ?? 0)} hint="sessões únicas" />
        <StatCard label="Início do funil" value={fmt(m?.starts ?? 0)} hint="funnel_start" />
        <StatCard label="Leads capturados" value={fmt(m?.leads ?? 0)} hint="lead_submit" />
        <StatCard label="Checkout clicks" value={fmt(m?.checkoutClicks ?? 0)} hint="checkout_click" />
        <StatCard label="WhatsApp clicks" value={fmt(m?.whatsappClicks ?? 0)} hint="whatsapp_click" />
        <StatCard label="Compras" value={fmt(m?.purchases ?? 0)} hint={m?.revenue ? `R$ ${fmt(m.revenue)}` : "sem evento purchase"} />
      </div>

      {/* Funil visual */}
      <SectionCard title="Funil visual geral" className="mb-5">
        {!hasEvents ? (
          <EmptyState icon={<Inbox className="w-5 h-5" />} title="Ainda não há eventos suficientes para este período." description="Ajuste o filtro de período ou aguarde tráfego." />
        ) : (
          <div className="space-y-3">
            {data!.byScreen.map((s) => {
              const w = (s.users / max) * 100;
              return (
                <div key={s.screen_key}>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="font-medium">{s.name}</span>
                    <span style={{ color: "var(--admin-muted)" }}>
                      {fmt(s.users)} · {pct(s.convAccPct)} acumulada
                    </span>
                  </div>
                  <div className="h-2.5 rounded-full overflow-hidden" style={{ background: "var(--admin-surface-3)" }}>
                    <div className="h-full rounded-full" style={{ width: `${w}%`, background: "var(--admin-blue)" }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>

      {/* Tabela micro de conversão */}
      <SectionCard padded={false} title="Conversão por etapa" className="mb-5">
        {!hasEvents ? (
          <div className="p-6"><EmptyState title="Sem dados de tela neste filtro." /></div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Tela</th>
                <th>Tipo</th>
                <th>Usuários</th>
                <th>Perda vs anterior</th>
                <th>Conv. vs anterior</th>
                <th>Conv. acumulada</th>
                <th>Tempo médio</th>
                <th>Ação</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data!.byScreen.map((s) => (
                <tr key={s.screen_key}>
                  <td className="font-medium">{s.name}</td>
                  <td className="text-xs" style={{ color: "var(--admin-muted)" }}>{s.type}</td>
                  <td>{fmt(s.users)}</td>
                  <td>{pct(s.lossPct)}</td>
                  <td>{pct(s.convPrevPct)}</td>
                  <td>{pct(s.convAccPct)}</td>
                  <td>{secs(s.avgTimeSec)}</td>
                  <td className="text-xs">{s.mainAction}</td>
                  <td><StatusBadge variant={STATUS_VARIANT[s.status]}>{STATUS_LABEL[s.status]}</StatusBadge></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </SectionCard>

      {/* A/B */}
      <SectionCard title="Performance por variação A/B" className="mb-5" padded={false}>
        {(!data || data.abVariants.length === 0) ? (
          <div className="p-6"><EmptyState title="Nenhum teste A/B ativo encontrado." /></div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Teste</th>
                <th>Variante</th>
                <th>Visitantes</th>
                <th>Leads</th>
                <th>Checkout</th>
                <th>WhatsApp</th>
                <th>Compras</th>
                <th>Conversão</th>
              </tr>
            </thead>
            <tbody>
              {data.abVariants.map((v) => (
                <tr key={v.variant_id}>
                  <td className="font-medium">{v.test_name}</td>
                  <td>{v.variant_label}</td>
                  <td>{fmt(v.visitors)}</td>
                  <td>{fmt(v.leads)}</td>
                  <td>{fmt(v.checkout)}</td>
                  <td>{fmt(v.whatsapp)}</td>
                  <td>{fmt(v.purchases)}</td>
                  <td>{pct(v.conversion)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </SectionCard>

      {/* Rotas finais */}
      <SectionCard title="Rotas finais" className="mb-5">
        <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
          <StatCard label="Checkout direto" value={fmt(data?.routes.checkout ?? 0)} hint="sessões com checkout_click" />
          <StatCard label="WhatsApp" value={fmt(data?.routes.whatsapp ?? 0)} hint="sessões com whatsapp_click" />
          <StatCard label="Ultra acionado" value={fmt(data?.routes.ultra ?? 0)} hint="sessões com ultra_interest" />
        </div>
      </SectionCard>

      {/* Segmentos */}
      <SectionCard title="Segmentos por respostas">
        {(data?.totalLeads ?? 0) === 0 ? (
          <EmptyState title="Nenhum lead captado neste filtro." description="Os segmentos aparecem assim que houver leads com respostas associadas." />
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            <SegmentBlock title="Mercado" rows={data!.segments.mercado} />
            <SegmentBlock title="Uso atual de IA" rows={data!.segments.uso_ia} />
            <SegmentBlock title="Tarefas principais" rows={data!.segments.tarefas} />
            <SegmentBlock title="Dores principais" rows={data!.segments.dores} />
            <SegmentBlock title="Interesse Ultra" rows={data!.segments.interesse_ultra} />
            <SegmentBlock title="Plano indicado" rows={data!.segments.plano} />
          </div>
        )}
      </SectionCard>
    </>
  );
}

function SegmentBlock({ title, rows }: { title: string; rows: { label: string; count: number; share: number }[] }) {
  if (!rows.length) {
    return (
      <div className="admin-card-soft p-4">
        <div className="admin-label mb-2">{title}</div>
        <p className="text-xs" style={{ color: "var(--admin-muted)" }}>Sem dados.</p>
      </div>
    );
  }
  const max = Math.max(1, ...rows.map((r) => r.count));
  return (
    <div className="admin-card-soft p-4">
      <div className="admin-label mb-3">{title}</div>
      <div className="space-y-2">
        {rows.slice(0, 8).map((r) => (
          <div key={r.label}>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="truncate pr-2">{r.label}</span>
              <span style={{ color: "var(--admin-muted)" }}>{r.count} · {r.share.toFixed(0)}%</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--admin-surface-3)" }}>
              <div className="h-full rounded-full" style={{ width: `${(r.count / max) * 100}%`, background: "var(--admin-blue)" }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
