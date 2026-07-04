import { motion } from 'framer-motion';
import { ChevronRight, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency, formatDate } from '../../../utils/helpers';
import LucideIcon from '../../../components/LucideIcon';

export default function RecentTransactions({ transactions = [], balanceVisible, catMap }) {
  const navigate = useNavigate();

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="text-[15px] font-semibold text-[var(--color-text)] tracking-tight">Latest transactions</h3>
        <button
          onClick={() => navigate('/calendar')}
          className="text-[12px] text-[var(--color-primary)] font-medium flex items-center gap-0.5 active:scale-95 transition-all"
        >
          See All <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {transactions.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-8 rounded-3xl bg-[var(--color-card)] border border-[var(--color-border-subtle)] text-center"
        >
          <p className="text-[var(--color-muted)] text-sm mb-1">No transactions yet</p>
          <p className="text-[var(--color-muted)] text-xs mb-3">Add your first transaction to get started</p>
          <button
            onClick={() => navigate('/add')}
            className="px-4 py-2 bg-[var(--color-primary)] text-white text-xs font-bold rounded-xl active:scale-95 transition-all"
          >
            Add Transaction
          </button>
        </motion.div>
      ) : (
        <div className="space-y-2">
          {transactions.map((txn, idx) => {
            const cat = catMap[txn.categoryId || txn.categoryId?._id];
            
            return (
              <motion.div
                key={txn._id || txn.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                onClick={() => navigate('/add/' + (txn._id || txn.id))}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-[var(--color-card)] border border-[var(--color-border-subtle)] cursor-pointer hover:border-[var(--color-primary)]/20 active:scale-[0.99] transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: (cat?.color || '#007AFF') + '15' }}
                  >
                    {cat ? (
                      <LucideIcon name={cat.icon} className="w-5 h-5" style={{ color: cat.color }} />
                    ) : txn.type === 'income' ? (
                      <ArrowDownLeft className="w-5 h-5 text-[var(--color-success)]" />
                    ) : (
                      <ArrowUpRight className="w-5 h-5 text-[var(--color-danger)]" />
                    )}
                  </div>
                  
                  <div className="min-w-0">
                    <p className="font-medium text-[14px] text-[var(--color-text)] truncate leading-tight mb-0.5">
                      {txn.name || (cat?.name || txn.type)}
                    </p>
                    <p className="text-[11px] text-[var(--color-muted)] font-medium">
                      {cat?.name || txn.type} &middot; {formatDate(txn.date)}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className={`text-[14px] font-semibold ${
                    txn.type === 'income' ? 'text-[var(--color-success)]' : txn.type === 'expense' ? 'text-[var(--color-danger)]' : 'text-cyan-400'
                  }`}>
                    {txn.type === 'income' ? '+' : txn.type === 'expense' ? '-' : ''}
                    {balanceVisible ? formatCurrency(txn.amount) : '••••'}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
