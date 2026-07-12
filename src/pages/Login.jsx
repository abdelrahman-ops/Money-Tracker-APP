import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { useAppStore } from '../store/appStore';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import clsx from 'clsx';

export default function Login() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const isLoading = useAuthStore((s) => s.isLoading);
  const error = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);
  const darkMode = useAppStore((s) => s.darkMode);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();

    const result = await login(email, password);
    if (result.success) {
      navigate('/', { replace: true });
    }
  };

  return (
    <div className={clsx('min-h-[100dvh]', 'bg-[var(--color-bg)]', 'text-[var(--color-text)]', 'flex', 'flex-col', 'items-center', 'justify-center', 'px-6')}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className={clsx('w-full', 'max-w-sm')}
      >
        {/* Logo */}
        <div className={clsx('text-center', 'mb-8')}>
          <img src={darkMode ? '/logo-blank.png' : '/logo-blank.png'} className={clsx('w-14', 'h-14', 'mx-auto', 'mb-3', 'object-contain')} alt="Finora Logo" />
          <h1 className={clsx('brand-logo')}>Finora</h1>
          <p className={clsx('text-[14px]', 'text-[var(--color-muted)]', 'mt-1')}>
            Welcome back to your personal finance dashboard
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <Mail className={clsx('absolute', 'left-4', 'top-1/2', '-translate-y-1/2', 'w-5', 'h-5', 'text-[var(--color-muted)]')} />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className={clsx('w-full', 'pl-12', 'pr-4', 'py-4', 'rounded-2xl', 'bg-[var(--color-card)]', 'border', 'border-[var(--color-border)]', 'text-[15px]', 'focus:outline-none', 'focus:ring-2', 'focus:ring-[var(--color-primary)]/40', 'transition-all')}
            />
          </div>

          <div className="relative">
            <Lock className={clsx('absolute', 'left-4', 'top-1/2', '-translate-y-1/2', 'w-5', 'h-5', 'text-[var(--color-muted)]')} />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="current-password"
              className={clsx('w-full', 'pl-12', 'pr-12', 'py-4', 'rounded-2xl', 'bg-[var(--color-card)]', 'border', 'border-[var(--color-border)]', 'text-[15px]', 'focus:outline-none', 'focus:ring-2', 'focus:ring-[var(--color-primary)]/40', 'transition-all')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={clsx('absolute', 'right-4', 'top-1/2', '-translate-y-1/2', 'p-1')}
            >
              {showPassword ? (
                <EyeOff className={clsx('w-5', 'h-5', 'text-[var(--color-muted)]')} />
              ) : (
                <Eye className={clsx('w-5', 'h-5', 'text-[var(--color-muted)]')} />
              )}
            </button>
          </div>

          {/* Error */}
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className={clsx('text-[13px]', 'text-[var(--color-danger)]', 'text-center', 'py-2', 'px-4', 'rounded-xl', 'bg-[var(--color-danger)]/10')}
            >
              {error}
            </motion.p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className={clsx('w-full', 'py-4', 'rounded-2xl', 'bg-gradient-to-r', 'from-[var(--color-primary)]', 'to-purple-600', 'text-white', 'font-bold', 'text-[16px]', 'flex', 'items-center', 'justify-center', 'gap-2', 'shadow-lg', 'shadow-[var(--color-primary)]/30', 'disabled:opacity-50', 'transition-all', 'active:scale-[0.98]')}
          >
            {isLoading ? (
              <div className={clsx('w-5', 'h-5', 'border-2', 'border-white/30', 'border-t-white', 'rounded-full', 'animate-spin')} />
            ) : (
              <>
                Sign In
                <ArrowRight className={clsx('w-5', 'h-5')} />
              </>
            )}
          </button>

          <div className="text-right">
            <Link to="/forgot-password" className={clsx('text-[13px]', 'text-[var(--color-primary)]', 'font-semibold')}>
              Forgot password?
            </Link>
          </div>
        </form>

        {/* Toggle */}
        <p className={clsx('text-center', 'text-[14px]', 'text-[var(--color-muted)]', 'mt-6')}>
          Don't have an account?{' '}
          <Link to="/register" className={clsx('text-[var(--color-primary)]', 'font-semibold')}>
            Sign Up
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

