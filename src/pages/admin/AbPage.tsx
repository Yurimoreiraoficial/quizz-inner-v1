import { useEffect, useMemo, useRef, useState } from "react";
import { Trophy, ChevronRight, AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { SectionCard } from "@/components/admin/SectionCard";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { EmptyState } from "@/components/admin/EmptyState";
import { useFunnelScreens } from "@/hooks/useFunnelScreens";
import {
  loadAllAbTests,
  loadAbPerformance,
  saveAbTestFull,
  setAbStatus,
  deleteAbTest,
  pickWinner,
  MIN_VOLUME_FOR_WINNER,
  type AbTest,
  type AbStatus,
  type AbMetric,
  type VariantPerformance,
} from "@/services/abService";

const FIELD_OPTIONS: { value: string; label: string }[] = [
  { value: "headline", label: "Título (headline)" },
  { value: "subtitle", label: "Subtítulo" },
  { value: "buttonText", label: "Texto do botão" },
  { value: "cta.label", label: "Label do CTA" },
  { value: "resultBullets", label: "Bullets do resultado" },
];

const METRIC_OPTIONS: { value: AbMetric; label: string }[] = [
  { value: "lead_submit", label: "Lead enviado" },
  { value: "checkout_click", label: "Clique no checkout" },
  { value: "whatsapp_click", label: "Clique no WhatsApp" },
  { value: "purchase", label: "Compra" },
];

const FIELD_LABEL: Record<string, string> = Object.fromEntries(FIELD_OPTIONS.map((o) => [o.value, o.label]));
const METRIC_LABEL: Record<string, string> = Object.fromEntries(METRIC_OPTIONS.map((o) => [o.value, o.label]));

const STATUS_BADGE: Record<string, React.ComponentProps<typeof StatusBadge>["variant"]> = {
  draft: "neutral",
  active: "experiment",
  paused: "warning",
  completed: "success",
};
const STATUS_LABEL: Record<string, string> = {
  draft: "rascunho",
  active: "ativo",
  paused: "pausado",
  completed: "finalizado",
};

type VariantStatus = "base" | "coletando" | "vencedora" | "pausada" | "sem_volume";

function variantStatus(opts: {
  isFirst: boolean;
  isWinner: boolean;
  testStatus: string;
  visitors: number;
  totalVisitors: number;
}): VariantStatus {
  if (opts.testStatus === "paused") return "pausada";
  if (opts.isWinner) return "vencedora";
  if (opts.visitors === 0) return "sem_volume";
  if (opts.totalVisitors < MIN_VOLUME_FOR_WINNER) return "coletando";
  if (opts.isFirst) return "base";
  return "coletando";
}

const VARIANT_BADGE: Record<VariantStatus, { variant: React.ComponentProps<typeof StatusBadge>["variant"]; label: string }> = {
  base: { variant: "neutral", label: "Base" },
  coletando: { variant: "info", label: "Coletando" },
  vencedora: { variant: "success", label: "Vencedora" },
  pausada: { variant: "warning", label: "Pausada" },
  sem_volume: { variant: "neutral", label: "Sem volume" },
};

interface DraftVariant {
  id?: string;
  label: string;
  value: string;
  split_percentage: number;
}
interface Draft {
  id?: string;
  name: string;
  screen_key: string;
  field_key: string;
  metric: AbMetric;
  status: AbStatus;
  variants: DraftVariant[];
}

function emptyDraft(screenKey: string): Draft {
  return {
    name: "",
    screen_key: screenKey,
    field_key: "headline",
    metric: "checkout_click",
    status: "draft",
    variants: [
      { label: "Controle", value: "", split_percentage: 50 },
      { label: "Variação B", value: "", split_percentage: 50 },
    ],
  };
}

export default function AbPage() {
  const { screens } = useFunnelScreens();
  const [tests, setTests] = useState<AbTest[]>([]);
  const [perfMap, setPerfMap] = useState<Record<string, VariantPerformance[]>>({});
  const [loading, setLoading] = useState(true);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  async function refresh() {
    setLoading(true);
    const all = await loadAllAbTests();
    setTests(all);
    setLoading(false);
    // load performance in parallel
    const entries = await Promise.all(
      all.map(async (t) => [t.id, await loadAbPerformance(t)] as const),
    );
    setPerfMap(Object.fromEntries(entries));
  }

  useEffect(() => { void refresh(); }, []);



  function scrollToTest(id: string) {
    const el = cardRefs.current[id];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      el.classList.add("ring-2");
      setTimeout(() => el.classList.remove("ring-2"), 1200);
    }
  }

  const screenName = (key: string) => screens.find((s) => s.id === key)?.name ?? key;

  return (
    <>
      <PageHeader
        title="Testes A/B"
        description="Acompanhamento de performance de variações configuradas via código."
      />

      {/* 1. Visão geral de performance */}
      <SectionCard
        title="Visão geral de performance"
        className="mb-5"
      >
        {loading ? (
          <p className="text-sm" style={{ color: "var(--admin-muted)" }}>Carregando testes…</p>
        ) : tests.length === 0 ? (
          <EmptyState
            title="Nenhum teste criado"
            description="Crie um teste A/B para validar uma mudança de copy, CTA ou bullets antes de aplicar a todos."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Teste A/B</th>
                  <th>Variação vencedora</th>
                  <th>Checkout</th>
                  <th>Mais detalhes</th>
                </tr>
              </thead>
              <tbody>
                {tests.map((t) => {
                  const perf = perfMap[t.id] ?? [];
                  const winner = pickWinner(perf);
                  const winnerVariant = winner
                    ? t.variants.find((v) => v.id === winner.variant_id)
                    : null;
                  // Best checkout value from winning variant, or best overall
                  const checkoutPct = winner
                    ? `${winner.conversion_rate.toFixed(1)}%`
                    : "—";
                  const detail = winnerVariant
                    ? String(
                        typeof (winnerVariant.value as { value?: unknown }).value === "string"
                          ? (winnerVariant.value as { value?: unknown }).value
                          : ""
                      ).slice(0, 60) || "—"
                    : "—";
                  return (
                    <tr key={t.id}>
                      <td className="font-semibold">{t.name || "(sem nome)"}</td>
                      <td>
                        {winner ? (
                          <span className="inline-flex items-center gap-1" style={{ color: "var(--admin-green)" }}>
                            <Trophy className="w-3.5 h-3.5" /> {winner.label}
                          </span>
                        ) : (
                          <span style={{ color: "var(--admin-muted)" }}>—</span>
                        )}
                      </td>
                      <td>{checkoutPct}</td>
                      <td className="text-sm" style={{ color: "var(--admin-muted)" }}>{detail}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>



      {/* 2. Visão detalhada de performance */}
      {!loading && tests.length > 0 && (
        <>
          <h2 className="text-[15px] font-bold mb-4" style={{ color: "var(--admin-text)" }}>Visão detalhada de performance</h2>
          <div className="grid gap-5 mb-5 grid-cols-1 xl:grid-cols-2">
            {tests.map((t) => (
              <div
                key={t.id}
                ref={(el) => { cardRefs.current[t.id] = el; }}
                className="rounded-lg transition-shadow"
                style={{ boxShadow: "0 0 0 0 transparent" }}
              >
                <AbTestCard
                  test={t}
                  perf={perfMap[t.id] ?? []}
                  screenName={screenName(t.screen_key)}
                />
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}

function AbTestCard({
  test, perf, screenName,
}: {
  test: AbTest;
  perf: VariantPerformance[];
  screenName: string;
}) {
  const winner = pickWinner(perf);
  const totalVisitors = perf.reduce((a, p) => a + p.visitors, 0);
  const splitSum = test.variants.reduce((a, v) => a + v.split_percentage, 0);
  const hasVolume = totalVisitors >= MIN_VOLUME_FOR_WINNER;
  const rows = perf.length > 0
    ? perf
    : test.variants.map((v) => ({
        variant_id: v.id, label: v.label, split_percentage: v.split_percentage,
        visitors: 0, leads: 0, checkout_clicks: 0, whatsapp_clicks: 0, purchases: 0, revenue: 0, conversion_rate: 0,
      }));

  return (
    <SectionCard
      title={test.name || "(sem nome)"}
      description={`Métrica principal: ${METRIC_LABEL[test.metric] ?? test.metric}`}
      right={
        <div className="flex items-center gap-2">
          <StatusBadge variant={STATUS_BADGE[test.status] ?? "neutral"}>
            {STATUS_LABEL[test.status] ?? test.status}
          </StatusBadge>
        </div>
      }
    >
      {Math.round(splitSum) !== 100 && (
        <div className="mb-3 text-sm" style={{ color: "var(--admin-red-text)" }}>
          ⚠ Soma dos splits é {splitSum}% (deveria ser 100%).
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Variante</th>
              <th>Split</th>
              <th>Lead</th>
              <th>Checkout</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p, i) => {
              const isWinner = !!winner && winner.variant_id === p.variant_id;
              const vs = variantStatus({
                isFirst: i === 0,
                isWinner,
                testStatus: test.status,
                visitors: p.visitors,
                totalVisitors,
              });
              const badge = VARIANT_BADGE[vs];
              const leadPct = p.visitors ? ((p.leads / p.visitors) * 100).toFixed(1) + "%" : "—";
              const checkoutPct = p.visitors ? ((p.checkout_clicks / p.visitors) * 100).toFixed(1) + "%" : "—";
              const rowStyle: React.CSSProperties = isWinner
                ? { background: "var(--admin-green-soft)" }
                : {};
              return (
                <tr key={p.variant_id} style={rowStyle}>
                  <td className="font-semibold">
                    <span className="inline-flex items-center gap-1.5">
                      {isWinner && <Trophy className="w-3.5 h-3.5" style={{ color: "var(--admin-green)" }} />}
                      {p.label}
                    </span>
                  </td>
                  <td>{p.split_percentage}%</td>
                  <td className={isWinner ? "font-semibold" : ""}>{leadPct}</td>
                  <td className={isWinner ? "font-semibold" : ""}>{checkoutPct}</td>
                  <td><StatusBadge variant={badge.variant}>{badge.label}</StatusBadge></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {!hasVolume && (
        <p className="mt-3 text-xs" style={{ color: "var(--admin-muted)" }}>
          Volume insuficiente para declarar vencedora ({totalVisitors}/{MIN_VOLUME_FOR_WINNER} visitantes).
        </p>
      )}
    </SectionCard>
  );
}