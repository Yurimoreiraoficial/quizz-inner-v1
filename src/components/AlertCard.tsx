import { cn } from "@/lib/utils";

interface AlertCardProps {
  title?: string;
  body: string;
  variant?: "warning" | "info";
  align?: "left" | "center";
}

export function AlertCard({ title, body, variant = "warning", align = "left" }: AlertCardProps) {
  const alignClass = align === "center" ? "text-center" : "text-left";
  return (
    <div className={cn(
      "rounded-2xl border p-4",
      alignClass,
      variant === "warning" ? "bg-warning/10 border-warning/30" : "bg-primary/5 border-primary/20"
    )}>
      {title && <div className={cn("font-semibold text-foreground mb-1", alignClass)}>{title}</div>}
      <p className={cn("text-sm text-muted-foreground leading-relaxed text-pretty whitespace-pre-line", alignClass)}>{body}</p>
    </div>
  );
}
