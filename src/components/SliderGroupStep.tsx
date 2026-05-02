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
    <div className="card-surface px-4 py-3 rounded-sm">
      <div className="text-[14px] sm:text-[15px] font-semibold text-foreground text-pretty mb-2 py-[6px]">
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
      <div className="mt-2 grid" style={{ gridTemplateColumns: `repeat(${scale.length}, minmax(0,1fr))` }}>
        {scale.map((s, i) => (
          <button
            key={String(s)}
            type="button"
            onClick={() => onChange(s)}
            className={cn(
              "text-[12px] sm:text-[13px] py-0.5 transition-colors text-muted-foreground text-right",
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
  return (
    <div className="flex flex-col">
      <h1 className="text-[24px] sm:text-[26px] leading-[1.2] font-bold text-foreground text-balance">
        {question}
      </h1>
      <div className="mt-5 flex flex-col gap-2">
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
