import { cn } from "@/lib/utils";

type Variant = "info" | "success" | "warning" | "experiment" | "neutral" | "danger";

const styles: Record<Variant, { bg: string; color: string; dot: string }> = {
  info:       { bg: "var(--admin-blue-soft)",   color: "var(--admin-blue)",   dot: "var(--admin-blue)" },
  success:    { bg: "var(--admin-green-soft)",  color: "var(--admin-green)",  dot: "var(--admin-green)" },
  warning:    { bg: "var(--admin-yellow-soft)", color: "var(--admin-yellow)", dot: "var(--admin-yellow)" },
  experiment: { bg: "var(--admin-purple-soft)", color: "var(--admin-purple)", dot: "var(--admin-purple)" },
  neutral:    { bg: "var(--admin-surface-3)",   color: "var(--admin-muted)",  dot: "var(--admin-muted-2)" },
  danger:     { bg: "var(--admin-red-soft)",    color: "var(--admin-red-text)", dot: "var(--admin-red-text)" },
};

export function StatusBadge({
  children, variant = "neutral", dot = true, className,
}: {
  children: React.ReactNode;
  variant?: Variant;
  dot?: boolean;
  className?: string;
}) {
  const s = styles[variant];
  return (
    <span
      className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold", className)}
      style={{ background: s.bg, color: s.color }}
    >
      {dot && <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: s.dot }} />}
      {children}
    </span>
  );
}