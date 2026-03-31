import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Component, ReactNode } from "react";

import { AuthProvider } from "@/contexts/AuthContext";
import { TeamProvider } from "@/contexts/TeamContext";
import { BottomNav } from "@/components/layout/BottomNav";
import { ScrollRestoration } from "@/components/layout/ScrollRestoration";
import Index from "./pages/Index";
import TeamHome from "./pages/TeamHome";
import TeamArchive from "./pages/TeamArchive";
import MyTeam from "./pages/MyTeam";
import CreateTeam from "./pages/CreateTeam";
import JoinRequestManagement from "./pages/JoinRequestManagement";
import Matchmaking from "./pages/Matchmaking";
import Schedule from "./pages/Schedule";
import CourtBooking from "./pages/CourtBooking";
import PlayerRegistration from "./pages/PlayerRegistration";
import MyProfile from "./pages/MyProfile";
import ProfileSetup from "./pages/ProfileSetup";
import Auth from "./pages/Auth";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Messages from "./pages/Messages";
import NotFound from "./pages/NotFound";

// Error Boundary to catch render errors
class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20, fontFamily: 'monospace', fontSize: 12, color: 'red', wordBreak: 'break-all' }}>
          <h2>App Error:</h2>
          <pre>{this.state.error?.message}</pre>
          <pre>{this.state.error?.stack}</pre>
          <button onClick={() => window.location.reload()} style={{ marginTop: 10, padding: '8px 16px', background: '#333', color: '#fff', border: 'none' }}>
            새로고침
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const queryClient = new QueryClient();

const AppContent = () => (
  <BrowserRouter>
    <ScrollRestoration />
    <div className="min-h-screen bg-background">
      <main className="pb-16 page-content">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/my-team" element={<MyTeam />} />
          <Route path="/team/:teamId" element={<TeamHome />} />
          <Route path="/archive" element={<TeamArchive />} />
          <Route path="/create-team" element={<CreateTeam />} />
          <Route path="/team/:teamId/requests" element={<JoinRequestManagement />} />
          <Route path="/matchmaking" element={<Matchmaking />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/courts" element={<CourtBooking />} />
          <Route path="/register" element={<PlayerRegistration />} />
          <Route path="/profile" element={<MyProfile />} />
          <Route path="/profile-setup" element={<ProfileSetup />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <BottomNav />
    </div>
  </BrowserRouter>
);

const App = () => {
  try {
    return (
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <AuthProvider>
              <TeamProvider>
                  <Toaster />
                  <Sonner />
                  <AppContent />
              </TeamProvider>
            </AuthProvider>
          </TooltipProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    );
  } catch (e: any) {
    return (
      <div style={{ padding: 20, fontFamily: 'monospace', color: 'red' }}>
        <h2>Fatal Error:</h2>
        <pre>{e?.message}{'\n'}{e?.stack}</pre>
      </div>
    );
  }
};

export default App;
