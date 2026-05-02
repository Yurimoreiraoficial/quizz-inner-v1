import { useEffect, useMemo, useRef, useCallback } from "react";
import type { TaskItem } from "@/data/taskOptionsByMarket";
import type { SliderValue, FrequencyValue } from "@/types/funnel";
import { cn } from "@/lib/utils";

type ScaleValue = SliderValue | FrequencyValue;

interface SliderRowProps<T extends ScaleValue> {
  label: string;
  scale: T[];
  value?: T;
  onChange: (value: T) => void;
}

// Slider visual customizado (não usa range nativo) para combinar com design
function SliderRow<T extends ScaleValue>({ label, scale, value, onChange }: SliderRowProps<T>) {
  const idx = value ? scale.indexOf(value) : -1;
  const pct = idx >= 0 ? (idx / (scale.length - 1)) * 100 : 0;

  const answered = idx >= 0;
  const trackRef = useRef<HTMLDivElement>(null);
  const lastIdxRef = useRef<number>(idx);

  const updateFromClientX = useCallback(
    (clientX: number) => {
      const el = trackRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
      const newIdx = Math.round(ratio * (scale.length - 1));
      if (newIdx !== lastIdxRef.current) {
        lastIdxRef.current = newIdx;
        onChange(scale[newIdx]);
      }
    },
    [scale, onChange]
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    lastIdxRef.current = -1;
    updateFromClientX(e.clientX);
  };
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.buttons !== 1 && e.pointerType === "mouse") return;
    updateFromClientX(e.clientX);
  };

  return (
    <div
      className={cn(
        "card-surface px-4 py-3.5 rounded-xl transition-colors",
        answered ? "border-primary/30" : ""
      )}
    >
      {/* Afirmação — protagonista */}
      <div className="text-[15px] sm:text-[16px] font-semibold text-foreground leading-snug">
        {label}
      </div>

      {/* Bloco de resposta — secundário, separado e atenuado até interação */}
      <div
        className={cn(
          "mt-3 pt-3 border-t border-border/60 transition-opacity",
          answered ? "opacity-100" : "opacity-70"
        )}
      >
        {/* Trilho — clicável e arrastável */}
        <div
          ref={trackRef}
          role="slider"
          aria-valuemin={0}
          aria-valuemax={scale.length - 1}
          aria-valuenow={Math.max(0, idx)}
          aria-valuetext={idx >= 0 ? String(scale[idx]) : undefined}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          className="relative px-2 py-3 -my-3 touch-none cursor-pointer select-none"
        >
          <div className="h-[3px] rounded-full bg-secondary pointer-events-none">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ width: `${pct}%`, background: "var(--gradient-primary)" }}
            />
          </div>
          <div className="absolute inset-0 px-2 flex items-center justify-between pointer-events-none">
            {scale.map((s, i) => {
              const active = idx >= i;
              return (
                <span
                  key={String(s)}
                  aria-hidden
                  className={cn(
                    "w-2 h-2 rounded-full border transition-all",
                    active ? "bg-primary border-primary" : "bg-card border-border-strong/30"
                  )}
                />
              );
            })}
          </div>
        </div>

        {/* Labels da escala — pequenos e discretos */}
        <div
          className="mt-2 grid"
          style={{ gridTemplateColumns: `repeat(${scale.length}, minmax(0,1fr))` }}
        >
          {scale.map((s, i) => (
            <button
              key={String(s)}
              type="button"
              onClick={() => onChange(s)}
              className={cn(
                "text-[10px] uppercase tracking-wide leading-tight py-0 transition-colors",
                i === 0 ? "text-left" : i === scale.length - 1 ? "text-right" : "text-center",
                i === idx ? "font-semibold text-primary" : "text-muted-foreground/70"
              )}
            >
              {String(s)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

interface SliderGroupStepProps {
  question: string;
  scale: ScaleValue[];
  items: { id: string; label: string }[] | TaskItem[];
  values: Record<string, ScaleValue>;
  onChange: (id: string, label: string, value: ScaleValue) => void;
}

export function SliderGroupStep({ question, scale, items, values, onChange }: SliderGroupStepProps) {
  const list = useMemo(() => items, [items]);

  // Pré-seleciona "Nunca" (primeiro item da escala) para itens sem valor
  useEffect(() => {
    const defaultValue = scale[0];
    list.forEach((it) => {
      if (values[it.id] === undefined) {
        onChange(it.id, it.label, defaultValue);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list]);
  return (
    <div className="flex flex-col">
      <h1 className="text-[20px] sm:text-[24px] leading-[1.2] font-bold text-foreground text-balance">
        {question}
      </h1>
      <div className="mt-4 flex flex-col gap-1.5">
        {list.map((it) => (
          <SliderRow
            key={it.id}
            label={it.label}
            scale={scale}
            value={values[it.id]}
            onChange={(v) => onChange(it.id, it.label, v)}
          />
        ))}
      </div>
    </div>
  );
}
