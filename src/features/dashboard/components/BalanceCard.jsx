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
      className="mb-6 pt-3 px-1"
    >
      {/* Muted header & Eye Toggle */}
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[12px] text-[var(--color-muted)] font-semibold uppercase tracking-wider">
          Main balance
        </span>
        <button
          onClick={toggleBalanceVisible}
          className="w-7 h-7 rounded-full bg-[var(--color-card)] border border-[var(--color-border-subtle)] flex items-center justify-center active:scale-90 transition-transform text-[var(--color-muted)] hover:text-[var(--color-text)]"
          title={balanceVisible ? 'Hide Balance' : 'Show Balance'}
        >
          {balanceVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Large Balance Amount */}
      <div className="flex items-baseline mb-4">
        <h1 className="text-[38px] font-bold tracking-tight text-[var(--color-text)] leading-none">
          {balanceVisible ? formatCurrency(totalBalance) : maskedAmount}
        </h1>
        <span className="text-[12px] text-[var(--color-muted)] font-semibold ml-2.5">
          {monthName}
        </span>
      </div>

      {/* Action Buttons Row */}
      <div className="grid grid-cols-4 gap-2.5 mt-2">
        <button
          onClick={() => navigate('/add?type=expense')}
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[var(--color-card)] border border-[var(--color-border-subtle)] hover:border-[var(--color-primary)]/40 active:scale-95 transition-all group"
        >
          <div className="w-10 h-10 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)] group-hover:scale-105 transition-transform mb-1.5">
            <Plus className="w-5 h-5" strokeWidth={2.5} />
          </div>
          <span className="text-[11px] font-medium text-[var(--color-text)]">Add</span>
        </button>

        <button
          onClick={() => navigate('/add?type=transfer')}
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[var(--color-card)] border border-[var(--color-border-subtle)] hover:border-[var(--color-primary)]/40 active:scale-95 transition-all group"
        >
          <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform mb-1.5">
            <Repeat className="w-4.5 h-4.5" strokeWidth={2.5} />
          </div>
          <span className="text-[11px] font-medium text-[var(--color-text)]">Move</span>
        </button>

        <button
          onClick={() => navigate('/add?type=income')}
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[var(--color-card)] border border-[var(--color-border-subtle)] hover:border-[var(--color-primary)]/40 active:scale-95 transition-all group"
        >
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform mb-1.5">
            <Send className="w-4.5 h-4.5" strokeWidth={2.5} />
          </div>
          <span className="text-[11px] font-medium text-[var(--color-text)]">Send</span>
        </button>

        <button
          onClick={onOpenCoach}
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[var(--color-card)] border border-[var(--color-border-subtle)] hover:border-[var(--color-primary)]/40 active:scale-95 transition-all group"
        >
          <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform mb-1.5">
            <Brain className="w-4.5 h-4.5" strokeWidth={2.2} />
          </div>
          <span className="text-[11px] font-medium text-[var(--color-text)]">Coach</span>
        </button>
      </div>
    </motion.div>
  );
}
