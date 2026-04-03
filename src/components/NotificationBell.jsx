import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCheck } from 'lucide-react';
import { useNotificationStore } from '../store/notificationStore';
import LucideIcon from './LucideIcon';

/**
 * NotificationBell — Bell icon with unread badge.
 * On click: opens a clean top sheet that drops down smoothly.
 */
export default function NotificationBell() {
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const notifications = useNotificationStore((s) => s.notifications);
  const dropdownOpen = useNotificationStore((s) => s.dropdownOpen);
  const toggleDropdown = useNotificationStore((s) => s.toggleDropdown);
  const closeDropdown = useNotificationStore((s) => s.closeDropdown);
  const markAsRead = useNotificationStore((s) => s.markAsRead);
  const markAllAsRead = useNotificationStore((s) => s.markAllAsRead);

  const latest = useMemo(() => notifications.slice(0, 5), [notifications]);

  return (
    <>
      {/* Bell Button */}
      <button
        onClick={toggleDropdown}
        className="relative p-2.5 rounded-2xl bg-[var(--color-card)] min-w-touch min-h-touch flex items-center justify-center haptic ios-card"
      >
        <Bell className="w-5 h-5 text-[var(--color-muted)]" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-2 min-w-[18px] h-[18px] bg-[var(--color-primary)] rounded-full flex items-center justify-center shadow-sm shadow-[var(--color-primary)]/50">
            <span className="text-[10px] font-bold text-white leading-none">{unreadCount > 9 ? '9+' : unreadCount}</span>
          </span>
        )}
      </button>

      {/* Top Sheet Modal */}
      <AnimatePresence>
        {dropdownOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[80] flex items-start justify-center"
            onClick={(e) => {
              if (e.target === e.currentTarget) closeDropdown();
            }}
          >
            <motion.div
              initial={{ y: -80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -80, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 260 }}
              className="bg-[var(--color-card)] rounded-b-3xl w-full sm:max-w-md mx-auto flex flex-col max-h-[80vh] shadow-xl"
              style={{ paddingTop: 'env(safe-area-inset-top)' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-[var(--color-border)]">
                <h3 className="text-lg font-bold">Notifications</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="flex items-center gap-1.5 text-[13px] text-[var(--color-primary)] font-semibold px-3 py-1.5 rounded-xl bg-[var(--color-primary)]/10 active:scale-95 transition-transform"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    Read All
                  </button>
                )}
              </div>

              {/* Content */}
              <div className="overflow-y-auto flex-1 px-4 py-3">
                {latest.length === 0 ? (
                  <div className="py-10 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-[var(--color-surface)] flex items-center justify-center mx-auto mb-3">
                      <Bell className="w-7 h-7 text-[var(--color-muted)] opacity-40" />
                    </div>
                    <p className="text-[15px] font-semibold">All Clear!</p>
                    <p className="text-[13px] text-[var(--color-muted)]">No financial insights right now.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {latest.map((notif, i) => (
                      <motion.button
                        key={notif.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                        onClick={() => markAsRead(notif.id)}
                        className="flex items-center gap-3 w-full p-3 rounded-xl bg-[var(--color-surface)] active:scale-[0.97] transition-transform"
                      >
                        <div
                          className="w-[32px] h-[32px] rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: notif.color + '20' }}
                        >
                          <LucideIcon name={notif.icon} className="w-4 h-4" style={{ color: notif.color }} />
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <p className={`text-[14px] font-bold leading-snug mb-0.5 ${notif.isRead ? 'text-[var(--color-muted)]' : ''}`}>
                            {notif.title}
                          </p>
                          <p className="text-[12px] text-[var(--color-muted)] leading-relaxed">{notif.message}</p>
                        </div>
                        {!notif.isRead && (
                          <span className="w-2 h-2 rounded-full bg-[var(--color-primary)]" />
                        )}
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>

              {/* Handle */}
              <div className="w-10 h-1 bg-[var(--color-border)] rounded-full mx-auto my-3" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
