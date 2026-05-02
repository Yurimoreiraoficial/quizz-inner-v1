import { cn } from "@/lib/utils";
import logoWhite from "@/assets/logo-inner-white.svg";

interface LogoProps {
  className?: string;
}

/**
 * Logo oficial Inner AI.
 * - O SVG é branco por padrão (ideal para o tema dark).
 * - No tema light, invertemos a cor via filter para ficar escuro sobre a pílula branca.
 *   (a classe `dark:invert-0` cancela a inversão quando o tema dark está ativo)
 */
export function Logo({ className }: LogoProps) {
  return (
    <div className={cn("logo-pill rounded", className)} aria-label="Inner AI">
      <img
        src={logoWhite}
        alt="Inner AI"
        className="h-[18px] w-auto invert dark:invert-0"
        draggable={false}
      />
    </div>
  );
}
