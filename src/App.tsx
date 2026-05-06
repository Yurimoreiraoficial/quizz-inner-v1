import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import IndexDark from "./pages/IndexDark.tsx";
import NotFound from "./pages/NotFound.tsx";
import { FunnelProvider } from "@/context/FunnelContext";
import { funnelSteps } from "@/data/funnelSteps";

const queryClient = new QueryClient();

const stepPaths = funnelSteps.map((s) => s.path);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <FunnelProvider>
          <Routes>
            {/* Funil light: cada etapa tem sua própria rota */}
            <Route path="/" element={<Navigate to="/intro" replace />} />
            {stepPaths.map((p) => (
              <Route key={`light-${p}`} path={`/${p}`} element={<Index />} />
            ))}
            {/* Aliases /stepN -> slug em português (compatível com o dropdown do editor Lovable) */}
            {stepPaths.map((p, i) => (
              <Route
                key={`light-step-${i + 1}`}
                path={`/step${i + 1}`}
                element={<Navigate to={`/${p}`} replace />}
              />
            ))}

            {/* Funil dark: mesmas etapas com prefixo /dark */}
            <Route path="/dark" element={<Navigate to="/dark/intro" replace />} />
            {stepPaths.map((p) => (
              <Route key={`dark-${p}`} path={`/dark/${p}`} element={<IndexDark />} />
            ))}
            {stepPaths.map((p, i) => (
              <Route
                key={`dark-step-${i + 1}`}
                path={`/dark/step${i + 1}`}
                element={<Navigate to={`/dark/${p}`} replace />}
              />
            ))}

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </FunnelProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
