import { useEffect, useMemo, useRef, useState } from "react";
import { Plus, Trash2, Trophy, ChevronRight, AlertTriangle } from "lucide-react";
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
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>(() => emptyDraft("final"));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
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

  function startNew() {
    setDraft(emptyDraft(screens[0]?.id ?? "final"));
    setError(null);
    setOpen(true);
  }

  function startEdit(t: AbTest) {
    setDraft({
      id: t.id,
      name: t.name,
      screen_key: t.screen_key,
      field_key: t.field_key,
      metric: (t.metric as AbMetric) ?? "checkout_click",
      status: (t.status as AbStatus) ?? "draft",
      variants: t.variants.map((v) => ({
        id: v.id,
        label: v.label,
        value: typeof (v.value as { value?: unknown }).value === "string"
          ? String((v.value as { value?: unknown }).value)
          : Array.isArray((v.value as { value?: unknown }).value)
            ? ((v.value as { value?: unknown[] }).value as unknown[]).join("\n")
            : "",
        split_percentage: v.split_percentage,
      })),
    });
    setError(null);
    setOpen(true);
  }

  function updateVariant(idx: number, patch: Partial<DraftVariant>) {
    setDraft((d) => ({
      ...d,
      variants: d.variants.map((v, i) => (i === idx ? { ...v, ...patch } : v)),
    }));
  }

  function addVariant() {
    setDraft((d) => ({
      ...d,
      variants: [...d.variants, { label: `Variação ${String.fromCharCode(65 + d.variants.length)}`, value: "", split_percentage: 0 }],
    }));
  }
  function removeVariant(idx: number) {
    setDraft((d) => ({ ...d, variants: d.variants.filter((_, i) => i !== idx) }));
  }

  const splitSum = useMemo(
    () => draft.variants.reduce((acc, v) => acc + (Number(v.split_percentage) || 0), 0),
    [draft.variants],
  );

  // Aviso: já existe teste ativo no mesmo screen+field?
  const duplicateActiveWarning = useMemo(() => {
    if (draft.status !== "active") return false;
    return tests.some(
      (t) => t.id !== draft.id && t.status === "active"
        && t.screen_key === draft.screen_key && t.field_key === draft.field_key,
    );
  }, [tests, draft.status, draft.screen_key, draft.field_key, draft.id]);

  async function save() {
    setError(null);
    if (!draft.name.trim()) { setError("Informe um nome para o teste."); return; }
    if (draft.variants.length < 2) { setError("Crie pelo menos 2 variações."); return; }
    if (draft.variants.some((v) => !v.label.trim())) { setError("Todas as variações precisam de rótulo."); return; }
    if (draft.status === "active" && !draft.metric) { setError("Selecione uma métrica principal antes de ativar."); return; }
    if (Math.round(splitSum) !== 100) { setError(`A soma dos splits deve ser 100% (atual: ${splitSum}%).`); return; }

    setSaving(true);
    const isBulletField = draft.field_key === "resultBullets";
    const res = await saveAbTestFull({
      id: draft.id,
      name: draft.name.trim(),
      screen_key: draft.screen_key,
      field_key: draft.field_key,
      metric: draft.metric,
      status: draft.status,
      variants: draft.variants.map((v) => ({
        id: v.id,
        label: v.label.trim(),
        value: isBulletField ? v.value.split("\n").map((s) => s.trim()).filter(Boolean) : v.value,
        split_percentage: Number(v.split_percentage),
      })),
    });
    setSaving(false);
    if (!res.ok) {
      setError(
        res.error === "duplicate_active_test"
          ? "Já existe um teste ativo neste campo desta tela. Pause o anterior antes de ativar outro."
          : res.error?.startsWith("splits_sum_invalid")
            ? "Soma dos splits precisa ser 100%."
            : (res.error ?? "Falha ao salvar."),
      );
      return;
    }
    setOpen(false);
    await refresh();
  }

  async function changeStatus(id: string, status: AbStatus) {
    await setAbStatus(id, status);
    await refresh();
  }
  async function remove(id: string) {
    await deleteAbTest(id);
    await refresh();
  }

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
        description="Crie variações de campo (headline, subtítulo, CTA) e meça por métrica real do funil."
        right={<button className="admin-btn-primary inline-flex items-center gap-1.5" onClick={startNew}><Plus className="w-4 h-4" /> Novo teste</button>}
      />

      {/* 1. Visão geral dos testes */}
      <SectionCard
        title="Visão geral dos testes"
        description="Resumo de todos os testes A/B do funil."
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
                  <th>Tela</th>
                  <th>Campo</th>
                  <th>Métrica</th>
                  <th>Variação vencedora</th>
                  <th>Resultado</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {tests.map((t) => {
                  const perf = perfMap[t.id] ?? [];
                  const winner = pickWinner(perf);
                  const totalVisitors = perf.reduce((a, p) => a + p.visitors, 0);
                  return (
                    <tr key={t.id}>
                      <td className="font-semibold">{t.name || "(sem nome)"}</td>
                      <td>{screenName(t.screen_key)}</td>
                      <td>{FIELD_LABEL[t.field_key] ?? t.field_key}</td>
                      <td>{METRIC_LABEL[t.metric] ?? t.metric}</td>
                      <td>
                        {winner ? (
                          <span className="inline-flex items-center gap-1" style={{ color: "var(--admin-green)" }}>
                            <Trophy className="w-3.5 h-3.5" /> {winner.label}
                          </span>
                        ) : (
                          <span style={{ color: "var(--admin-muted)" }}>—</span>
                        )}
                      </td>
                      <td>
                        {winner
                          ? `${winner.conversion_rate.toFixed(2)}%`
                          : totalVisitors === 0
                            ? <span style={{ color: "var(--admin-muted)" }}>sem dados</span>
                            : <span style={{ color: "var(--admin-muted)" }}>{totalVisitors}/{MIN_VOLUME_FOR_WINNER} visitantes</span>}
                      </td>
                      <td>
                        <StatusBadge variant={STATUS_BADGE[t.status] ?? "neutral"}>
                          {STATUS_LABEL[t.status] ?? t.status}
                        </StatusBadge>
                      </td>
                      <td>
                        <button className="admin-btn-ghost inline-flex items-center gap-1" onClick={() => scrollToTest(t.id)}>
                          Detalhes <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      {/* 3. Criar novo teste (formulário) */}
      {open && (
        <SectionCard title={draft.id ? "Editar teste A/B" : "Criar novo teste"} className="mb-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="admin-label block mb-1.5">Nome do teste</label>
              <input className="admin-input" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="Ex.: Headline final — urgência" />
            </div>
            <div>
              <label className="admin-label block mb-1.5">Status inicial</label>
              <select className="admin-input" value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value as AbStatus })}>
                <option value="draft">Rascunho</option>
                <option value="active">Ativo</option>
                <option value="paused">Pausado</option>
                <option value="completed">Finalizado</option>
              </select>
            </div>
            <div>
              <label className="admin-label block mb-1.5">Tela</label>
              <select className="admin-input" value={draft.screen_key} onChange={(e) => setDraft({ ...draft, screen_key: e.target.value })}>
                {screens.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="admin-label block mb-1.5">Campo testado</label>
              <select className="admin-input" value={draft.field_key} onChange={(e) => setDraft({ ...draft, field_key: e.target.value })}>
                {FIELD_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="admin-label block mb-1.5">Métrica principal</label>
              <select className="admin-input" value={draft.metric} onChange={(e) => setDraft({ ...draft, metric: e.target.value as AbMetric })}>
                {METRIC_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          {duplicateActiveWarning && (
            <div
              className="mt-4 flex items-start gap-2 rounded-md p-3 text-sm"
              style={{ background: "var(--admin-yellow-soft)", color: "var(--admin-yellow)" }}
            >
              <AlertTriangle className="w-4 h-4 mt-0.5" />
              <span>
                Já existe um teste ativo no mesmo campo dessa tela. Pause o teste anterior antes de ativar este,
                ou salve este como rascunho.
              </span>
            </div>
          )}

          <div className="mt-5">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-[14px] font-semibold">Variações</h4>
              <div className="flex items-center gap-3">
                <span className="text-xs" style={{ color: Math.round(splitSum) === 100 ? "var(--admin-muted)" : "var(--admin-red-text)" }}>
                  Split total: {splitSum}%
                </span>
                <button className="admin-btn-ghost inline-flex items-center gap-1" onClick={addVariant}>
                  <Plus className="w-4 h-4" /> Variação
                </button>
              </div>
            </div>
            <div className="space-y-3">
              {draft.variants.map((v, i) => (
                <div key={i} className="grid gap-2 sm:grid-cols-[1fr_2fr_120px_auto] items-start">
                  <input className="admin-input" placeholder="Rótulo" value={v.label} onChange={(e) => updateVariant(i, { label: e.target.value })} />
                  {draft.field_key === "resultBullets" ? (
                    <textarea className="admin-input" rows={3} placeholder="Um bullet por linha" value={v.value} onChange={(e) => updateVariant(i, { value: e.target.value })} />
                  ) : (
                    <input className="admin-input" placeholder="Conteúdo da variação" value={v.value} onChange={(e) => updateVariant(i, { value: e.target.value })} />
                  )}
                  <input
                    className="admin-input"
                    type="number"
                    min={0}
                    max={100}
                    value={v.split_percentage}
                    onChange={(e) => updateVariant(i, { split_percentage: Number(e.target.value) })}
                  />
                  <button className="admin-btn-ghost" onClick={() => removeVariant(i)} aria-label="Remover variação">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="mt-4 text-sm" style={{ color: "var(--admin-red-text)" }}>{error}</div>
          )}

          <div className="flex justify-end gap-2 mt-5">
            <button className="admin-btn-ghost" onClick={() => setOpen(false)}>Cancelar</button>
            <button className="admin-btn-primary" onClick={save} disabled={saving}>
              {saving ? "Salvando..." : (draft.id ? "Salvar alterações" : "Criar teste")}
            </button>
          </div>
        </SectionCard>
      )}

      {/* 2. Cards detalhados por teste */}
      {!loading && tests.length > 0 && (
        <div className="space-y-5">
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
                onEdit={() => startEdit(t)}
                onStatus={(s) => changeStatus(t.id, s)}
                onRemove={() => remove(t.id)}
              />
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function AbTestCard({
  test, perf, screenName, onEdit, onStatus, onRemove,
}: {
  test: AbTest;
  perf: VariantPerformance[];
  screenName: string;
  onEdit: () => void;
  onStatus: (s: AbStatus) => void;
  onRemove: () => void;
}) {
  const winner = pickWinner(perf);
  const totalVisitors = perf.reduce((a, p) => a + p.visitors, 0);
  const splitSum = test.variants.reduce((a, v) => a + v.split_percentage, 0);
  const rows = perf.length > 0
    ? perf
    : test.variants.map((v) => ({
        variant_id: v.id, label: v.label, split_percentage: v.split_percentage,
        visitors: 0, leads: 0, checkout_clicks: 0, whatsapp_clicks: 0, purchases: 0, revenue: 0, conversion_rate: 0,
      }));

  return (
    <SectionCard
      title={test.name || "(sem nome)"}
      description={`Tela: ${screenName} · Campo: ${FIELD_LABEL[test.field_key] ?? test.field_key} · Métrica: ${METRIC_LABEL[test.metric] ?? test.metric}`}
      right={
        <div className="flex items-center gap-2">
          <StatusBadge variant={STATUS_BADGE[test.status] ?? "neutral"}>
            {STATUS_LABEL[test.status] ?? test.status}
          </StatusBadge>
          {test.status !== "active" && <button className="admin-btn-ghost" onClick={() => onStatus("active")}>Ativar</button>}
          {test.status === "active" && <button className="admin-btn-ghost" onClick={() => onStatus("paused")}>Pausar</button>}
          {test.status !== "completed" && <button className="admin-btn-ghost" onClick={() => onStatus("completed")}>Finalizar</button>}
          <button className="admin-btn-ghost" onClick={onEdit}>Editar</button>
          <button className="admin-btn-ghost" onClick={onRemove} aria-label="Remover"><Trash2 className="w-4 h-4" /></button>
        </div>
      }
    >
      {Math.round(splitSum) !== 100 && (
        <div className="mb-3 text-sm" style={{ color: "var(--admin-red-text)" }}>
          ⚠ Soma dos splits desta variação é {splitSum}% (deveria ser 100%).
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Variação</th>
              <th>Split</th>
              <th>Visitantes</th>
              <th>Leads</th>
              <th>Checkout</th>
              <th>WhatsApp</th>
              <th>Compras</th>
              <th>Receita</th>
              <th>Conv. ({METRIC_LABEL[test.metric] ?? test.metric})</th>
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
                  <td>{p.visitors}</td>
                  <td>{p.leads}</td>
                  <td>{p.checkout_clicks}</td>
                  <td>{p.whatsapp_clicks}</td>
                  <td>{p.purchases}</td>
                  <td>{p.revenue ? `R$ ${p.revenue.toFixed(2)}` : "—"}</td>
                  <td className={isWinner ? "font-semibold" : ""}>{p.conversion_rate.toFixed(2)}%</td>
                  <td>
                    <StatusBadge variant={badge.variant}>{badge.label}</StatusBadge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalVisitors < MIN_VOLUME_FOR_WINNER && (
        <p className="mt-3 text-xs" style={{ color: "var(--admin-muted)" }}>
          Volume insuficiente para declarar vencedora ({totalVisitors}/{MIN_VOLUME_FOR_WINNER} visitantes).
        </p>
      )}
    </SectionCard>
  );
}