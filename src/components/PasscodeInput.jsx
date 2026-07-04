import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Delete, ShieldAlert } from 'lucide-react';
import { useAppStore } from '../store/appStore';

export default function PasscodeInput({ title, subtitle, onComplete, onCancel }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);
  const lockoutUntil = useAppStore((s) => s.lockoutUntil);
  const [lockoutTimeLeft, setLockoutTimeLeft] = useState(0);

  useEffect(() => {
    const checkLockout = () => {
      const now = Date.now();
      if (lockoutUntil && now < lockoutUntil) {
        setLockoutTimeLeft(Math.ceil((lockoutUntil - now) / 1000));
      } else {
        setLockoutTimeLeft(0);
      }
    };

    checkLockout();
    const interval = setInterval(checkLockout, 1000);
    return () => clearInterval(interval);
  }, [lockoutUntil]);

  const handleKey = (digit) => {
    if (lockoutTimeLeft > 0) return;
    if (code.length >= 4) return;
    const next = code + digit;
    setCode(next);
    setError(false);

    if (next.length === 4) {
      setTimeout(async () => {
        const success = await onComplete(next);
        if (success) {
          setCode('');
        } else {
          setError(true);
          setCode('');
        }
      }, 150);
    }
  };

  const handleDelete = () => {
    if (lockoutTimeLeft > 0) return;
    setCode((prev) => prev.slice(0, -1));
    setError(false);
  };

  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-xs mx-auto">
      {/* Lockout alert */}
      {lockoutTimeLeft > 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6 p-4 rounded-2xl bg-[var(--color-danger)]/10 text-[var(--color-danger)] text-center flex flex-col items-center gap-1.5"
        >
          <ShieldAlert className="w-6 h-6 animate-bounce" />
          <p className="text-[13px] font-semibold">Too many failed attempts</p>
          <p className="text-[11px] opacity-80">Keypad locked for {lockoutTimeLeft}s</p>
        </motion.div>
      ) : (
        <div className="text-center mb-6">
          {title && <h2 className="text-[20px] font-bold mb-1 tracking-tight">{title}</h2>}
          {subtitle && <p className="text-[13px] text-[var(--color-muted)]">{subtitle}</p>}
        </div>
      )}

      {/* PIN Dots */}
      <div className="flex gap-4 mb-6 h-6 items-center">
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            animate={error ? { x: [0, -10, 10, -10, 10, 0] } : {}}
            transition={{ duration: 0.4 }}
            className={`w-3.5 h-3.5 rounded-full transition-all duration-200 ${
              i < code.length
                ? error
                  ? 'bg-[var(--color-danger)] scale-110'
                  : 'bg-[var(--color-primary)] scale-110'
                : 'border-2 border-[var(--color-border)]'
            }`}
          />
        ))}
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[12px] text-[var(--color-danger)] mb-4 font-medium"
        >
          Incorrect passcode. Try again.
        </motion.p>
      )}

      {/* Keypad Grid */}
      <div className="grid grid-cols-3 gap-3 w-full">
        {keys.map((key, idx) => {
          if (key === '') return <div key={idx} />;
          if (key === 'del') {
            return (
              <button
                key={idx}
                onClick={handleDelete}
                disabled={lockoutTimeLeft > 0}
                className="h-14 rounded-2xl flex items-center justify-center active:bg-[var(--color-surface)] disabled:opacity-30 transition-colors haptic"
              >
                <Delete className="w-5 h-5 text-[var(--color-muted)]" />
              </button>
            );
          }
          return (
            <motion.button
              key={idx}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleKey(key)}
              disabled={lockoutTimeLeft > 0}
              className="h-14 rounded-2xl bg-[var(--color-surface)] flex items-center justify-center text-[22px] font-bold border border-[var(--color-border)]/50 active:bg-[var(--color-border)]/50 disabled:opacity-30 transition-colors haptic"
            >
              {key}
            </motion.button>
          );
        })}
      </div>

      {onCancel && lockoutTimeLeft === 0 && (
        <button
          onClick={onCancel}
          className="mt-6 text-[14px] font-semibold text-[var(--color-primary)] active:opacity-75 transition-opacity"
        >
          Cancel
        </button>
      )}
    </div>
  );
}
