import clientsLogos from "@/assets/clients-logos.webp";

// Faixa única de logos de clientes/parceiros com rolagem contínua da direita para a esquerda
export function PartnerLogos() {
  return (
    <div className="w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
      <div className="flex w-max animate-marquee-rtl">
        {[0, 1].map((i) => (
          <img
            key={i}
            src={clientsLogos}
            alt="Logos de empresas parceiras e clientes"
            loading="lazy"
            decoding="async"
            aria-hidden={i === 1}
            className="h-auto max-h-10 sm:max-h-12 object-contain opacity-80 select-none pointer-events-none shrink-0 pr-8"
            draggable={false}
          />
        ))}
      </div>
    </div>
  );
}
