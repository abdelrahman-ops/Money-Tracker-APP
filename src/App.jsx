import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useAppStore } from './store/appStore';
import { useAuthStore } from './store/authStore';
import { useFinancialStore } from './store/financialStore';
import { useWalletStore } from './store/walletStore';
import { useCategoryStore } from './store/categoryStore';
import { useTransactionStore } from './store/transactionStore';

import Layout from './components/Layout';
import AuthGuard from './components/AuthGuard';
import LockScreen from './components/LockScreen';
import SplashScreen from './onboarding/SplashScreen';
import InstallBanner from './components/InstallBanner';
import GlobalPasscodeModal from './components/GlobalPasscodeModal';

// Lazy load page components
const DashboardPage = lazy(() => import('./features/dashboard/DashboardPage'));
const Transactions = lazy(() => import('./pages/Transactions'));
const AddTransaction = lazy(() => import('./pages/AddTransaction'));
const Wallets = lazy(() => import('./pages/Wallets'));
const WalletForm = lazy(() => import('./pages/WalletForm'));
const WalletInsights = lazy(() => import('./pages/WalletInsights'));
const Settings = lazy(() => import('./pages/Settings'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Budgets = lazy(() => import('./pages/Budgets'));
const TemplateManager = lazy(() => import('./pages/TemplateManager'));
const SavingsGoals = lazy(() => import('./pages/SavingsGoals'));
const DebtTracker = lazy(() => import('./pages/DebtTracker'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Landing = lazy(() => import('./pages/Landing'));

import NotificationModal from './components/NotificationModal';
import apiClient from './api/client';
import { useNotificationStore } from './store/notificationStore';


function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

/**
 * AppInitializer — loads data from API once authenticated.
 * Runs inside BrowserRouter so hooks work correctly.
 */
function AppInitializer() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!isAuthenticated || (user && !user.emailVerified)) return;

    // Single parallel bootstrap call for all core data
    async function bootstrap() {
      try {
        const { data } = await apiClient.get('/data/bootstrap');
        const payload = data.data;
        if (payload) {
          useWalletStore.setState({ wallets: payload.wallets || [] });
          useCategoryStore.setState({ categories: payload.categories || [] });
          useTransactionStore.setState({
            transactions: payload.transactions || [],
            total: payload.transactions?.length || 0,
          });

          // Enrich and set notifications
          const readIds = useNotificationStore.getState().readIds;
          const shownIds = useNotificationStore.getState().shownIds;
          const enriched = (payload.notifications || []).map(n => {
            const id = n._id || n.id;
            return {
              ...n,
              id,
              isRead: readIds.has(id) ? true : n.isRead,
              shownInModal: shownIds.has(id),
            };
          });
          useNotificationStore.setState({
            notifications: enriched,
            unreadCount: enriched.filter(n => !n.isRead).length
          });
        }
      } catch (err) {
        console.error('Failed to bootstrap application data:', err);
      }

      // Load financial intelligence in the background
      const fs = useFinancialStore.getState();
      fs.loadDailyLimit();
      fs.loadInsights();
      fs.loadHealthScore();
      fs.loadProjection();
    }

    bootstrap();
  }, [isAuthenticated, user]);

  return null;
}


function LoadingFallback() {
  return (
    <div className="min-h-[60dvh] w-full flex items-center justify-center bg-[var(--color-bg)]">
      <div className="w-8 h-8 rounded-full border-4 border-[var(--color-primary)]/20 border-t-[var(--color-primary)] animate-spin" />
    </div>
  );
}

export default function App() {
  const initTheme = useAppStore((s) => s.initTheme);
  const setInstallPromptEvent = useAppStore((s) => s.setInstallPromptEvent);
  const isLocked = useAppStore((s) => s.isLocked);
  const passcode = useAppStore((s) => s.passcode);
  const showSplash = useAppStore((s) => s.showSplash);
  const hideSplash = useAppStore((s) => s.hideSplash);
  const hasOnboarded = useAppStore((s) => s.hasOnboarded);
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    initTheme();
    useAuthStore.getState().hydrate();

    const handler = (e) => {
      e.preventDefault();
      setInstallPromptEvent(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  // Splash screen (which also handles onboarding for new users)
  if (showSplash) {
    return (
      <div className="min-h-[100dvh] bg-[var(--color-bg)] text-[var(--color-text)]">
        <SplashScreen onFinish={hideSplash} />
      </div>
    );
  }

  if (isLocked && passcode) {
    return (
      <div className="min-h-[100dvh] bg-[var(--color-bg)] text-[var(--color-text)]">
        <LockScreen />
      </div>
    );
  }

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ScrollToTop />
      <AppInitializer />
      <div className="min-h-[100dvh] bg-[var(--color-bg)] text-[var(--color-text)]">
        <main className="flex-1 relative">
          <NotificationModal />
          <InstallBanner />
          <GlobalPasscodeModal />
        </main>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* Public */}
            <Route path="/" element={
              isAuthenticated ? <Navigate to="/dashboard" replace /> : <Landing />
            } />
            <Route path="login" element={
              isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
            } />
            <Route path="register" element={
              isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />
            } />
            <Route path="verify-email" element={<VerifyEmail />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="reset-password" element={<ResetPassword />} />


            {/* Protected */}
            <Route element={<AuthGuard><Layout /></AuthGuard>}>
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="calendar" element={<Transactions />} />
              <Route path="wallets" element={<Wallets />} />
              <Route path="settings" element={<Settings />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="budgets" element={<Budgets />} />
            </Route>
            <Route path="add" element={<AuthGuard><AddTransaction /></AuthGuard>} />
            <Route path="add/:editId" element={<AuthGuard><AddTransaction /></AuthGuard>} />
            <Route path="wallet/new" element={<AuthGuard><WalletForm /></AuthGuard>} />
            <Route path="wallet/edit/:id" element={<AuthGuard><WalletForm /></AuthGuard>} />
            <Route path="wallet/insights/:id" element={<AuthGuard><WalletInsights /></AuthGuard>} />
            <Route path="templates" element={<AuthGuard><TemplateManager /></AuthGuard>} />
            <Route path="savings" element={<AuthGuard><SavingsGoals /></AuthGuard>} />
            <Route path="debts" element={<AuthGuard><DebtTracker /></AuthGuard>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </div>
    </BrowserRouter>
  );
}
