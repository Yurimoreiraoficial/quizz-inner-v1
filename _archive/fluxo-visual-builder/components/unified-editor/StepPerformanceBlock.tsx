import type { FunnelScreen } from "@/data/funnelConfig";
import type { ScreenMicroRow } from "@/services/analyticsService";
import { type AbTest, type VariantPerformance, pickWinner } from "@/services/abService";

export function StepPerformanceBlock({
  screen,
  micro,
  test,
  perf
}: {
  screen: FunnelScreen;
  micro?: ScreenMicroRow;
  test?: AbTest;
  perf: VariantPerformance[];
}) {
  const views = micro ? micro.views : 0;
  const completions = micro ? micro.completions : 0;
  const avanco = micro && views > 0 ? (micro.completion_rate * 100).toFixed(1) + "%" : "—";
  const dropoff = micro && views > 0 ? ((1 - micro.completion_rate) * 100).toFixed(1) + "%" : "—";

  const isFinal = screen.type === "final" || screen.type === "offer";

  return (
    <div className="space-y-6">
      {/* Visão Geral da Etapa */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-[var(--admin-surface-2)] border border-[var(--admin-border)]">
          <div className="text-[10px] text-[var(--admin-muted)] uppercase tracking-wider font-bold mb-1">Views Totais</div>
          <div className="text-xl font-semibold">{views > 0 ? views : "—"}</div>
        </div>
        
        <div className="p-4 rounded-xl bg-[var(--admin-surface-2)] border border-[var(--admin-border)]">
          <div className="text-[10px] text-[var(--admin-muted)] uppercase tracking-wider font-bold mb-1">Avanço Médio</div>
          <div className="text-xl font-semibold">{avanco}</div>
        </div>

        <div className="p-4 rounded-xl bg-[var(--admin-surface-2)] border border-[var(--admin-border)]">
          <div className="text-[10px] text-[var(--admin-muted)] uppercase tracking-wider font-bold mb-1">Perda (Drop-off)</div>
          <div className="text-xl font-semibold text-red-400">{dropoff}</div>
        </div>

        {isFinal ? (
          <div className="p-4 rounded-xl bg-[var(--admin-surface-2)] border border-[var(--admin-border)]">
            <div className="text-[10px] text-[var(--admin-muted)] uppercase tracking-wider font-bold mb-1">Cliques Checkout</div>
            <div className="text-xl font-semibold text-green-400">
              {perf.reduce((a, b) => a + b.checkout_clicks, 0) || "—"}
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-[var(--admin-surface-2)] border border-[var(--admin-border)]">
            <div className="text-[10px] text-[var(--admin-muted)] uppercase tracking-wider font-bold mb-1">Conclusões</div>
            <div className="text-xl font-semibold">{completions > 0 ? completions : "—"}</div>
          </div>
        )}
      </div>

      {/* Comparativo A/B, se existir */}
      {test && test.variants.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-[var(--admin-border)]">
          <div className="text-[11px] font-bold text-[var(--admin-muted)] uppercase tracking-wider mb-2">Comparativo A/B</div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[var(--admin-border)] text-[var(--admin-muted)]">
                  <th className="py-2 font-medium">Versão</th>
                  <th className="py-2 font-medium">Views</th>
                  <th className="py-2 font-medium">Avanço</th>
                  <th className="py-2 font-medium">Checkout</th>
                  <th className="py-2 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {test.variants.map((v) => {
                  const p = perf?.find(x => x.variant_id === v.id);
                  const winner = pickWinner(perf);
                  const isWinner = winner?.variant_id === v.id;
                  const vViews = p?.visitors || 0;
                  const rate = p && vViews > 0 ? ((p.completions / vViews) * 100).toFixed(1) + "%" : "—";
                  const checkout = p?.checkout_clicks || 0;
                  
                  return (
                    <tr key={v.id} className="border-b border-[var(--admin-border-strong)] last:border-0">
                      <td className="py-3 font-semibold">{v.label}</td>
                      <td className="py-3">{vViews > 0 ? vViews : "—"}</td>
                      <td className="py-3">{rate}</td>
                      <td className="py-3">{checkout > 0 ? checkout : "—"}</td>
                      <td className="py-3 text-right">
                        {isWinner ? (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-[var(--admin-blue-soft)] text-[var(--admin-blue)] font-bold">Vencedora</span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-[var(--admin-surface-2)] text-[var(--admin-muted)]">Coletando</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
