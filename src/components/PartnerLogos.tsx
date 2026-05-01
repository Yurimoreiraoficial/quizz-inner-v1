import { partnerLogos } from "@/data/finalPageContent";

// Logos em UMA única linha (overflow horizontal mas sem barra)
export function PartnerLogos() {
  return (
    <div className="w-full overflow-x-auto no-scrollbar">
      <div className="flex items-center justify-center gap-5 sm:gap-7 px-2 whitespace-nowrap">
        {partnerLogos.map((p) => (
          <div key={p} className="text-[13px] sm:text-sm font-semibold text-muted-foreground/70 tracking-tight">
            {p}
          </div>
        ))}
      </div>
    </div>
  );
}
