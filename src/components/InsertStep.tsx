import type { ReactNode } from "react";
import { PrimaryButton } from "./PrimaryButton";

interface InsertStepProps {
  title?: string;
  headline?: string;
  subtitle?: string;
  image?: ReactNode;
  imageHeightClass?: string; // ex: "h-40"
  bullets?: { title?: string; items: string[] };
  ctaLabel?: string;
  onContinue: () => void;
  children?: ReactNode;
}

export function InsertStep({
  title, headline, subtitle, image, imageHeightClass = "h-44",
  bullets, ctaLabel = "CONTINUAR", onContinue, children,
}: InsertStepProps) {
  return (
    <div className="flex flex-col">
      {headline && (
        <h1 className="text-[26px] sm:text-[28px] leading-[1.15] font-bold text-foreground text-balance">
          {headline}
        </h1>
      )}

      {image && (
        <div className={`mt-5 ${imageHeightClass} flex items-center justify-center`}>
          {image}
        </div>
      )}

      {title && (
        <h2 className="mt-5 text-[22px] sm:text-[24px] font-bold text-foreground text-balance text-center">
          {title}
        </h2>
      )}

      {subtitle && (
        <p className="mt-3 text-[15px] sm:text-[16px] leading-relaxed text-muted-foreground text-pretty">
          {subtitle}
        </p>
      )}

      {bullets && (
        <div className="card-surface mt-5 p-5">
          {bullets.title && (
            <h3 className="text-[20px] font-bold text-foreground mb-3 text-balance">
              {bullets.title}
            </h3>
          )}
          <ul className="space-y-2.5">
            {bullets.items.map((b, i) => (
              <li key={i} className="flex items-start gap-2.5 text-[15px] text-foreground text-pretty">
                <span className="mt-2 inline-block w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {children}

      <div className="mt-7">
        <PrimaryButton onClick={onContinue}>{ctaLabel}</PrimaryButton>
      </div>
    </div>
  );
}
