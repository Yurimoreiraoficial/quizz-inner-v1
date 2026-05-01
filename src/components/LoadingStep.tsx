import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, CheckCircle2 } from "lucide-react";

interface LoadingStepProps {
  steps?: string[];
  duration?: number; // ms total
  onComplete: () => void;
}

export function LoadingStep({
  steps = [
    "Analisando seu perfil de uso",
    "Identificando sua principal oportunidade",
    "Calculando sua economia estimada",
    "Montando sua recomendação final",
  ],
  duration = 3800,
  onComplete,
}: LoadingStepProps) {
  const [stepIdx, setStepIdx] = useState(0);

  useEffect(() => {
    const interval = duration / steps.length;
    const t = setInterval(() => {
      setStepIdx((i) => Math.min(i + 1, steps.length));
    }, interval);
    const done = setTimeout(() => onComplete(), duration + 250);
    return () => { clearInterval(t); clearTimeout(done); };
  }, [duration, steps.length, onComplete]);

  return (
    <div className="flex flex-col items-center text-center pt-2">
      <h1 className="text-[24px] sm:text-[26px] font-bold text-foreground text-balance">
        Estamos analisando suas respostas
      </h1>
      <p className="mt-3 text-[15px] text-muted-foreground text-pretty max-w-[360px]">
        Vamos cruzar seu perfil, mercado, tarefas e principais dores para montar uma recomendação personalizada.
      </p>

      <div className="mt-7 w-full card-surface p-5 text-left">
        <ul className="space-y-3">
          {steps.map((s, i) => {
            const done = i < stepIdx;
            const active = i === stepIdx;
            return (
              <li key={s} className="flex items-center gap-3 text-[14px]">
                {done ? (
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                ) : active ? (
                  <Loader2 className="w-5 h-5 text-primary animate-spin" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-border" />
                )}
                <span className={done || active ? "text-foreground font-medium" : "text-muted-foreground"}>
                  {s}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      <motion.p
        className="mt-5 text-[13px] text-muted-foreground"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.6, repeat: Infinity }}
      >
        Isso leva poucos segundos. Sua análise está quase pronta.
      </motion.p>
    </div>
  );
}
