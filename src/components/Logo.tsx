import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
}

// Pill branca centralizada com texto "Inner AI" — fácil trocar por SVG depois
export function Logo({ className }: LogoProps) {
  return (
    <div className={cn("logo-pill", className)} aria-label="Inner AI">
      <span className="text-[15px] tracking-tight text-foreground">
        Inner <span className="font-extrabold">AI</span>
      </span>
    </div>
  );
}
