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
import UnifiedFunnelEditorPage from "./pages/admin/UnifiedFunnelEditorPage";
import AbPage from "./pages/admin/AbPage";
import AnalyticsFunilPage from "./pages/admin/AnalyticsFunilPage";



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
            <Route path="funis/atual" element={<Navigate to="/admin/funis/atual/analytics" replace />} />
            <Route path="funis/atual/editor" element={<Navigate to="/admin/funis/atual/fluxo" replace />} />
            <Route path="funis/atual/fluxo" element={<UnifiedFunnelEditorPage />} />
            <Route path="funis/atual/ab" element={<AbPage />} />
            <Route path="funis/atual/analytics" element={<AnalyticsFunilPage />} />
            <Route path="funis/atual/links" element={<Navigate to="/admin/funis/atual/fluxo" replace />} />
            <Route path="funis/atual/diagnostico" element={<Navigate to="/admin/funis/atual/fluxo" replace />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
