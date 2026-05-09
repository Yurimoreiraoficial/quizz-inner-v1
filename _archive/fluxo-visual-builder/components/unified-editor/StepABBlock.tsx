import type { FunnelScreen } from "@/data/funnelConfig";
import { type AbTest, MIN_VOLUME_FOR_WINNER } from "@/services/abService";
import { Copy, Plus, Info } from "lucide-react";

export function StepABBlock({ 
  screen, 
  test, 
  onRefresh
}: { 
  screen: FunnelScreen;
  test?: AbTest;
  onRefresh: () => void;
}) {
  const vibeCodeNote = (
    <div className="flex items-start gap-2 p-3 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl border border-blue-200/20 text-[11px] text-blue-700 dark:text-blue-400 mb-6">
      <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
      <span>O conteúdo das versões é editado via Vibe Code. Aqui você configura distribuição, métrica e otimização.</span>
    </div>
  );

  if (!test) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-6 rounded-xl bg-[var(--admin-surface-2)] border border-[var(--admin-border)]">
        {vibeCodeNote}
        <p className="text-sm font-semibold mb-2">Sem teste A/B ativo</p>
        <p className="text-xs text-[var(--admin-muted)] mb-4">
          Crie um teste para testar variações nesta etapa.
        </p>
        <button className="admin-btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Criar Teste A/B
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {vibeCodeNote}
      {/* Resumo e Variantes */}
      <div className="space-y-3">
        <div className="flex items-center justify-between mb-2">
          <div className="text-[11px] font-bold text-[var(--admin-muted)] uppercase tracking-wider">
            Versões existentes
          </div>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[var(--admin-blue-soft)] text-[var(--admin-blue)]">
            Ativo
          </span>
        </div>
        
        {test.variants.map((v) => (
          <div key={v.id} className="p-3 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface-2)] flex items-center justify-between">
            <span className="font-semibold text-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[var(--admin-purple)]"></span>
              Versão {v.label}
            </span>
            <div className="flex items-center gap-3 text-xs text-[var(--admin-muted)]">
              <span>Split auto</span>
              <button className="text-[var(--admin-blue)] hover:underline flex items-center gap-1">
                <Copy className="w-3 h-3" /> Duplicar
              </button>
            </div>
          </div>
        ))}

        <button className="w-full py-2 flex justify-center items-center gap-2 text-xs font-semibold text-[var(--admin-blue)] hover:bg-[var(--admin-blue-soft)] rounded-lg transition-colors border border-transparent hover:border-blue-200/20">
          <Plus className="w-3.5 h-3.5" /> Criar nova versão
        </button>
      </div>

      {/* Otimização Automática */}
      <div className="space-y-4 pt-4 border-t border-[var(--admin-border)]">
        <div className="text-[11px] font-bold text-[var(--admin-muted)] uppercase tracking-wider">Otimização Automática</div>
        
        <div className="space-y-1.5">
          <label className="text-xs font-medium">Status da otimização</label>
          <select className="admin-input w-full text-xs">
            <option>Desligada (distribuição manual)</option>
            <option>Recomendar vencedora manualmente</option>
            <option>Enviar automaticamente para vencedora</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium">Mínimo de views</label>
            <input type="number" className="admin-input w-full text-xs" defaultValue={MIN_VOLUME_FOR_WINNER} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium">Métrica principal</label>
            <select className="admin-input w-full text-xs" defaultValue={test.metric}>
              <option value="checkout_click">Checkout click</option>
              <option value="lead_submit">Lead capturado</option>
              <option value="whatsapp_click">WhatsApp click</option>
              <option value="purchase">Compra confirmada</option>
              <option value="advance">Avanço de tela</option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium">Comportamento em empate</label>
          <select className="admin-input w-full text-xs">
            <option>Manter teste rodando</option>
            <option>Recomendar manualmente</option>
            <option>Manter distribuição igual</option>
          </select>
        </div>
      </div>
    </div>
  );
}
