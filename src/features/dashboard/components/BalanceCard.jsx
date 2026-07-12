import { motion } from 'framer-motion';
import { Eye, EyeOff, Plus, Repeat, Send, Brain } from 'lucide-react';
import { formatCurrency } from '../../../utils/helpers';
import { useNavigate } from 'react-router-dom';

export default function BalanceCard({ 
  monthName, 
  balanceVisible, 
  toggleBalanceVisible, 
  totalBalance, 
  monthIncome, 
  monthExpense,
  onOpenCoach
}) {
  const navigate = useNavigate();
  const maskedAmount = '••••••';

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-light)] rounded-[28px] p-6 shadow-xl shadow-[var(--color-primary)]/15 relative overflow-hidden"
    >
      {/* Decorative colored glow circles (Pinterest design language) */}
      <div className="absolute -right-10 -top-10 w-36 h-36 rounded-full bg-white/5 blur-xl pointer-events-none" />
      <div className="absolute -left-10 -bottom-10 w-24 h-24 rounded-full bg-white/5 blur-xl pointer-events-none" />

      {/* Muted header & Eye Toggle */}
      <div className="flex items-center justify-between mb-1.5 relative z-10">
        <span className="text-[12px] text-white/70 font-semibold uppercase tracking-wider">
          Main balance
        </span>
        <button
          onClick={toggleBalanceVisible}
          className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center active:scale-90 transition-transform text-white/60 hover:text-white"
          title={balanceVisible ? 'Hide Balance' : 'Show Balance'}
        >
          {balanceVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Large Balance Amount */}
      <div className="flex items-baseline mb-5 relative z-10">
        <h1 className="text-[34px] font-bold tracking-tight text-white leading-none">
          {balanceVisible ? formatCurrency(totalBalance) : maskedAmount}
        </h1>
        <span className="text-[12px] text-white/60 font-semibold ml-2.5">
          {monthName}
        </span>
      </div>

      {/* Action Buttons Row */}
      <div className="grid grid-cols-4 gap-2 mt-2 relative z-10">
        <button
          onClick={() => navigate('/add?type=expense')}
          className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/5 active:scale-95 transition-all group"
        >
          <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center text-white mb-1.5 transition-transform group-hover:scale-105">
            <Plus className="w-4.5 h-4.5" strokeWidth={2.5} />
          </div>
          <span className="text-[11px] font-medium text-white/90">Add</span>
        </button>

        <button
          onClick={() => navigate('/add?type=transfer')}
          className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/5 active:scale-95 transition-all group"
        >
          <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center text-white mb-1.5 transition-transform group-hover:scale-105">
            <Repeat className="w-4 h-4" strokeWidth={2.5} />
          </div>
          <span className="text-[11px] font-medium text-white/90">Move</span>
        </button>

        <button
          onClick={() => navigate('/add?type=income')}
          className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/5 active:scale-95 transition-all group"
        >
          <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center text-white mb-1.5 transition-transform group-hover:scale-105">
            <Send className="w-4 h-4" strokeWidth={2.5} />
          </div>
          <span className="text-[11px] font-medium text-white/90">Send</span>
        </button>

        <button
          onClick={onOpenCoach}
          className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/5 active:scale-95 transition-all group"
        >
          <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center text-white mb-1.5 transition-transform group-hover:scale-105">
            <Brain className="w-4 h-4" strokeWidth={2.2} />
          </div>
          <span className="text-[11px] font-medium text-white/90">Coach</span>
        </button>
      </div>
    </motion.div>
  );
}
