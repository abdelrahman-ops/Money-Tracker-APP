import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { formatCurrency, formatDateShort } from '../utils/helpers';
import { useAppStore } from '../store/appStore';
import { useWalletStore } from '../store/walletStore';
import { useCategoryStore } from '../store/categoryStore';
import { useTransactionStore } from '../store/transactionStore';
import { ChevronLeft, Settings, ArrowDownLeft, ArrowUpRight, Zap } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip } from 'recharts';
import LucideIcon from '../components/LucideIcon';
import { motion } from 'framer-motion';

export default function WalletInsights() {
  const { id } = useParams();
  const navigate = useNavigate();
  const accountId = id; // MongoDB string _id
  const balanceVisible = useAppStore((s) => s.balanceVisible);

  const [timeView, setTimeView] = useState('month');

  const wallets = useWalletStore((s) => s.wallets);
  const account = wallets.find((w) => w._id === accountId);
  const allTransactions = useTransactionStore((s) => s.transactions);
  const categories = useCategoryStore((s) => s.categories);

  // Filter transactions for this wallet
  const transactions = useMemo(() => {
    return allTransactions.filter(
      (t) => t.accountId === accountId || t.toAccountId === accountId
    );
  }, [allTransactions, accountId]);

  const catMap = useMemo(() => {
    const map = {};
    categories.forEach((c) => { map[c._id] = c; });
    return map;
  }, [categories]);

  // Aggregate transactions by chosen time view
  const aggregatedData = useMemo(() => {
    if (!transactions.length) return [];

    const map = {};

    transactions.forEach(t => {
      let type = t.type;
      if (t.type === 'transfer') {
        type = t.accountId === accountId ? 'expense' : 'income';
      }

      const d = new Date(t.date);
      let key = '';
      let label = '';
      let dateForSort = d.getTime();

      if (timeView === 'month') {
        key = `${d.getFullYear()}-${d.getMonth() + 1}`;
        label = new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(d);
        dateForSort = new Date(d.getFullYear(), d.getMonth(), 1).getTime();
      } else if (timeView === 'week') {
        const day = d.getDay();
        const diff = d.getDate() - day;
        const weekStart = new Date(d.getFullYear(), d.getMonth(), diff);
        key = `${weekStart.getFullYear()}-${weekStart.getMonth()}-${weekStart.getDate()}`;
        label = `Week of ${new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(weekStart)}`;
        dateForSort = weekStart.getTime();
      } else {
        key = t.date.split('T')[0];
        label = formatDateShort(t.date);
      }

      if (!map[key]) {
        map[key] = { key, label, income: 0, expense: 0, dateForSort };
      }

      if (type === 'income') map[key].income += t.amount;
      if (type === 'expense') map[key].expense += t.amount;
    });

    return Object.values(map).sort((a, b) => a.dateForSort - b.dateForSort);
  }, [transactions, accountId, timeView]);

  const topCategories = useMemo(() => {
    const map = {};
    let totalEx = 0;
    transactions.forEach(t => {
      if (t.type === 'expense' || (t.type === 'transfer' && t.accountId === accountId)) {
        totalEx += t.amount;
        if (t.categoryId) {
           const cat = catMap[t.categoryId];
           if (cat) {
             if (!map[cat._id]) map[cat._id] = { ...cat, total: 0 };
             map[cat._id].total += t.amount;
           }
        }
      }
    });

    return {
      totalExpense: totalEx,
      categories: Object.values(map).sort((a, b) => b.total - a.total).slice(0, 5)
    };
  }, [transactions, accountId, catMap]);

  if (!account) return <div className="p-4">Account not found</div>;

  const totalIn = aggregatedData.reduce((sum, d) => sum + d.income, 0);
  const totalOut = aggregatedData.reduce((sum, d) => sum + d.expense, 0);

  return (
    <div className="pb-safe bg-[var(--color-bg)] min-h-[100dvh]">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[var(--color-bg)]/80 backdrop-blur-md px-4 pt-5 pb-3 flex items-center justify-between border-b border-[var(--color-border)]">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-2xl active:bg-[var(--color-surface)] transition-colors haptic">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ backgroundColor: account.color + '20' }}>
             <LucideIcon name={account.icon} className="w-3.5 h-3.5" style={{ color: account.color }} />
          </div>
          <span className="font-bold text-[16px]">{account.name}</span>
        </div>
        <button onClick={() => navigate('/wallet/edit/' + account._id)} className="p-2 -mr-2 rounded-2xl active:bg-[var(--color-surface)] transition-colors haptic">
          <Settings className="w-5 h-5 text-[var(--color-primary)]" />
        </button>
      </div>

      <div className="px-4 py-5">
        {/* Quick Summary */}
        <div className="ios-card p-5 mb-5 relative overflow-hidden">
          <p className="text-[13px] text-[var(--color-muted)] font-semibold uppercase tracking-widest mb-1">Current Balance</p>
          <p className="text-[32px] font-bold tracking-tight mb-4">
            {balanceVisible ? formatCurrency(account.balance) : '••••••'}
          </p>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[var(--color-border)]">
             <div>
                <p className="text-[11px] text-[var(--color-muted)] font-bold uppercase mb-0.5 flex items-center gap-1">
                   <ArrowDownLeft className="w-3 h-3 text-[var(--color-success)]" /> All Time In
                </p>
                <p className="text-[15px] font-bold text-[var(--color-success)]">{balanceVisible ? formatCurrency(totalIn) : '••••'}</p>
             </div>
             <div>
                <p className="text-[11px] text-[var(--color-muted)] font-bold uppercase mb-0.5 flex items-center gap-1">
                   <ArrowUpRight className="w-3 h-3 text-[var(--color-danger)]" /> All Time Out
                </p>
                <p className="text-[15px] font-bold text-[var(--color-danger)]">{balanceVisible ? formatCurrency(totalOut) : '••••'}</p>
             </div>
          </div>
        </div>

        {/* View Toggles */}
        <div className="flex bg-[var(--color-surface)] p-1 rounded-xl mb-4">
          {['month', 'week', 'day'].map((view) => (
            <button
              key={view}
              onClick={() => setTimeView(view)}
              className={`flex-1 py-1.5 text-[13px] font-bold rounded-lg capitalize transition-all haptic ${
                timeView === view ? 'bg-[var(--color-card)] text-[var(--color-text)] shadow-sm' : 'text-[var(--color-muted)]'
              }`}
            >
              {view}
            </button>
          ))}
        </div>

        {/* Chart View */}
        {aggregatedData.length > 0 ? (
          <div className="ios-card p-4 mb-6">
            <p className="text-[14px] font-bold mb-4 capitalize">Spending by {timeView}</p>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={aggregatedData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <XAxis dataKey="label" fontSize={10} axisLine={false} tickLine={false} tick={{ fill: 'var(--color-muted)' }} dy={10} minTickGap={15} />
                  <Tooltip
                    cursor={{ fill: 'var(--color-surface)' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '13px', zIndex: 100 }}
                    itemStyle={{ fontWeight: 'bold' }}
                    formatter={(val, name) => [formatCurrency(val), name === 'income' ? 'Income' : 'Expense']}
                  />
                  <Bar dataKey="income" fill="#30d158" radius={[4, 4, 0, 0]} maxBarSize={30} />
                  <Bar dataKey="expense" fill="#ff453a" radius={[4, 4, 0, 0]} maxBarSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="ios-card p-8 mb-6 text-center text-[var(--color-muted)]">
            <Zap className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-[14px]">No transactions found for this wallet.</p>
          </div>
        )}

        {/* Top Categories */}
        {topCategories.categories.length > 0 && (
          <div className="ios-card p-4 mb-5">
             <p className="text-[15px] font-bold mb-4">Top Expenses Breakdown</p>
             <div className="space-y-4">
               {topCategories.categories.map((cat) => (
                 <div key={cat._id} className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: (cat.color || '#000') + '15' }}>
                     <LucideIcon name={cat.icon} className="w-5 h-5" style={{ color: cat.color }} />
                   </div>
                   <div className="flex-1 min-w-0">
                     <div className="flex justify-between items-end mb-1">
                       <p className="text-[14px] font-semibold truncate pr-2">{cat.name}</p>
                       <p className="text-[14px] font-bold shrink-0">{balanceVisible ? formatCurrency(cat.total) : '••••'}</p>
                     </div>
                     <div className="w-full h-1.5 bg-[var(--color-surface)] rounded-full overflow-hidden">
                       <motion.div
                         initial={{ width: 0 }}
                         animate={{ width: `${Math.min((cat.total / topCategories.totalExpense) * 100, 100)}%` }}
                         transition={{ duration: 1, ease: "easeOut" }}
                         className="h-full rounded-full"
                         style={{ backgroundColor: cat.color }}
                       />
                     </div>
                   </div>
                 </div>
               ))}
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
