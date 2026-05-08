export function EmptyState({
  icon, title, description, action,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div
      className="flex flex-col items-center justify-center text-center py-16 px-6"
      style={{
        border: "1px dashed var(--admin-border-strong)",
        borderRadius: "var(--admin-radius)",
        background: "var(--admin-surface-2)",
      }}
    >
      {icon && (
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: "var(--admin-surface)", border: "1px solid var(--admin-border)" }}
        >
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold">{title}</h3>
      {description && (
        <p className="text-sm mt-1.5 max-w-md" style={{ color: "var(--admin-muted)" }}>{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}