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

const lightFunnel = (
  <FunnelProvider basePath="">
    <Index />
  </FunnelProvider>
);

const darkFunnel = (
  <FunnelProvider basePath="/dark">
    <IndexDark />
  </FunnelProvider>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Funil light: cada etapa tem sua própria rota */}
          <Route path="/" element={<Navigate to="/intro" replace />} />
          {stepPaths.map((p) => (
            <Route key={`light-${p}`} path={`/${p}`} element={lightFunnel} />
          ))}

          {/* Funil dark: mesmas etapas com prefixo /dark */}
          <Route path="/dark" element={<Navigate to="/dark/intro" replace />} />
          {stepPaths.map((p) => (
            <Route key={`dark-${p}`} path={`/dark/${p}`} element={darkFunnel} />
          ))}

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
