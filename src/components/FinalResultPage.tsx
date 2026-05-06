import { useMemo } from "react";
import { ArrowRight, Check, MessageCircle, Shield, Star, Sparkles, X } from "lucide-react";
import { motion } from "framer-motion";
import { WhatsAppIcon } from "./icons/WhatsAppIcon";
import type { FunnelState } from "@/types/funnel";
import { firstName } from "@/utils/formatters";
import { getNaturalBenefits } from "@/utils/getNaturalBenefits";
import { buildCheckoutUrl } from "@/utils/buildCheckoutUrl";
import { buildWhatsappUrl } from "@/utils/buildWhatsappUrl";
import { finalPageContent, partnerLogos } from "@/data/finalPageContent";
import { socialProofSubBy } from "@/data/marketOptions";
import { testimonialsByMarket } from "@/data/testimonialsByMarket";
import { TestimonialSwipe } from "./TestimonialSwipe";
import { PrimaryButton } from "./PrimaryButton";
import { AlertCard } from "./AlertCard";
import { trackEvent } from "@/services/funnelTrackingService";
import { Logo } from "./Logo";
import { Reveal } from "./Reveal";
import { company, links } from "@/data/designTokens";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import fusionImg from "@/assets/fusion.svg";
import innerTeamImg from "@/assets/inner-team.webp";
import promptsImg from "@/assets/prompts.webp";
import appImg from "@/assets/app.webp";
import assistentesImg from "@/assets/assistentes.webp";
import transcricaoImg from "@/assets/transcricao.webp";
import integracoesImg from "@/assets/integracoes.webp";
import partnerLogosImg from "@/assets/partner-logos.svg";

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
      <Reveal as="section" className="text-left">
        <h1 className="sm:text-[30px] leading-[1.1] text-foreground text-balance text-left font-normal text-2xl">
          {fName}, sua análise está pronta.
        </h1>

        <div className="mt-5 card-strong p-6 text-left relative overflow-hidden bg-gradient-to-br from-primary/10 via-card to-card border border-primary/20">
          <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
          <div className="relative">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
              <Sparkles className="w-3.5 h-3.5" />
              Resultado
            </div>

            <p className="mt-3 text-[15px] sm:text-[16px] text-muted-foreground">
              Seu nível de encaixe com a Inner é
            </p>

            <div className="mt-2 flex items-baseline gap-3">
              <span className="text-brand text-6xl sm:text-7xl font-bold leading-none tracking-tight drop-shadow-[0_0_24px_hsl(var(--primary)/0.35)]">
                {fitLabel}
              </span>
            </div>

          </div>
        </div>

        <div className="mt-4 card-strong p-5 text-left">
          <p className="text-[14px] text-muted-foreground text-pretty">
            Com base no seu perfil, identificamos que a Inner pode te ajudar principalmente em:
          </p>
          <ul className="mt-3 space-y-2.5">
            {benefits.map((b, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: i * 0.08 }}
                className="flex items-start gap-2.5 text-[14.5px] text-foreground text-pretty"
              >
                <Check className="w-4 h-4 text-primary mt-1 shrink-0" />
                <span>{b}</span>
              </motion.li>
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
              <PrimaryButton
                variant="secondary"
                onClick={onWhats}
                className="text-[13px] sm:text-[15px] whitespace-nowrap text-[hsl(var(--whatsapp))] border-[hsl(var(--whatsapp))]/30 hover:bg-[hsl(var(--whatsapp))]/8 hover:border-[hsl(var(--whatsapp))]/50"
              >
                <WhatsAppIcon className="w-4 h-4 mr-1" />
                {finalPageContent.ultraAlert.cta}
              </PrimaryButton>
            </div>
          )}
        </div>
      </Reveal>

      {/* Bloco 02 — Tecnologia Fusion */}
      <Reveal as="section" className="mt-10">
        <div className="inline-flex items-center gap-1.5 text-primary text-[12px] font-semibold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" /> Tecnologia Fusion
        </div>
        <h2 className="mt-2 text-[24px] sm:text-[26px] font-bold text-foreground text-balance">
          {finalPageContent.fusion.title}
        </h2>
        <p className="mt-3 text-[15px] text-foreground text-pretty">
          {finalPageContent.fusion.description}
        </p>
        <img
          src={fusionImg}
          alt="Tecnologia Fusion"
          className="mt-4 w-full max-w-sm mx-auto h-auto"
        />
        <p className="mt-2 text-[14px] text-muted-foreground text-pretty">
          {finalPageContent.fusion.sub}
        </p>
      </Reveal>

      {/* Bloco 03 — Cards de impacto */}
      <Reveal as="section" className="mt-12">
        <h2 className="text-[20px] sm:text-[22px] font-bold text-foreground text-balance">
          Por que confiar na Inner
        </h2>
        <div className="mt-5 grid grid-cols-2 divide-x divide-y divide-border/60 border-y border-border/60">
          {finalPageContent.impact.map((t) => {
            const match = t.match(/^([+\d.,]+\s*\S*?)\s+(.*)$/);
            const num = match?.[1] ?? t;
            const label = match?.[2] ?? "";
            return (
              <div key={t} className="px-4 py-6">
                <div className="font-display text-3xl sm:text-[34px] font-semibold tracking-tight text-foreground leading-none">
                  {num}
                </div>
                {label && (
                  <div className="mt-2 text-[12px] leading-snug text-muted-foreground">
                    {label}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Reveal>

      {/* Bloco 04 — Antes e depois */}
      <Reveal as="section" className="mt-10">
        <h2 className="text-[24px] sm:text-[26px] font-bold text-foreground text-balance mb-5">
          Tenha mais pagando menos
        </h2>
        <div className="grid grid-cols-1 gap-3">
          {/* SEM a Inner — negativo */}
          <div className="rounded-3xl border border-destructive/25 bg-destructive/[0.06] p-5 relative overflow-hidden">
            
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-destructive/15 text-destructive">
                <X className="w-3.5 h-3.5" strokeWidth={3} />
              </span>
              <div className="text-[12px] uppercase tracking-wider text-destructive font-semibold">
                {finalPageContent.beforeAfter.withoutLabel}
              </div>
            </div>
            <ul className="mt-3 space-y-2 text-[14px] text-foreground/70">
              {finalPageContent.beforeAfter.withoutItems.map((i) => (
                <li key={i} className="flex items-start gap-2 line-through decoration-destructive/40 decoration-1">
                  <X className="w-4 h-4 text-destructive/70 mt-0.5 shrink-0" strokeWidth={2.5} />
                  <span>{i}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* COM a Inner — positivo */}
          <div className="rounded-3xl p-5 relative overflow-hidden bg-gradient-to-br from-primary/15 via-card to-card border border-primary/30">
            
            <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full bg-primary/15 blur-3xl pointer-events-none" />
            <div className="relative flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground">
                <Check className="w-3.5 h-3.5" strokeWidth={3} />
              </span>
              <div className="text-[12px] uppercase tracking-wider text-primary font-semibold">
                {finalPageContent.beforeAfter.withLabel}
              </div>
            </div>
            <ul className="relative mt-3 space-y-2 text-[14px] text-foreground font-medium">
              {finalPageContent.beforeAfter.withItems.map((i) => (
                <li key={i} className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" strokeWidth={3} /> {i}
                </li>
              ))}
            </ul>
          </div>
        </div>




        <div className="mt-5">
          <PrimaryButton withArrow onClick={onCheckout}>Assinar agora</PrimaryButton>
        </div>
      </Reveal>

      {/* Bloco 05 — Recursos */}
      <Reveal as="section" className="mt-10">
        <h2 className="text-[24px] sm:text-[26px] font-bold text-foreground text-balance">
          {finalPageContent.features.title}
        </h2>
        <p className="mt-2 text-[15px] text-muted-foreground text-pretty">
          {finalPageContent.features.sub}
        </p>

        <div className="mt-6 space-y-4">
          {finalPageContent.features.big.map((b, idx) => (
            <article key={b.eyebrow} className="card-surface p-5">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
                {b.eyebrow}
              </p>
              <h3 className="mt-2 text-[18px] sm:text-[19px] font-bold text-foreground text-balance leading-snug">
                {b.title}
              </h3>
              <p className="mt-2 text-[14px] text-muted-foreground text-pretty leading-relaxed">
                {b.description}
              </p>
              {(() => {
                const imgs = [promptsImg, appImg, assistentesImg, transcricaoImg, integracoesImg];
                const alts = [
                  "Biblioteca de prompts da Inner",
                  "App Inner AI",
                  "Assistentes personalizados",
                  "Transcrição de áudio e vídeo",
                  "Integrações inteligentes com Gmail e Google Calendar",
                ];
                const src = imgs[idx];
                return src ? (
                  <div className="mt-4 rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-primary/10 border border-primary/15 overflow-hidden">
                    <img
                      src={src}
                      alt={alts[idx]}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-auto block"
                    />
                  </div>
                ) : (
                  <div className="mt-4 rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-primary/10 border border-primary/15 px-4 py-8 text-center text-[14px] text-muted-foreground">
                    {b.visual}
                  </div>
                );
              })()}
            </article>
          ))}
        </div>

        <div className="mt-4">
          <PrimaryButton withArrow onClick={onCheckout}>Quero acesso a tudo isso</PrimaryButton>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          {finalPageContent.features.short.map((s) => (
            <div key={s.eyebrow} className="card-surface p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
                {s.eyebrow}
              </p>
              <p className="mt-1.5 text-[13.5px] text-foreground leading-snug">
                {s.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-5 hidden">
          <PrimaryButton withArrow onClick={onCheckout}>Quero acesso a tudo isso</PrimaryButton>
        </div>
      </Reveal>

      {/* Bloco 06 — Prova social */}
      <Reveal as="section" className="mt-10">
        <h2 className="text-[22px] sm:text-[24px] text-foreground text-balance text-center font-semibold">
          {fName}, Inner é a ferramenta ideal para você!
        </h2>
        <p className="mt-2 text-[14px] text-muted-foreground text-pretty text-center">
          {socialProofSubBy[market]}
        </p>
        <h3 className="mt-5 text-[16px] font-bold text-foreground text-center">Veja o que eles dizem sobre nós:</h3>
        <div className="mt-3">
          <TestimonialSwipe items={testimonialsByMarket[market]} />
        </div>
        <div className="mt-5">
          <div className="flex items-center justify-center gap-1 text-warning mb-2">
            {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
            <span className="text-[12px] text-muted-foreground ml-1">4.9 / 5</span>
          </div>
          <div className="w-full overflow-hidden">
            <img
              src={partnerLogosImg}
              alt="Logos de empresas parceiras e clientes"
              loading="lazy"
              decoding="async"
              className="w-full h-auto max-h-10 sm:max-h-12 object-contain opacity-80 select-none pointer-events-none"
              draggable={false}
            />
          </div>
        </div>
      </Reveal>

      {/* Bloco 07 — Oferta */}
      <Reveal as="section" className="mt-10 relative rounded-3xl p-[1.5px] bg-gradient-to-br from-primary/60 via-primary/20 to-primary/60 shadow-[0_20px_60px_-20px_hsl(var(--primary)/0.45)]">
        <div className="relative rounded-[calc(1.5rem-1.5px)] bg-gradient-to-br from-card via-card to-primary/5 p-6 overflow-hidden">
          {/* glow decorativo */}
          <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-primary/15 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-56 h-56 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

          <div className="relative">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-wider px-3 py-1 rounded-full bg-primary text-primary-foreground uppercase shadow-[0_6px_20px_-6px_hsl(var(--primary)/0.7)]">
                <Sparkles className="w-3 h-3" />
                {finalPageContent.offer.tag}
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-primary/90">
                MELHOR ESCOLHA
              </span>
            </div>

            <h2 className="mt-4 text-[22px] sm:text-[24px] font-bold text-foreground text-balance leading-tight">
              {finalPageContent.offer.title}
            </h2>

            <ul className="mt-4 space-y-2.5">
              {finalPageContent.offer.bullets.map((b) => (
                <li key={b} className="flex items-start gap-2.5 text-[14.5px] text-foreground text-pretty">
                  <span className="mt-0.5 inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary/15 text-primary shrink-0">
                    <Check className="w-3 h-3" strokeWidth={3.5} />
                  </span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>

            {/* divisor sutil */}
            <div className="mt-6 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

            {/* Card de preço destacado */}
            <div className="mt-6 rounded-2xl bg-primary/5 border border-primary/20 p-5 text-center">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                {finalPageContent.offer.closing.line1}
              </p>

              <div className="mt-3 flex items-baseline justify-center gap-3">
                <span className="text-[18px] font-medium text-muted-foreground line-through decoration-destructive/60">
                  R$249
                </span>
                <div className="flex items-baseline gap-1 text-brand drop-shadow-[0_0_24px_hsl(var(--primary)/0.35)]">
                  <span className="text-[18px] font-semibold">R$</span>
                  <span className="text-[64px] sm:text-[72px] font-extrabold tracking-tight leading-[0.9]">99</span>
                </div>
                <span className="text-[14px] font-medium text-muted-foreground">/mês</span>
              </div>

              <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/15 text-primary text-[11px] font-bold uppercase tracking-wider">
                <Sparkles className="w-3 h-3" />
                Economize 60%
              </div>

              <p className="mt-3 text-[11px] text-destructive">
                {finalPageContent.offer.anchor}
              </p>
            </div>

            <div className="mt-6">
              <PrimaryButton withArrow onClick={onCheckout}>Assinar agora</PrimaryButton>
            </div>

            <div className="mt-3 flex items-center justify-center gap-1.5 text-[12px] text-muted-foreground">
              <Shield className="w-3.5 h-3.5 text-primary" />
              <span>Garantia de 14 dias · Cancele quando quiser</span>
            </div>

            {ultra && (
              <div className="mt-5 space-y-3">
                <AlertCard
                  body="Pelo seu perfil, talvez o Plano Ultra seja mais adequado para uso alto de imagens, vídeos ou audiovisual."
                  align="center"
                />
                <PrimaryButton
                  variant="secondary"
                  onClick={onWhats}
                  className="text-[13px] sm:text-[15px] whitespace-nowrap text-[hsl(var(--whatsapp))] border-[hsl(var(--whatsapp))]/30 hover:bg-[hsl(var(--whatsapp))]/8 hover:border-[hsl(var(--whatsapp))]/50"
                >
                  <WhatsAppIcon className="w-4 h-4 mr-1" />
                  Falar com o time sobre o Plano Ultra
                </PrimaryButton>
              </div>
            )}
          </div>
        </div>
      </Reveal>

      {/* Bloco 08 — Garantia */}
      <Reveal as="section" className="mt-10 card-surface p-5 text-center">
        <Shield className="w-7 h-7 text-primary mx-auto" />
        <h2 className="mt-2 text-[22px] font-bold text-foreground">{finalPageContent.guarantee.title}</h2>
        <p className="mt-2 text-muted-foreground text-pretty whitespace-pre-line text-base">{finalPageContent.guarantee.sub}</p>
      </Reveal>

      {/* Bloco 09 — Quem somos */}
      <Reveal as="section" className="mt-10">
        <h2 className="text-[22px] font-bold text-foreground">{finalPageContent.about.title}</h2>
        <img
          src={innerTeamImg}
          alt="Equipe Inner AI reunida no escritório"
          loading="lazy"
          decoding="async"
          className="mt-4 w-full h-auto rounded-2xl border border-border object-cover aspect-[3/2] mx-px mr-0 mb-0 py-0 px-0"
        />
        <p className="mt-4 text-[15px] text-muted-foreground text-pretty">
          {finalPageContent.about.text}
        </p>
      </Reveal>

      {/* Bloco 10 — FAQs */}
      <Reveal as="section" className="mt-10">
        <h2 className="text-[22px] font-bold text-foreground">Perguntas frequentes:</h2>
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
      </Reveal>

      {/* Bloco 11 — CTA final */}
      <Reveal as="section" className="mt-10 text-center">
        <h2 className="text-[24px] sm:text-[26px] font-bold text-foreground text-balance">
          Comece hoje com seu plano personalizado de IA.
        </h2>
        <div className="mt-5">
          <PrimaryButton withArrow onClick={onCheckout}>
            Assinar agora por R$99/mês
          </PrimaryButton>
          <p className="mt-2 text-[12px] text-muted-foreground">
            Checkout seguro · 14 dias de garantia
          </p>
        </div>

        <div className="mt-7">
          <h3 className="text-[16px] font-bold text-foreground">
            {fName}, ainda ficou com alguma dúvida?
          </h3>
          <div className="mt-3">
            <PrimaryButton
              variant="secondary"
              onClick={onWhats}
              className="text-sm mt-[8px] py-[5px] whitespace-nowrap text-[hsl(var(--whatsapp))] border-[hsl(var(--whatsapp))]/30 hover:bg-[hsl(var(--whatsapp))]/8 hover:border-[hsl(var(--whatsapp))]/50"
            >
              <WhatsAppIcon className="w-4 h-4" />
              <span>Fale com o time no WhatsApp</span>
            </PrimaryButton>
          </div>
        </div>

      </Reveal>

      {/* Bloco 12 — Rodapé */}
      <Reveal as="footer" className="mt-12 text-center">
        <Logo />
        <div className="mt-4 text-[12px] text-muted-foreground flex flex-col gap-1">
          <div>
            <a href={links.termsUrl} className="hover:underline">Termos de Serviço</a>
            <span className="mx-2">·</span>
            <a href={links.privacyUrl} className="hover:underline">Privacidade</a>
          </div>
          <div>CNPJ: {company.cnpj}</div>
        </div>
        <div className="mt-3 inline-flex items-center gap-2 text-[11px] text-muted-foreground">
          <Shield className="w-3.5 h-3.5" /> Compra segura · Reclame Aqui
        </div>
      </Reveal>
    </div>
  );
}
