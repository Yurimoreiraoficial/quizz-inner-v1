interface ProgressBarProps {
  value: number;          // 0..1
  visible?: boolean;
}

// Barra fina sem texto
export function ProgressBar({ value, visible = true }: ProgressBarProps) {
  if (!visible) return <div className="h-1.5" aria-hidden />;
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
      <div
        className="h-full rounded-full transition-[width] duration-500"
        style={{ width: `${pct}%`, background: "var(--gradient-primary)" }}
      />
    </div>
  );
}
