import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Save, RotateCcw, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/PageHeader";
import { SectionCard } from "@/components/admin/SectionCard";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { MobilePreviewFrame } from "@/components/admin/MobilePreviewFrame";
import { LivePreview } from "@/components/admin/LivePreview";
import { useSetTopbarActions } from "@/components/admin/AdminLayout";
import { useFunnelScreens } from "@/hooks/useFunnelScreens";
import { saveScreen } from "@/services/funnelService";
import { getActiveScreens, type FunnelScreen, type ScreenOption } from "@/data/funnelConfig";

export default function EditorPage() {
  const { screens: loaded, setScreens, source } = useFunnelScreens();
  const [screens, setLocal] = useState<FunnelScreen[]>(loaded);
  const [selectedId, setSelectedId] = useState(loaded[0]?.id ?? "intro");
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => { setLocal(loaded); }, [loaded]);

  const selected = useMemo(
    () => screens.find((s) => s.id === selectedId) ?? screens[0],
    [screens, selectedId],
  );

  function validate(s: FunnelScreen): string[] {
    const errs: string[] = [];
    if (s.status !== "active") return errs;
    if (!s.name?.trim()) errs.push("Nome da tela é obrigatório.");
    if (!s.type) errs.push("Tipo da tela é obrigatório.");
    if (s.type !== "final" && !s.nextScreen) {
      errs.push("Defina a próxima tela (apenas a tela final pode ficar sem próxima etapa).");
    }
    if (s.type === "single_choice" && (!s.options || s.options.length === 0)) {
      errs.push("Perguntas de escolha precisam ter ao menos uma opção.");
    }
    if (s.options?.some((o) => !o.label.trim())) {
      errs.push("Todas as opções precisam ter um rótulo.");
    }
    return errs;
  }

  async function handleSave() {
    if (!selected) return;
    const errs = validate(selected);
    setErrors(errs);
    if (errs.length > 0) {
      toast.error("Corrija os erros antes de salvar", { description: errs[0] });
      return;
    }
    setSaving(true);
    const r = await saveScreen(selected);
    setScreens(screens);
    setSaving(false);
    setDirty(false);
    if (r.ok) toast.success("Tela salva", { description: "Sincronizada com o backend." });
    else toast.message("Salvo localmente", { description: "Backend indisponível — alterações ficam em cache." });
  }

  function handleReset() {
    const fresh = getActiveScreens();
    setLocal(fresh);
    setScreens(fresh);
    setDirty(false);
    setErrors([]);
  }

  useSetTopbarActions(
    <>
      <button className="admin-btn-secondary inline-flex items-center gap-1.5" onClick={handleReset}>
        <RotateCcw className="w-4 h-4" /> Restaurar padrão
      </button>
      <button className="admin-btn-primary inline-flex items-center gap-1.5" disabled={saving} onClick={handleSave}>
        <Save className="w-4 h-4" /> {saving ? "Salvando..." : "Salvar tela"}
      </button>
    </>,
  );

  function patch(fn: (s: FunnelScreen) => FunnelScreen) {
    setLocal((arr) => arr.map((st) => (st.id === selectedId ? fn(st) : st)));
    setDirty(true);
  }

  function updateContent(field: "headline" | "subtitle" | "buttonText", value: string) {
    patch((st) => ({ ...st, content: { ...st.content, [field]: value } }));
  }
  function updateExtra(key: string, value: string | string[]) {
    patch((st) => ({ ...st, content: { ...st.content, extras: { ...(st.content.extras ?? {}), [key]: value } } }));
  }
  function updateCtaLabel(value: string) {
    patch((st) => ({ ...st, cta: { ...(st.cta ?? { type: "next", label: "" }), label: value } }));
  }
  function updateCtaHref(value: string) {
    patch((st) => ({ ...st, cta: { ...(st.cta ?? { type: "next", label: "" }), href: value } }));
  }
  function updateNextScreen(value: string) {
    patch((st) => ({ ...st, nextScreen: value || null }));
  }
  function updateName(value: string) {
    patch((st) => ({ ...st, name: value }));
  }
  function updateOptions(opts: ScreenOption[]) {
    patch((st) => ({ ...st, options: opts }));
  }
  function updateStatus(enabled: boolean) {
    patch((st) => ({ ...st, status: enabled ? "active" : "disabled" }));
  }

  function move(idx: number, dir: -1 | 1) {
    setLocal((arr) => {
      const next = [...arr];
      const j = idx + dir;
      if (j < 0 || j >= next.length) return arr;
      [next[idx], next[j]] = [next[j], next[idx]];
      return next.map((s, i) => ({ ...s, order: i + 1 }));
    });
    setDirty(true);
  }

  if (!selected) return null;

  return (
    <>
      <PageHeader
        title="Editor de etapas"
        description="Edite títulos, subtítulos e CTAs do funil atual. Reorganize a ordem ou desative etapas."
        right={
          dirty
            ? <StatusBadge variant="warning">rascunho não salvo</StatusBadge>
            : <StatusBadge variant="neutral">{source === "supabase" ? "backend" : "config"}</StatusBadge>
        }
      />

      <div className="grid gap-5 grid-cols-1 xl:grid-cols-[300px_1fr_auto]">
        <SectionCard title="Etapas" padded={false}>
          <ul>
            {screens.map((s, i) => (
              <li
                key={s.id}
                className="flex items-center justify-between gap-2 px-4 py-3 cursor-pointer transition"
                style={{
                  background: selectedId === s.id ? "var(--admin-surface-3)" : "transparent",
                  borderBottom: i < screens.length - 1 ? "1px solid var(--admin-border)" : "none",
                }}
                onClick={() => setSelectedId(s.id)}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono" style={{ color: "var(--admin-muted-2)" }}>{String(i + 1).padStart(2, "0")}</span>
                    <span className="text-sm font-semibold truncate">{s.name}</span>
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: "var(--admin-muted)" }}>{s.type}</div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {s.status !== "active" && <StatusBadge variant="neutral">{s.status}</StatusBadge>}
                  <button className="admin-btn-ghost p-1.5" onClick={(e) => { e.stopPropagation(); move(i, -1); }} aria-label="Subir">
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button className="admin-btn-ghost p-1.5" onClick={(e) => { e.stopPropagation(); move(i, 1); }} aria-label="Descer">
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard
          title={`Editando: ${selected.name}`}
          description={`Tipo: ${selected.type}`}
          right={
            <label className="inline-flex items-center gap-2 text-xs font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={selected.status === "active"}
                onChange={(e) => updateStatus(e.target.checked)}
              />
              Etapa ativa
            </label>
          }
        >
          <ScreenFields
            screen={selected}
            allScreens={screens}
            errors={errors}
            onName={updateName}
            onContent={updateContent}
            onExtra={updateExtra}
            onCtaLabel={updateCtaLabel}
            onCtaHref={updateCtaHref}
            onNext={updateNextScreen}
            onOptions={updateOptions}
          />
        </SectionCard>

        <SectionCard title="Preview" description="Atualiza enquanto você edita">
          <div className="flex justify-center">
            <MobilePreviewFrame>
              <LivePreview screen={selected} />
            </MobilePreviewFrame>
          </div>
        </SectionCard>
      </div>
    </>
  );
}

/* ============================================================ Campos por tipo */

interface FieldsProps {
  screen: FunnelScreen;
  allScreens: FunnelScreen[];
  errors: string[];
  onName: (v: string) => void;
  onContent: (f: "headline" | "subtitle" | "buttonText", v: string) => void;
  onExtra: (k: string, v: string | string[]) => void;
  onCtaLabel: (v: string) => void;
  onCtaHref: (v: string) => void;
  onNext: (v: string) => void;
  onOptions: (opts: ScreenOption[]) => void;
}

function ScreenFields(p: FieldsProps) {
  const { screen } = p;
  const extras = (screen.content.extras ?? {}) as Record<string, string | string[]>;
  const labelByType: Record<string, string> = {
    opening: "Pergunta principal", single_choice: "Pergunta", insert: "Headline",
    slider_group_market: "Pergunta", slider_group_pain: "Pergunta",
    loading: "Mensagem", lead_capture: "Headline", final: "Headline da oferta",
  };

  return (
    <div className="space-y-5">
      {p.errors.length > 0 && (
        <div className="text-xs p-3 rounded-xl" style={{ background: "var(--admin-red-soft)", color: "var(--admin-red-text)" }}>
          <strong>Não é possível salvar:</strong>
          <ul className="mt-1 list-disc pl-4 space-y-0.5">{p.errors.map((e) => <li key={e}>{e}</li>)}</ul>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="admin-label block mb-1.5">Nome da tela</label>
          <input className="admin-input" value={screen.name} onChange={(e) => p.onName(e.target.value)} />
        </div>
        <div>
          <label className="admin-label block mb-1.5">Próxima tela</label>
          <select
            className="admin-input"
            value={screen.nextScreen ?? ""}
            onChange={(e) => p.onNext(e.target.value)}
          >
            <option value="">— nenhuma (apenas tela final) —</option>
            {p.allScreens.filter((s) => s.id !== screen.id).map((s) => (
              <option key={s.id} value={s.id}>{s.name} ({s.id})</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="admin-label block mb-1.5">{labelByType[screen.type] ?? "Headline"}</label>
        <input
          className="admin-input"
          value={screen.content.headline ?? ""}
          onChange={(e) => p.onContent("headline", e.target.value)}
        />
      </div>

      <div>
        <label className="admin-label block mb-1.5">Subtítulo</label>
        <textarea
          className="admin-input" rows={2}
          value={screen.content.subtitle ?? ""}
          onChange={(e) => p.onContent("subtitle", e.target.value)}
        />
      </div>

      {screen.type === "single_choice" && (
        <OptionsEditor options={screen.options ?? []} onChange={p.onOptions} />
      )}

      {(screen.type === "slider_group_market" || screen.type === "slider_group_pain") && (
        <ListExtraEditor
          label="Itens do slider"
          items={(extras.sliderItems as string[]) ?? []}
          onChange={(v) => p.onExtra("sliderItems", v)}
          placeholder="Ex.: Criar conteúdo"
          help="Quando vazio, usa a lista padrão por mercado/dor."
        />
      )}

      {screen.type === "insert" && (
        <ListExtraEditor
          label="Bullets"
          items={(extras.bullets as string[]) ?? []}
          onChange={(v) => p.onExtra("bullets", v)}
          placeholder="Ex.: GPT-5, Claude e Gemini em uma só plataforma"
        />
      )}

      {screen.type === "lead_capture" && (
        <>
          <ListExtraEditor
            label="Campos do formulário"
            items={(extras.formFields as string[]) ?? ["Seu nome", "WhatsApp (com DDD)"]}
            onChange={(v) => p.onExtra("formFields", v)}
            placeholder="Ex.: WhatsApp"
          />
          <div>
            <label className="admin-label block mb-1.5">Microcopy de privacidade</label>
            <input
              className="admin-input"
              value={(extras.microcopy as string) ?? ""}
              onChange={(e) => p.onExtra("microcopy", e.target.value)}
            />
          </div>
        </>
      )}

      {screen.type === "final" && (
        <>
          <ListExtraEditor
            label="Bullets do resultado"
            items={(extras.resultBullets as string[]) ?? []}
            onChange={(v) => p.onExtra("resultBullets", v)}
            placeholder="Ex.: Acesso a +50 IAs"
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="admin-label block mb-1.5">CTA Checkout (URL)</label>
              <input
                className="admin-input"
                value={screen.cta?.href ?? ""}
                onChange={(e) => p.onCtaHref(e.target.value)}
                placeholder="https://pay.innerai.com/..."
              />
            </div>
            <div>
              <label className="admin-label block mb-1.5">Microcopy de garantia</label>
              <input
                className="admin-input"
                value={(extras.guaranteeMicro as string) ?? ""}
                onChange={(e) => p.onExtra("guaranteeMicro", e.target.value)}
              />
            </div>
          </div>
        </>
      )}

      {screen.cta?.type !== "none" && screen.type !== "loading" && (
        <div>
          <label className="admin-label block mb-1.5">Texto do CTA</label>
          <input
            className="admin-input"
            value={screen.content.buttonText ?? screen.cta?.label ?? ""}
            onChange={(e) => {
              p.onContent("buttonText", e.target.value);
              p.onCtaLabel(e.target.value);
            }}
          />
        </div>
      )}

      <div className="grid gap-2 grid-cols-2 sm:grid-cols-4 text-xs pt-3" style={{ color: "var(--admin-muted)", borderTop: "1px solid var(--admin-border)" }}>
        <div><span className="admin-label">CTA tipo:</span> <span className="font-mono">{screen.cta?.type ?? "—"}</span></div>
        <div><span className="admin-label">Evento view:</span> <span className="font-mono">{screen.events?.view ?? "—"}</span></div>
        <div><span className="admin-label">Pixels:</span> <span className="font-mono">{screen.pixels?.length ?? 0}</span></div>
        <div><span className="admin-label">Regras:</span> <span className="font-mono">{screen.rules?.length ?? 0}</span></div>
      </div>
    </div>
  );
}

/* Editor de opções (single_choice) */
function OptionsEditor({
  options, onChange,
}: { options: ScreenOption[]; onChange: (v: ScreenOption[]) => void }) {
  function update(i: number, patch: Partial<ScreenOption>) {
    onChange(options.map((o, idx) => (idx === i ? { ...o, ...patch } : o)));
  }
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="admin-label">Opções da pergunta</label>
        <button
          className="admin-btn-ghost inline-flex items-center gap-1 text-xs"
          onClick={() => onChange([...options, { value: `opt_${options.length + 1}`, label: "" }])}
        >
          <Plus className="w-3.5 h-3.5" /> Adicionar
        </button>
      </div>
      <div className="space-y-2">
        {options.map((o, i) => (
          <div key={i} className="grid grid-cols-[120px_1fr_auto] gap-2">
            <input className="admin-input font-mono text-xs" value={o.value} onChange={(e) => update(i, { value: e.target.value })} placeholder="value" />
            <input className="admin-input" value={o.label} onChange={(e) => update(i, { label: e.target.value })} placeholder="Rótulo visível" />
            <button className="admin-btn-ghost p-2" onClick={() => onChange(options.filter((_, idx) => idx !== i))} aria-label="Remover">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        {options.length === 0 && (
          <div className="text-xs" style={{ color: "var(--admin-muted)" }}>Nenhuma opção. Clique em Adicionar.</div>
        )}
      </div>
    </div>
  );
}

/* Editor genérico de lista de strings */
function ListExtraEditor({
  label, items, onChange, placeholder, help,
}: {
  label: string; items: string[]; onChange: (v: string[]) => void; placeholder?: string; help?: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="admin-label">{label}</label>
        <button className="admin-btn-ghost inline-flex items-center gap-1 text-xs" onClick={() => onChange([...items, ""])}>
          <Plus className="w-3.5 h-3.5" /> Adicionar
        </button>
      </div>
      {help && <p className="text-xs mb-2" style={{ color: "var(--admin-muted)" }}>{help}</p>}
      <div className="space-y-2">
        {items.map((it, i) => (
          <div key={i} className="grid grid-cols-[1fr_auto] gap-2">
            <input className="admin-input" value={it} onChange={(e) => onChange(items.map((x, idx) => (idx === i ? e.target.value : x)))} placeholder={placeholder} />
            <button className="admin-btn-ghost p-2" onClick={() => onChange(items.filter((_, idx) => idx !== i))} aria-label="Remover">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        {items.length === 0 && <div className="text-xs" style={{ color: "var(--admin-muted)" }}>Vazio.</div>}
      </div>
    </div>
  );
}