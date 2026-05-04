import { useEffect, useMemo, useRef, useState } from "react";
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

import introAiCards from "@/assets/intro-ai-cards.svg";
import { InnerAIOrbital } from "@/components/InnerAIOrbital";

const Index = () => {
  // Inicializa UTMs cedo
  useUtmParams();

  const c = useFunnelState();
  const step = c.currentStep;
  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [tarefasComplete, setTarefasComplete] = useState(false);
  const [doresComplete, setDoresComplete] = useState(false);

  // Reset estados de "completo" ao trocar de step
  useEffect(() => {
    if (step?.id !== "tarefas") setTarefasComplete(false);
    if (step?.id !== "dores") setDoresComplete(false);
  }, [step?.id]);

  const handleBack = () => {
    if (advanceTimerRef.current) {
      clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
    }
    c.goBack();
  };

  const scheduleAdvance = () => {
    if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
    advanceTimerRef.current = setTimeout(() => {
      advanceTimerRef.current = null;
      c.goNext();
    }, 180);
  };

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
      onBack={handleBack}
      scrollable={isFinal}
    >
      {/* 1. Intro */}
      {step.id === "intro" && (
        <div className="flex flex-col items-center text-center -mt-4">
          <h1 className="leading-[1.05] font-bold text-foreground text-center flex flex-col items-center pt-0 pb-[13px]">
            <span className="sm:text-[22px] font-medium text-foreground text-2xl">Acesso a</span>
            <span className="text-brand sm:text-[56px] font-extrabold tracking-tight mt-1 text-7xl text-secondary-foreground">+50 IAs</span>
            <span className="sm:text-[16px] font-medium text-muted-foreground text-lg mb-0 mt-[4px]">por apenas R$99/mês</span>
          </h1>
          <div className="mt-6 w-full max-w-[640px] mx-auto">
            <InnerAIOrbital />
          </div>
          <p className="mt-4 text-[15px] sm:text-[16px] text-muted-foreground text-pretty max-w-[360px] my-[3px] py-0 mb-0 pt-[13px]">
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
          question="Você já utiliza alguma ferramenta de IA hoje?"
          options={aiUsageOptions as { value: string; label: string }[]}
          selectedValue={c.state.usoIA}
          onSelect={(v, l) => {
            c.setUsoIA(v as never, l);
            scheduleAdvance();
          }}
        />
      )}

      {/* 3. Insert +50 IAs */}
      {step.id === "insert_50ias" && (
        <InsertStep
          headline="Use GPT-5, Claude, Gemini e +50 IAs Premium em uma só plataforma."
          image={<img src={introAiCards} alt="+50 IAs conectadas à Inner" loading="lazy" decoding="async" className="max-h-full w-auto object-contain" />}
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
            scheduleAdvance();
          }}
        />
      )}

      {/* 5. Insert por mercado */}
      {step.id === "insert_help" && (
        <InsertStep
          title="Você está no lugar certo"
          image={
            <img 
              src={`/markets/${market}.png`} 
              alt={c.state.mercadoLabel ?? "Seu mercado"}
              className="w-full h-full object-cover rounded-xl shadow-sm"
              loading="lazy"
              decoding="async"
            />
          }
          imageHeightClass="h-32"
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
            onAllAnswered={setTarefasComplete}
          />
          {tarefasComplete && (
            <div className="mt-4 animate-fade-in">
              <PrimaryButton onClick={() => { c.finalizeTasksAndPains(); c.goNext(); }}>
                CONTINUAR
              </PrimaryButton>
            </div>
          )}
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
            onAllAnswered={setDoresComplete}
          />
          {doresComplete && (
            <div className="mt-4 animate-fade-in">
              <PrimaryButton onClick={() => { c.finalizeTasksAndPains(); c.goNext(); }}>
                CONTINUAR
              </PrimaryButton>
            </div>
          )}
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
