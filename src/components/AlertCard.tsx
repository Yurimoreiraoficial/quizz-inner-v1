import { cn } from "@/lib/utils";

interface AlertCardProps {
  title?: string;
  body: string;
  variant?: "warning" | "info";
}

export function AlertCard({ title, body, variant = "warning" }: AlertCardProps) {
  return (
    <div className={cn(
      "rounded-2xl border p-4 text-left",
      variant === "warning" ? "bg-warning/10 border-warning/30" : "bg-primary/5 border-primary/20"
    )}>
      {title && <div className="font-semibold text-foreground mb-1 text-left">{title}</div>}
      <p className="text-sm text-muted-foreground leading-relaxed text-pretty whitespace-pre-line text-left">{body}</p>
    </div>
  );
}
