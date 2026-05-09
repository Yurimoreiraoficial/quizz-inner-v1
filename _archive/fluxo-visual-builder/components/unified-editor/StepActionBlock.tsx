import { useState } from "react";
import type { FunnelScreen } from "@/data/funnelConfig";
import { saveScreen } from "@/services/funnelService";
import { toast } from "sonner";

export function StepActionBlock({ screen }: { screen: FunnelScreen }) {
  const [loading, setLoading] = useState(false);
  
  // Load initial values from content.metaEventConfig or fallback to existing pixels structure if possible
  const config = (screen.content as any).metaEventConfig || {
    trigger: 
      screen.type === "lead_capture" ? "submit" :
      screen.type === "single_choice" ? "answer" :
      (screen.type === "slider_group_market" || screen.type === "slider_group_pain") ? "click" :
      "view",
    metaEvent: "Sem evento",
    customEventName: ""
  };

  const [trigger, setTrigger] = useState(config.trigger);
  const [metaEvent, setMetaEvent] = useState(config.metaEvent);
  const [customEventName, setCustomEventName] = useState(config.customEventName || "");

  const handleSave = async () => {
    setLoading(true);
    try {
      const updatedScreen = {
        ...screen,
        content: {
          ...screen.content,
          metaEventConfig: {
            trigger,
            metaEvent,
            customEventName: metaEvent === "Evento customizado" ? customEventName : ""
          }
        }
      };
      const { ok } = await saveScreen(updatedScreen);
      if (ok) {
        toast.success("Configuração de Pixel salva!");
      } else {
        toast.error("Erro ao salvar configuração.");
      }
    } catch (err) {
      toast.error("Erro na operação.");
    } finally {
      setLoading(false);
    }
  };

  const triggerOptions = [
    { value: "view", label: "Visualizou a página" },
    { value: "click", label: "Clicou no botão" },
    { value: "answer", label: "Respondeu a pergunta" },
    { value: "submit", label: "Enviou formulário" },
    { value: "whatsapp", label: "Clicou no WhatsApp" },
    { value: "checkout", label: "Clicou no checkout" },
    { value: "purchase", label: "Compra confirmada" },
  ];

  const metaEvents = [
    "Sem evento",
    "PageView",
    "ViewContent",
    "Lead",
    "CompleteRegistration",
    "InitiateCheckout",
    "Contact",
    "Subscribe",
    "Purchase",
    "Evento customizado",
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-bold text-[var(--admin-text)] mb-1">Ação & Pixel</h3>
        <p className="text-xs text-[var(--admin-muted)]">
          Configure quando o evento da Meta será disparado nesta etapa.
        </p>
      </div>

      <div className="space-y-4">
        {/* Gatilho */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-[var(--admin-muted)] uppercase tracking-wider">
            Gatilho
          </label>
          <select 
            className="admin-input w-full"
            value={trigger}
            onChange={(e) => setTrigger(e.target.value)}
          >
            {triggerOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Evento Meta */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-[var(--admin-muted)] uppercase tracking-wider">
            Evento Meta
          </label>
          <select 
            className="admin-input w-full"
            value={metaEvent}
            onChange={(e) => setMetaEvent(e.target.value)}
          >
            {metaEvents.map(ev => (
              <option key={ev} value={ev}>{ev}</option>
            ))}
          </select>
        </div>

        {metaEvent === "Evento customizado" && (
          <div className="space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
            <label className="text-[11px] font-bold text-[var(--admin-muted)] uppercase tracking-wider">
              Nome do Evento Customizado
            </label>
            <input 
              type="text"
              className="admin-input w-full"
              placeholder="Ex: MinhaConversaoPersonalizada"
              value={customEventName}
              onChange={(e) => setCustomEventName(e.target.value)}
            />
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-[var(--admin-border)] flex flex-col gap-3">
        <div className="text-[10px] text-[var(--admin-muted)] italic text-center">
          Pixel configurado globalmente no bloco Início.
        </div>
        <button 
          className="admin-btn-primary w-full"
          disabled={loading}
          onClick={handleSave}
        >
          {loading ? "Salvando..." : "Salvar configuração de Pixel"}
        </button>
      </div>
    </div>
  );
}
