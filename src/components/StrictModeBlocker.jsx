import { motion } from 'framer-motion';
import { ShieldAlert, X } from 'lucide-react';
import { formatCurrency } from '../utils/helpers';

export default function StrictModeBlocker({ limitCheck, onDismiss, onOverride }) {
  if (!limitCheck || limitCheck.allowed) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-md z-[90] flex items-center justify-center p-6"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="bg-[var(--color-card)] rounded-3xl p-6 w-full max-w-sm text-center"
      >
        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-8 h-8 text-red-500" />
        </div>

        <h3 className="text-xl font-bold mb-2 text-[var(--color-danger)]">Spending Blocked</h3>
        <p className="text-[14px] text-[var(--color-muted)] mb-4 leading-relaxed">
          Strict mode is active. You've reached your daily spending limit of{' '}
          <span className="font-bold text-[var(--color-text)]">{formatCurrency(limitCheck.limit)}</span>.
        </p>

        <div className="bg-[var(--color-surface)] rounded-2xl p-4 mb-5">
          <div className="flex justify-between text-[13px] mb-2">
            <span className="text-[var(--color-muted)]">Today's spending</span>
            <span className="font-bold text-[var(--color-danger)]">{formatCurrency(limitCheck.todayTotal)}</span>
          </div>
          <div className="flex justify-between text-[13px] mb-3">
            <span className="text-[var(--color-muted)]">Daily limit</span>
            <span className="font-bold">{formatCurrency(limitCheck.limit)}</span>
          </div>
          <div className="h-2.5 bg-[var(--color-bg)] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: Math.min(limitCheck.pct, 100) + '%' }}
              transition={{ duration: 0.6 }}
              className="h-full rounded-full bg-[var(--color-danger)]"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onDismiss}
            className="flex-1 py-3.5 rounded-2xl gradient-primary text-white font-bold text-[15px] active:scale-[0.98] transition-transform"
          >
            Go Back
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
