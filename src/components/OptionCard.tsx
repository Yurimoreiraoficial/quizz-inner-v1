import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface OptionCardProps {
  label: string;
  selected?: boolean;
  onClick: () => void;
}

// Card branco com borda escura sutil; ao selecionar fica azul
export function OptionCard({ label, selected = false, onClick }: OptionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group w-full text-left rounded-2xl bg-card",
        "px-5 py-4 sm:py-[18px] flex items-center justify-between gap-3",
        "border transition-all duration-200 active:scale-[0.99]",
        selected
          ? "border-primary bg-primary/5 shadow-card"
          : "border-[hsl(var(--border-strong))] hover:border-primary/60"
      )}
      aria-pressed={selected}
    >
      <span className="text-[16px] sm:text-[17px] font-medium text-foreground text-pretty">
        {label}
      </span>
      <span
        className={cn(
          "shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
          selected ? "bg-primary border-primary text-white" : "border-[hsl(var(--border-strong))]/60 bg-white"
        )}
      >
        {selected && <Check className="w-3.5 h-3.5" />}
      </span>
    </button>
  );
}
