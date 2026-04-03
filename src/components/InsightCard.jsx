import { motion } from 'framer-motion';
import { formatCurrency } from '../utils/helpers';
import LucideIcon from './LucideIcon';

export default function InsightCard({ insight, index = 0, balanceVisible = true }) {
  if (!insight) return null;

  const formatValue = () => {
    if (!balanceVisible) return '••••';
    switch (insight.type) {
      case 'currency':
        return formatCurrency(insight.value);
      case 'days':
        return `${insight.value} days`;
      case 'percent':
        return `${insight.value}%`;
      default:
        return String(insight.value);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="ios-card p-3.5 flex items-center gap-3"
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: insight.color + '18' }}
      >
        <LucideIcon name={insight.icon} className="w-5 h-5" style={{ color: insight.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-[var(--color-muted)] font-medium">{insight.title}</p>
        <p className="text-[18px] font-bold tracking-tight leading-tight" style={{ color: insight.color }}>
          {formatValue()}
        </p>
        {insight.subtitle && (
          <p className="text-[11px] text-[var(--color-muted)] mt-0.5 truncate">{insight.subtitle}</p>
        )}
      </div>
    </motion.div>
  );
}
