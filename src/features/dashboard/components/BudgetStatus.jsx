import { motion } from 'framer-motion';
import { Target } from 'lucide-react';
import { formatCurrency } from '../../../utils/helpers';
import { useNavigate } from 'react-router-dom';

export default function BudgetStatus({ totalBudget, budgetRemaining, budgetPct, monthExpense }) {
  const navigate = useNavigate();

  if (totalBudget <= 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="ios-card p-4 mb-4"
      onClick={() => navigate('/analytics')}
    >
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-[var(--color-primary)]" />
          <span className="text-[13px] font-semibold">Monthly Budget</span>
        </div>
        <span className={'text-[12px] font-bold px-2 py-0.5 rounded-lg ' +
          (budgetRemaining >= 0
            ? 'bg-[var(--color-success)]/10 text-[var(--color-success)]'
            : 'bg-[var(--color-danger)]/10 text-[var(--color-danger)]')
        }>
          {budgetRemaining >= 0 ? (
            <>{formatCurrency(budgetRemaining)} left</>
          ) : (
            <>Over by {formatCurrency(Math.abs(budgetRemaining))}</>
          )}
        </span>
      </div>
      <div className="h-2.5 bg-[var(--color-surface)] rounded-full overflow-hidden mb-2">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: budgetPct + '%' }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{
            backgroundColor: budgetPct > 90 ? 'var(--color-danger)' : budgetPct > 70 ? 'var(--color-warning)' : 'var(--color-success)'
          }}
        />
      </div>
      <div className="flex justify-between text-[11px] text-[var(--color-muted)]">
        <span>{formatCurrency(monthExpense)} spent</span>
        <span>{formatCurrency(totalBudget)} budget</span>
      </div>
    </motion.div>
  );
}
