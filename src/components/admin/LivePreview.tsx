/**
 * Preview mobile in-page do funil dark.
 * Renderiza visualmente o conteúdo da tela enquanto o operador edita,
 * sem sair do design system público (dark, primary glow).
 * Não é o funil real — é uma maquete fiel para feedback visual instantâneo.
 */
import type { FunnelScreen } from "@/data/funnelConfig";
import { ChevronRight, Lock } from "lucide-react";

export function LivePreview({ screen }: { screen: FunnelScreen }) {
  const c = screen.content ?? {};
  const ctaText = c.buttonText || screen.cta?.label || "Continuar";
  const extras = (c.extras ?? {}) as Record<string, string | string[]>;

  return (
    <div className="flex flex-col h-full text-white px-5 pt-10 pb-6 overflow-y-auto">
      {/* status bar */}
      <div className="flex justify-between text-[10px] text-white/40 -mt-4 mb-3">
        <span>9:41</span>
        <span>Inner AI</span>
      </div>

      {/* progress */}
      {screen.type !== "opening" && screen.type !== "final" && (
        <div className="h-1 w-full rounded-full bg-white/10 mb-5">
          <div
            className="h-full rounded-full"
            style={{ width: `${Math.min((screen.order / 10) * 100, 100)}%`, background: "#3b82f6" }}
          />
        </div>
      )}

      {/* headline */}
      {c.headline && (
        <h2 className="text-[20px] leading-tight font-bold text-balance">{c.headline}</h2>
      )}
      {c.subtitle && (
        <p className="mt-2 text-[13px] text-white/60 leading-snug">{c.subtitle}</p>
      )}

      {/* per-type body */}
      <div className="mt-5 flex-1 min-h-0">
        {renderBody(screen, extras)}
      </div>

      {/* CTA */}
      {ctaText && screen.cta?.type !== "none" && (
        <button
          className="mt-4 w-full rounded-2xl py-3.5 font-bold text-[14px] tracking-wide flex items-center justify-center gap-1.5"
          style={{
            background: "linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%)",
            boxShadow: "0 8px 24px rgba(59,130,246,0.35)",
          }}
        >
          {ctaText.toUpperCase()}
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

function renderBody(screen: FunnelScreen, extras: Record<string, string | string[]>) {
  switch (screen.type) {
    case "single_choice":
      return (
        <div className="space-y-2">
          {(screen.options ?? []).map((o) => (
            <div
              key={o.value}
              className="rounded-2xl border border-white/10 bg-white/[0.04] px-3.5 py-3 text-[13px]"
            >
              {o.label}
            </div>
          ))}
          {(!screen.options || screen.options.length === 0) && (
            <p className="text-[12px] text-white/40">Nenhuma opção definida.</p>
          )}
        </div>
      );

    case "slider_group_market":
    case "slider_group_pain": {
      const items = (extras.sliderItems as string[]) ?? sampleSliderItems(screen.type);
      return (
        <div className="space-y-3">
          {items.map((label, i) => (
            <div key={i}>
              <div className="text-[12px] mb-1.5">{label}</div>
              <div className="flex gap-1.5">
                {["Nunca", "Às vezes", "Muito"].map((s) => (
                  <span
                    key={s}
                    className="flex-1 text-center text-[10px] rounded-full border border-white/10 bg-white/[0.03] py-1.5"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      );
    }

    case "insert": {
      const bullets = (extras.bullets as string[]) ?? [];
      return (
        <div className="space-y-2">
          {bullets.length > 0
            ? bullets.map((b, i) => (
                <div key={i} className="flex gap-2 text-[13px]">
                  <span className="text-blue-400">•</span>
                  <span>{b}</span>
                </div>
              ))
            : (
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-[12px] text-white/60 text-center">
                Bloco visual de inserção
              </div>
            )}
        </div>
      );
    }

    case "loading":
      return (
        <div className="flex flex-col items-center justify-center gap-3 mt-6">
          <div className="w-10 h-10 rounded-full border-2 border-white/15 border-t-blue-500 animate-spin" />
          <span className="text-[12px] text-white/60">Calculando...</span>
        </div>
      );

    case "lead_capture": {
      const fields = (extras.formFields as string[]) ?? ["Seu nome", "WhatsApp (com DDD)"];
      return (
        <div className="space-y-2.5">
          {fields.map((f, i) => (
            <div key={i} className="rounded-2xl border border-white/10 bg-white/[0.04] px-3.5 py-3 text-[12px] text-white/40">
              {f}
            </div>
          ))}
          <div className="flex items-center gap-1.5 text-[10px] text-white/40 mt-2">
            <Lock className="w-3 h-3" /> {extras.microcopy as string ?? "Seus dados estão seguros."}
          </div>
        </div>
      );
    }

    case "final": {
      const bullets = (extras.resultBullets as string[]) ?? [];
      return (
        <div className="space-y-3">
          <div className="rounded-2xl border border-blue-400/30 bg-blue-500/10 p-3.5">
            <div className="text-[10px] uppercase tracking-wider text-blue-300">Plano sugerido</div>
            <div className="text-[15px] font-bold mt-1">Plano PRO</div>
          </div>
          {bullets.map((b, i) => (
            <div key={i} className="text-[12px] text-white/70 flex gap-2">
              <span className="text-green-400">✓</span>{b}
            </div>
          ))}
          {extras.guaranteeMicro && (
            <div className="text-[10px] text-white/40 text-center mt-1">{extras.guaranteeMicro}</div>
          )}
        </div>
      );
    }

    case "opening":
    default:
      return (
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 text-center">
          <div className="text-[11px] text-white/40 uppercase tracking-widest mb-2">Inner AI</div>
          <div className="text-[12px] text-white/60">Tela inicial do funil</div>
        </div>
      );
  }
}

function sampleSliderItems(type: FunnelScreen["type"]) {
  if (type === "slider_group_pain") return ["Pular tarefa por falta de tempo", "Procrastinar", "Refazer trabalho"];
  return ["Criar conteúdo", "Resumir documentos", "Gerar imagens"];
}
