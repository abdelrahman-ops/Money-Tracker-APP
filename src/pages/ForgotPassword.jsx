import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import { requestPasswordReset } from '../services/authService';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setIsSubmitting(true);

    try {
      const data = await requestPasswordReset(email);
      setResult(data || { message: 'If the email exists, a reset link has been sent.' });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to request password reset');
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
          <h1 className="text-[30px] font-bold tracking-tight">Forgot Password</h1>
          <p className="text-[14px] text-[var(--color-muted)] mt-2">
            Enter your email and we will send you a reset link.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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

          {error && (
            <p className="text-[13px] text-[var(--color-danger)] text-center py-2 px-4 rounded-xl bg-[var(--color-danger)]/10">
              {error}
            </p>
          )}

          {result?.message && (
            <div className="text-[13px] text-emerald-400 text-center py-2 px-4 rounded-xl bg-emerald-500/10 space-y-2">
              <p>{result.message}</p>
              {result.debugResetUrl && (
                <a href={result.debugResetUrl} className="underline break-all" target="_blank" rel="noreferrer">
                  Open reset link (dev)
                </a>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-[var(--color-primary)] to-purple-600 text-white font-bold text-[16px] disabled:opacity-50 transition-all"
          >
            {isSubmitting ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
      </div>
    </div>
  );
}
