import { useMemo } from "react";
import { ArrowRight, Check, MessageCircle, Shield, Star, Sparkles } from "lucide-react";
import type { FunnelState } from "@/types/funnel";
import { firstName } from "@/utils/formatters";
import { getNaturalBenefits } from "@/utils/getNaturalBenefits";
import { buildCheckoutUrl } from "@/utils/buildCheckoutUrl";
import { buildWhatsappUrl } from "@/utils/buildWhatsappUrl";
import { finalPageContent, partnerLogos } from "@/data/finalPageContent";
import { finalSocialSubBy, socialProofSubBy } from "@/data/marketOptions";
import { testimonialsByMarket } from "@/data/testimonialsByMarket";
import { TestimonialSwipe } from "./TestimonialSwipe";
import { PrimaryButton } from "./PrimaryButton";
import { AlertCard } from "./AlertCard";
import { trackEvent } from "@/services/funnelTrackingService";
import { Logo } from "./Logo";
import { company, links } from "@/data/designTokens";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";

interface FinalResultPageProps {
  state: FunnelState;
}

export function FinalResultPage({ state }: FinalResultPageProps) {
  const fName = firstName(state.nome) || "você";
  const benefits = useMemo(() => getNaturalBenefits(state), [state]);
  const checkoutUrl = useMemo(() => buildCheckoutUrl(state), [state]);
  const whatsappUrl = useMemo(() => buildWhatsappUrl(state), [state]);
  const market = state.mercado ?? "outro";
  const ultra = state.ultraFlag;
  const fitLabel = state.nivelEncaixe ?? "Alto";

  const onCheckout = () => {
    trackEvent(state.sessionId, "checkout_clicked", {
      stepId: "final",
      metadata: { fit_level: fitLabel, recommended_plan: state.planoSugerido },
    });
    window.open(checkoutUrl, "_blank", "noopener");
  };
  const onWhats = () => {
    trackEvent(state.sessionId, "whatsapp_clicked", {
      stepId: "final",
      metadata: { fit_level: fitLabel, recommended_plan: state.planoSugerido },
    });
    window.open(whatsappUrl, "_blank", "noopener");
  };

  return (
    <div className="pb-12">
      {/* Bloco 01 — Nível de encaixe */}
      <section className="text-center">
        <h1 className="text-[26px] sm:text-[30px] leading-[1.1] font-bold text-foreground text-balance">
          {fName}, sua análise está pronta.
        </h1>

        <div className="mt-5 card-strong p-5 text-left">
          <div className="text-[12px] uppercase tracking-wider text-muted-foreground">
            Resultado
          </div>
          <div className="mt-1 text-[18px] sm:text-[20px] font-bold text-foreground text-balance">
            Seu nível de encaixe com a Inner é{" "}
            <span className="text-brand text-6xl">{fitLabel}</span>
          </div>

          <p className="mt-4 text-[14px] text-muted-foreground text-pretty">
            Com base no seu perfil, identificamos que a Inner pode te ajudar principalmente em:
          </p>
          <ul className="mt-3 space-y-2.5">
            {benefits.map((b, i) => (
              <li key={i} className="flex items-start gap-2.5 text-[14.5px] text-foreground text-pretty">
                <Check className="w-4 h-4 text-primary mt-1 shrink-0" />
                <span>{b}</span>
              </li>
            ))}
          </ul>

          <div className="mt-5">
            <PrimaryButton withArrow onClick={onCheckout}>Assinar agora</PrimaryButton>
          </div>

          {ultra && (
            <div className="mt-4 space-y-3">
              <AlertCard
                title={finalPageContent.ultraAlert.title}
                body={finalPageContent.ultraAlert.body}
              />
              <PrimaryButton variant="secondary" onClick={onWhats}>
                <MessageCircle className="w-4 h-4 mr-1" />
                {finalPageContent.ultraAlert.cta}
              </PrimaryButton>
            </div>
          )}
        </div>
      </section>

      {/* Bloco 02 — Tecnologia Fusion */}
      <section className="mt-10">
        <div className="inline-flex items-center gap-1.5 text-primary text-[12px] font-semibold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" /> Tecnologia Fusion
        </div>
        <h2 className="mt-2 text-[24px] sm:text-[26px] font-bold text-foreground text-balance">
          {finalPageContent.fusion.title}
        </h2>
        <p className="mt-3 text-[15px] text-foreground text-pretty">
          {finalPageContent.fusion.description}
        </p>
        <p className="mt-2 text-[14px] text-muted-foreground text-pretty">
          {finalPageContent.fusion.sub}
        </p>
      </section>

      {/* Bloco 03 — Cards de impacto */}
      <section className="mt-8 grid grid-cols-2 gap-3">
        {finalPageContent.impact.map((t) => (
          <div key={t} className="card-surface p-4 text-center text-[14px] font-semibold text-foreground">
            {t}
          </div>
        ))}
      </section>

      {/* Bloco 04 — Antes e depois */}
      <section className="mt-10">
        <div className="grid grid-cols-1 gap-3">
          <div className="rounded-3xl border border-border p-5 bg-secondary/40">
            <div className="text-[12px] uppercase tracking-wider text-muted-foreground">
              {finalPageContent.beforeAfter.withoutLabel}
            </div>
            <ul className="mt-2 space-y-1.5 text-[14px] text-foreground/80">
              {finalPageContent.beforeAfter.withoutItems.map((i) => (
                <li key={i}>• {i}</li>
              ))}
            </ul>
          </div>
          <div className="card-strong p-5">
            <div className="text-[12px] uppercase tracking-wider text-primary font-semibold">
              {finalPageContent.beforeAfter.withLabel}
            </div>
            <ul className="mt-2 space-y-1.5 text-[14px] text-foreground">
              {finalPageContent.beforeAfter.withItems.map((i) => (
                <li key={i} className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-primary mt-1 shrink-0" /> {i}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="mt-4 text-[14px] text-muted-foreground text-pretty">
          {finalPageContent.beforeAfter.summary}
        </p>

        <div className="mt-5">
          <PrimaryButton withArrow onClick={onCheckout}>Assinar agora</PrimaryButton>
        </div>
      </section>

      {/* Bloco 05 — Recursos */}
      <section className="mt-10">
        <h2 className="text-[24px] sm:text-[26px] font-bold text-foreground text-balance">
          {finalPageContent.features.title}
        </h2>
        <p className="mt-2 text-[15px] text-muted-foreground text-pretty">
          {finalPageContent.features.sub}
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3">
          {finalPageContent.features.big.map((b) => (
            <div key={b} className="card-surface p-4 text-[14px] font-semibold text-foreground">{b}</div>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {finalPageContent.features.short.map((b) => (
            <span key={b} className="text-[11px] font-bold tracking-wider px-3 py-1.5 rounded-full bg-primary/10 text-primary uppercase">
              {b}
            </span>
          ))}
        </div>

        <div className="mt-5">
          <PrimaryButton withArrow onClick={onCheckout}>Quero acesso a tudo isso</PrimaryButton>
        </div>
      </section>

      {/* Bloco 06 — Prova social */}
      <section className="mt-10">
        <h2 className="text-[22px] sm:text-[24px] font-bold text-foreground text-balance">
          {fName}, Inner é a ferramenta ideal para você!
        </h2>
        <p className="mt-2 text-[14px] text-muted-foreground text-pretty">
          {socialProofSubBy[market]}
        </p>
        <h3 className="mt-5 text-[16px] font-bold text-foreground">Veja o que eles dizem sobre nós:</h3>
        <div className="mt-3">
          <TestimonialSwipe items={testimonialsByMarket[market]} />
        </div>
        <div className="mt-5">
          <div className="flex items-center justify-center gap-1 text-warning mb-2">
            {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
            <span className="text-[12px] text-muted-foreground ml-1">4.9 / 5</span>
          </div>
          <div className="overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-5 justify-center whitespace-nowrap text-[12px] font-semibold text-muted-foreground/70">
              {partnerLogos.map((p) => <span key={p}>{p}</span>)}
            </div>
          </div>
        </div>
      </section>

      {/* Bloco 07 — Oferta */}
      <section className="mt-10 card-strong p-5">
        <span className="inline-block text-[11px] font-bold tracking-wider px-3 py-1 rounded-full bg-primary text-primary-foreground uppercase">
          {finalPageContent.offer.tag}
        </span>
        <h2 className="mt-3 text-[22px] sm:text-[24px] font-bold text-foreground text-balance">
          {finalPageContent.offer.title}
        </h2>
        <ul className="mt-3 space-y-2">
          {finalPageContent.offer.bullets.map((b) => (
            <li key={b} className="flex items-start gap-2 text-[14.5px] text-foreground text-pretty">
              <Check className="w-4 h-4 text-primary mt-1 shrink-0" /> {b}
            </li>
          ))}
        </ul>

        {/* ancoragem em UMA linha */}
        <div className="mt-5 overflow-x-auto no-scrollbar">
          <p className="text-[13px] text-muted-foreground whitespace-nowrap">
            {finalPageContent.offer.anchor}
          </p>
        </div>

        <div className="mt-3 text-center">
          <p className="text-[15px] text-foreground">{finalPageContent.offer.closing.line1}</p>
          <p className="text-[24px] font-bold text-foreground">{finalPageContent.offer.closing.line2}</p>
        </div>

        <div className="mt-5">
          <PrimaryButton withArrow onClick={onCheckout}>Assinar agora</PrimaryButton>
        </div>
        <p className="mt-3 text-center text-[12px] text-muted-foreground">
          Garantia de 14 dias · Cancele quando quiser
        </p>

        {ultra && (
          <div className="mt-5 space-y-3">
            <AlertCard
              body="Pelo seu perfil, talvez o Plano Ultra seja mais adequado para uso alto de imagens, vídeos ou audiovisual."
            />
            <PrimaryButton variant="secondary" onClick={onWhats}>
              <MessageCircle className="w-4 h-4 mr-1" />
              Falar com o time sobre o Plano Ultra
            </PrimaryButton>
          </div>
        )}
      </section>

      {/* Bloco 08 — Garantia */}
      <section className="mt-10 card-surface p-5 text-center">
        <Shield className="w-7 h-7 text-primary mx-auto" />
        <h2 className="mt-2 text-[22px] font-bold text-foreground">{finalPageContent.guarantee.title}</h2>
        <p className="mt-2 text-[14px] text-muted-foreground text-pretty">{finalPageContent.guarantee.sub}</p>
        <p className="mt-2 text-[12px] text-muted-foreground">{finalPageContent.guarantee.micro}</p>
      </section>

      {/* Bloco 09 — Quem somos */}
      <section className="mt-10">
        <h2 className="text-[22px] font-bold text-foreground">{finalPageContent.about.title}</h2>
        <p className="mt-3 text-[15px] text-muted-foreground text-pretty">
          {finalPageContent.about.text}
        </p>
      </section>

      {/* Bloco 10 — FAQs */}
      <section className="mt-10">
        <h2 className="text-[22px] font-bold text-foreground">As pessoas costumam perguntar</h2>
        <Accordion type="single" collapsible className="mt-3">
          {finalPageContent.faqs.map((f, i) => (
            <AccordionItem key={i} value={`faq-${i}`} className="border-b border-border">
              <AccordionTrigger className="text-left text-[15px] font-semibold text-foreground">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-[14px] text-muted-foreground text-pretty">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* Bloco 11 — CTA final */}
      <section className="mt-10 text-center">
        <h2 className="text-[24px] sm:text-[26px] font-bold text-foreground text-balance">
          Comece hoje com seu plano personalizado de IA.
        </h2>
        <div className="mt-5">
          <PrimaryButton withArrow onClick={onCheckout}>
            Assinar agora por R$99/mês
          </PrimaryButton>
          <p className="mt-2 text-[12px] text-muted-foreground">
            Checkout seguro · Pix, cartão ou boleto parcelado · 14 dias de garantia
          </p>
        </div>

        <div className="mt-7">
          <h3 className="text-[16px] font-bold text-foreground">
            {fName}, ainda ficou com alguma dúvida?
          </h3>
          <div className="mt-3">
            <PrimaryButton variant="secondary" onClick={onWhats}>
              <MessageCircle className="w-4 h-4 mr-1" />
              Falar com o time no WhatsApp
            </PrimaryButton>
          </div>
        </div>

        {/* fallback se a final social mensagem ajudar */}
        <p className="mt-4 text-[12px] text-muted-foreground">{finalSocialSubBy[market]}</p>
      </section>

      {/* Bloco 12 — Rodapé */}
      <footer className="mt-12 text-center">
        <Logo />
        <div className="mt-4 text-[12px] text-muted-foreground">
          <a href={links.termsUrl} className="hover:underline">Termos de Serviço</a>
          <span className="mx-2">·</span>
          <a href={links.privacyUrl} className="hover:underline">Privacidade</a>
          <span className="mx-2">·</span>
          <span>CNPJ: {company.cnpj}</span>
        </div>
        <div className="mt-3 inline-flex items-center gap-2 text-[11px] text-muted-foreground">
          <Shield className="w-3.5 h-3.5" /> Compra segura · Reclame Aqui
        </div>
      </footer>
    </div>
  );
}
