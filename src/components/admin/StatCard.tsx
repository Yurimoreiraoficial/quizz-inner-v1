import { StatusBadge } from "./StatusBadge";

export function StatCard({
  label, value, hint, badge, badgeVariant = "neutral",
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  badge?: string;
  badgeVariant?: "info" | "success" | "warning" | "experiment" | "neutral" | "danger";
}) {
  return (
    <div className="admin-card-soft p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="admin-label">{label}</span>
        {badge && <StatusBadge variant={badgeVariant}>{badge}</StatusBadge>}
      </div>
      <div className="text-[26px] font-bold tracking-tight leading-none">{value}</div>
      {hint && <p className="text-xs mt-2" style={{ color: "var(--admin-muted)" }}>{hint}</p>}
    </div>
  );
}