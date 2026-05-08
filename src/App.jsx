import { Toaster } from "sonner"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Photos from './pages/Photos.jsx';
import DoctorReport from './pages/DoctorReport.jsx';

import CookieConsent from './components/CookieConsent';
import Dashboard from './pages/Dashboard';
import Medications from './pages/Medications';
import SideEffects from './pages/SideEffects';
import Progress from './pages/Progress';
import Reminders from './pages/Reminders';
import Settings from './pages/Settings.jsx';
import Upgrade from './pages/Upgrade';
import InstallBanner from './components/InstallBanner';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
          <p className="text-sm text-muted-foreground">Loading ThinShot...</p>
        </div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Only redirect to login for protected routes — public pages render normally
      const publicPaths = ['/', '/terms', '/privacy'];
      if (!publicPaths.includes(window.location.pathname)) {
        navigateToLogin();
        return null;
      }
    }
  }

  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/doctor-report" element={<DoctorReport />} />
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/medications" element={<Medications />} />
          <Route path="/side-effects" element={<SideEffects />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/photos" element={<Photos />} />
          <Route path="/reminders" element={<Reminders />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/upgrade" element={<Upgrade />} />
          <Route path="*" element={<PageNotFound />} />
        </Route>
      </Routes>
      <CookieConsent />
      <InstallBanner />
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App