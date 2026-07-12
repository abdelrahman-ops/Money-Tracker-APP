import { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { authClient } from '../lib/auth-client';

export default function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const token = useMemo(() => new URLSearchParams(location.search).get('token') || '', [location.search]);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!token) {
      setError('Missing reset token. Please use the link from your email.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error: resetError } = await authClient.resetPassword({
        newPassword: password,
        token: token,
      });

      if (resetError) {
        setError(resetError.message || 'Failed to reset password');
      } else {
        setSuccess('Password updated successfully. Redirecting to login...');
        setTimeout(() => navigate('/login', { replace: true }), 1200);
      }
    } catch (err) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="min-h-[100dvh] bg-[var(--color-bg)] text-[var(--color-text)] flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-[14px] text-[var(--color-muted)] mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to login
        </Link>

        <div className="mb-8">
          <h1 className="text-[30px] font-bold tracking-tight">Reset Password</h1>
          <p className="text-[14px] text-[var(--color-muted)] mt-2">
            Create a new password for your account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-muted)]" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
              className="w-full pl-12 pr-12 py-4 rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] text-base focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 transition-all"
            />
            <button
              type="button"
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1"
              onClick={() => setShowPassword((v) => !v)}
            >
              {showPassword ? <EyeOff className="w-5 h-5 text-[var(--color-muted)]" /> : <Eye className="w-5 h-5 text-[var(--color-muted)]" />}
            </button>
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-muted)]" />
            <input
              type={showConfirm ? 'text' : 'password'}
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
              className="w-full pl-12 pr-12 py-4 rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] text-base focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 transition-all"
            />
            <button
              type="button"
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1"
              onClick={() => setShowConfirm((v) => !v)}
            >
              {showConfirm ? <EyeOff className="w-5 h-5 text-[var(--color-muted)]" /> : <Eye className="w-5 h-5 text-[var(--color-muted)]" />}
            </button>
          </div>

          {error && (
            <p className="text-[13px] text-[var(--color-danger)] text-center py-2 px-4 rounded-xl bg-[var(--color-danger)]/10">
              {error}
            </p>
          )}

          {success && (
            <p className="text-[13px] text-emerald-400 text-center py-2 px-4 rounded-xl bg-emerald-500/10">
              {success}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-[var(--color-primary)] to-purple-600 text-white font-bold text-[16px] disabled:opacity-50 transition-all"
          >
            {isSubmitting ? 'Updating...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
