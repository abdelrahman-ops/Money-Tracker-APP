import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../utils/helpers';
import { useAppStore } from '../store/appStore';
import { useWalletStore } from '../store/walletStore';
import { Eye, EyeOff, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';
import LucideIcon from '../components/LucideIcon';
import StackedCards from '../components/StackedCards';

export default function Wallets() {
  const navigate = useNavigate();
  const accounts = useWalletStore((s) => s.wallets);
  const isLoading = useWalletStore((s) => s.isLoading);
  const totalBalance = accounts.reduce((sum, a) => sum + (a.balance || 0), 0);
  const balanceVisible = useAppStore((s) => s.balanceVisible);
  const toggleBalanceVisible = useAppStore((s) => s.toggleBalanceVisible);

  const masked = '••••••';

  if (isLoading && accounts.length === 0) {
    return (
      <div className="px-4 pt-5 pb-24 space-y-4">
        <div className="h-7 w-28 bg-[var(--color-surface)] rounded-full animate-pulse" />
        <div className="ios-card h-48 animate-pulse" />
        <div className="space-y-3">
          {[0,1,2].map(i => <div key={i} className="ios-card h-16 animate-pulse" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pt-5 pb-24">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-[28px] font-bold tracking-tight">Wallets</h1>
        <motion.button
          onClick={toggleBalanceVisible}
          className="p-2.5 rounded-2xl bg-[var(--color-card)] shadow-sm haptic active:scale-95 transition-transform"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {balanceVisible ? <Eye className="w-5 h-5 text-[var(--color-muted)]" /> : <EyeOff className="w-5 h-5 text-[var(--color-muted)]" />}
        </motion.button>
      </div>

      {accounts.length === 0 ? (
        <motion.div
          className="ios-card text-center py-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <div className="w-16 h-16 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center mx-auto mb-5">
            <CreditCard className="w-8 h-8 text-[var(--color-primary)] opacity-90" strokeWidth={2.5} />
          </div>
          <p className="text-[17px] font-bold mb-2">No accounts yet</p>
          <p className="text-[14px] text-[var(--color-muted)] mb-8 px-4 leading-relaxed">Add your first wallet to start tracking balances and cash flow.</p>
          <motion.button
            onClick={() => navigate('/wallet/new')}
            className="px-6 py-3.5 rounded-2xl gradient-primary text-white text-[15px] font-bold haptic shadow-sm"
            whileHover={{ scale: 1.02, opacity: 0.95 }}
            whileTap={{ scale: 0.98 }}
          >
            Create Account
          </motion.button>
        </motion.div>
      ) : (
        <>
          <StackedCards accounts={accounts} balanceVisible={balanceVisible} navigate={navigate} />

          {/* Premium Net Worth Card */}
          <motion.div
            className="rounded-[28px] bg-gradient-to-br from-[var(--color-card)] to-[var(--color-bg)] border border-[var(--color-border)] p-5 mb-6 mt-8 relative overflow-hidden shadow-sm"
            whileHover={{ scale: 1.01 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          >
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-[var(--color-primary)]/[0.04] rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -left-6 -bottom-6 w-24 h-24 bg-[var(--color-primary)]/[0.03] rounded-full blur-xl pointer-events-none" />

            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-[12px] text-[var(--color-muted)] font-semibold uppercase tracking-widest mb-1.5 opacity-80">Total Net Worth</p>
                <p className="text-[32px] font-extrabold tracking-tight leading-none text-transparent bg-clip-text bg-gradient-to-br from-[var(--color-text)] to-[var(--color-muted)]">
                  {balanceVisible ? formatCurrency(totalBalance) : masked}
                </p>
              </div>
              <div className="text-right flex flex-col items-end">
                <div className="w-8 h-8 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center mb-1">
                  <p className="text-[14px] font-bold text-[var(--color-primary)]">
                    {accounts.length}
                  </p>
                </div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-muted)] opacity-70">
                  {accounts.length === 1 ? 'Wallet' : 'Wallets'}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Account List */}
          <p className="text-[15px] font-bold tracking-tight mb-3 px-1 text-[var(--color-text)] opacity-90">All Accounts</p>
          <div className="space-y-3 pb-2">
            {accounts.map((account, index) => (
              <motion.div
                key={account._id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04, type: 'spring', stiffness: 400, damping: 35 }}
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/wallet/insights/' + account._id)}
                className="ios-card flex items-center gap-4 p-4 cursor-pointer border border-transparent hover:border-[var(--color-border)] transition-colors"
              >
                <div
                  className="w-11 h-11 rounded-[14px] flex items-center justify-center shrink-0 shadow-sm"
                  style={{ backgroundColor: (account.color || '#007AFF') + '15' }}
                >
                  <LucideIcon name={account.icon} className="w-5 h-5" style={{ color: account.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[16px] font-semibold truncate tracking-tight">{account.name}</p>
                  <p className="text-[13px] text-[var(--color-muted)] capitalize font-medium mt-0.5">{account.type}</p>
                </div>
                <p className="text-[16px] font-bold tracking-tight">
                  {balanceVisible ? formatCurrency(account.balance) : '••••'}
                </p>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}