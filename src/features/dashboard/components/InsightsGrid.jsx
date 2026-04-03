import { motion } from 'framer-motion';
import { Flame, Zap } from 'lucide-react';
import InsightCard from '../../../components/InsightCard';

export default function InsightsGrid({ insights, balanceVisible, streakDays, monthTransactionCount }) {
  return (
    <>
      {/* Smart Insights */}
      {insights.length > 0 && (
        <div className="mb-4">
          <h2 className="text-[17px] font-bold mb-3">Smart Insights</h2>
          <div className="grid grid-cols-2 gap-2.5">
            {insights.slice(0, 4).map((insight, idx) => (
              <InsightCard key={idx} insight={insight} index={idx} balanceVisible={balanceVisible} />
            ))}
          </div>
        </div>
      )}

      {/* Streak / Count Row */}
      <div className="flex gap-2.5 mb-5">
        {streakDays > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 ios-card p-3.5 flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0">
              <Flame className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="text-[20px] font-bold leading-tight">{streakDays}</p>
              <p className="text-[11px] text-[var(--color-muted)]">Day streak</p>
            </div>
          </motion.div>
        )}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.05 }}
          className="flex-1 ios-card p-3.5 flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <p className="text-[20px] font-bold leading-tight">{monthTransactionCount}</p>
            <p className="text-[11px] text-[var(--color-muted)]">This month</p>
          </div>
        </motion.div>
      </div>
    </>
  );
}
