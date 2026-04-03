import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../store/appStore';
import { Lock, Delete } from 'lucide-react';

export default function LockScreen() {
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);
  const passcode = useAppStore((s) => s.passcode);
  const unlock = useAppStore((s) => s.unlock);

  const handleKey = useCallback((digit) => {
    if (code.length >= 4) return;
    const next = code + digit;
    setCode(next);
    setError(false);

    if (next.length === 4) {
      setTimeout(() => {
        if (next === passcode) {
          unlock();
        } else {
          setError(true);
          setCode('');
        }
      }, 150);
    }
  }, [code, passcode, unlock]);

  const handleDelete = useCallback(() => {
    setCode((prev) => prev.slice(0, -1));
    setError(false);
  }, []);

  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[var(--color-bg)] safe-top safe-bottom"
    >
      {/* Icon */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
        className="mb-8"
      >
        <div className="w-[72px] h-[72px] rounded-[22px] gradient-primary flex items-center justify-center shadow-lg shadow-blue-500/30">
          <Lock className="w-8 h-8 text-white" />
        </div>
      </motion.div>

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-center mb-8"
      >
        <h1 className="text-[22px] font-bold mb-1">Welcome Back</h1>
        <p className="text-[15px] text-[var(--color-muted)]">Enter your passcode</p>
      </motion.div>

      {/* Dots */}
      <div className="flex gap-5 mb-3 h-10 items-center">
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
          className="text-[13px] text-[var(--color-danger)] mb-4 font-medium"
        >
          Wrong passcode. Try again.
        </motion.p>
      )}

      {!error && <div className="h-9" />}

      {/* Keypad */}
      <div className="grid grid-cols-3 gap-[18px] w-[260px]">
        {keys.map((key, idx) => {
          if (key === '') return <div key={idx} />;
          if (key === 'del') {
            return (
              <button
                key={idx}
                onClick={handleDelete}
                className="w-[72px] h-[72px] rounded-full flex items-center justify-center mx-auto haptic"
              >
                <Delete className="w-6 h-6 text-[var(--color-muted)]" />
              </button>
            );
          }
          return (
            <motion.button
              key={idx}
              whileTap={{ scale: 0.88, backgroundColor: 'var(--color-border)' }}
              onClick={() => handleKey(key)}
              className="w-[72px] h-[72px] rounded-full bg-[var(--color-surface)] flex items-center justify-center mx-auto text-[24px] font-medium haptic"
            >
              {key}
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
