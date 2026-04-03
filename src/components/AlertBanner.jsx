import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Info, AlertCircle, X } from 'lucide-react';

const SEVERITY_CONFIG = {
  info: { icon: Info, bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', iconColor: '#3b82f6' },
  warning: { icon: AlertTriangle, bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', iconColor: '#f59e0b' },
  critical: { icon: AlertCircle, bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', iconColor: '#ef4444' },
};

export default function AlertBanner({ alerts = [], onDismiss, onDismissAll }) {
  if (!alerts || alerts.length === 0) return null;

  return (
    <div className="space-y-2 mb-4">
      <AnimatePresence>
        {alerts.slice(0, 3).map((alert) => {
          const config = SEVERITY_CONFIG[alert.severity] || SEVERITY_CONFIG.info;
          const Icon = config.icon;

          return (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.9 }}
              className={`${config.bg} border ${config.border} rounded-2xl p-3.5 flex items-start gap-3`}
            >
              <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: config.iconColor + '20' }}>
                <Icon className="w-4 h-4" style={{ color: config.iconColor }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-[13px] font-semibold ${config.text}`}>
                  {alert.type === 'budget_exceeded' ? 'Budget Exceeded' :
                   alert.type === 'budget_warning' ? 'Budget Warning' :
                   alert.type === 'spending_spike' ? 'Spending Alert' :
                   alert.type === 'daily_limit' ? 'Daily Limit' : 'Alert'}
                </p>
                <p className="text-[12px] text-[var(--color-muted)] mt-0.5 leading-snug">{alert.message}</p>
              </div>
              {onDismiss && (
                <button
                  onClick={() => onDismiss(alert.id)}
                  className="p-1.5 rounded-lg active:bg-[var(--color-surface)] transition-colors shrink-0"
                >
                  <X className="w-3.5 h-3.5 text-[var(--color-muted)]" />
                </button>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
      {alerts.length > 3 && (
        <button
          onClick={onDismissAll}
          className="text-[12px] text-[var(--color-primary)] font-semibold px-2 py-1"
        >
          Dismiss all ({alerts.length - 3} more)
        </button>
      )}
    </div>
  );
}
