import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Info, AlertCircle, X } from 'lucide-react';
import { useNotificationStore } from '../store/notificationStore';
import LucideIcon from './LucideIcon';

const PRIORITY_CONFIG = {
  high: { icon: AlertCircle, bg: 'bg-red-500/90', fallbackColor: '#ef4444' },
  medium: { icon: AlertTriangle, bg: 'bg-amber-500/95', fallbackColor: '#f59e0b' },
  low: { icon: Info, bg: 'bg-blue-500/90', fallbackColor: '#3b82f6' },
};

/**
 * NotificationModal — Full half-screen modal that drops from top with blurred bg.
 * Shows up to 3 unshown notifications, auto-dismisses after 6s.
 */
export default function NotificationModal() {
  const notifications = useNotificationStore((s) => s.notifications);
  const markAsShown = useNotificationStore((s) => s.markAsShown);
  const markAsRead = useNotificationStore((s) => s.markAsRead);
  const timerRef = useRef(null);

  // Get unshown, unread notifications (up to 3)
  const unshown = notifications.filter(n => !n.shownInModal && !n.isRead).slice(0, 3);
  const isVisible = unshown.length > 0;

  // Auto-dismiss all shown notifications after 6 seconds
  useEffect(() => {
    if (!isVisible) return;

    // Mark them as shown immediately
    unshown.forEach(n => markAsShown(n.id));

    timerRef.current = setTimeout(() => {
      unshown.forEach(n => markAsRead(n.id));
    }, 6000);

    return () => clearTimeout(timerRef.current);
  }, [isVisible, unshown.map(n => n.id).join(',')]);

  const dismissAll = () => {
    clearTimeout(timerRef.current);
    unshown.forEach(n => markAsRead(n.id));
  };

  const dismissOne = (id) => {
    markAsRead(id);
    // If it was the last one, clear the timer
    if (unshown.length <= 1) {
      clearTimeout(timerRef.current);
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Blurred backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[490] bg-black/30 backdrop-blur-sm"
            onClick={dismissAll}
          />

          {/* Modal container — drops from top, covers ~half screen */}
          <motion.div
            initial={{ opacity: 0, y: '-100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '-100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className="fixed top-0 left-0 right-0 z-[500] max-h-[55dvh] overflow-y-auto"
          >
            <div className="bg-[var(--color-bg)]/80 backdrop-blur-xl rounded-b-3xl shadow-2xl border-b border-[var(--color-border)] px-4 pt-safe pb-6">
              {/* Header */}
              <div className="flex items-center justify-between pt-4 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[var(--color-primary)] rounded-full animate-pulse" />
                  <p className="text-[15px] font-bold text-[var(--color-text)]">
                    {unshown.length} New Notification{unshown.length > 1 ? 's' : ''}
                  </p>
                </div>
                <button
                  onClick={dismissAll}
                  className="p-2 rounded-xl bg-[var(--color-surface)] haptic active:scale-95 transition-transform"
                >
                  <X className="w-4 h-4 text-[var(--color-muted)]" />
                </button>
              </div>

              {/* Notification cards */}
              <div className="flex flex-col gap-2.5">
                {unshown.map((item, index) => {
                  const config = PRIORITY_CONFIG[item.priority] || PRIORITY_CONFIG.low;
                  const isHighPriority = item.priority === 'high';

                  return (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: -40, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -20, scale: 0.95 }}
                      transition={{ type: 'spring', damping: 25, stiffness: 300, delay: index * 0.08 }}
                      className={`${isHighPriority ? config.bg : 'bg-[var(--color-card)]/95 border border-[var(--color-border)]'} 
                        backdrop-blur-xl rounded-2xl p-4 w-full shadow-2xl flex items-start gap-3 pointer-events-auto cursor-pointer`}
                      onClick={() => dismissOne(item.id)}
                      drag="y"
                      dragConstraints={{ top: 0, bottom: 0 }}
                      onDragEnd={(_, info) => {
                        if (info.offset.y < -20) dismissOne(item.id);
                      }}
                    >
                      {isHighPriority ? (
                        /* High priority: white icon on colored bg */
                        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                          <LucideIcon name={item.icon} className="w-5 h-5 text-white" />
                        </div>
                      ) : (
                        /* Medium/Low: tinted icon */
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                          style={{ backgroundColor: item.color + '15' }}
                        >
                          <LucideIcon name={item.icon} className="w-5 h-5" style={{ color: item.color }} />
                        </div>
                      )}

                      <div className="flex-1 min-w-0 pt-0.5">
                        <div className="flex items-center justify-between mb-0.5">
                          <p className={`text-[14px] font-bold ${isHighPriority ? 'text-white' : 'text-[var(--color-text)]'}`}>
                            {item.title}
                          </p>
                          {item.priority === 'high' && !isHighPriority && (
                            <span className="w-2 h-2 rounded-full bg-[var(--color-danger)]" />
                          )}
                        </div>
                        <p className={`text-[13px] leading-snug ${isHighPriority ? 'text-white/90' : 'text-[var(--color-muted)]'}`}>
                          {item.message}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Auto-dismiss progress bar */}
              <motion.div
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: 6, ease: 'linear' }}
                className="h-1 rounded-full mt-4 bg-[var(--color-primary)]/40"
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
