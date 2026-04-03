import { motion } from 'framer-motion';
import { ChevronRight, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../../../utils/helpers';
import LucideIcon from '../../../components/LucideIcon'; // Assuming this imports properly

export default function AccountsCarousel({ accounts, balanceVisible }) {
  const navigate = useNavigate();

  if (!accounts || accounts.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-[17px] font-bold">Accounts</h2>
        </div>
        <button
          onClick={() => navigate('/wallets')}
          className="text-[13px] text-[var(--color-primary)] font-semibold flex items-center gap-0.5 min-h-touch px-2 haptic"
        >
          Manage <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
      <div
        className="flex gap-3 overflow-x-auto pb-2"
        style={{ scrollSnapType: 'x mandatory', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
      >
        {accounts.map((account, idx) => (
          <motion.div
            key={account._id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/wallet/edit/' + account._id)}
            className="shrink-0 cursor-pointer"
            style={{ width: '72%', maxWidth: '300px', scrollSnapAlign: 'start' }}
          >
            <div
              className="rounded-2xl p-4 text-white relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${account.color || '#007AFF'}, ${account.color || '#007AFF'}bb)`,
                boxShadow: `0 8px 24px -6px ${account.color || '#007AFF'}44`,
              }}
            >
              <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-white/[0.07]" />
              <div className="absolute -bottom-10 -left-4 w-24 h-24 rounded-full bg-white/[0.05]" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 rounded-lg bg-white/15 border border-white/20 flex items-center justify-center">
                    <LucideIcon name={account.icon} className="w-4 h-4" />
                  </div>
                  <div className="flex items-center gap-1">
                    {[0, 1].map((g) => (
                      <span key={g} className="flex gap-[2px]">
                        {[0, 1, 2, 3].map((d) => (
                          <span key={d} className="w-1 h-1 bg-white/40 rounded-full inline-block" />
                        ))}
                      </span>
                    ))}
                    <span className="text-[11px] text-white/60 font-medium ml-1">
                      {String(account._id || '0000').slice(-4)}
                    </span>
                  </div>
                </div>
                <p className="text-[10px] text-white/40 uppercase tracking-wider">Balance</p>
                <p className="text-[22px] font-bold tracking-tight leading-none mb-2">
                  {balanceVisible ? formatCurrency(account.balance) : '••••••'}
                </p>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-[9px] text-white/30 uppercase">Name</p>
                    <p className="text-[12px] font-semibold text-white/80 truncate max-w-[120px]">{account.name}</p>
                  </div>
                  <p className="text-[10px] text-white/50 capitalize">{account.type}</p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
        {/* Add Card mini */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={() => navigate('/wallet/new')}
          className="shrink-0 cursor-pointer h-[160px] pb-2"
          style={{ width: '72%', maxWidth: '300px', scrollSnapAlign: 'start' }}
        >
          <div className="h-full rounded-2xl border-2 border-dashed border-[var(--color-primary)]/30 bg-[var(--color-primary)]/5 flex flex-col items-center justify-center gap-2 active:bg-[var(--color-primary)]/10 transition-colors">
            <div className="w-12 h-12 rounded-full bg-[var(--color-primary)]/20 flex items-center justify-center mb-1">
              <Plus className="w-6 h-6 text-[var(--color-primary)]" />
            </div>
            <p className="text-[14px] text-[var(--color-primary)] font-bold">Add New Card</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
