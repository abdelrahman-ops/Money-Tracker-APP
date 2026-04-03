import { motion } from 'framer-motion';
import { Eye, EyeOff, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import moneyBg from '../../../assets/money.png';
import { formatCurrency } from '../../../utils/helpers';

export default function BalanceCard({ monthName, balanceVisible, toggleBalanceVisible, totalBalance, monthIncome, monthExpense }) {
  const maskedAmount = '••••••';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="gradient-card rounded-3xl p-5 pb-5 mb-3 text-white shadow-xl shadow-black/10 relative overflow-hidden"
    >
      <div className="absolute inset-0 w-full h-full pointer-events-none mix-blend-overlay opacity-50">
        <img
          src={moneyBg}
          alt="Money Background"
          className="w-full h-full object-cover scale-110 rotate-2"
        />
      </div>

      <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/[0.04] rounded-full -ml-10 -mb-10 pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 w-20 h-20 bg-white/10 rounded-full blur-xl pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-1">
          <p className="text-[13px] text-white/50 font-medium tracking-wide">{monthName}</p>
          <button
            onClick={toggleBalanceVisible}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center active:bg-white/20 transition-colors haptic"
          >
            {balanceVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          </button>
        </div>

        <p className="text-[13px] text-white/60 mb-0.5 mt-2">Total Balance</p>
        <p className="text-[36px] font-bold tracking-tight leading-none mb-5 drop-shadow-sm">
          {balanceVisible ? formatCurrency(totalBalance) : maskedAmount}
        </p>

        <div className="flex gap-2">
          <div className="flex-1 bg-white/[0.08] backdrop-blur-sm rounded-2xl p-3 flex items-center gap-2.5 shadow-inner border border-white/5">
            <div className="w-9 h-9 rounded-[12px] bg-[#34C759]/20 flex items-center justify-center shrink-0">
              <ArrowDownLeft className="w-4 h-4 text-[#34C759]" strokeWidth={2.5} />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-white/50 font-medium tracking-wide uppercase">Income</p>
              <p className="text-[15px] font-bold truncate tracking-tight">{balanceVisible ? formatCurrency(monthIncome) : '••••'}</p>
            </div>
          </div>
          <div className="flex-1 bg-white/[0.08] backdrop-blur-sm rounded-2xl p-3 flex items-center gap-2.5 shadow-inner border border-white/5">
            <div className="w-9 h-9 rounded-[12px] bg-[#FF3B30]/20 flex items-center justify-center shrink-0">
              <ArrowUpRight className="w-4 h-4 text-[#FF3B30]" strokeWidth={2.5} />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-white/50 font-medium tracking-wide uppercase">Spent</p>
              <p className="text-[15px] font-bold truncate tracking-tight">{balanceVisible ? formatCurrency(monthExpense) : '••••'}</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
