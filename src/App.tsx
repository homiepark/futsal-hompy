import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Component, ReactNode, lazy, Suspense } from "react";

import { AuthProvider } from "@/contexts/AuthContext";
import { TeamProvider } from "@/contexts/TeamContext";
import { BottomNav } from "@/components/layout/BottomNav";
import { ScrollRestoration } from "@/components/layout/ScrollRestoration";

// Lazy load all pages for bundle splitting
const Index = lazy(() => import("./pages/Index"));
const TeamHome = lazy(() => import("./pages/TeamHome"));
const TeamArchive = lazy(() => import("./pages/TeamArchive"));
const MyTeam = lazy(() => import("./pages/MyTeam"));
const CreateTeam = lazy(() => import("./pages/CreateTeam"));
const JoinRequestManagement = lazy(() => import("./pages/JoinRequestManagement"));
const Matchmaking = lazy(() => import("./pages/Matchmaking"));
const Schedule = lazy(() => import("./pages/Schedule"));
const CourtBooking = lazy(() => import("./pages/CourtBooking"));
const PlayerRegistration = lazy(() => import("./pages/PlayerRegistration"));
const MyProfile = lazy(() => import("./pages/MyProfile"));
const ProfileSetup = lazy(() => import("./pages/ProfileSetup"));
const Auth = lazy(() => import("./pages/Auth"));
const AuthCallback = lazy(() => import("./pages/AuthCallback"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Messages = lazy(() => import("./pages/Messages"));
const NotFound = lazy(() => import("./pages/NotFound"));

// 주요 페이지 프리로드: 앱 초기 로드 후 유휴 시간에 미리 다운로드
const preloadPages = () => {
  import("./pages/TeamHome");
  import("./pages/Schedule");
  import("./pages/Messages");
  import("./pages/Matchmaking");
  import("./pages/TeamArchive");
  import("./pages/MyProfile");
};

if (typeof window !== 'undefined') {
  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(preloadPages);
  } else {
    setTimeout(preloadPages, 2000);
  }
}

// Loading fallback
const PageLoading = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="text-3xl mb-2 animate-pixel-pulse">⚽</div>
      <p className="font-pixel text-[10px] text-muted-foreground">로딩 중...</p>
    </div>
  </div>
);

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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,      // 5분간 데이터 신선 유지 (재요청 안 함)
      gcTime: 1000 * 60 * 30,         // 30분간 캐시 보관
      refetchOnWindowFocus: false,     // 탭 전환 시 자동 재요청 방지
      retry: 1,                        // 실패 시 1회만 재시도
    },
  },
});

const AppContent = () => (
  <BrowserRouter>
    <ScrollRestoration />
    <div className="min-h-screen bg-background">
      <main className="pb-16 page-content">
        <Suspense fallback={<PageLoading />}>
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
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
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
