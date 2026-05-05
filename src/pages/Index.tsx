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
import { Zap, Target, BrainCircuit } from "lucide-react";

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
        <div className="flex flex-col items-center text-center -mt-2">
          <h1
            className="font-sans not-italic font-bold tracking-tight text-foreground text-[32px] sm:text-[40px] leading-[1.1]"
            style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
          >
            Descubra em menos<br />
            de{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "linear-gradient(90deg, hsl(270 90% 70%) 0%, hsl(213 92% 65%) 100%)" }}
            >
              1 minuto
            </span>{" "}
            se a Inner<br />
            é a melhor escolha<br />
            para você.
          </h1>

          <div className="mt-5 w-full max-w-[640px] mx-auto">
            <InnerAIOrbital />
          </div>

          <div
            className="mt-5 inline-flex items-center gap-2 rounded-full px-4 py-2 text-[13px] sm:text-[14px] backdrop-blur-sm"
            style={{
              background: "hsla(0, 0%, 100%, 0.03)",
              border: "1px solid hsla(270, 90%, 70%, 0.35)",
              boxShadow: "0 0 24px hsla(270, 90%, 60%, 0.12), inset 0 0 0 1px hsla(213, 92%, 60%, 0.08)",
            }}
          >
            <Zap className="w-3.5 h-3.5" style={{ color: "hsl(270 90% 75%)" }} aria-hidden />
            <span className="text-muted-foreground">
              <span className="font-semibold" style={{ color: "hsl(270 90% 78%)" }}>+50</span>
              <span className="text-foreground/90"> IAs.</span>
              <span className="text-muted-foreground"> Uma única plataforma.</span>
            </span>
            <Zap className="w-3.5 h-3.5" style={{ color: "hsl(213 92% 70%)" }} aria-hidden />
          </div>

          <div className="mt-5 w-full">
            <PrimaryButton withArrow onClick={() => { c.ensureSession(); c.goNext(); }}>
              COMEÇAR AGORA
            </PrimaryButton>
          </div>

          <div className="mt-4 flex items-center justify-center gap-3 text-[12px] text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" style={{ color: "hsl(270 90% 75%)" }} aria-hidden />
              Rápido
            </span>
            <span className="h-3 w-px bg-border" aria-hidden />
            <span className="inline-flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5" style={{ color: "hsl(195 90% 70%)" }} aria-hidden />
              Personalizado
            </span>
            <span className="h-3 w-px bg-border" aria-hidden />
            <span className="inline-flex items-center gap-1.5">
              <BrainCircuit className="w-3.5 h-3.5" style={{ color: "hsl(213 92% 70%)" }} aria-hidden />
              Inteligente
            </span>
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
              src={`/markets/${market}.webp`} 
              alt={c.state.mercadoLabel ?? "Seu mercado"}
              width={720}
              height={265}
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
