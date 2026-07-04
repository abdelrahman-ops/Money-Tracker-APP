import { create } from 'zustand';
import { hashPasscode } from '../utils/crypto';


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
  isLocked: localStorage.getItem('app_lockMode') !== 'never' && !!localStorage.getItem('app_passcode_hash'),
  passcode: localStorage.getItem('app_passcode_hash') || null,
  failedAttempts: parseInt(localStorage.getItem('app_failed_attempts') || '0', 10),
  lockoutUntil: parseInt(localStorage.getItem('app_lockout_until') || '0', 10),
  
  setPasscode: async (code) => {
    if (code) {
      const hash = await hashPasscode(code);
      localStorage.setItem('app_passcode_hash', hash);
      localStorage.removeItem('app_passcode'); // clean up old plaintext if exists
      set({ passcode: hash, isLocked: get().lockMode !== 'never', failedAttempts: 0, lockoutUntil: 0 });
      localStorage.setItem('app_failed_attempts', '0');
      localStorage.setItem('app_lockout_until', '0');
    } else {
      localStorage.removeItem('app_passcode_hash');
      localStorage.removeItem('app_passcode');
      set({ passcode: null, isLocked: false, failedAttempts: 0, lockoutUntil: 0 });
      localStorage.setItem('app_failed_attempts', '0');
      localStorage.setItem('app_lockout_until', '0');
    }
  },

  verifyPasscode: async (code) => {
    const now = Date.now();
    const lockoutUntil = get().lockoutUntil;
    if (lockoutUntil && now < lockoutUntil) {
      return false;
    }

    const hash = await hashPasscode(code);
    const isValid = hash === get().passcode;

    if (isValid) {
      localStorage.setItem('app_failed_attempts', '0');
      localStorage.setItem('app_lockout_until', '0');
      set({ failedAttempts: 0, lockoutUntil: 0, isLocked: false });
      return true;
    } else {
      const newAttempts = get().failedAttempts + 1;
      let newLockout = 0;
      if (newAttempts >= 5) {
        newLockout = now + 30 * 1000; // 30 seconds cooldown
        localStorage.setItem('app_lockout_until', String(newLockout));
      }
      localStorage.setItem('app_failed_attempts', String(newAttempts));
      set({ failedAttempts: newAttempts, lockoutUntil: newLockout });
      return false;
    }
  },

  unlock: () => {
    set({ isLocked: false, failedAttempts: 0, lockoutUntil: 0 });
    localStorage.setItem('app_failed_attempts', '0');
    localStorage.setItem('app_lockout_until', '0');
  },
  
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
