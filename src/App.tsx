import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { BottomNav } from "@/components/layout/BottomNav";
import Index from "./pages/Index";
import TeamArchive from "./pages/TeamArchive";
import Matchmaking from "./pages/Matchmaking";
import Schedule from "./pages/Schedule";
import CourtBooking from "./pages/CourtBooking";
import PlayerRegistration from "./pages/PlayerRegistration";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="min-h-screen bg-background">
          
          <main className="pb-16">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/archive" element={<TeamArchive />} />
              <Route path="/matchmaking" element={<Matchmaking />} />
              <Route path="/schedule" element={<Schedule />} />
              <Route path="/courts" element={<CourtBooking />} />
              <Route path="/register" element={<PlayerRegistration />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <BottomNav />
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
