import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore, CURRENCIES } from '../store/appStore';
import { useAuthStore } from '../store/authStore';
import { exportData as apiExportData, exportCsv as apiExportCsv, importData as apiImportData, clearAllData as apiClearAllData, getSetting, setSetting } from '../services/apiServices';
import {
  Moon, Sun, Lock, Shield, Download, Upload, FileText, Trash2,
  ChevronRight, Globe, Palette, Info, Repeat, Check, Target, Users,
  HandCoins, Clock, ShieldAlert, Gauge, LogOut
} from 'lucide-react';
import { refreshAllData } from '../utils/refreshData';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [confirmCode, setConfirmCode] = useState('');
  const [codeStep, setCodeStep] = useState(1);
  const [codeError, setCodeError] = useState('');
  const [importStatus, setImportStatus] = useState(null);
  const fileRef = useRef(null);
  const [dailyLimitAmount, setDailyLimitAmount] = useState('');
  const [dailyLimitStrict, setDailyLimitStrict] = useState(false);
  const [showDailyLimit, setShowDailyLimit] = useState(false);

  // Load daily limit on mount via API
  useState(() => {
    getSetting('dailyLimit').then((dl) => {
      if (dl) {
        setDailyLimitAmount(dl.amount > 0 ? String(dl.amount) : '');
        setDailyLimitStrict(!!dl.isStrictMode);
      }
    }).catch(() => {});
  });

  const currentCurrency = CURRENCIES.find((c) => c.code === currency) || CURRENCIES[0];

  const handlePasscodeToggle = () => {
    if (passcode) {
      setPasscode(null);
    } else {
      setShowPasscodeSetup(true);
      setNewCode('');
      setConfirmCode('');
      setCodeStep(1);
      setCodeError('');
    }
  };

  const handleCodeDigit = (digit) => {
    if (codeStep === 1) {
      if (newCode.length < 4) {
        const next = newCode + digit;
        setNewCode(next);
        if (next.length === 4) setTimeout(() => setCodeStep(2), 200);
      }
    } else {
      if (confirmCode.length < 4) {
        const next = confirmCode + digit;
        setConfirmCode(next);
        if (next.length === 4) {
          if (next === newCode) {
            setPasscode(next);
            setShowPasscodeSetup(false);
          } else {
            setCodeError('Codes do not match');
            setConfirmCode('');
          }
        }
      }
    }
  };

  const handleCodeDelete = () => {
    setCodeError('');
    if (codeStep === 1) setNewCode((p) => p.slice(0, -1));
    else setConfirmCode((p) => p.slice(0, -1));
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
      refreshAllData(); // <== Added this!
      setImportStatus('success');
      setTimeout(() => setImportStatus(null), 3000);
    } catch {
      setImportStatus('error');
      setTimeout(() => setImportStatus(null), 3000);
    }
    e.target.value = '';
  };

  const handleClearData = async () => {
    if (window.confirm('Delete ALL data? This cannot be undone.')) {
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

  const currentCode = codeStep === 1 ? newCode : confirmCode;
  const setupKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];

  return (
    <div className="px-4 pt-5">
      <h1 className="text-[28px] font-bold tracking-tight mb-6">Settings</h1>

      {/* GENERAL */}
      <p className="ios-section-header">General</p>
      <div className="ios-section mb-6">
        <button onClick={toggleDarkMode} className="ios-section-item w-full">
          <div className="w-[30px] h-[30px] rounded-lg flex items-center justify-center" style={{ backgroundColor: darkMode ? '#5856d6' : '#ff9500' }}>
            {darkMode ? <Moon className="w-4 h-4 text-white" /> : <Sun className="w-4 h-4 text-white" />}
          </div>
          <div className="flex-1 text-left">
            <p className="text-[15px] font-normal">Dark Mode</p>
          </div>
          <div className={`ios-toggle ${darkMode ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-border)]'}`}>
            <div className={`ios-toggle-knob ${darkMode ? 'translate-x-[22px]' : 'translate-x-[2px]'}`} />
          </div>
        </button>

        <button onClick={() => setShowCurrencyPicker(true)} className="ios-section-item w-full">
          <div className="w-[30px] h-[30px] rounded-lg bg-[#30d158] flex items-center justify-center">
            <Globe className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-[15px] font-normal">Currency</p>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[15px] text-[var(--color-muted)]">{currentCurrency.code}</span>
            <ChevronRight className="w-4 h-4 text-[var(--color-muted)]" />
          </div>
        </button>
      </div>

      {/* SECURITY */}
      <p className="ios-section-header">Security</p>
      <div className="ios-section mb-6">
        <button onClick={handlePasscodeToggle} className="ios-section-item w-full">
          <div className="w-[30px] h-[30px] rounded-lg bg-[#ff453a] flex items-center justify-center">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-[15px] font-normal">Passcode Lock</p>
          </div>
          <div className={`ios-toggle ${passcode ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-border)]'}`}>
            <div className={`ios-toggle-knob ${passcode ? 'translate-x-[22px]' : 'translate-x-[2px]'}`} />
          </div>
        </button>

        {passcode && (
          <>
            <div className="ios-section-item w-full flex-col items-start gap-2">
              <p className="text-[13px] text-[var(--color-muted)] font-medium">Lock Mode</p>
              <div className="flex gap-1.5 w-full">
                {[
                  { key: 'always', label: 'Always', desc: 'Every time' },
                  { key: 'timed', label: 'After Time', desc: `${lockTimeout}m` },
                  { key: 'never', label: 'Never', desc: 'Manual only' },
                ].map((mode) => (
                  <button
                    key={mode.key}
                    onClick={() => setLockMode(mode.key)}
                    className={'flex-1 py-2 rounded-xl text-[12px] font-semibold transition-all ' +
                      (lockMode === mode.key
                        ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)] ring-1 ring-[var(--color-primary)]/30'
                        : 'bg-[var(--color-surface)] text-[var(--color-muted)]')
                    }
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>

            {lockMode === 'timed' && (
              <div className="ios-section-item w-full">
                <div className="w-[30px] h-[30px] rounded-lg bg-[#5856d6] flex items-center justify-center">
                  <Clock className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-[15px] font-normal">Lock After</p>
                </div>
                <select
                  value={lockTimeout}
                  onChange={(e) => setLockTimeout(parseInt(e.target.value))}
                  className="bg-[var(--color-surface)] rounded-lg px-2 py-1 text-[14px]"
                >
                  <option value="1">1 min</option>
                  <option value="5">5 min</option>
                  <option value="15">15 min</option>
                  <option value="30">30 min</option>
                  <option value="60">1 hour</option>
                </select>
              </div>
            )}
          </>
        )}
      </div>

      {/* BEHAVIOR */}
      <p className="ios-section-header">Behavior Control</p>
      <div className="ios-section mb-6">
        <button onClick={() => setShowDailyLimit(true)} className="ios-section-item w-full">
          <div className="w-[30px] h-[30px] rounded-lg bg-[#ff9500] flex items-center justify-center">
            <ShieldAlert className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-[15px] font-normal">Daily Spending Limit</p>
            <p className="text-[12px] text-[var(--color-muted)]">
              {dailyLimitAmount ? `${dailyLimitAmount}/day${dailyLimitStrict ? ' (strict)' : ''}` : 'Not set'}
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-[var(--color-muted)]" />
        </button>
      </div>

      {/* FEATURES */}
      <p className="ios-section-header">Features</p>
      <div className="ios-section mb-6">
        <button onClick={() => navigate('/templates')} className="ios-section-item w-full">
          <div className="w-[30px] h-[30px] rounded-lg bg-[#af52de] flex items-center justify-center">
            <Repeat className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-[15px] font-normal">Templates</p>
          </div>
          <ChevronRight className="w-4 h-4 text-[var(--color-muted)]" />
        </button>
        <button onClick={() => navigate('/savings')} className="ios-section-item w-full">
          <div className="w-[30px] h-[30px] rounded-lg bg-[#34c759] flex items-center justify-center">
            <HandCoins className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-[15px] font-normal">Savings Goals</p>
          </div>
          <ChevronRight className="w-4 h-4 text-[var(--color-muted)]" />
        </button>
        <button onClick={() => navigate('/debts')} className="ios-section-item w-full">
          <div className="w-[30px] h-[30px] rounded-lg bg-[#ff453a] flex items-center justify-center">
            <Users className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-[15px] font-normal">Debt Tracker</p>
          </div>
          <ChevronRight className="w-4 h-4 text-[var(--color-muted)]" />
        </button>
      </div>

      {/* DATA */}
      <p className="ios-section-header">Data</p>
      <div className="ios-section mb-6">
        <button onClick={handleExportJSON} className="ios-section-item w-full">
          <div className="w-[30px] h-[30px] rounded-lg bg-[#007aff] flex items-center justify-center">
            <Download className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-[15px] font-normal">Export JSON</p>
            <p className="text-[12px] text-[var(--color-muted)]">Full backup</p>
          </div>
          <ChevronRight className="w-4 h-4 text-[var(--color-muted)]" />
        </button>

        <button onClick={handleExportCSV} className="ios-section-item w-full">
          <div className="w-[30px] h-[30px] rounded-lg bg-[#5856d6] flex items-center justify-center">
            <FileText className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-[15px] font-normal">Export CSV</p>
            <p className="text-[12px] text-[var(--color-muted)]">Spreadsheet format</p>
          </div>
          <ChevronRight className="w-4 h-4 text-[var(--color-muted)]" />
        </button>

        <button onClick={() => fileRef.current?.click()} className="ios-section-item w-full">
          <div className="w-[30px] h-[30px] rounded-lg bg-[#34c759] flex items-center justify-center">
            <Upload className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-[15px] font-normal">Import Data</p>
            <p className="text-[12px] text-[var(--color-muted)]">Restore from backup</p>
          </div>
          <ChevronRight className="w-4 h-4 text-[var(--color-muted)]" />
        </button>
        <input ref={fileRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
      </div>

      {importStatus && (
        <p className={'text-xs text-center py-1 mb-4 ' + (importStatus === 'success' ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]')}>
          {importStatus === 'success' ? 'Import successful!' : 'Import failed'}
        </p>
      )}

      {/* ACCOUNT */}
      <p className="ios-section-header">Account</p>
      <div className="ios-section mb-6">
        <button onClick={handleLogout} className="ios-section-item w-full">
          <div className="w-[30px] h-[30px] rounded-lg bg-[#ff9500] flex items-center justify-center">
            <LogOut className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-[15px] font-normal">Log Out</p>
          </div>
          <ChevronRight className="w-4 h-4 text-[var(--color-muted)]" />
        </button>
      </div>

      {/* DANGER */}
      <p className="ios-section-header !text-[var(--color-danger)]">Danger Zone</p>
      <div className="ios-section mb-8">
        <button onClick={handleClearData} className="ios-section-item w-full">
          <div className="w-[30px] h-[30px] rounded-lg bg-[#ff453a] flex items-center justify-center">
            <Trash2 className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-[15px] font-normal text-[var(--color-danger)]">Clear All Data</p>
            <p className="text-[12px] text-[var(--color-muted)]">Delete everything permanently</p>
          </div>
        </button>
      </div>

      <div className="text-center mb-8 pb-4">
        <p className="text-[12px] text-[var(--color-muted)]">Finora v2.0</p>
        <p className="text-[11px] text-[var(--color-muted)] mt-0.5">Made with care</p>
      </div>

      {/* Currency Picker */}
      <AnimatePresence>
        {showCurrencyPicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[80] flex items-end justify-center"
            onClick={() => setShowCurrencyPicker(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[var(--color-card)] rounded-t-3xl w-full max-w-lg pb-8 max-h-[70vh]"
            >
              <div className="w-10 h-1 bg-[var(--color-border)] rounded-full mx-auto mt-3 mb-4" />
              <h3 className="text-lg font-bold text-center mb-4">Select Currency</h3>
              <div className="overflow-y-auto max-h-[50vh]">
                <div className="ios-section mx-4">
                  {CURRENCIES.map((cur) => (
                    <button
                      key={cur.code}
                      onClick={() => { setCurrency(cur.code); setShowCurrencyPicker(false); }}
                      className="ios-section-item w-full"
                    >
                      <div className="w-[30px] h-[30px] rounded-lg bg-[var(--color-surface)] flex items-center justify-center text-xs font-bold text-[var(--color-primary)]">
                        {cur.symbol}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-[15px] font-normal">{cur.name}</p>
                        <p className="text-[12px] text-[var(--color-muted)]">{cur.code}</p>
                      </div>
                      {currency === cur.code && (
                        <Check className="w-5 h-5 text-[var(--color-primary)]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Passcode Setup Modal */}
      <AnimatePresence>
        {showPasscodeSetup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[80] flex items-center justify-center p-4"
            onClick={() => setShowPasscodeSetup(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[var(--color-card)] rounded-3xl p-6 w-full max-w-xs"
            >
              <h3 className="text-lg font-bold text-center mb-1">
                {codeStep === 1 ? 'Set Passcode' : 'Confirm Passcode'}
              </h3>
              <p className="text-xs text-[var(--color-muted)] text-center mb-4">
                {codeStep === 1 ? 'Enter a 4-digit code' : 'Re-enter your code'}
              </p>

              <div className="flex justify-center gap-3 mb-4">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className={'w-3.5 h-3.5 rounded-full transition-all ' + (i < currentCode.length ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-border)]')} />
                ))}
              </div>
              {codeError && <p className="text-xs text-[var(--color-danger)] text-center mb-2">{codeError}</p>}

              <div className="grid grid-cols-3 gap-2">
                {setupKeys.map((key, idx) => {
                  if (key === '') return <div key={idx} />;
                  if (key === 'del') return (
                    <button key={idx} onClick={handleCodeDelete} className="h-12 rounded-2xl flex items-center justify-center text-sm text-[var(--color-muted)] active:bg-[var(--color-surface)]">DEL</button>
                  );
                  return (
                    <button key={idx} onClick={() => handleCodeDigit(key)} className="h-12 rounded-2xl bg-[var(--color-surface)] text-base font-semibold active:bg-[var(--color-border)] transition-colors">{key}</button>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Daily Limit Modal */}
      <AnimatePresence>
        {showDailyLimit && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[80] flex items-center justify-center p-4"
            onClick={() => setShowDailyLimit(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[var(--color-card)] rounded-3xl p-6 w-full max-w-xs"
            >
              <div className="flex items-center justify-center mb-4">
                <div className="w-14 h-14 rounded-full bg-orange-500/10 flex items-center justify-center">
                  <ShieldAlert className="w-7 h-7 text-orange-500" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-center mb-1">Daily Spending Limit</h3>
              <p className="text-xs text-[var(--color-muted)] text-center mb-5">
                Set a maximum daily spending amount
              </p>

              <input
                type="number"
                value={dailyLimitAmount}
                onChange={(e) => setDailyLimitAmount(e.target.value)}
                placeholder="Amount per day"
                autoFocus
                className="w-full px-4 py-3 rounded-2xl bg-[var(--color-surface)] text-[17px] font-semibold text-center focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 mb-4"
              />

              <button
                onClick={() => setDailyLimitStrict(!dailyLimitStrict)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-[var(--color-surface)] mb-4"
              >
                <div>
                  <p className="text-[14px] font-medium text-left">Strict Mode</p>
                  <p className="text-[11px] text-[var(--color-muted)] text-left">Block transactions when limit is exceeded</p>
                </div>
                <div className={`ios-toggle ${dailyLimitStrict ? 'bg-[var(--color-danger)]' : 'bg-[var(--color-border)]'}`}>
                  <div className={`ios-toggle-knob ${dailyLimitStrict ? 'translate-x-[22px]' : 'translate-x-[2px]'}`} />
                </div>
              </button>

              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    await setSetting('dailyLimit', { amount: 0, isStrictMode: false });
                    refreshAllData(); // <== Added this!
                    setDailyLimitAmount('');
                    setDailyLimitStrict(false);
                    setShowDailyLimit(false);
                  }}
                  className="flex-1 py-3 rounded-2xl bg-[var(--color-surface)] text-[var(--color-danger)] font-semibold text-[14px]"
                >
                  Remove
                </button>
                <button
                  onClick={async () => {
                    const amount = parseFloat(dailyLimitAmount);
                    if (amount > 0) {
                      await setSetting('dailyLimit', { amount, isStrictMode: dailyLimitStrict });
                      refreshAllData(); // <== Added this!
                    }
                    setShowDailyLimit(false);
                  }}
                  disabled={!dailyLimitAmount || parseFloat(dailyLimitAmount) <= 0}
                  className="flex-1 py-3 rounded-2xl gradient-primary text-white font-semibold text-[14px] disabled:opacity-50"
                >
                  Save
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
