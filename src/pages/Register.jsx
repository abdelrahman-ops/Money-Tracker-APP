import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { useAppStore, CURRENCIES } from '../store/appStore';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Globe, Check } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const register = useAuthStore((s) => s.register);
  const isLoading = useAuthStore((s) => s.isLoading);
  const error = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);
  const darkMode = useAppStore((s) => s.darkMode);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [currency, setCurrency] = useState('EGP');
  const [showPassword, setShowPassword] = useState(false);
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();

    const result = await register(email, password, name, currency);
    if (result.success) {
      // Upon success, user will be redirected to /verify-email automatically via AuthGuard or App routing
      navigate('/verify-email', { replace: true });
    }
  };

  const selectedCurrency = CURRENCIES.find(c => c.code === currency) || CURRENCIES[0];

  return (
    <div className="min-h-[100dvh] bg-[var(--color-bg)] text-[var(--color-text)] flex flex-col items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="text-center mb-6">
          <img src={darkMode ? '/logo-blank.png' : '/logo-blank.png'} className="w-14 h-14 mx-auto mb-3 object-contain" alt="Finora Logo" />
          <h1 className="brand-logo mb-1">Finora</h1>
          <h2 className="text-[22px] font-bold tracking-tight">Create Account</h2>
          <p className="text-[13px] text-[var(--color-muted)] mt-1">
            Get started with your private finance tracker today
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-muted)]" />
            <input
              type="text"
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] text-[15px] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 transition-all"
            />
          </div>

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-muted)]" />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] text-[15px] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 transition-all"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-muted)]" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
              className="w-full pl-12 pr-12 py-4 rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] text-[15px] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5 text-[var(--color-muted)]" />
              ) : (
                <Eye className="w-5 h-5 text-[var(--color-muted)]" />
              )}
            </button>
          </div>

          {/* Currency Preference */}
          <button
            type="button"
            onClick={() => setShowCurrencyPicker(true)}
            className="w-full px-4 py-3.5 rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] text-[15px] flex items-center justify-between text-left active:bg-[var(--color-surface)] transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[var(--color-surface)] flex items-center justify-center text-xs font-bold text-[var(--color-primary)]">
                {selectedCurrency.symbol}
              </div>
              <div>
                <p className="text-[14px] font-medium">Default Currency</p>
                <p className="text-[11px] text-[var(--color-muted)]">{selectedCurrency.name}</p>
              </div>
            </div>
            <Globe className="w-4 h-4 text-[var(--color-muted)]" />
          </button>

          {/* Error */}
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[13px] text-[var(--color-danger)] text-center py-2 px-4 rounded-xl bg-[var(--color-danger)]/10"
            >
              {error}
            </motion.p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-[var(--color-primary)] to-purple-600 text-white font-bold text-[16px] flex items-center justify-center gap-2 shadow-lg shadow-[var(--color-primary)]/30 disabled:opacity-50 transition-all active:scale-[0.98]"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Create Account
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        {/* Toggle */}
        <p className="text-center text-[14px] text-[var(--color-muted)] mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-[var(--color-primary)] font-semibold">
            Sign In
          </Link>
        </p>
      </motion.div>

      {/* Currency Picker Modal */}
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
              <div className="overflow-y-auto max-h-[50vh] px-4">
                <div className="space-y-1 bg-[var(--color-card)] rounded-2xl overflow-hidden border border-[var(--color-border)]">
                  {CURRENCIES.map((cur) => (
                    <button
                      key={cur.code}
                      type="button"
                      onClick={() => { setCurrency(cur.code); setShowCurrencyPicker(false); }}
                      className="w-full flex items-center justify-between px-4 py-3.5 active:bg-[var(--color-surface)] border-b last:border-b-0 border-[var(--color-border)] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-[30px] h-[30px] rounded-lg bg-[var(--color-surface)] flex items-center justify-center text-xs font-bold text-[var(--color-primary)]">
                          {cur.symbol}
                        </div>
                        <div className="text-left">
                          <p className="text-[15px] font-normal">{cur.name}</p>
                          <p className="text-[12px] text-[var(--color-muted)]">{cur.code}</p>
                        </div>
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
    </div>
  );
}
