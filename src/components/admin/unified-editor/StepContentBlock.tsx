import type { FunnelScreen } from "@/data/funnelConfig";

export function StepContentBlock({ screen }: { screen: FunnelScreen }) {
  const type = screen.type;
  
  const isOpening = type === "opening";
  const isSingleChoice = type === "single_choice";
  const isInsert = type === "insert";
  const isSlider = type === "slider_group_market" || type === "slider_group_pain";
  const isLead = type === "lead_capture";
  const isFinal = type === "final";
  const isLoading = type === "loading";

  // Configuration flags
  const showHeadline = !isLoading;
  const showSubtitle = !isSlider && !isLoading;
  const showOptions = isSingleChoice;
  const showFormFields = isLead;
  const showBullets = isInsert || isFinal;
  const showCta = isOpening || isSingleChoice || isInsert || isSlider || isLead || isFinal;

  return (
    <div className="space-y-4">
      {/* Headline / Question */}
      {showHeadline && (
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-[var(--admin-muted)] uppercase tracking-wider">
            {isSingleChoice ? "Pergunta principal" : "Headline"}
          </label>
          <textarea 
            className="admin-input min-h-[60px]" 
            defaultValue={screen.content.headline || ""} 
            placeholder={isSingleChoice ? "Digite a pergunta..." : "Digite a headline principal..."}
          />
        </div>
      )}

      {/* Subtitle */}
      {showSubtitle && (
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-[var(--admin-muted)] uppercase tracking-wider">
            Subtítulo {(isSingleChoice || isInsert) && "(Opcional)"}
          </label>
          <textarea 
            className="admin-input min-h-[40px]" 
            defaultValue={screen.content.subtitle || ""} 
            placeholder="Texto auxiliar abaixo da headline"
          />
        </div>
      )}

      {/* Options (For single_choice) */}
      {showOptions && (
        <div className="space-y-1.5 pt-2 border-t border-[var(--admin-border)]">
          <label className="text-[11px] font-bold text-[var(--admin-muted)] uppercase tracking-wider">Opções de Resposta</label>
          <div className="space-y-3">
            {(screen.options || []).map((opt, i) => (
              <div key={i} className="p-3 bg-[var(--admin-surface-2)] rounded-xl border border-[var(--admin-border)] space-y-2">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="text-[10px] text-[var(--admin-muted)] font-bold uppercase">Texto exibido (Label)</label>
                    <input 
                      type="text" 
                      className="admin-input mt-1" 
                      defaultValue={opt.label} 
                    />
                  </div>
                  <div className="w-1/3">
                    <label className="text-[10px] text-[var(--admin-muted)] font-bold uppercase">Valor Interno (Value)</label>
                    <input 
                      type="text" 
                      className="admin-input mt-1" 
                      defaultValue={opt.value} 
                    />
                  </div>
                </div>
                <div className="flex justify-between items-center px-1">
                   <div className="text-[10px] text-[var(--admin-muted)] italic">
                     Identificador lógico: <span className="font-mono text-[var(--admin-blue)]">{opt.value}</span>
                   </div>
                   <button className="text-[10px] text-red-500 font-bold hover:underline">Remover</button>
                </div>
              </div>
            ))}
            {(!screen.options || screen.options.length === 0) && (
              <div className="text-xs text-[var(--admin-muted)] italic px-2 py-4 border border-dashed border-[var(--admin-border)] rounded-xl text-center">
                Nenhuma opção configurada.
              </div>
            )}
          </div>
          <button className="w-full py-2.5 mt-2 rounded-xl border border-dashed border-[var(--admin-border)] text-xs text-[var(--admin-muted)] font-bold hover:bg-[var(--admin-surface-2)] transition-colors">
            + Adicionar opção de resposta
          </button>
        </div>
      )}

      {/* Slider Items */}
      {isSlider && (
        <div className="space-y-1.5 pt-2 border-t border-[var(--admin-border)]">
          <label className="text-[11px] font-bold text-[var(--admin-muted)] uppercase tracking-wider">Itens do Slider</label>
          <div className="text-[12px] text-[var(--admin-muted)] bg-[var(--admin-surface-2)] p-4 rounded-xl border border-[var(--admin-border)] border-dashed leading-relaxed">
            Esta etapa utiliza um <strong>grupo dinâmico de sliders</strong>. 
            Os itens são carregados automaticamente baseados na resposta do mercado anterior.
          </div>
        </div>
      )}

      {/* Form Fields (For Lead Capture) */}
      {showFormFields && (
        <div className="space-y-1.5 pt-2 border-t border-[var(--admin-border)]">
          <label className="text-[11px] font-bold text-[var(--admin-muted)] uppercase tracking-wider">Campos do formulário</label>
          <div className="space-y-2">
            {((screen.content.extras?.formFields as string[]) || ["Seu nome", "WhatsApp (com DDD)"]).map((field, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input 
                  type="text" 
                  className="admin-input" 
                  defaultValue={field} 
                />
                <button className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg shrink-0">×</button>
              </div>
            ))}
          </div>
          <button className="text-xs text-[var(--admin-blue)] font-medium mt-1 hover:underline">
            + Adicionar campo
          </button>
        </div>
      )}

      {/* Bullets (Insert / Final) */}
      {showBullets && (
        <div className="space-y-1.5 pt-2 border-t border-[var(--admin-border)]">
          <label className="text-[11px] font-bold text-[var(--admin-muted)] uppercase tracking-wider">
            {isInsert ? "Lista de benefícios/infos" : "Bullets da oferta"}
          </label>
          <div className="space-y-2">
            {((screen.content.extras?.resultBullets as string[]) || []).map((bullet, i) => (
              <input 
                key={i} 
                type="text" 
                className="admin-input" 
                defaultValue={bullet} 
              />
            ))}
            {(!screen.content.extras?.resultBullets || (screen.content.extras?.resultBullets as string[]).length === 0) && (
              <div className="text-xs text-[var(--admin-muted)] italic px-2 py-4 border border-dashed border-[var(--admin-border)] rounded-xl text-center">
                Nenhum bullet configurado.
              </div>
            )}
          </div>
          <button className="text-xs text-[var(--admin-blue)] font-medium mt-2 hover:underline">
            + Adicionar bullet
          </button>
        </div>
      )}

      {/* Button CTA */}
      {showCta && (
        <div className="space-y-3 pt-2 border-t border-[var(--admin-border)]">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-[var(--admin-muted)] uppercase tracking-wider">
              {isFinal ? "CTA Principal (Checkout)" : "Texto do Botão"}
            </label>
            <input 
              type="text"
              className="admin-input" 
              defaultValue={screen.content.buttonText || screen.cta?.label || ""} 
              placeholder="Ex: CONTINUAR"
            />
          </div>
          
          {isFinal && (
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[var(--admin-muted)] uppercase tracking-wider">CTA Secundário (WhatsApp)</label>
              <input 
                type="text" 
                className="admin-input" 
                defaultValue={(screen.content.extras?.whatsappText as string) || "Falar no WhatsApp"} 
              />
            </div>
          )}
        </div>
      )}

      {isLoading && (
        <div className="text-center py-10 bg-[var(--admin-surface-2)] rounded-2xl border border-[var(--admin-border)] border-dashed">
          <div className="text-[11px] font-bold uppercase tracking-widest text-[var(--admin-muted)] mb-2">Tela de Processamento</div>
          <p className="text-[13px] text-[var(--admin-muted)] px-6">
            Esta tela é uma transição automática que exibe o progresso do cálculo para o usuário.
          </p>
        </div>
      )}

      <div className="pt-6 border-t border-[var(--admin-border)] flex justify-end">
        <button className="admin-btn-primary px-8">Salvar alterações</button>
      </div>
    </div>
  );
}
