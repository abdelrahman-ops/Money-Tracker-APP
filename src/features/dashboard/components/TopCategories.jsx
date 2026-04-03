import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../../../utils/helpers';
import LucideIcon from '../../../components/LucideIcon'; // Assuming this imports properly

const CARD_COLORS = [
  { bg: 'linear-gradient(135deg, #667eea, #764ba2)', shadow: 'rgba(102,126,234,0.3)' },
  { bg: 'linear-gradient(135deg, #f093fb, #f5576c)', shadow: 'rgba(245,87,108,0.3)' },
  { bg: 'linear-gradient(135deg, #4facfe, #00f2fe)', shadow: 'rgba(79,172,254,0.3)' },
  { bg: 'linear-gradient(135deg, #43e97b, #38f9d7)', shadow: 'rgba(67,233,123,0.3)' },
];

export default function TopCategories({ topCategories, balanceVisible }) {
  const navigate = useNavigate();

  if (!topCategories || topCategories.length === 0) return null;

  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[17px] font-bold">Top Spending</h2>
        <button
          onClick={() => navigate('/analytics')}
          className="text-[13px] text-[var(--color-primary)] font-semibold flex items-center gap-0.5 min-h-touch px-2 haptic"
        >
          See All <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {topCategories.map((cat, idx) => {
          const cardStyle = CARD_COLORS[idx % CARD_COLORS.length];
          return (
            <motion.div
              key={cat._id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.06 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => navigate('/analytics')}
              className="rounded-2xl p-4 text-white cursor-pointer relative overflow-hidden"
              style={{
                background: cardStyle.bg,
                boxShadow: `0 8px 20px -4px ${cardStyle.shadow}`,
              }}
            >
              <div className="absolute bottom-0 right-0 w-16 h-16 bg-white/[0.08] rounded-full -mr-4 -mb-4" />
              <div className="relative z-10">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center mb-2.5">
                  <LucideIcon name={cat.icon} className="w-4.5 h-4.5" />
                </div>
                <p className="text-[12px] text-white/70 font-medium">{cat.name}</p>
                <p className="text-[18px] font-bold mt-0.5">
                  {balanceVisible ? formatCurrency(cat.total) : '••••'}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
