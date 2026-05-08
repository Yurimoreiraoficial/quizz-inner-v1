export function PageHeader({
  title, description, right,
}: { title: string; description?: string; right?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-6 mb-6">
      <div>
        <h1 className="text-[28px] font-bold tracking-tight" style={{ color: "var(--admin-text)" }}>
          {title}
        </h1>
        {description && (
          <p className="mt-1.5 text-sm max-w-2xl" style={{ color: "var(--admin-muted)" }}>
            {description}
          </p>
        )}
      </div>
      {right && <div className="flex items-center gap-2 shrink-0">{right}</div>}
    </div>
  );
}