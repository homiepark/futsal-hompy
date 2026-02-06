import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { TeamProvider } from "@/contexts/TeamContext";
import { BottomNav } from "@/components/layout/BottomNav";
import Index from "./pages/Index";
import TeamHome from "./pages/TeamHome";
import TeamArchive from "./pages/TeamArchive";
import MyTeam from "./pages/MyTeam";
import Matchmaking from "./pages/Matchmaking";
import Schedule from "./pages/Schedule";
import CourtBooking from "./pages/CourtBooking";
import PlayerRegistration from "./pages/PlayerRegistration";
import MyProfile from "./pages/MyProfile";
import Messages from "./pages/Messages";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <TeamProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen bg-background">
            
            <main className="pb-16">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/team/:teamId" element={<TeamHome />} />
                <Route path="/archive" element={<TeamArchive />} />
                <Route path="/matchmaking" element={<Matchmaking />} />
                <Route path="/schedule" element={<Schedule />} />
                <Route path="/courts" element={<CourtBooking />} />
                <Route path="/register" element={<PlayerRegistration />} />
                <Route path="/profile" element={<MyProfile />} />
                <Route path="/messages" element={<Messages />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <BottomNav />
          </div>
        </BrowserRouter>
      </TeamProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
