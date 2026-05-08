import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import IndexDark from "./pages/IndexDark.tsx";
import NotFound from "./pages/NotFound.tsx";
import { AdminLayout } from "@/components/admin/AdminLayout";
import FunisListPage from "./pages/admin/FunisListPage";
import AdminOverviewPage from "./pages/admin/AdminOverviewPage";
import EditorPage from "./pages/admin/EditorPage";
import FluxoPage from "./pages/admin/FluxoPage";
import AbPage from "./pages/admin/AbPage";
import AnalyticsFunilPage from "./pages/admin/AnalyticsFunilPage";
import LinksPage from "./pages/admin/LinksPage";
import DiagnosticoPage from "./pages/admin/DiagnosticoPage";
import TemplatesPage from "./pages/admin/TemplatesPage";
import ExperimentosPage from "./pages/admin/ExperimentosPage";
import AnalyticsGlobalPage from "./pages/admin/AnalyticsGlobalPage";
import ConfiguracoesPage from "./pages/admin/ConfiguracoesPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dark" element={<IndexDark />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/funis" replace />} />
            <Route path="funis" element={<FunisListPage />} />
            <Route path="funis/atual" element={<AdminOverviewPage />} />
            <Route path="funis/atual/editor" element={<EditorPage />} />
            <Route path="funis/atual/fluxo" element={<FluxoPage />} />
            <Route path="funis/atual/ab" element={<AbPage />} />
            <Route path="funis/atual/analytics" element={<AnalyticsFunilPage />} />
            <Route path="funis/atual/links" element={<LinksPage />} />
            <Route path="funis/atual/diagnostico" element={<DiagnosticoPage />} />
            <Route path="templates" element={<TemplatesPage />} />
            <Route path="experimentos" element={<ExperimentosPage />} />
            <Route path="analytics" element={<AnalyticsGlobalPage />} />
            <Route path="configuracoes" element={<ConfiguracoesPage />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
