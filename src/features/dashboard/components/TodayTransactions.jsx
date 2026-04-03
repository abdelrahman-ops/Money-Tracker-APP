import { motion } from 'framer-motion';
import { ChevronRight, TrendingDown, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency, formatTime } from '../../../utils/helpers';
import LucideIcon from '../../../components/LucideIcon';

export default function TodayTransactions({ todayTransactions, todaySpent, balanceVisible, catMap }) {
  const navigate = useNavigate();

  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-[17px] font-bold">Today</h2>
          <p className="text-[12px] text-[var(--color-muted)]">
            {todayTransactions.length} transaction{todayTransactions.length !== 1 ? 's' : ''} &middot; Spent {balanceVisible ? formatCurrency(todaySpent) : '••••'}
          </p>
        </div>
        <button
          onClick={() => navigate('/calendar')}
          className="text-[13px] text-[var(--color-primary)] font-semibold flex items-center gap-0.5 min-h-touch px-2 haptic"
        >
          See All <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {todayTransactions.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="ios-card text-center py-10"
        >
          <div className="w-14 h-14 rounded-2xl bg-[var(--color-surface)] flex items-center justify-center mx-auto mb-3">
            <TrendingDown className="w-7 h-7 text-[var(--color-muted)]" />
          </div>
          <p className="text-[var(--color-muted)] text-sm mb-1">No entries today</p>
          <p className="text-[var(--color-muted)] text-xs mb-4">Tap + to add your first entry</p>
          <button
            onClick={() => navigate('/add')}
            className="btn-primary text-sm px-6 py-2.5"
          >
            Add Entry
          </button>
        </motion.div>
      ) : (
        <div className="ios-section">
          {todayTransactions.map((txn, idx) => {
            const cat = catMap[txn.categoryId];
            return (
              <motion.div
                key={txn._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                onClick={() => navigate('/add/' + txn._id)}
                className="ios-section-item cursor-pointer"
              >
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: (cat?.color || '#007AFF') + '15' }}
                >
                  {cat ? (
                    <LucideIcon name={cat.icon} className="w-5 h-5" style={{ color: cat.color }} />
                  ) : (
                    txn.type === 'income'
                      ? <ArrowDownLeft className="w-5 h-5 text-[var(--color-success)]" />
                      : <ArrowUpRight className="w-5 h-5 text-[var(--color-danger)]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[15px] truncate">{txn.name || (cat?.name || txn.type)}</p>
                  <p className="text-[12px] text-[var(--color-muted)]">
                    {cat?.name || txn.type} &middot; {formatTime(txn.date)}
                  </p>
                </div>
                <p className={'text-[15px] font-bold ' + (txn.type === 'income' ? 'text-[var(--color-success)]' : txn.type === 'expense' ? 'text-[var(--color-danger)]' : 'text-[var(--color-primary)]')}>
                  {txn.type === 'income' ? '+' : txn.type === 'expense' ? '-' : ''}{balanceVisible ? formatCurrency(txn.amount) : '••••'}
                </p>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
