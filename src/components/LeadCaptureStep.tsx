import { useState } from "react";
import { PrimaryButton } from "./PrimaryButton";
import { isValidName, isValidPhone, maskPhoneBR, normalizePhone } from "@/utils/formatters";
import { Lock } from "lucide-react";

interface LeadCaptureStepProps {
  headline?: string;
  subtitle?: string;
  buttonText?: string;
  onSubmit: (nome: string, whatsapp: string) => void;
  blurredCards: { value: string; label: string }[];
}

export function LeadCaptureStep({ 
  headline = "Sua análise está pronta", 
  subtitle = "Preencha seus dados para liberar sua recomendação.",
  buttonText = "LIBERAR MINHA ANÁLISE",
  onSubmit, 
  blurredCards 
}: LeadCaptureStepProps) {
  const [nome, setNome] = useState("");
  const [phone, setPhone] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const nameOk = isValidName(nome);
  const phoneOk = isValidPhone(phone);
  const formOk = nameOk && phoneOk;

  return (
    <div className="flex flex-col">
      <div className="text-center">
        <h1 className="text-[26px] sm:text-[28px] leading-[1.15] font-bold text-foreground text-balance">
          {headline}
        </h1>
      </div>

      {/* Cards com blur */}
      <div className="mt-5 grid grid-cols-2 gap-3">
        {blurredCards.map((c, i) => (
          <div key={i} className="card-surface h-[68px] overflow-hidden px-3 py-2.5 text-left flex flex-col justify-center">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground leading-none truncate">{c.label}</div>
            <div className="mt-1 text-[14px] leading-tight font-bold text-foreground select-none truncate" style={{ filter: "blur(6px)" }}>
              {c.value}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 text-center">
        <div className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-primary uppercase tracking-wider">
          <span>FALTA POUCO</span>
        </div>
        <p className="mt-1 text-[14px] text-muted-foreground text-pretty">
          {subtitle}
        </p>
      </div>

      <form
        className="mt-4 flex flex-col gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitted(true);
          if (formOk) onSubmit(nome.trim(), normalizePhone(phone));
        }}
      >
        <div>
          <input
            type="text"
            inputMode="text"
            autoComplete="name"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Seu nome"
            className="w-full h-12 px-4 rounded-2xl bg-card text-foreground placeholder:text-muted-foreground border border-border focus:border-primary outline-none transition-colors text-[16px]"
          />
          {submitted && !nameOk && (
            <p className="mt-1 text-[12px] text-destructive">Informe seu nome.</p>
          )}
        </div>
        <div>
          <input
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(maskPhoneBR(e.target.value))}
            placeholder="WhatsApp (com DDD)"
            className="w-full h-12 px-4 rounded-2xl bg-card text-foreground placeholder:text-muted-foreground border border-border focus:border-primary outline-none transition-colors text-[16px]"
          />
          {submitted && !phoneOk && (
            <p className="mt-1 text-[12px] text-destructive">Informe um WhatsApp válido.</p>
          )}
        </div>

        <div className="mt-2">
          <PrimaryButton type="submit" withArrow disabled={submitted && !formOk}>
            {buttonText}
          </PrimaryButton>
        </div>

        <p className="text-[10px] text-muted-foreground flex items-center justify-center gap-1 text-center whitespace-nowrap">
          <Lock className="w-3 h-3" />
          <span>Usaremos seu WhatsApp apenas para te ajudar em caso de dúvida.</span>
        </p>
      </form>
    </div>
  );
}
