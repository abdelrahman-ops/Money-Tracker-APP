import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, CalendarDays, Plus, Wallet, Settings } from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: Home, label: 'Home' },
  { to: '/calendar', icon: CalendarDays, label: 'History' },
  { to: '/add', icon: Plus, label: 'Add', isFab: true },
  { to: '/wallets', icon: Wallet, label: 'Wallets' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Layout() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-[100dvh]">
      <main className="flex-1 pb-24 safe-top">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 safe-bottom z-50 px-5 pb-4 pt-1.5 pointer-events-none">
        <div className="relative max-w-lg mx-auto flex items-center justify-between bg-[var(--color-card)]/90 backdrop-blur-xl border border-[var(--color-border)]/60 rounded-[22px] px-3 py-1.5 pointer-events-auto shadow-xl shadow-black/10 dark:shadow-black/25">
          {navItems.map((item) => {
            if (item.isFab) {
              return (
                <button
                  key={item.to}
                  onClick={() => navigate('/add')}
                  className="relative -mt-5 flex items-center justify-center w-[52px] h-[52px] rounded-full gradient-primary text-white shadow-lg shadow-blue-500/30 active:scale-90 transition-transform duration-150"
                >
                  <Plus className="w-6 h-6" strokeWidth={2.5} />
                </button>
              );
            }
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/dashboard'}
                className="flex flex-col items-center justify-center w-14 py-2 gap-0.5 transition-all duration-200 relative"
              >
                {({ isActive }) => (
                  <>
                    <item.icon
                      className={'w-[22px] h-[22px] transition-colors duration-200 ' +
                        (isActive ? 'text-[var(--color-primary)]' : 'text-[var(--color-muted)]')
                      }
                      strokeWidth={isActive ? 2.2 : 1.6}
                    />
                    <span className={'text-[10px] font-medium transition-colors duration-200 ' +
                      (isActive ? 'text-[var(--color-primary)]' : 'text-[var(--color-muted)]')
                    }>
                      {item.label}
                    </span>
                    {isActive && (
                      <motion.div
                        layoutId="nav-dot"
                        className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-[var(--color-primary)]"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
