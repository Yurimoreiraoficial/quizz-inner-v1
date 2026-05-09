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
  const [filters, setFilters] = useState<AnalyticsFilters>({ rangeDays: 30, theme: "todos", route: "todos", compareWithPrevious: false });
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
            
            <div className="flex items-end">
              <label className="flex items-center gap-2 mb-2 cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 rounded border-[var(--admin-border)] text-[var(--admin-blue)] focus:ring-0 focus:ring-offset-0 bg-transparent"
                  checked={!!filters.compareWithPrevious}
                  onChange={(e) => patch({ compareWithPrevious: e.target.checked })}
                />
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--admin-muted)" }}>
                  Comparar com período anterior
                </span>
              </label>
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
            {filters.compareWithPrevious && <DiffValue current={m?.revenue} previous={m?.comparison?.revenue} />}
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
            {filters.compareWithPrevious && <DiffValue current={m?.investment} previous={m?.comparison?.investment} />}
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
            {filters.compareWithPrevious && <DiffValue current={m?.roas} previous={m?.comparison?.roas} />}
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
            {filters.compareWithPrevious && <DiffValue current={m?.cac} previous={m?.comparison?.cac} />}
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

      {/* Linha 2 — Funil de conversão */}
      <div className="grid gap-3 mb-6 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
        <StatCard label="VISITANTES" value={fmt(m?.visitors ?? 0)} sub="acessos no período"
          comp={filters.compareWithPrevious && <DiffValue current={m?.visitors} previous={m?.comparison?.visitors} />} />
        <StatCard label="INÍCIO DO FUNIL" value={fmt(m?.starts ?? 0)} sub="iniciaram quiz"
          comp={filters.compareWithPrevious && <DiffValue current={m?.starts} previous={m?.comparison?.starts} />} />
        <StatCard label="LEADS CAPTADOS" value={fmt(m?.leads ?? 0)} sub="leads no período"
          comp={filters.compareWithPrevious && <DiffValue current={m?.leads} previous={m?.comparison?.leads} />} />
        <StatCard label="CLIQUES NO CHECKOUT" value={fmt(m?.checkoutClicks ?? 0)} sub="intenção compra"
          comp={filters.compareWithPrevious && <DiffValue current={m?.checkoutClicks} previous={m?.comparison?.checkoutClicks} />} />
        <StatCard label="CLIQUES NO WHATSAPP" value={fmt(m?.whatsappClicks ?? 0)} sub="suporte acionado"
          comp={filters.compareWithPrevious && <DiffValue current={m?.whatsappClicks} previous={m?.comparison?.whatsappClicks} />} />
        <StatCard label="COMPRAS" value={fmt(m?.purchases ?? 0)} sub="vendas diretas"
          comp={filters.compareWithPrevious && <DiffValue current={m?.purchases} previous={m?.comparison?.purchases} />} />
        <StatCard label="CONV. GERAL" value={`${(m?.visitors ? (m.purchases / m.visitors * 100) : 0).toFixed(1)}%`} sub="visita → venda"
          comp={filters.compareWithPrevious && <DiffValue current={m?.visitors ? m.purchases / m.visitors : 0} previous={m?.comparison?.visitors ? m.comparison.purchases! / m.comparison.visitors : 0} />} />
      </div>

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


      {/* ─── Conversão por mercado ─── */}
      <SectionCard title="Conversão por mercado" description="Volume, conversão e receita por mercado declarado no funil." padded={false} className="mb-5">
        {(data?.segments.mercado.length ?? 0) === 0 ? (
          <div className="p-6"><EmptyState title="Sem dados de mercado neste filtro." /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Mercado</th>
                  <th>Acessos</th>
                  <th>Leads (%)</th>
                  <th>Chegou na Oferta</th>
                  <th>Checkout</th>
                  <th>WhatsApp (%)</th>
                  <th>Vendas</th>
                  <th>Conversão (%)</th>
                </tr>
              </thead>
              <tbody>
                {data!.segments.mercado.map((s) => {
                  const leadPct = s.visitors ? (s.leads / s.visitors * 100).toFixed(1) : "0";
                  const wpPct = s.visitors ? (s.whatsapp / s.visitors * 100).toFixed(1) : "0";
                  const convPct = s.visitors ? (s.purchases / s.visitors * 100).toFixed(1) : "0";
                  
                  return (
                    <tr key={s.label}>
                      <td className="font-semibold">{s.label}</td>
                      <td>
                        <div className="flex flex-col">
                          <span>{fmt(s.visitors)}</span>
                          {filters.compareWithPrevious && <DiffValue current={s.visitors} previous={s.prevVisitors} />}
                        </div>
                      </td>
                      <td>
                        <div className="flex flex-col">
                          <span>{fmt(s.leads)} ({leadPct}%)</span>
                          {filters.compareWithPrevious && <DiffValue current={s.leads} previous={s.prevLeads} />}
                        </div>
                      </td>
                      <td>{fmt(s.offers)}</td>
                      <td>{fmt(s.checkout)}</td>
                      <td>{fmt(s.whatsapp)} ({wpPct}%)</td>
                      <td>
                        <div className="flex flex-col">
                          <span>{fmt(s.purchases)}</span>
                          {filters.compareWithPrevious && <DiffValue current={s.purchases} previous={s.prevPurchases} />}
                        </div>
                      </td>
                      <td>
                        <div className="flex flex-col">
                          <span className="font-bold" style={{ color: "var(--admin-blue)" }}>{convPct}%</span>
                          {filters.compareWithPrevious && (
                            <DiffValue 
                              current={s.visitors ? s.purchases / s.visitors : 0} 
                              previous={s.prevVisitors ? s.prevPurchases! / s.prevVisitors : 0} 
                            />
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      {/* Performance por dia / hora REMOVIDOS */}

      {/* Segmentos */}
      <SectionCard title="Segmentos por respostas">
        {(data?.totalLeads ?? 0) === 0 ? (
          <EmptyState title="Nenhum lead captado neste filtro." description="Os segmentos aparecem assim que houver leads com respostas associadas." />
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            <SegmentBlock title="Mercado" rows={data!.segments.mercado} />
            <SegmentBlock title="Uso atual de IA" rows={data!.segments.uso_ia} />
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

function StatCard({ label, value, sub, comp }: { label: string; value: string | number; sub?: string; comp?: React.ReactNode }) {
  return (
    <div className="admin-card p-4 flex flex-col justify-between">
      <div>
        <span className="text-[10px] font-bold tracking-widest uppercase mb-1.5 block" style={{ color: "var(--admin-muted)" }}>{label}</span>
        <span className="text-xl font-bold tracking-tight block" style={{ color: "var(--admin-text)" }}>{value}</span>
        {comp && <div className="mt-1">{comp}</div>}
      </div>
      {sub && <span className="text-[10px] mt-2 block" style={{ color: "var(--admin-muted)" }}>{sub}</span>}
    </div>
  );
}

function DiffValue({ current, previous, label = "vs período anterior" }: { current?: number; previous?: number; label?: string }) {
  if (previous === undefined || previous === 0) {
    if (current === 0 || current === undefined) return <span className="text-[10px]" style={{ color: "var(--admin-muted)" }}>— {label}</span>;
    return <span className="text-[10px]" style={{ color: "var(--admin-green)" }}>+100% {label}</span>;
  }
  const diff = ((current || 0) - previous) / previous * 100;
  const color = diff > 0 ? "var(--admin-green)" : diff < 0 ? "var(--admin-red-text)" : "var(--admin-muted)";
  const sign = diff > 0 ? "+" : "";
  return (
    <span className="text-[10px] font-medium" style={{ color }}>
      {sign}{diff.toFixed(1)}% {label}
    </span>
  );
}
