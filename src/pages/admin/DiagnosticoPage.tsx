import { useEffect, useState } from "react";
import { CheckCircle2, AlertTriangle, XCircle, RefreshCw } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { SectionCard } from "@/components/admin/SectionCard";
import { useSetTopbarActions } from "@/components/admin/AdminLayout";
import { loadState } from "@/data/admin/store";

type CheckStatus = "ok" | "warn" | "fail";
type Check = { id: string; label: string; description: string; status: CheckStatus };

function statusIcon(s: CheckStatus) {
  if (s === "ok") return <CheckCircle2 className="w-5 h-5" style={{ color: "var(--admin-green)" }} />;
  if (s === "warn") return <AlertTriangle className="w-5 h-5" style={{ color: "var(--admin-yellow)" }} />;
  return <XCircle className="w-5 h-5" style={{ color: "var(--admin-red-text)" }} />;
}

async function runChecks(): Promise<Check[]> {
  const links = loadState().links;
  const checks: Check[] = [];

  checks.push({
    id: "meta", label: "Meta Pixel",
    description: links.metaPixelId ? `ID configurado: ${links.metaPixelId}` : "Pixel não configurado em Links e Pixels.",
    status: links.metaPixelId ? "ok" : "warn",
  });
  checks.push({
    id: "ga4", label: "Google Analytics 4",
    description: links.ga4Id ? `ID configurado: ${links.ga4Id}` : "GA4 não configurado.",
    status: links.ga4Id ? "ok" : "warn",
  });
  checks.push({
    id: "gtm", label: "Google Tag Manager",
    description: links.gtmId ? `Container: ${links.gtmId}` : "GTM não configurado.",
    status: links.gtmId ? "ok" : "warn",
  });

  let checkoutOk: CheckStatus = "warn";
  let checkoutDesc = "Não foi possível alcançar a URL.";
  try {
    await fetch(links.checkoutBaseUrl, { mode: "no-cors" });
    checkoutOk = "ok";
    checkoutDesc = `URL respondendo: ${links.checkoutBaseUrl}`;
  } catch {
    checkoutOk = "fail";
    checkoutDesc = `Falha ao alcançar ${links.checkoutBaseUrl}`;
  }
  checks.push({ id: "checkout", label: "Checkout base", description: checkoutDesc, status: checkoutOk });

  const utmOk = !!(links.defaultUtmSource && links.defaultUtmMedium && links.defaultUtmCampaign);
  checks.push({
    id: "utm", label: "UTMs padrão",
    description: utmOk ? `${links.defaultUtmSource}/${links.defaultUtmMedium}/${links.defaultUtmCampaign}` : "UTMs padrão incompletas.",
    status: utmOk ? "ok" : "warn",
  });

  return checks;
}

export default function DiagnosticoPage() {
  const [checks, setChecks] = useState<Check[] | null>(null);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);
    const r = await runChecks();
    setChecks(r);
    setLoading(false);
  }

  useEffect(() => { void refresh(); }, []);

  useSetTopbarActions(
    <button className="admin-btn-secondary inline-flex items-center gap-1.5" onClick={refresh}>
      <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Reexecutar
    </button>,
  );

  const okCount = checks?.filter((c) => c.status === "ok").length ?? 0;
  const warnCount = checks?.filter((c) => c.status === "warn").length ?? 0;
  const failCount = checks?.filter((c) => c.status === "fail").length ?? 0;

  return (
    <>
      <PageHeader
        title="Diagnóstico técnico"
        description="Checagens automáticas para garantir que o funil está pronto para receber tráfego."
      />

      <div className="grid gap-3 grid-cols-3 mb-5">
        <div className="admin-card-soft p-4 text-center">
          <div className="text-xs admin-label">OK</div>
          <div className="text-xl font-bold" style={{ color: "var(--admin-green)" }}>{okCount}</div>
        </div>
        <div className="admin-card-soft p-4 text-center">
          <div className="text-xs admin-label">Atenção</div>
          <div className="text-xl font-bold" style={{ color: "var(--admin-yellow)" }}>{warnCount}</div>
        </div>
        <div className="admin-card-soft p-4 text-center">
          <div className="text-xs admin-label">Falhas</div>
          <div className="text-xl font-bold" style={{ color: "var(--admin-red-text)" }}>{failCount}</div>
        </div>
      </div>

      <SectionCard padded={false}>
        <ul>
          {(checks ?? []).map((c, i) => (
            <li
              key={c.id}
              className="flex items-center gap-4 px-6 py-4"
              style={{ borderBottom: i < (checks!.length - 1) ? "1px solid var(--admin-border)" : "none" }}
            >
              {statusIcon(c.status)}
              <div className="flex-1">
                <div className="text-sm font-semibold">{c.label}</div>
                <div className="text-xs mt-0.5" style={{ color: "var(--admin-muted)" }}>{c.description}</div>
              </div>
            </li>
          ))}
          {!checks && (
            <li className="px-6 py-8 text-center text-sm" style={{ color: "var(--admin-muted)" }}>Executando checagens...</li>
          )}
        </ul>
      </SectionCard>
    </>
  );
}
