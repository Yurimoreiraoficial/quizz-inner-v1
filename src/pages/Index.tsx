import { useEffect, useMemo } from "react";
import { useFunnelState } from "@/hooks/useFunnelState";
import { useUtmParams } from "@/hooks/useUtmParams";
import { funnelSteps } from "@/data/funnelSteps";
import { aiUsageOptions, marketOptions, innerHelpsByMarket, socialProofSubBy } from "@/data/marketOptions";
import { taskOptionsByMarket, painOptions } from "@/data/taskOptionsByMarket";
import { testimonialsByMarket } from "@/data/testimonialsByMarket";
import { trackEvent } from "@/services/funnelTrackingService";

import { FunnelLayout } from "@/components/FunnelLayout";
import { PrimaryButton } from "@/components/PrimaryButton";
import { SingleChoiceStep } from "@/components/SingleChoiceStep";
import { InsertStep } from "@/components/InsertStep";
import { SliderGroupStep } from "@/components/SliderGroupStep";
import { LeadCaptureStep } from "@/components/LeadCaptureStep";
import { LoadingStep } from "@/components/LoadingStep";
import { TestimonialSwipe } from "@/components/TestimonialSwipe";
import { PartnerLogos } from "@/components/PartnerLogos";
import { FinalResultPage } from "@/components/FinalResultPage";

import aiHero from "@/assets/ai-network-hero.png";
import introAiCards from "@/assets/intro-ai-cards.png";

const Index = () => {
  // Inicializa UTMs cedo
  useUtmParams();

  const c = useFunnelState();
  const step = c.currentStep;

  // result_viewed quando entra na tela final
  useEffect(() => {
    if (step?.id === "final") {
      trackEvent(c.state.sessionId, "result_viewed", { stepId: "final" });
    }
  }, [step?.id, c.state.sessionId]);

  const market = c.state.mercado ?? "outro";

  // Cards com blur na tela de captura
  const blurredCards = useMemo(() => ([
    { label: "Economia estimada", value: "R$ 480/mês" },
    { label: "Seu nível de encaixe", value: "Alto" },
    { label: "IAs recomendadas", value: "GPT-5 · Claude · Gemini" },
    { label: "Plano indicado", value: "Plano PRO" },
  ]), []);

  if (!step) return null;

  const isFinal = step.id === "final";

  return (
    <FunnelLayout
      stepKey={step.id}
      showBack={!!step.showBack}
      showProgress={!!step.showProgress}
      progress={c.progress}
      onBack={c.goBack}
      scrollable={isFinal}
    >
      {/* 1. Intro */}
      {step.id === "intro" && (
        <div className="flex flex-col items-center text-center pt-2">
          <h1 className="leading-[1.05] font-bold text-foreground text-balance">
            <span className="block sm:text-[28px] text-4xl">Acesso a</span>
            <span className="block text-brand sm:text-[56px] leading-none my-1 text-8xl">+50 IAs</span>
            <span className="block sm:text-[18px] font-medium text-muted-foreground text-base">por apenas R$99/mês</span>
          </h1>
          <img
            src={introAiCards}
            alt="Cards das principais IAs: Gemini, Nano Banana, ChatGPT e Claude"
            className="mt-6 w-full max-w-[360px] h-auto select-none pointer-events-none"
            draggable={false}
          />
          <p className="mt-4 text-[15px] sm:text-[16px] text-muted-foreground text-pretty max-w-[360px]">
            Descubra em menos de 1 minuto se a <br /> Inner é a melhor escolha para você.
          </p>
          <div className="mt-8 w-full">
            <PrimaryButton withArrow onClick={() => { c.ensureSession(); c.goNext(); }}>
              COMEÇAR
            </PrimaryButton>
          </div>
        </div>
      )}

      {/* 2. Uso de IA */}
      {step.id === "uso_ia" && (
        <SingleChoiceStep
          question="Qual seu uso de IA hoje?"
          options={aiUsageOptions as { value: string; label: string }[]}
          selectedValue={c.state.usoIA}
          onSelect={(v, l) => {
            c.setUsoIA(v as never, l);
            setTimeout(() => c.goNext(), 180);
          }}
        />
      )}

      {/* 3. Insert +50 IAs */}
      {step.id === "insert_50ias" && (
        <InsertStep
          headline="Use GPT-5, Claude, Gemini e +50 IAs Premium em uma só plataforma."
          image={<img src={aiHero} alt="+50 IAs conectadas à Inner" className="max-h-full w-auto object-contain" />}
          imageHeightClass="h-36"
          subtitle="Tudo em um só lugar, sem precisar alternar entre várias assinaturas."
          onContinue={c.goNext}
        />
      )}

      {/* 4. Mercado */}
      {step.id === "mercado" && (
        <SingleChoiceStep
          question="Em que mercado você atua hoje?"
          options={marketOptions as { value: string; label: string }[]}
          selectedValue={c.state.mercado}
          onSelect={(v, l) => {
            c.setMercado(v as never, l);
            setTimeout(() => c.goNext(), 180);
          }}
        />
      )}

      {/* 5. Insert por mercado */}
      {step.id === "insert_help" && (
        <InsertStep
          title="Você está no lugar certo"
          image={
            <div className="w-full h-full rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-border flex items-center justify-center">
              <span className="text-primary font-semibold text-sm uppercase tracking-wider">
                {c.state.mercadoLabel ?? "Seu mercado"}
              </span>
            </div>
          }
          imageHeightClass="h-28"
          bullets={{ title: "A Inner pode te ajudar com:", items: innerHelpsByMarket[market] }}
          onContinue={c.goNext}
        />
      )}

      {/* 6. Tarefas (sliders) */}
      {step.id === "tarefas" && (
        <>
          <SliderGroupStep
            question="Marque o quanto você usa IA hoje para essas tarefas:"
            scale={["Nunca", "Às vezes", "Muito"]}
            items={taskOptionsByMarket[market]}
            values={c.state.tarefas}
            onChange={(id, l, v) => c.setTarefa(id, l, v as never)}
          />
          <div className="mt-4">
            <PrimaryButton onClick={() => { c.finalizeTasksAndPains(); c.goNext(); }}>
              CONTINUAR
            </PrimaryButton>
          </div>
        </>
      )}

      {/* 7. Prova social */}
      {step.id === "insert_proof" && (
        <div className="flex flex-col">
          <h1 className="text-[26px] sm:text-[28px] leading-[1.15] font-bold text-foreground text-balance">
            Mais de 500 mil usuários
          </h1>
          <p className="mt-3 text-[15px] text-muted-foreground text-pretty">
            {socialProofSubBy[market]}
          </p>
          <div className="mt-5">
            <TestimonialSwipe items={testimonialsByMarket[market]} />
          </div>
          <div className="mt-5">
            <PartnerLogos />
          </div>
          <div className="mt-7">
            <PrimaryButton onClick={c.goNext}>CONTINUAR</PrimaryButton>
          </div>
        </div>
      )}

      {/* 8. Dores */}
      {step.id === "dores" && (
        <>
          <SliderGroupStep
            question="Marque com que frequência isso acontece na sua rotina."
            scale={["Nunca", "Às vezes", "Muito"]}
            items={painOptions}
            values={c.state.dores}
            onChange={(id, l, v) => c.setDor(id, l, v as never)}
          />
          <div className="mt-4">
            <PrimaryButton onClick={() => { c.finalizeTasksAndPains(); c.goNext(); }}>
              CONTINUAR
            </PrimaryButton>
          </div>
        </>
      )}

      {/* 9. Loading */}
      {step.id === "loading" && (
        <LoadingStep onComplete={c.goNext} />
      )}

      {/* 10. Lead capture */}
      {step.id === "lead" && (
        <LeadCaptureStep
          blurredCards={blurredCards}
          onSubmit={(nome, whatsapp) => {
            c.submitLead(nome, whatsapp);
            c.goNext();
          }}
        />
      )}

      {/* Final */}
      {step.id === "final" && <FinalResultPage state={c.state} />}
    </FunnelLayout>
  );
};

export default Index;
