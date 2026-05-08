import { Fragment, useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Save, RotateCcw } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import {
  getDefaultActionsForScreen,
  getScreenActions,
  type ActionDestinationType,
  type FunnelScreen,
  type ScreenAction,
} from "@/data/funnelConfig";
import { saveScreen } from "@/services/funnelService";
import { toast } from "@/hooks/use-toast";

type Row = {
  screenId: string;
  screenName: string;
  action: ScreenAction;
};

function flatten(screens: FunnelScreen[]): Row[] {
  return screens.flatMap((s) =>
    getScreenActions(s).map((a) => ({ screenId: s.id, screenName: s.name, action: a })),
  );
}

function destLabel(t: ActionDestinationType) {
  return ({
    next_screen: "Próxima tela",
    checkout: "Checkout",
    whatsapp: "WhatsApp",
    external_url: "URL externa",
  } as const)[t];
}

function validate(a: ScreenAction, screenIds: string[]): string | null {
  if (!a.action_label.trim()) return "Nome da ação é obrigatório.";
  if (!a.event_name.trim()) return "Nome do evento é obrigatório.";
  const v = a.destination_value.trim();
  if (a.destination_type === "checkout" && !/^https?:\/\//i.test(v))
    return "Checkout requer uma URL válida (http/https).";
  if (a.destination_type === "whatsapp" && !/^\d{10,}$/.test(v))
    return "WhatsApp requer um número válido (apenas dígitos, com DDI).";
  if (a.destination_type === "next_screen" && !screenIds.includes(v))
    return "Selecione uma tela válida como destino.";
  if (a.destination_type === "external_url" && !/^https?:\/\//i.test(v))
    return "URL externa requer http(s)://.";
  return null;
}

export function ScreenActionsTable({ screens }: { screens: FunnelScreen[] }) {
  const [rows, setRows] = useState<Row[]>(() => flatten(screens));
  const [open, setOpen] = useState<string | null>(null);
  const [dirtyKeys, setDirtyKeys] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  useEffect(() => { setRows(flatten(screens)); }, [screens]);

  const screenIds = useMemo(() => screens.map((s) => s.id), [screens]);

  function patchAction(screenId: string, key: string, patch: Partial<ScreenAction>) {
    setRows((rs) =>
      rs.map((r) =>
        r.screenId === screenId && r.action.action_key === key
          ? { ...r, action: { ...r.action, ...patch } }
          : r,
      ),
    );
    setDirtyKeys((s) => new Set(s).add(screenId));
  }

  function resetScreen(screenId: string) {
    const screen = screens.find((s) => s.id === screenId);
    if (!screen) return;
    const defaults = getDefaultActionsForScreen({ ...screen, events: { ...screen.events, actions: undefined } });
    setRows((rs) => [
      ...rs.filter((r) => r.screenId !== screenId),
      ...defaults.map((a) => ({ screenId, screenName: screen.name, action: a })),
    ].sort((a, b) => screenIds.indexOf(a.screenId) - screenIds.indexOf(b.screenId)));
    setDirtyKeys((s) => new Set(s).add(screenId));
  }

  async function saveAll() {
    setSaving(true);
    let ok = 0, fail = 0;
    for (const screenId of dirtyKeys) {
      const screen = screens.find((s) => s.id === screenId);
      if (!screen) continue;
      const actions = rows.filter((r) => r.screenId === screenId).map((r) => r.action);
      // Validar
      for (const a of actions) {
        const err = validate(a, screenIds);
        if (err) {
          toast({ title: `Erro em "${a.action_label}"`, description: err });
          setSaving(false);
          return;
        }
      }
      const pixels = actions
        .filter((a) => a.pixel_enabled && a.status === "active")
        .map((a) => ({
          provider: "meta",
          event: a.pixel_event_name || a.event_name,
          params: { action_key: a.action_key },
        }));
      const next: FunnelScreen = {
        ...screen,
        events: { ...screen.events, actions },
        pixels,
      };
      const r = await saveScreen(next);
      r.ok ? ok++ : fail++;
    }
    setSaving(false);
    setDirtyKeys(new Set());
    toast({
      title: fail === 0 ? "Ações salvas" : "Salvo parcialmente",
      description: `${ok} tela(s) sincronizada(s)${fail ? `, ${fail} falha(s) — fallback local mantido.` : "."}`,
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
          Configure links, eventos, pixels e UTMs por tela e por ação. Inativos não disparam evento nem pixel.
        </p>
        <button
          className="admin-btn-primary inline-flex items-center gap-1.5 disabled:opacity-50"
          disabled={dirtyKeys.size === 0 || saving}
          onClick={saveAll}
        >
          <Save className="w-4 h-4" /> {saving ? "Salvando..." : `Salvar alterações${dirtyKeys.size ? ` (${dirtyKeys.size})` : ""}`}
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg" style={{ border: "1px solid var(--admin-border)" }}>
        <table className="w-full text-sm">
          <thead style={{ background: "var(--admin-surface-2)" }}>
            <tr className="text-left text-xs uppercase tracking-wide" style={{ color: "var(--admin-muted)" }}>
              <th className="w-8 px-3 py-2.5"></th>
              <th className="px-3 py-2.5">Tela</th>
              <th className="px-3 py-2.5">Ação</th>
              <th className="px-3 py-2.5">Destino</th>
              <th className="px-3 py-2.5">Evento</th>
              <th className="px-3 py-2.5">Pixel</th>
              <th className="px-3 py-2.5">UTM</th>
              <th className="px-3 py-2.5">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const key = `${r.screenId}:${r.action.action_key}`;
              const expanded = open === key;
              const utm = [r.action.utm_source, r.action.utm_medium, r.action.utm_campaign].filter(Boolean).join(" / ");
              return (
                <Fragment key={key}>
                  <tr
                    className="cursor-pointer hover:bg-[var(--admin-surface-2)]/60"
                    style={{ borderTop: "1px solid var(--admin-border)" }}
                    onClick={() => setOpen(expanded ? null : key)}
                  >
                    <td className="px-3 py-3 text-[var(--admin-muted)]">
                      {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </td>
                    <td className="px-3 py-3 font-medium">{r.screenName}</td>
                    <td className="px-3 py-3">{r.action.action_label}</td>
                    <td className="px-3 py-3">
                      <span className="text-xs" style={{ color: "var(--admin-muted)" }}>{destLabel(r.action.destination_type)}</span>
                      <div className="text-xs truncate max-w-[200px]">{r.action.destination_value || <em>—</em>}</div>
                    </td>
                    <td className="px-3 py-3 font-mono text-xs">{r.action.event_name}</td>
                    <td className="px-3 py-3">
                      {r.action.pixel_enabled
                        ? <StatusBadge variant="info">{r.action.pixel_event_name || r.action.event_name}</StatusBadge>
                        : <StatusBadge variant="neutral">desativado</StatusBadge>}
                    </td>
                    <td className="px-3 py-3 text-xs" style={{ color: "var(--admin-muted)" }}>{utm || "—"}</td>
                    <td className="px-3 py-3">
                      {r.action.status === "active"
                        ? <StatusBadge variant="success">ativo</StatusBadge>
                        : <StatusBadge variant="neutral">inativo</StatusBadge>}
                    </td>
                  </tr>
                  {expanded && (
                    <tr style={{ borderTop: "1px solid var(--admin-border)", background: "var(--admin-surface-2)" }}>
                      <td colSpan={8} className="px-6 py-5">
                        <ActionEditor
                          action={r.action}
                          screenIds={screenIds}
                          onChange={(p) => patchAction(r.screenId, r.action.action_key, p)}
                          onReset={() => resetScreen(r.screenId)}
                        />
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ActionEditor({
  action, screenIds, onChange, onReset,
}: {
  action: ScreenAction;
  screenIds: string[];
  onChange: (patch: Partial<ScreenAction>) => void;
  onReset: () => void;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <Field label="Label da ação">
        <input className="admin-input" value={action.action_label} onChange={(e) => onChange({ action_label: e.target.value })} />
      </Field>
      <Field label="Tipo de destino">
        <select
          className="admin-input"
          value={action.destination_type}
          onChange={(e) => onChange({ destination_type: e.target.value as ActionDestinationType })}
        >
          <option value="next_screen">Próxima tela</option>
          <option value="checkout">Checkout</option>
          <option value="whatsapp">WhatsApp</option>
          <option value="external_url">URL externa</option>
        </select>
      </Field>
      <Field label="Valor de destino">
        {action.destination_type === "next_screen" ? (
          <select
            className="admin-input"
            value={action.destination_value}
            onChange={(e) => onChange({ destination_value: e.target.value })}
          >
            <option value="">— selecionar —</option>
            {screenIds.map((id) => <option key={id} value={id}>{id}</option>)}
          </select>
        ) : (
          <input
            className="admin-input"
            placeholder={action.destination_type === "whatsapp" ? "551199999999" : "https://..."}
            value={action.destination_value}
            onChange={(e) => onChange({ destination_value: e.target.value })}
          />
        )}
      </Field>

      <Field label="Nome do evento (event_name)">
        <input className="admin-input font-mono" value={action.event_name} onChange={(e) => onChange({ event_name: e.target.value })} />
      </Field>
      <Field label="Status">
        <select
          className="admin-input"
          value={action.status}
          onChange={(e) => onChange({ status: e.target.value as ScreenAction["status"] })}
        >
          <option value="active">Ativo</option>
          <option value="inactive">Inativo</option>
        </select>
      </Field>
      <Field label="Pixel">
        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={action.pixel_enabled}
            onChange={(e) => onChange({ pixel_enabled: e.target.checked })}
          />
          Disparar pixel
        </label>
        {action.pixel_enabled && (
          <input
            className="admin-input mt-2"
            placeholder="Nome do evento no pixel (ex: Lead)"
            value={action.pixel_event_name ?? ""}
            onChange={(e) => onChange({ pixel_event_name: e.target.value })}
          />
        )}
      </Field>

      <Field label="UTM source"><input className="admin-input" value={action.utm_source ?? ""} onChange={(e) => onChange({ utm_source: e.target.value })} /></Field>
      <Field label="UTM medium"><input className="admin-input" value={action.utm_medium ?? ""} onChange={(e) => onChange({ utm_medium: e.target.value })} /></Field>
      <Field label="UTM campaign"><input className="admin-input" value={action.utm_campaign ?? ""} onChange={(e) => onChange({ utm_campaign: e.target.value })} /></Field>
      <Field label="UTM content"><input className="admin-input" value={action.utm_content ?? ""} onChange={(e) => onChange({ utm_content: e.target.value })} /></Field>

      <div className="md:col-span-2 xl:col-span-3 flex justify-end">
        <button className="admin-btn-secondary inline-flex items-center gap-1.5" onClick={onReset}>
          <RotateCcw className="w-4 h-4" /> Resetar ações desta tela
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="admin-label block mb-1.5">{label}</label>
      {children}
    </div>
  );
}
