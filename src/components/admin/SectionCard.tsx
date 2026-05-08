import { cn } from "@/lib/utils";

export function SectionCard({
  title, description, right, children, className, padded = true,
}: {
  title?: string;
  description?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <section className={cn("admin-card", className)}>
      {(title || right) && (
        <header
          className="flex items-center justify-between gap-4 px-6 py-5"
          style={{ borderBottom: "1px solid var(--admin-border)" }}
        >
          <div>
            {title && <h3 className="text-[15px] font-semibold">{title}</h3>}
            {description && (
              <p className="text-xs mt-0.5" style={{ color: "var(--admin-muted)" }}>{description}</p>
            )}
          </div>
          {right}
        </header>
      )}
      <div className={padded ? "p-6" : ""}>{children}</div>
    </section>
  );
}