import { useEffect, useMemo, useRef, useCallback, useState } from "react";
import type { TaskItem } from "@/data/taskOptionsByMarket";
import type { SliderValue, FrequencyValue } from "@/types/funnel";
import { cn } from "@/lib/utils";

type ScaleValue = SliderValue | FrequencyValue;

// Sentinela interno: representa "ainda não respondido" como uma bolinha extra
// à esquerda, sem texto. Não é exposto para fora do componente.
const EMPTY = "__empty__" as const;
type InternalScale = (ScaleValue | typeof EMPTY)[];

interface SliderRowProps<T extends ScaleValue> {
  label: string;
  scale: T[];
  value?: T;
  onChange: (value: T) => void;
  answered: boolean;
}

function SliderRow<T extends ScaleValue>({ label, scale, value, onChange, answered }: SliderRowProps<T>) {
  // Escala interna: [EMPTY, ...scale]. Quando não respondido, idx = 0.
  const internalScale: InternalScale = useMemo(() => [EMPTY, ...scale], [scale]);
  const idx = answered && value ? internalScale.indexOf(value) : 0;
  const pct = (idx / (internalScale.length - 1)) * 100;

  const trackRef = useRef<HTMLDivElement>(null);
  const lastIdxRef = useRef<number>(idx);

  const updateFromClientX = useCallback(
    (clientX: number) => {
      const el = trackRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
      const newIdx = Math.round(ratio * (internalScale.length - 1));
      if (newIdx === 0) return; // não selecionar a bolinha "vazia"
      if (newIdx !== lastIdxRef.current) {
        lastIdxRef.current = newIdx;
        onChange(internalScale[newIdx] as T);
      }
    },
    [internalScale, onChange]
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

      {/* Bloco de resposta */}
      <div
        className={cn(
          "mt-3 pt-3 border-t border-border/60 transition-opacity",
          answered ? "opacity-100" : "opacity-80"
        )}
      >
        <div
          ref={trackRef}
          role="slider"
          aria-valuemin={1}
          aria-valuemax={internalScale.length - 1}
          aria-valuenow={Math.max(1, idx)}
          aria-valuetext={answered && value ? String(value) : undefined}
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
            {internalScale.map((s, i) => {
              const active = answered && idx >= i && i > 0;
              const isEmpty = s === EMPTY;
              return (
                <span
                  key={String(s)}
                  aria-hidden
                  className={cn(
                    "rounded-full border transition-all",
                    isEmpty ? "w-1.5 h-1.5" : "w-2 h-2",
                    active
                      ? "bg-primary border-primary"
                      : isEmpty && !answered
                        ? "bg-primary/60 border-primary/60"
                        : "bg-card border-border-strong/30"
                  )}
                />
              );
            })}
          </div>
        </div>

        <div
          className="mt-2 grid"
          style={{ gridTemplateColumns: `repeat(${internalScale.length}, minmax(0,1fr))` }}
        >
          {internalScale.map((s, i) => {
            const isEmpty = s === EMPTY;
            return (
              <button
                key={String(s)}
                type="button"
                disabled={isEmpty}
                onClick={() => !isEmpty && onChange(s as T)}
                className={cn(
                  "text-[10px] uppercase tracking-wide leading-tight py-0 transition-colors",
                  i === 0 ? "text-left" : i === internalScale.length - 1 ? "text-right" : "text-center",
                  answered && i === idx ? "font-semibold text-primary" : "text-muted-foreground/70",
                  isEmpty && "invisible"
                )}
              >
                {isEmpty ? "·" : String(s)}
              </button>
            );
          })}
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
  onAllAnswered?: (allAnswered: boolean) => void;
}

export function SliderGroupStep({ question, scale, items, values, onChange, onAllAnswered }: SliderGroupStepProps) {
  const list = useMemo(() => items, [items]);

  // Conjunto local de itens já respondidos (independente do valor inicial)
  const [answeredIds, setAnsweredIds] = useState<Set<string>>(new Set());

  // Reset ao trocar a lista (mudar de step)
  useEffect(() => {
    setAnsweredIds(new Set());
  }, [list]);

  const handleChange = useCallback(
    (id: string, label: string, value: ScaleValue) => {
      setAnsweredIds((prev) => {
        if (prev.has(id)) return prev;
        const next = new Set(prev);
        next.add(id);
        return next;
      });
      onChange(id, label, value);
    },
    [onChange]
  );

  // Quantos blocos revelar: todos os respondidos + o próximo
  const revealCount = Math.min(list.length, answeredIds.size + 1);
  const allAnswered = answeredIds.size >= list.length;

  useEffect(() => {
    onAllAnswered?.(allAnswered);
  }, [allAnswered, onAllAnswered]);

  return (
    <div className="flex flex-col">
      <h1 className="text-[20px] sm:text-[24px] leading-[1.2] font-bold text-foreground text-balance">
        {question}
      </h1>
      <div className="mt-4 flex flex-col gap-1.5">
        {list.map((it, i) => {
          const isRevealed = i < revealCount;
          const isAnswered = answeredIds.has(it.id);
          return (
            <div
              key={it.id}
              className={cn(
                "transition-all duration-500",
                isRevealed
                  ? "opacity-100 blur-0 pointer-events-auto"
                  : "opacity-40 blur-sm pointer-events-none select-none"
              )}
              aria-hidden={!isRevealed}
            >
              <SliderRow
                label={it.label}
                scale={scale}
                value={values[it.id]}
                answered={isAnswered}
                onChange={(v) => handleChange(it.id, it.label, v)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
