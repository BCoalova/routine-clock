
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { RoutineProvider } from "@/contexts/RoutineContext";
import Index from "./pages/Index";
import CreateRoutine from "./pages/CreateRoutine";
import EditRoutine from "./pages/EditRoutine";
import TimerPage from "./pages/TimerPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <RoutineProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/create" element={<CreateRoutine />} />
            <Route path="/edit/:id" element={<EditRoutine />} />
            <Route path="/timer/:id" element={<TimerPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </RoutineProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
