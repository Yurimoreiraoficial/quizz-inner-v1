import clientsLogos from "@/assets/clients-logos.svg";

// Faixa única de logos de clientes/parceiros
export function PartnerLogos() {
  return (
    <div className="w-full overflow-hidden">
      <img
        src={clientsLogos}
        alt="Logos de empresas parceiras e clientes"
        className="w-full h-auto max-h-10 sm:max-h-12 object-contain opacity-80 invert dark:invert-0 select-none pointer-events-none"
        draggable={false}
      />
    </div>
  );
}
