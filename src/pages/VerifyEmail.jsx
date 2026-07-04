import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { authClient } from '../lib/auth-client';
import { Mail, ArrowLeft, LogOut, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function VerifyEmail() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const hydrate = useAuthStore((s) => s.hydrate);
  
  const [resendCooldown, setResendCooldown] = useState(0);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    // If not logged in, go to login
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }
    // If already verified, go to dashboard
    if (user.emailVerified) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  // Automatically check status when user focuses the tab
  useEffect(() => {
    const checkStatus = async () => {
      await hydrate();
    };
    window.addEventListener('focus', checkStatus);
    return () => window.removeEventListener('focus', checkStatus);
  }, [hydrate]);

  // Countdown timer for resend cooldown
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleCheckStatus = async () => {
    setIsChecking(true);
    setError('');
    try {
      await hydrate();
    } catch (err) {
      setError('Failed to check status. Please check your internet connection.');
    } finally {
      setIsChecking(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || isSending) return;
    setIsSending(true);
    setError('');
    setMessage('');

    try {
      const { error: resendError } = await authClient.sendVerificationEmail({
        email: user.email,
        callbackURL: window.location.origin + '/login',
      });

      if (resendError) {
        setError(resendError.message || 'Failed to send verification email.');
      } else {
        setMessage('Verification email sent! Please check your inbox.');
        setResendCooldown(60); // 60 seconds cooldown
      }
    } catch (err) {
      setError(err.message || 'An error occurred.');
    } finally {
      setIsSending(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  if (!user) return null;

  return (
    <div className="min-h-[100dvh] bg-[var(--color-bg)] text-[var(--color-text)] flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm text-center"
      >
        <div className="w-16 h-16 rounded-3xl bg-blue-500/10 flex items-center justify-center mx-auto mb-6">
          <Mail className="w-8 h-8 text-[var(--color-primary)] animate-pulse" />
        </div>

        <h1 className="text-[28px] font-bold tracking-tight mb-2">Verify Your Email</h1>
        <p className="text-[14px] text-[var(--color-muted)] mb-6 px-4">
          We've sent a verification link to <span className="font-semibold text-[var(--color-text)]">{user.email}</span>. Please verify your email to unlock your account.
        </p>

        <div className="space-y-3">
          <button
            onClick={handleCheckStatus}
            disabled={isChecking}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-[var(--color-primary)] to-purple-600 text-white font-bold text-[15px] shadow-lg shadow-[var(--color-primary)]/20 active:scale-[0.98] transition-transform duration-100 disabled:opacity-50"
          >
            {isChecking ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
            ) : (
              "I've Verified My Email"
            )}
          </button>

          <button
            onClick={handleResend}
            disabled={resendCooldown > 0 || isSending}
            className="w-full py-4 rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] text-white font-semibold text-[15px] active:bg-[var(--color-surface)] active:scale-[0.98] transition-transform"
          >
            {isSending ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
            ) : resendCooldown > 0 ? (
              `Resend in ${resendCooldown}s`
            ) : (
              'Resend Verification Email'
            )}
          </button>

          <button
            onClick={handleLogout}
            className="w-full py-4 rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] text-[var(--color-muted)] font-semibold text-[15px] flex items-center justify-center gap-2 active:bg-[var(--color-surface)] transition-all"
          >
            <LogOut className="w-4 h-4 text-[var(--color-muted)]" />
            Log Out / Change Email
          </button>
        </div>

        {error && (
          <p className="mt-4 text-[13px] text-[var(--color-danger)] py-2 px-4 rounded-xl bg-[var(--color-danger)]/10">
            {error}
          </p>
        )}

        {message && (
          <div className="mt-4 flex items-center justify-center gap-2 text-[13px] text-emerald-400 py-2 px-4 rounded-xl bg-emerald-500/10">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <p>{message}</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
