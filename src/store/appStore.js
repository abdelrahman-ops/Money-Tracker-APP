import { create } from 'zustand';

export const CURRENCIES = [
  { code: 'EGP', symbol: 'E£', name: 'Egyptian Pound', locale: 'en-EG' },
  { code: 'USD', symbol: '$', name: 'US Dollar', locale: 'en-US' },
  { code: 'EUR', symbol: '€', name: 'Euro', locale: 'de-DE' },
  { code: 'GBP', symbol: '£', name: 'British Pound', locale: 'en-GB' },
  { code: 'SAR', symbol: 'ر.س', name: 'Saudi Riyal', locale: 'ar-SA' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', locale: 'ar-AE' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', locale: 'en-IN' },
  { code: 'TRY', symbol: '₺', name: 'Turkish Lira', locale: 'tr-TR' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', locale: 'ja-JP' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', locale: 'en-CA' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', locale: 'en-AU' },
  { code: 'KWD', symbol: 'د.ك', name: 'Kuwaiti Dinar', locale: 'ar-KW' },
];

export const useAppStore = create((set, get) => ({
  // Theme - default dark
  darkMode: localStorage.getItem('darkMode') !== 'false',
  toggleDarkMode: () => {
    const next = !get().darkMode;
    localStorage.setItem('darkMode', String(next));
    document.documentElement.classList.toggle('dark', next);
    set({ darkMode: next });
  },
  initTheme: () => {
    const dark = localStorage.getItem('darkMode') !== 'false';
    document.documentElement.classList.toggle('dark', dark);
    set({ darkMode: dark });
  },

  // Currency
  currency: localStorage.getItem('app_currency') || 'EGP',
  setCurrency: (code) => {
    localStorage.setItem('app_currency', code);
    set({ currency: code });
  },

  // Balance visibility
  balanceVisible: false,
  setBalanceVisible: (v) => set({ balanceVisible: v }),
  toggleBalanceVisible: () => {
    const state = get();
    if (state.balanceVisible) {
      set({ balanceVisible: false });
    } else {
      // If passcode exists, require unlock first
      if (state.passcode && localStorage.getItem('app_lockMode') !== 'never') {
        set({ pendingBalanceReveal: true });
      } else {
        set({ balanceVisible: true });
      }
    }
  },
  pendingBalanceReveal: false,
  clearPendingBalanceReveal: () => set({ pendingBalanceReveal: false }),
  confirmBalanceReveal: () => set({ balanceVisible: true, pendingBalanceReveal: false }),

  // Passcode lock
  isLocked: localStorage.getItem('app_lockMode') !== 'never' && !!localStorage.getItem('app_passcode'),
  passcode: localStorage.getItem('app_passcode') || null,
  setPasscode: (code) => {
    if (code) {
      localStorage.setItem('app_passcode', code);
    } else {
      localStorage.removeItem('app_passcode');
    }
    set({ passcode: code, isLocked: !!code });
  },
  unlock: () => set({ isLocked: false }),
  lock: () => {
    if (get().passcode) set({ isLocked: true, balanceVisible: false });
  },

  // Lock mode: 'always' | 'timed' | 'never'
  lockMode: localStorage.getItem('app_lockMode') || 'always',
  setLockMode: (mode) => {
    localStorage.setItem('app_lockMode', mode);
    set({ lockMode: mode });
  },

  // Lock timeout in minutes (only for 'timed' mode)
  lockTimeout: parseInt(localStorage.getItem('app_lockTimeout') || '5'),
  setLockTimeout: (minutes) => {
    localStorage.setItem('app_lockTimeout', String(minutes));
    set({ lockTimeout: minutes });
  },

  // Onboarding
  hasOnboarded: localStorage.getItem('app_onboarded') === 'true',
  completeOnboarding: () => {
    localStorage.setItem('app_onboarded', 'true');
    set({ hasOnboarded: true });
  },

  // Splash
  showSplash: true,
  hideSplash: () => set({ showSplash: false }),

  // Install prompt
  installPromptEvent: null,
  showInstallBanner: false,
  setInstallPromptEvent: (e) => {
    // Don't show if user previously dismissed
    if (localStorage.getItem('install_bar_dismissed') === 'true') return;
    set({ installPromptEvent: e, showInstallBanner: true });
  },
  dismissInstallBanner: () => {
    localStorage.setItem('install_bar_dismissed', 'true');
    set({ showInstallBanner: false, installPromptEvent: null });
  },

  // Active account
  activeAccountId: null,
  setActiveAccountId: (id) => set({ activeAccountId: id }),
}));
