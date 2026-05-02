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

  const answered = idx >= 0;

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
        {/* Trilho */}
        <div className="relative px-2">
          <div className="h-[3px] rounded-full bg-secondary">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ width: `${pct}%`, background: "var(--gradient-primary)" }}
            />
          </div>
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
