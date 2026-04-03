import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';
import { formatCurrency } from '../../../utils/helpers';

export default function TodaySpending({ todaySpent, dailyLimit, balanceVisible, todayTxnCount }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="ios-card p-4 mb-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-orange-500/10 flex items-center justify-center">
            <Flame className="w-4 h-4 text-orange-500" />
          </div>
          <span className="text-[13px] font-semibold">Today's Spending</span>
        </div>
        <span className="text-[15px] font-bold text-[var(--color-danger)]">{balanceVisible ? formatCurrency(todaySpent) : '••••'}</span>
      </div>
      {dailyLimit > 0 && (
        <>
          <div className="h-2 bg-[var(--color-surface)] rounded-full overflow-hidden mb-1.5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: Math.min((todaySpent / dailyLimit) * 100, 100) + '%' }}
              className="h-full rounded-full"
              style={{
                backgroundColor: todaySpent > dailyLimit ? 'var(--color-danger)' : todaySpent > dailyLimit * 0.7 ? '#f59e0b' : 'var(--color-success)',
              }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-[var(--color-muted)]">
            <span>{Math.round((todaySpent / dailyLimit) * 100)}% of daily limit</span>
            <span>{balanceVisible ? formatCurrency(Math.max(0, dailyLimit - todaySpent)) : '••••'} left</span>
          </div>
        </>
      )}
      <div className="text-[11px] text-[var(--color-muted)] mt-1">
        {todayTxnCount} transaction{todayTxnCount !== 1 ? 's' : ''} today
      </div>
    </motion.div>
  );
}
