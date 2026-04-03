import { useEffect } from 'react';
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
import Onboarding from './onboarding/Onboarding';
import DashboardPage from './features/dashboard/DashboardPage';
import Transactions from './pages/Transactions';
import AddTransaction from './pages/AddTransaction';
import Wallets from './pages/Wallets';
import WalletForm from './pages/WalletForm';
import WalletInsights from './pages/WalletInsights';
import Settings from './pages/Settings';
import Analytics from './pages/Analytics';
import TemplateManager from './pages/TemplateManager';
import SavingsGoals from './pages/SavingsGoals';
import DebtTracker from './pages/DebtTracker';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import NotificationModal from './components/NotificationModal';

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

  useEffect(() => {
    if (!isAuthenticated) return;

    // Fetch core data from API
    useWalletStore.getState().fetchWallets();
    useCategoryStore.getState().fetchCategories();
    useTransactionStore.getState().fetchTransactions();

    // Financial intelligence
    const fs = useFinancialStore.getState();
    fs.loadDailyLimit();
    fs.loadInsights();
    fs.loadHealthScore();
    fs.loadProjection();

    // NOTE: seedDefaults removed — server seeds on registration only.
    // Calling it on every app load caused wallet duplication.
  }, [isAuthenticated]);

  return null;
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

  // Splash screen
  if (showSplash) {
    return (
      <div className="min-h-[100dvh] bg-[var(--color-bg)] text-[var(--color-text)]">
        <SplashScreen onFinish={hideSplash} />
      </div>
    );
  }

  // Onboarding
  if (!hasOnboarded) {
    return (
      <div className="min-h-[100dvh] bg-[var(--color-bg)] text-[var(--color-text)]">
        <Onboarding onFinish={completeOnboarding} />
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
        <Routes>
          {/* Public */}
          <Route path="login" element={
            isAuthenticated ? <Navigate to="/" replace /> : <Login />
          } />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="reset-password" element={<ResetPassword />} />

          {/* Protected */}
          <Route element={<AuthGuard><Layout /></AuthGuard>}>
            <Route index element={<DashboardPage />} />
            <Route path="calendar" element={<Transactions />} />
            <Route path="wallets" element={<Wallets />} />
            <Route path="settings" element={<Settings />} />
            <Route path="analytics" element={<Analytics />} />
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
      </div>
    </BrowserRouter>
  );
}
