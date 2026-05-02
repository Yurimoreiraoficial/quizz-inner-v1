import { company, links } from "@/data/designTokens";

export function Footer() {
  return (
    <footer className="mt-8 pb-6 text-center text-[12px] text-muted-foreground">
      <div className="flex flex-col gap-1">
        <div>
          <a href={links.termsUrl} className="hover:underline">Termos de Serviço</a>
          <span className="mx-2">·</span>
          <a href={links.privacyUrl} className="hover:underline">Privacidade</a>
        </div>
        <div>CNPJ: {company.cnpj}</div>
      </div>
    </footer>
  );
}
