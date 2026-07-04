import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore, CURRENCIES } from '../store/appStore';
import { useAuthStore } from '../store/authStore';
import { exportData as apiExportData, exportCsv as apiExportCsv, importData as apiImportData, clearAllData as apiClearAllData, getSetting, setSetting } from '../services/apiServices';
import {
  Moon, Sun, Lock, Shield, Download, Upload, FileText, Trash2,
  ChevronRight, Globe, Palette, Info, Repeat, Check, Target, Users,
  HandCoins, Clock, ShieldAlert, Gauge, LogOut, ArrowLeft
} from 'lucide-react';
import { refreshAllData } from '../utils/refreshData';
import { motion, AnimatePresence } from 'framer-motion';
import PasscodeInput from '../components/PasscodeInput';

export default function Settings() {
  const navigate = useNavigate();
  const darkMode = useAppStore((s) => s.darkMode);
  const toggleDarkMode = useAppStore((s) => s.toggleDarkMode);
  const passcode = useAppStore((s) => s.passcode);
  const setPasscode = useAppStore((s) => s.setPasscode);
  const currency = useAppStore((s) => s.currency);
  const setCurrency = useAppStore((s) => s.setCurrency);
  const lockMode = useAppStore((s) => s.lockMode);
  const setLockMode = useAppStore((s) => s.setLockMode);
  const lockTimeout = useAppStore((s) => s.lockTimeout);
  const setLockTimeout = useAppStore((s) => s.setLockTimeout);
  const logout = useAuthStore((s) => s.logout);

  const [showPasscodeSetup, setShowPasscodeSetup] = useState(false);
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [codeStep, setCodeStep] = useState(1);
  const [codeError, setCodeError] = useState('');
  const [importStatus, setImportStatus] = useState(null);
  const fileRef = useRef(null);
  const [dailyLimitAmount, setDailyLimitAmount] = useState('');
  const [dailyLimitStrict, setDailyLimitStrict] = useState(false);
  const [showDailyLimit, setShowDailyLimit] = useState(false);

  // Load daily limit on mount via API
  useEffect(() => {
    getSetting('dailyLimit').then((dl) => {
      if (dl) {
        setDailyLimitAmount(dl.amount > 0 ? String(dl.amount) : '');
        setDailyLimitStrict(!!dl.isStrictMode);
      }
    }).catch(() => {});
  }, []);

  const currentCurrency = CURRENCIES.find((c) => c.code === currency) || CURRENCIES[0];

  const handlePasscodeToggle = () => {
    if (passcode) {
      setPasscode(null);
    } else {
      setShowPasscodeSetup(true);
      setNewCode('');
      setCodeStep(1);
      setCodeError('');
    }
  };

  const handlePasscodeSetupComplete = async (code) => {
    if (codeStep === 1) {
      setNewCode(code);
      setCodeStep(2);
      return true;
    } else {
      if (code === newCode) {
        await setPasscode(code);
        setShowPasscodeSetup(false);
        return true;
      } else {
        setCodeError('Passcodes do not match. Restarting...');
        setNewCode('');
        setCodeStep(1);
        return false;
      }
    }
  };

  const handleExportJSON = async () => {
    try {
      const data = await apiExportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `finora-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Export failed:', e);
    }
  };

  const handleExportCSV = async () => {
    try {
      const blob = await apiExportCsv();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `finora-transactions-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('CSV export failed:', e);
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const payload = JSON.parse(text);
      await apiImportData(payload);
      refreshAllData();
      setImportStatus('success');
      setTimeout(() => setImportStatus(null), 3000);
    } catch {
      setImportStatus('error');
      setTimeout(() => setImportStatus(null), 3000);
    }
    e.target.value = '';
  };

  const handleClearData = async () => {
    if (window.confirm('Are you absolutely sure you want to delete ALL data? This operation is permanent and cannot be undone.')) {
      try {
        await apiClearAllData();
      } catch (e) {
        console.error("Error clearing data:", e);
      }
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = window.location.origin + '/';
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="px-4 pt-5 pb-24 max-w-lg mx-auto bg-[var(--color-bg)] min-h-[100dvh]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 rounded-2xl min-w-touch min-h-touch flex items-center justify-center hover:bg-[var(--color-border)]/20 text-[var(--color-text)] transition-colors haptic"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-[17px] font-black tracking-tight text-[var(--color-text)]">Preferences</h1>
        <div className="w-10" />
      </div>

      <div className="space-y-6">
        {/* GENERAL SECTION */}
        <div>
          <p className="text-[11.5px] text-[var(--color-muted)] font-extrabold uppercase tracking-widest px-4 mb-2">General Settings</p>
          <div className="bg-[var(--color-card)] border border-[var(--color-border)]/45 rounded-3xl p-1.5 divide-y divide-[var(--color-border)]/35 shadow-sm">
            {/* Dark Mode Row */}
            <div className="flex items-center justify-between px-3 py-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-8.5 h-8.5 rounded-xl flex items-center justify-center text-white border"
                  style={{
                    backgroundColor: darkMode ? '#af52de' : '#ff9500',
                    borderColor: darkMode ? '#af52de35' : '#ff950035'
                  }}
                >
                  {darkMode ? <Moon className="w-4.5 h-4.5" /> : <Sun className="w-4.5 h-4.5" />}
                </div>
                <div>
                  <p className="text-[14px] font-bold text-[var(--color-text)]">Dark Interface</p>
                  <p className="text-[10px] text-[var(--color-muted)] font-semibold mt-0.5">Toggle interface appearance</p>
                </div>
              </div>
              <button
                onClick={toggleDarkMode}
                className={`w-12 h-7 rounded-full p-0.5 transition-colors duration-250 cursor-pointer outline-none relative flex items-center ${
                  darkMode ? 'gradient-primary justify-end' : 'bg-[var(--color-surface)] border border-[var(--color-border)]/65 justify-start'
                }`}
              >
                <motion.div
                  layout
                  className="w-5.5 h-5.5 rounded-full bg-white shadow-sm"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </button>
            </div>

            {/* Currency Row */}
            <button onClick={() => setShowCurrencyPicker(true)} className="w-full flex items-center justify-between px-3 py-3 haptic hover:bg-[var(--color-surface)]/20 transition-colors text-left outline-none">
              <div className="flex items-center gap-3">
                <div className="w-8.5 h-8.5 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/10">
                  <Globe className="w-4.5 h-4.5 text-emerald-500" strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-[14px] font-bold text-[var(--color-text)]">Base Currency</p>
                  <p className="text-[10px] text-[var(--color-muted)] font-semibold mt-0.5">Formatting and conversion rates</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[13.5px] font-extrabold text-[var(--color-primary)]">{currentCurrency.code}</span>
                <ChevronRight className="w-4.5 h-4.5 text-[var(--color-muted)]" />
              </div>
            </button>
          </div>
        </div>

        {/* SECURITY SECTION */}
        <div>
          <p className="text-[11.5px] text-[var(--color-muted)] font-extrabold uppercase tracking-widest px-4 mb-2">Privacy & Security</p>
          <div className="bg-[var(--color-card)] border border-[var(--color-border)]/45 rounded-3xl p-1.5 divide-y divide-[var(--color-border)]/35 shadow-sm">
            {/* Passcode Switch Row */}
            <div className="flex items-center justify-between px-3 py-3">
              <div className="flex items-center gap-3">
                <div className="w-8.5 h-8.5 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/10">
                  <Shield className="w-4.5 h-4.5 text-blue-500" strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-[14px] font-bold text-[var(--color-text)]">Passcode Lock</p>
                  <p className="text-[10px] text-[var(--color-muted)] font-semibold mt-0.5">Verify PIN when launching app</p>
                </div>
              </div>
              <button
                onClick={handlePasscodeToggle}
                className={`w-12 h-7 rounded-full p-0.5 transition-colors duration-250 cursor-pointer outline-none relative flex items-center ${
                  passcode ? 'gradient-primary justify-end' : 'bg-[var(--color-surface)] border border-[var(--color-border)]/65 justify-start'
                }`}
              >
                <motion.div
                  layout
                  className="w-5.5 h-5.5 rounded-full bg-white shadow-sm"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </button>
            </div>

            {passcode && (
              <>
                {/* Lock Mode Selector */}
                <div className="px-3 py-3.5 flex flex-col items-start gap-2.5">
                  <span className="text-[12px] text-[var(--color-muted)] font-extrabold uppercase tracking-wider">Lock Enforcement</span>
                  <div className="flex gap-1.5 w-full bg-[var(--color-surface)] border border-[var(--color-border)]/35 p-1 rounded-2xl">
                    {[
                      { key: 'always', label: 'Always', desc: 'Every time' },
                      { key: 'timed', label: 'Timed', desc: `${lockTimeout}m` },
                      { key: 'never', label: 'Never', desc: 'Manual only' },
                    ].map((mode) => (
                      <button
                        key={mode.key}
                        onClick={() => setLockMode(mode.key)}
                        className={`flex-1 py-2 rounded-xl text-[12px] font-bold transition-all haptic ${
                          lockMode === mode.key
                            ? 'bg-[var(--color-card)] text-[var(--color-text)] border border-[var(--color-border)]/45 shadow-sm'
                            : 'text-[var(--color-muted)]'
                        }`}
                      >
                        {mode.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Lock Timeout selector */}
                {lockMode === 'timed' && (
                  <div className="flex items-center justify-between px-3 py-3 text-left">
                    <div className="flex items-center gap-3">
                      <div className="w-8.5 h-8.5 rounded-xl bg-violet-500/10 flex items-center justify-center border border-violet-500/10">
                        <Clock className="w-4.5 h-4.5 text-violet-500" strokeWidth={2.5} />
                      </div>
                      <div>
                        <p className="text-[14px] font-bold text-[var(--color-text)]">Lock Timeout Duration</p>
                        <p className="text-[10px] text-[var(--color-muted)] font-semibold mt-0.5">Time to elapse before locking</p>
                      </div>
                    </div>
                    <select
                      value={lockTimeout}
                      onChange={(e) => setLockTimeout(parseInt(e.target.value))}
                      className="bg-[var(--color-surface)] border border-[var(--color-border)]/45 text-[13px] font-bold rounded-xl px-3 py-2 text-[var(--color-text)] outline-none"
                    >
                      <option value="1">1 Min</option>
                      <option value="5">5 Mins</option>
                      <option value="15">15 Mins</option>
                      <option value="30">30 Mins</option>
                      <option value="60">1 Hour</option>
                    </select>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* CONTROLS SECTION */}
        <div>
          <p className="text-[11.5px] text-[var(--color-muted)] font-extrabold uppercase tracking-widest px-4 mb-2">Controls & Limits</p>
          <div className="bg-[var(--color-card)] border border-[var(--color-border)]/45 rounded-3xl p-1.5 divide-y divide-[var(--color-border)]/35 shadow-sm">
            {/* Daily Limit trigger */}
            <button onClick={() => setShowDailyLimit(true)} className="w-full flex items-center justify-between px-3 py-3 haptic hover:bg-[var(--color-surface)]/20 transition-colors text-left outline-none">
              <div className="flex items-center gap-3">
                <div className="w-8.5 h-8.5 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/10">
                  <ShieldAlert className="w-4.5 h-4.5 text-orange-500" strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-[14px] font-bold text-[var(--color-text)]">Daily Spending Limit</p>
                  <p className="text-[10.5px] text-[var(--color-muted)] font-semibold mt-0.5">
                    {dailyLimitAmount ? `${currentCurrency.symbol}${dailyLimitAmount}/day${dailyLimitStrict ? ' (Strict Limit)' : ''}` : 'Not configured'}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4.5 h-4.5 text-[var(--color-muted)]" />
            </button>
          </div>
        </div>

        {/* DATA MANAGEMENT */}
        <div>
          <p className="text-[11.5px] text-[var(--color-muted)] font-extrabold uppercase tracking-widest px-4 mb-2">Backup & Data</p>
          <div className="bg-[var(--color-card)] border border-[var(--color-border)]/45 rounded-3xl p-1.5 divide-y divide-[var(--color-border)]/35 shadow-sm">
            {/* Export JSON */}
            <button onClick={handleExportJSON} className="w-full flex items-center justify-between px-3 py-3 haptic hover:bg-[var(--color-surface)]/20 transition-colors text-left outline-none">
              <div className="flex items-center gap-3">
                <div className="w-8.5 h-8.5 rounded-xl bg-sky-500/10 flex items-center justify-center border border-sky-500/10">
                  <Download className="w-4.5 h-4.5 text-sky-500" strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-[14px] font-bold text-[var(--color-text)]">Export Data Backup</p>
                  <p className="text-[10px] text-[var(--color-muted)] font-semibold mt-0.5">Download full JSON database dump</p>
                </div>
              </div>
              <ChevronRight className="w-4.5 h-4.5 text-[var(--color-muted)]" />
            </button>

            {/* Export CSV */}
            <button onClick={handleExportCSV} className="w-full flex items-center justify-between px-3 py-3 haptic hover:bg-[var(--color-surface)]/20 transition-colors text-left outline-none">
              <div className="flex items-center gap-3">
                <div className="w-8.5 h-8.5 rounded-xl bg-violet-500/10 flex items-center justify-center border border-violet-500/10">
                  <FileText className="w-4.5 h-4.5 text-violet-500" strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-[14px] font-bold text-[var(--color-text)]">Export CSV Spreadsheet</p>
                  <p className="text-[10px] text-[var(--color-muted)] font-semibold mt-0.5">Compatible with Excel or Sheets</p>
                </div>
              </div>
              <ChevronRight className="w-4.5 h-4.5 text-[var(--color-muted)]" />
            </button>

            {/* Import Data */}
            <button onClick={() => fileRef.current?.click()} className="w-full flex items-center justify-between px-3 py-3 haptic hover:bg-[var(--color-surface)]/20 transition-colors text-left outline-none">
              <div className="flex items-center gap-3">
                <div className="w-8.5 h-8.5 rounded-xl bg-green-500/10 flex items-center justify-center border border-green-500/10">
                  <Upload className="w-4.5 h-4.5 text-green-500" strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-[14px] font-bold text-[var(--color-text)]">Import JSON Backup</p>
                  <p className="text-[10px] text-[var(--color-muted)] font-semibold mt-0.5">Restore records from local backup</p>
                </div>
              </div>
              <ChevronRight className="w-4.5 h-4.5 text-[var(--color-muted)]" />
            </button>
            <input ref={fileRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
          </div>
        </div>

        {importStatus && (
          <p className={`text-[12px] text-center font-bold tracking-tight py-1 ${importStatus === 'success' ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'}`}>
            {importStatus === 'success' ? 'Import completed successfully! 🎉' : 'Failed to import JSON data.'}
          </p>
        )}

        {/* PROFILE SECTION */}
        <div>
          <p className="text-[11.5px] text-[var(--color-muted)] font-extrabold uppercase tracking-widest px-4 mb-2">Account Administration</p>
          <div className="bg-[var(--color-card)] border border-[var(--color-border)]/45 rounded-3xl p-1.5 shadow-sm">
            <button onClick={handleLogout} className="w-full flex items-center justify-between px-3 py-3 haptic hover:bg-[var(--color-surface)]/20 transition-colors text-left outline-none">
              <div className="flex items-center gap-3">
                <div className="w-8.5 h-8.5 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/10">
                  <LogOut className="w-4.5 h-4.5 text-orange-500" strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-[14px] font-bold text-[var(--color-text)]">Sign Out Session</p>
                  <p className="text-[10px] text-[var(--color-muted)] font-semibold mt-0.5">End active authentication state</p>
                </div>
              </div>
              <ChevronRight className="w-4.5 h-4.5 text-[var(--color-muted)]" />
            </button>
          </div>
        </div>

        {/* DANGER ZONE */}
        <div>
          <p className="text-[11.5px] text-[var(--color-danger)] font-extrabold uppercase tracking-widest px-4 mb-2">Danger Administration</p>
          <div className="bg-[var(--color-card)] border border-red-500/35 rounded-3xl p-1.5 shadow-sm">
            <button onClick={handleClearData} className="w-full flex items-center justify-between px-3 py-3 haptic hover:bg-red-500/5 transition-colors text-left outline-none">
              <div className="flex items-center gap-3">
                <div className="w-8.5 h-8.5 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/10">
                  <Trash2 className="w-4.5 h-4.5 text-red-500" strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-[14px] font-bold text-[var(--color-danger)]">Clear All Local Records</p>
                  <p className="text-[10px] text-[var(--color-muted)] font-semibold mt-0.5">Delete every single transaction history</p>
                </div>
              </div>
              <ChevronRight className="w-4.5 h-4.5 text-[var(--color-muted)]" />
            </button>
          </div>
        </div>

        <div className="text-center pt-4 pb-2 text-[11px] font-bold text-[var(--color-muted)] tracking-wider">
          <p>Finora Premium Fintech v2.0</p>
          <p className="opacity-70 mt-1 font-semibold">Protected under secure cookie encryption.</p>
        </div>
      </div>

      {/* Currency Bottom Sheet Selector */}
      <AnimatePresence>
        {showCurrencyPicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-end justify-center px-4"
            onClick={() => setShowCurrencyPicker(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[var(--color-card)] rounded-t-[32px] border-t border-[var(--color-border)]/40 w-full max-w-md p-5 pb-8 max-h-[72vh] overflow-y-auto z-110 shadow-2xl flex flex-col"
            >
              <div className="w-12 h-1 bg-[var(--color-border)]/70 rounded-full mx-auto mb-5" />
              <h3 className="text-[17px] font-black text-center text-[var(--color-text)] mb-4">
                Select Base Currency
              </h3>
              
              <div className="space-y-1.5">
                {CURRENCIES.map((cur) => (
                  <button
                    key={cur.code}
                    onClick={() => { setCurrency(cur.code); setShowCurrencyPicker(false); }}
                    className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl hover:bg-[var(--color-surface)]/25 transition-all text-left outline-none haptic ${
                      currency === cur.code ? 'bg-[var(--color-surface)] border border-[var(--color-border)]/45' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]/35 flex items-center justify-center text-[13.5px] font-black text-[var(--color-primary)]">
                        {cur.symbol}
                      </div>
                      <div>
                        <p className="text-[14px] font-bold text-[var(--color-text)]">{cur.name}</p>
                        <p className="text-[11px] text-[var(--color-muted)] font-semibold mt-0.5">{cur.code}</p>
                      </div>
                    </div>
                    {currency === cur.code && (
                      <div className="w-6 h-6 rounded-full bg-[var(--color-primary)] flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Daily Spending Limit Modal */}
      <AnimatePresence>
        {showDailyLimit && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={() => setShowDailyLimit(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[var(--color-card)] border border-[var(--color-border)]/55 rounded-3xl p-5 w-full max-w-sm shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-center mb-4">
                <div className="w-14 h-14 rounded-2xl bg-orange-500/10 flex items-center justify-center border border-orange-500/10">
                  <ShieldAlert className="w-7 h-7 text-orange-500" />
                </div>
              </div>
              <h3 className="text-[17px] font-black text-center text-[var(--color-text)] leading-tight mb-1">
                Daily Spend Limits
              </h3>
              <p className="text-[11.5px] text-[var(--color-muted)] text-center font-bold mb-4">
                Configure maximum daily allowances
              </p>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--color-muted)] px-1">Daily Cap Amount ({currentCurrency.symbol})</label>
                  <input
                    type="number"
                    step="any"
                    value={dailyLimitAmount}
                    onChange={(e) => setDailyLimitAmount(e.target.value)}
                    placeholder="Enter limit amount"
                    autoFocus
                    className="w-full px-4 py-3 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)]/45 text-[16px] font-extrabold text-center focus:outline-none text-[var(--color-text)]"
                  />
                </div>

                <div className="flex items-center justify-between px-3 py-3 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)]/35">
                  <div>
                    <p className="text-[13px] font-bold text-[var(--color-text)]">Strict Mode enforcement</p>
                    <p className="text-[10px] text-[var(--color-muted)] font-semibold mt-0.5">Reject transaction if limit is crossed</p>
                  </div>
                  <button
                    onClick={() => setDailyLimitStrict(!dailyLimitStrict)}
                    className={`w-11 h-6.5 rounded-full p-0.5 transition-colors duration-250 cursor-pointer outline-none relative flex items-center ${
                      dailyLimitStrict ? 'bg-[var(--color-danger)] justify-end' : 'bg-[var(--color-border)]/65 justify-start'
                    }`}
                  >
                    <motion.div
                      layout
                      className="w-5 h-5 rounded-full bg-white shadow-sm"
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  </button>
                </div>
                
                <div className="flex gap-3 mt-2">
                  <button
                    onClick={async () => {
                      await setSetting('dailyLimit', { amount: 0, isStrictMode: false });
                      refreshAllData();
                      setDailyLimitAmount('');
                      setDailyLimitStrict(false);
                      setShowDailyLimit(false);
                    }}
                    className="flex-1 py-3.5 rounded-2xl bg-red-500/10 border border-red-500/10 font-bold text-[13px] text-[var(--color-danger)] haptic"
                  >
                    Deactivate
                  </button>
                  <button
                    onClick={async () => {
                      const amount = parseFloat(dailyLimitAmount);
                      if (amount > 0) {
                        await setSetting('dailyLimit', { amount, isStrictMode: dailyLimitStrict });
                        refreshAllData();
                      }
                      setShowDailyLimit(false);
                    }}
                    disabled={!dailyLimitAmount || parseFloat(dailyLimitAmount) <= 0}
                    className="flex-1 py-3.5 rounded-2xl gradient-primary text-white font-extrabold text-[13px] disabled:opacity-50 haptic shadow-md"
                  >
                    Apply Cap
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Passcode PIN Setup Overlay */}
      <AnimatePresence>
        {showPasscodeSetup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={() => setShowPasscodeSetup(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[var(--color-card)] border border-[var(--color-border)]/55 rounded-3xl p-6 w-full max-w-sm shadow-2xl flex flex-col items-center"
            >
              <PasscodeInput
                title={codeStep === 1 ? 'Configure PIN' : 'Verify passcode'}
                subtitle={codeStep === 1 ? 'Select a secure 4-digit pin' : 'Confirm your newly chosen code'}
                onComplete={handlePasscodeSetupComplete}
                onCancel={() => setShowPasscodeSetup(false)}
              />
              {codeError && (
                <p className="text-[11px] text-[var(--color-danger)] font-bold text-center mt-3 animate-pulse">
                  {codeError}
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
