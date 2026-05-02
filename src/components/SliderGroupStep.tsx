import { useEffect, useMemo } from "react";
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

  return (
    <div className="card-surface px-3 py-2 rounded-sm">
      <div className="text-[13px] sm:text-[14px] font-semibold text-foreground text-pretty mb-1.5 leading-snug">
        {label}
      </div>

      {/* Trilho */}
      <div className="relative px-2">
        <div className="h-1 rounded-full bg-secondary">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${pct}%`, background: "var(--gradient-primary)" }}
          />
        </div>
        {/* Pontos clicáveis */}
        <div className="absolute inset-0 flex items-center justify-between">
          {scale.map((s, i) => {
            const active = idx >= i;
            return (
              <button
                key={String(s)}
                type="button"
                aria-label={String(s)}
                onClick={() => onChange(s)}
                className={cn(
                  "w-3.5 h-3.5 rounded-full border-2 transition-all",
                  active ? "bg-primary border-primary scale-100" : "bg-card border-border-strong/40"
                )}
              />
            );
          })}
        </div>
      </div>

      {/* Labels */}
      <div className="mt-1.5 grid" style={{ gridTemplateColumns: `repeat(${scale.length}, minmax(0,1fr))` }}>
        {scale.map((s, i) => (
          <button
            key={String(s)}
            type="button"
            onClick={() => onChange(s)}
            className={cn(
              "text-[11px] sm:text-[12px] py-0 transition-colors",
              i === 0 ? "text-left" : i === scale.length - 1 ? "text-right" : "text-center",
              i === idx ? "font-bold text-foreground" : "text-muted-foreground"
            )}
          >
            {String(s)}
          </button>
        ))}
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
      <p className="mt-1.5 text-[13px] sm:text-[14px] text-muted-foreground text-pretty">
        Toque na escala para selecionar a opção que melhor descreve você.
      </p>
      <div className="mt-3 flex flex-col gap-1.5">
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
