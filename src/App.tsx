
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { RoutineProvider } from "@/contexts/RoutineContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import Index from "./pages/Index";
import CreateRoutine from "./pages/CreateRoutine";
import EditRoutine from "./pages/EditRoutine";
import TimerPage from "./pages/TimerPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <RoutineProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/routine-clock/" element={<Index />} />
              <Route path="/routine-clock/create" element={<CreateRoutine />} />
              <Route path="/routine-clock/edit/:id" element={<EditRoutine />} />
              <Route path="/routine-clock/timer/:id" element={<TimerPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </RoutineProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
