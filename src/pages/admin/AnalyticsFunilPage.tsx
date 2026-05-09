import { useEffect, useMemo, useState } from "react";
import { Inbox } from "lucide-react";
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
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RcTooltip,
  Legend, ResponsiveContainer,
} from "recharts";
import type { ScreenMicroRow } from "@/services/analyticsService";




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





  const m = data?.macros;
  const hasEvents = (data?.totalEvents ?? 0) > 0;
  const max = Math.max(1, ...(data?.byScreen.map((s) => s.users) ?? [1]));

  const funnelSteps = useMemo(() => {
    const visitors = m?.visitors || 0;
    const base = visitors || 1;
    return [
      { label: "Visitantes",      value: visitors,               pct: 100,                                            fill: "#4F7FFF" },
      { label: "Início do funil", value: m?.starts || 0,         pct: visitors ? ((m?.starts || 0) / base) * 100 : 0, fill: "#9B7FFF" },
      { label: "Leads captados",  value: m?.leads || 0,          pct: visitors ? ((m?.leads || 0) / base) * 100 : 0,  fill: "#F5A623" },
      { label: "Cliques no checkout", value: m?.checkoutClicks || 0, pct: visitors ? ((m?.checkoutClicks || 0) / base) * 100 : 0, fill: "#FFD93D" },
      { label: "Compras",         value: m?.purchases || 0,      pct: visitors ? ((m?.purchases || 0) / base) * 100 : 0,   fill: "#FFF176" },
    ];
  }, [m]);

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
      <SectionCard className="mb-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
          </div>
      </SectionCard>

      {/* ─── Bloco de métricas macro ─── */}
      {/* Linha 1 — Destaques financeiros */}
      {/* ─── Bloco de métricas macro: Cards Financeiros ─── */}
      <div className="grid gap-4 mb-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
        
        {/* 1. Receita */}
        <div className="admin-card p-5 flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-bold tracking-widest uppercase" style={{ color: "var(--admin-muted)" }}>Receita</span>
            <span className="text-3xl font-bold tracking-tight" style={{ color: "var(--admin-text)" }}>
              {m?.revenue ? `R$ ${fmt(m.revenue)}` : "—"}
            </span>
          </div>

          <div className="pt-4 border-t border-[var(--admin-border)]">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-medium" style={{ color: "var(--admin-muted)" }}>HOJE</span>
                <span className="text-sm font-bold" style={{ color: "var(--admin-text)" }}>
                  {m?.revenueToday ? `R$ ${fmt(m.revenueToday)}` : "—"}
                </span>
              </div>
              <div className="flex flex-col gap-0.5 pl-4" style={{ borderLeft: "1px solid var(--admin-border)" }}>
                <span className="text-[10px] font-medium" style={{ color: "var(--admin-muted)" }}>ONTEM</span>
                <span className="text-sm font-bold" style={{ color: "var(--admin-text)" }}>
                  {m?.revenueYesterday ? `R$ ${fmt(m.revenueYesterday)}` : "—"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Investimento */}
        <div className="admin-card p-5 flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-bold tracking-widest uppercase" style={{ color: "var(--admin-muted)" }}>Investimento</span>
            <span className="text-3xl font-bold tracking-tight" style={{ color: "var(--admin-text)" }}>
              {m?.investment ? `R$ ${fmt(m.investment)}` : "—"}
            </span>
          </div>

          <div className="pt-4 border-t border-[var(--admin-border)]">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-medium" style={{ color: "var(--admin-muted)" }}>HOJE</span>
                <span className="text-sm font-bold" style={{ color: "var(--admin-text)" }}>
                  {m?.investmentToday ? `R$ ${fmt(m.investmentToday)}` : "—"}
                </span>
              </div>
              <div className="flex flex-col gap-0.5 pl-4" style={{ borderLeft: "1px solid var(--admin-border)" }}>
                <span className="text-[10px] font-medium" style={{ color: "var(--admin-muted)" }}>ONTEM</span>
                <span className="text-sm font-bold" style={{ color: "var(--admin-text)" }}>
                  {m?.investmentYesterday ? `R$ ${fmt(m.investmentYesterday)}` : "—"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. ROAS */}
        <div className="admin-card p-5 flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-bold tracking-widest uppercase" style={{ color: "var(--admin-muted)" }}>ROAS</span>
            <span className="text-3xl font-bold tracking-tight" style={{ color: "var(--admin-text)" }}>
              {m?.roas ? `${m.roas.toFixed(1)}x` : "—"}
            </span>
          </div>

          <div className="pt-4 border-t border-[var(--admin-border)]">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-medium" style={{ color: "var(--admin-muted)" }}>HOJE</span>
                <span className="text-sm font-bold" style={{ color: "var(--admin-text)" }}>
                  {m?.roasToday ? `${m.roasToday.toFixed(1)}x` : "—"}
                </span>
              </div>
              <div className="flex flex-col gap-0.5 pl-4" style={{ borderLeft: "1px solid var(--admin-border)" }}>
                <span className="text-[10px] font-medium" style={{ color: "var(--admin-muted)" }}>ONTEM</span>
                <span className="text-sm font-bold" style={{ color: "var(--admin-text)" }}>
                  {m?.roasYesterday ? `${m.roasYesterday.toFixed(1)}x` : "—"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 4. CAC */}
        <div className="admin-card p-5 flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-bold tracking-widest uppercase" style={{ color: "var(--admin-muted)" }}>CAC</span>
            <span className="text-3xl font-bold tracking-tight" style={{ color: "var(--admin-text)" }}>
              {m?.investment && m?.purchases ? `R$ ${fmt(m.investment / (m.purchases || 1))}` : "—"}
            </span>
          </div>

          <div className="pt-4 border-t border-[var(--admin-border)]">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-medium" style={{ color: "var(--admin-muted)" }}>HOJE</span>
                <span className="text-sm font-bold" style={{ color: "var(--admin-text)" }}>
                  {m?.cacToday ? `R$ ${fmt(m.cacToday)}` : "—"}
                </span>
              </div>
              <div className="flex flex-col gap-0.5 pl-4" style={{ borderLeft: "1px solid var(--admin-border)" }}>
                <span className="text-[10px] font-medium" style={{ color: "var(--admin-muted)" }}>ONTEM</span>
                <span className="text-sm font-bold" style={{ color: "var(--admin-text)" }}>
                  {m?.cacYesterday ? `R$ ${fmt(m.cacYesterday)}` : "—"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Linha 2 — Funil de conversão (7 métricas pequenas) */}
      {(() => {
        const base = m?.visitors || 1;
        const metrics = [
          {
            label: "VISITANTES",
            value: fmt(m?.visitors ?? 0),
            sub: "Acessos no período",
            pct: null,
            pctColor: "pos",
          },
          {
            label: "INÍCIO DO FUNIL",
            value: fmt(m?.starts ?? 0),
            sub: `${((m?.starts || 0) / base * 100).toFixed(1)}% de início`,
            pct: null,
            pctColor: "pos",
          },
          {
            label: "LEADS CAPTADOS",
            value: fmt(m?.leads ?? 0),
            sub: `${((m?.leads || 0) / base * 100).toFixed(1)}% de lead`,
            pct: null,
            pctColor: "pos",
          },
          {
            label: "CLIQUES NO CHECKOUT",
            value: fmt(m?.checkoutClicks ?? 0),
            sub: `${(m?.leads ? ((m?.checkoutClicks || 0) / m.leads * 100) : 0).toFixed(1)}% dos leads`,
            pct: null,
            pctColor: "pos",
          },
          {
            label: "CLIQUES NO WHATSAPP",
            value: fmt(m?.whatsappClicks ?? 0),
            sub: `${(m?.leads ? ((m?.whatsappClicks || 0) / m.leads * 100) : 0).toFixed(1)}% dos leads`,
            pct: null,
            pctColor: "neg",
          },
          {
            label: "COMPRAS",
            value: fmt(m?.purchases ?? 0),
            sub: `${((m?.purchases || 0) / base * 100).toFixed(1)}% de compra`,
            pct: null,
            pctColor: "pos",
          },
          {
            label: "CONV. GERAL",
            value: `${((m?.purchases || 0) / base * 100).toFixed(1)}%`,
            sub: m?.revenue ? `R$ ${fmt(m.revenue)}` : "sem purchase",
            pct: null,
            pctColor: "pos",
          },
        ];
        return (
          <div className="grid gap-3 mb-6 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
            {metrics.map((met) => (
              <div key={met.label} className="admin-card p-4 flex flex-col gap-1.5">
                <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: "var(--admin-muted)" }}>
                  {met.label}
                </span>
                <span className="text-xl font-bold leading-tight" style={{ color: "var(--admin-text)" }}>
                  {met.value}
                </span>
                <span className="text-[11px]" style={{ color: "var(--admin-muted)" }}>
                  {met.sub}
                </span>
              </div>
            ))}
          </div>
        );
      })()}

      {/* Funil visual + Tabela — lado a lado */}
      <div className="grid gap-5 mb-5 grid-cols-1 xl:grid-cols-[5fr_7fr]">

        {/* Funil visual geral */}
        <SectionCard title="Conversão geral" className="h-full">
          {!hasEvents ? (
            <EmptyState icon={<Inbox className="w-5 h-5" />} title="Ainda não há eventos suficientes para este período." description="Ajuste o filtro de período ou aguarde tráfego." />
          ) : (
            <VisualFunnel steps={funnelSteps} fmt={fmt} />
          )}
        </SectionCard>

        {/* Tabela micro de conversão */}
        <SectionCard padded={false} title="Conversão por etapa" className="h-full">
          {!hasEvents ? (
            <div className="p-6"><EmptyState title="Sem dados de tela neste filtro." /></div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: "48px" }}>Etapa</th>
                  <th>Tela</th>
                  <th>Usuários</th>
                  <th>Conversão acumulada</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data!.byScreen.map((s, i) => (
                  <tr key={s.screen_key}>
                    <td className="text-center" style={{ color: "var(--admin-muted)", fontWeight: 600 }}>{i + 1}</td>
                    <td className="font-medium">{s.name}</td>
                    <td>{fmt(s.users)}</td>
                    <td>{pct(s.convAccPct)}</td>
                    <td><StatusBadge variant={STATUS_VARIANT[s.status]}>{STATUS_LABEL[s.status]}</StatusBadge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </SectionCard>

      </div>


      {/* ─── Mercados + Tarefas lado a lado ─── */}
      <div className="grid gap-5 mb-5 grid-cols-1 xl:grid-cols-2">

        {/* Conversão por mercado */}
        <SectionCard title="Conversão por mercado" description="Comparativo de conversão final por segmento principal.">
          {(data?.segments.mercado.length ?? 0) === 0 ? (
            <EmptyState title="Sem dados de segmento neste filtro." />
          ) : (
            <div className="space-y-4 mt-1">
              {data!.segments.mercado.slice(0, 6).map((row) => {
                const barW = row.share;
                return (
                  <div key={row.label} className="flex items-center gap-3">
                    <span className="text-sm font-medium w-28 shrink-0">{row.label}</span>
                    <div className="flex-1 relative h-6 rounded overflow-hidden" style={{ background: "var(--admin-surface-3)" }}>
                      <div
                        className="h-full rounded flex items-center px-2 text-white text-[11px] font-semibold"
                        style={{ width: `${Math.max(barW, 8)}%`, background: "var(--admin-blue)", whiteSpace: "nowrap" }}
                      >
                        {row.share.toFixed(1)}%
                      </div>
                    </div>
                    <span className="text-xs text-right shrink-0 w-16" style={{ color: "var(--admin-muted)" }}>
                      {fmt(row.count)} leads
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>

        {/* Conversão por tarefa */}
        <SectionCard title="Conversão por tarefa" description="Quando marcadas como uso alto/moderado, quais tarefas mais correlacionam com venda.">
          {(data?.segments.tarefas.length ?? 0) === 0 ? (
            <EmptyState title="Sem dados de tarefas neste filtro." />
          ) : (
            <div className="space-y-4 mt-1">
              {data!.segments.tarefas.slice(0, 6).map((row) => {
                const barW = row.share;
                return (
                  <div key={row.label} className="flex items-center gap-3">
                    <span className="text-sm font-medium w-36 shrink-0 truncate">{row.label}</span>
                    <div className="flex-1 relative h-6 rounded overflow-hidden" style={{ background: "var(--admin-surface-3)" }}>
                      <div
                        className="h-full rounded flex items-center px-2 text-white text-[11px] font-semibold"
                        style={{ width: `${Math.max(barW, 8)}%`, background: "#9B7FFF", whiteSpace: "nowrap" }}
                      >
                        {row.share.toFixed(1)}%
                      </div>
                    </div>
                    <span className="text-xs text-right shrink-0 w-10" style={{ color: "var(--admin-muted)" }}>
                      {row.share.toFixed(1)}%
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>

      </div>

      {/* ─── Leitura segmentada por mercado ─── */}
      <SectionCard title="Leitura segmentada por mercado" description="Volume, conversão e receita por mercado declarado no funil." padded={false} className="mb-5">
        {(data?.segments.mercado.length ?? 0) === 0 ? (
          <div className="p-6"><EmptyState title="Sem dados de segmento neste filtro." /></div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Mercado</th>
                <th>Leads</th>
                <th>Share</th>
                <th>Dores + ativas</th>
                <th>Tarefas ativas</th>
                <th>Interesse Ultra</th>
                <th>Plano sugerido</th>
              </tr>
            </thead>
            <tbody>
              {data!.segments.mercado.slice(0, 8).map((row, i) => {
                const topDor = data!.segments.dores[i]?.label ?? "—";
                const topTarefa = data!.segments.tarefas[i]?.label ?? "—";
                const ultra = data!.segments.interesse_ultra.find((r) => r.label === "Interesse Ultra");
                const plano = data!.segments.plano[0]?.label ?? "—";
                return (
                  <tr key={row.label}>
                    <td className="font-medium">{row.label}</td>
                    <td>{fmt(row.count)}</td>
                    <td>{row.share.toFixed(1)}%</td>
                    <td className="text-xs" style={{ color: "var(--admin-muted)" }}>{topDor}</td>
                    <td className="text-xs" style={{ color: "var(--admin-muted)" }}>{topTarefa}</td>
                    <td>{ultra ? `${ultra.share.toFixed(0)}%` : "—"}</td>
                    <td className="text-xs">{plano}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </SectionCard>

      {/* Performance por dia / hora REMOVIDOS */}

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

// ──────────────────────────────────────────────────────────────────────
// Visual Funnel — gráfico de funil trapezoidal com SVG puro
// ──────────────────────────────────────────────────────────────────────
type FunnelStep = { label: string; value: number; pct: number; fill: string };

function VisualFunnel({ steps, fmt }: { steps: FunnelStep[]; fmt: (n: number) => string }) {
  const n = steps.length;
  const svgW      = 500;
  const svgH      = 400;
  const labelColW = 145;
  const pctColW   = 65;
  const funnelX   = labelColW;
  const funnelW   = svgW - labelColW - pctColW;
  const rowH      = svgH / n;
  const halfTop   = funnelW / 2;
  const halfBot   = funnelW * 0.07;

  return (
    <div className="w-full">
      {/* Cabeçalho da tabela */}
      <div
        className="flex items-center mb-2 text-xs font-semibold"
        style={{ color: "var(--admin-muted)", paddingRight: "4px" }}
      >
        <span className="flex-1">Etapa</span>
        <span>Tx. conversão</span>
      </div>

      <svg
        viewBox={`0 0 ${svgW} ${svgH}`}
        width="100%"
        style={{ overflow: "visible", display: "block" }}
      >
        {steps.map((step, i) => {
          const yTop  = i * rowH;
          const yBot  = (i + 1) * rowH;
          const tRatio = n === 1 ? 0 : i / (n - 1);
          const bRatio = n === 1 ? 1 : (i + 1) / (n - 1);
          const halfL  = halfTop - (halfTop - halfBot) * tRatio;
          const halfR  = halfTop - (halfTop - halfBot) * bRatio;
          const cx     = funnelX + funnelW / 2;
          const x1 = cx - halfL; const x2 = cx + halfL;
          const x3 = cx + halfR; const x4 = cx - halfR;
          const yMid = (yTop + yBot) / 2;

          return (
            <g key={step.label}>
              {/* Trapézio colorido */}
              <polygon
                points={`${x1},${yTop} ${x2},${yTop} ${x3},${yBot} ${x4},${yBot}`}
                fill={step.fill}
                opacity={0.9}
              />
              {/* Linha divisória entre etapas */}
              {i < n - 1 && (
                <line
                  x1={x4 - 1} y1={yBot}
                  x2={x3 + 1} y2={yBot}
                  stroke="rgba(255,255,255,0.35)"
                  strokeWidth="2"
                />
              )}

              {/* Label à esquerda */}
              <text
                x={funnelX - 12}
                y={yMid}
                textAnchor="end"
                dominantBaseline="middle"
                fontSize="12"
                fontFamily="inherit"
                fill="var(--admin-text)"
              >
                {step.label}
              </text>

              {/* Linha pontilhada — esquerda */}
              <line
                x1={funnelX - 10}
                y1={yMid}
                x2={x1 + 1}
                y2={yMid}
                stroke="var(--admin-border)"
                strokeWidth="1"
                strokeDasharray="3 3"
              />

              {/* Percentual à direita */}
              <text
                x={funnelX + funnelW + 12}
                y={yMid}
                textAnchor="start"
                dominantBaseline="middle"
                fontSize="12"
                fontFamily="inherit"
                fontWeight="700"
                fill="var(--admin-text)"
              >
                {step.pct.toFixed(0)}%
              </text>

              {/* Linha pontilhada — direita */}
              <line
                x1={x2 - 1}
                y1={yMid}
                x2={funnelX + funnelW + 10}
                y2={yMid}
                stroke="var(--admin-border)"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
// ──────────────────────────────────────────────────────────────────────────
// Performance por dia / hora components removed as they are no longer used in this version.
// ──────────────────────────────────────────────────────────────────────────
