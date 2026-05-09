import { useEffect, useMemo, useState } from "react";
import { useFunnelScreens } from "@/hooks/useFunnelScreens";
import { loadAnalytics, type FunnelAnalytics } from "@/services/analyticsService";
import { loadAllAbTests, loadAbPerformance, type AbTest, type VariantPerformance } from "@/services/abService";
import { PageHeader } from "@/components/admin/PageHeader";
import { FunnelFlowCanvas } from "@/components/admin/unified-editor/FunnelFlowCanvas";
import { SelectedStepEditorPanel } from "@/components/admin/unified-editor/SelectedStepEditorPanel";
import { ExitNodeEditorPanel } from "@/components/admin/unified-editor/ExitNodeEditorPanel";
import { StartNodeEditorPanel } from "@/components/admin/unified-editor/StartNodeEditorPanel";

export type FlowSelection = 
  | { type: "screen"; id: string } 
  | { type: "variant"; testId: string; variantId: string } 
  | { type: "exit"; id: "whatsapp" | "checkout" | "purchase" }
  | { type: "start" }
  | null;

export default function UnifiedFunnelEditorPage() {
  const { screens, source } = useFunnelScreens();
  const [analytics, setAnalytics] = useState<FunnelAnalytics | null>(null);
  const [abTests, setAbTests] = useState<AbTest[]>([]);
  const [abPerf, setAbPerf] = useState<Record<string, VariantPerformance[]>>({});
  const [loading, setLoading] = useState(true);

  const [selection, setSelection] = useState<FlowSelection>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [ana, tests] = await Promise.all([
          loadAnalytics(),
          loadAllAbTests(),
        ]);
        setAnalytics(ana);
        setAbTests(tests);

        const perfEntries = await Promise.all(
          tests.map(async (t) => [t.id, await loadAbPerformance(t)] as const)
        );
        setAbPerf(Object.fromEntries(perfEntries));
      } catch (err) {
        console.error("Error loading unified editor data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Set initial selection
  useEffect(() => {
    if (!selection && screens.length > 0 && !loading) {
      setSelection({ type: "screen", id: screens[0].id });
    }
  }, [screens, loading, selection]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 rounded-full border-2 border-[var(--admin-blue)] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-56px)] -mx-6 -mb-6">
      <div className="px-6 py-4 shrink-0 border-b border-[var(--admin-border)] bg-[var(--admin-surface)]">
        <PageHeader 
          title="Editor de fluxo do funil" 
          description="Visualize o mapa real do funil, edite etapas, gerencie testes A/B e acompanhe a performance."
        />
      </div>

      <div className="flex flex-1 min-h-0 overflow-hidden bg-[var(--admin-surface-2)]">
        <div className="flex-1 overflow-auto relative">
          <FunnelFlowCanvas 
            screens={screens}
            analytics={analytics}
            abTests={abTests}
            abPerf={abPerf}
            selection={selection}
            onSelect={setSelection}
          />
        </div>
        
        <div className="w-[440px] shrink-0 border-l border-[var(--admin-border)] bg-[var(--admin-surface)] overflow-hidden">
          {selection?.type === "start" ? (
            <StartNodeEditorPanel 
              onSelect={setSelection} 
              screens={screens}
              abTests={abTests}
              analytics={analytics}
            />
          ) : selection?.type === "exit" ? (
            <ExitNodeEditorPanel selection={selection} analytics={analytics} />
          ) : (
            <SelectedStepEditorPanel 
              screens={screens}
              analytics={analytics}
              abTests={abTests}
              abPerf={abPerf}
              selection={selection}
              onRefresh={() => {}}
            />
          )}
        </div>
      </div>
    </div>
  );
}
