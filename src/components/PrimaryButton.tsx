import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  withArrow?: boolean;
  variant?: "primary" | "secondary";
}

export function PrimaryButton({
  children, withArrow = false, variant = "primary", className, ...rest
}: PrimaryButtonProps) {
  return (
    <button
      {...rest}
      className={cn(variant === "primary" ? "btn-primary" : "btn-secondary", className)}
    >
      <span className="inline-flex items-center justify-center gap-2">{children}</span>
      {withArrow && <ArrowRight className="w-4 h-4" />}
    </button>
  );
}
