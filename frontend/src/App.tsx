import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import Layout from '@/components/Layout';
import LoginPage from '@/pages/Login';
import RegisterPage from '@/pages/Register';
import OnboardingPage from '@/pages/Onboarding';
import TodayPage from '@/pages/Today';
import TrainingPage from '@/pages/Training';
import DietPage from '@/pages/Diet';
import TrendsPage from '@/pages/Trends';
import CoachPage from '@/pages/Coach';
import SettingsPage from '@/pages/Settings';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isLoading, user } = useAuth();
  if (isLoading) return <div className="min-h-screen flex items-center justify-center text-muted">加载中...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!user.onboarding_completed) return <Navigate to="/onboarding" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const { isLoading, user } = useAuth();
  if (isLoading) return <div className="min-h-screen flex items-center justify-center text-muted">加载中...</div>;

  const DEV_PREVIEW = import.meta.env.DEV && !user;

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/register" element={user ? <Navigate to="/" replace /> : <RegisterPage />} />
      <Route path="/onboarding" element={DEV_PREVIEW ? <OnboardingPage /> : (user ? <OnboardingPage /> : <Navigate to="/login" replace />)} />
      <Route element={DEV_PREVIEW ? <Layout /> : <ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/" element={<TodayPage />} />
        <Route path="/training" element={<TrainingPage />} />
        <Route path="/diet" element={<DietPage />} />
        <Route path="/trends" element={<TrendsPage />} />
        <Route path="/coach" element={<CoachPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
