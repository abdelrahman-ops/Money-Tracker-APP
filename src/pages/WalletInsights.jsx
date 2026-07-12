import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { formatCurrency, formatDateShort } from '../utils/helpers';
import { useAppStore } from '../store/appStore';
import { useWalletStore } from '../store/walletStore';
import { useCategoryStore } from '../store/categoryStore';
import { useTransactionStore } from '../store/transactionStore';
import { ChevronLeft, Settings, ArrowDownLeft, ArrowUpRight, Zap, TrendingUp, BarChart2 } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import LucideIcon from '../components/LucideIcon';
import { motion, AnimatePresence } from 'framer-motion';

export default function WalletInsights() {
  const { id } = useParams();
  const navigate = useNavigate();
  const accountId = id;
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
        label = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(d);
        dateForSort = new Date(d.getFullYear(), d.getMonth(), 1).getTime();
      } else if (timeView === 'week') {
        const day = d.getDay();
        const diff = d.getDate() - day;
        const weekStart = new Date(d.getFullYear(), d.getMonth(), diff);
        key = `${weekStart.getFullYear()}-${weekStart.getMonth()}-${weekStart.getDate()}`;
        label = `Wk ${new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(weekStart)}`;
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

  if (!account) return <div className="p-4 text-center font-bold">Account not found</div>;

  const totalIn = aggregatedData.reduce((sum, d) => sum + d.income, 0);
  const totalOut = aggregatedData.reduce((sum, d) => sum + d.expense, 0);

  const walletColor = account.color || '#007AFF';

  return (
    <div className="pb-24 bg-[var(--color-bg)] min-h-[100dvh] w-full max-w-md mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[var(--color-bg)]/80 backdrop-blur-md px-4 pt-5 pb-3 flex items-center justify-between border-b border-[var(--color-border)]/20">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 rounded-2xl min-w-touch min-h-touch flex items-center justify-center hover:bg-[var(--color-border)]/20 text-[var(--color-text)] transition-colors haptic"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-xl flex items-center justify-center border shadow-sm shrink-0"
            style={{ backgroundColor: `${walletColor}15`, borderColor: `${walletColor}30` }}
          >
             <LucideIcon name={account.icon} className="w-4 h-4" style={{ color: walletColor }} />
          </div>
          <span className="font-extrabold text-[15px] text-[var(--color-text)]">{account.name}</span>
        </div>
        <button
          onClick={() => navigate('/wallet/edit/' + account._id)}
          className="p-2 -mr-2 rounded-2xl min-w-touch min-h-touch flex items-center justify-center hover:bg-[var(--color-border)]/20 text-[var(--color-primary)] transition-colors haptic"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      <div className="px-4 py-5 space-y-4">
        {/* Account Info Panel */}
        <div className="bg-[var(--color-card)] border border-[var(--color-border)]/55 rounded-[28px] p-5 shadow-sm relative overflow-hidden">
          <div
            className="absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl pointer-events-none opacity-[0.06]"
            style={{ backgroundColor: walletColor }}
          />
          <p className="text-[11px] text-[var(--color-muted)] font-extrabold uppercase tracking-widest mb-1 opacity-70">
            Account Balance
          </p>
          <p className="text-[34px] font-black tracking-tight text-[var(--color-text)]">
            {balanceVisible ? formatCurrency(account.balance) : '••••••'}
          </p>
          <p className="text-[12px] text-[var(--color-muted)] font-bold capitalize mt-0.5 opacity-80">
            Type: {account.type}
          </p>

          <div className="grid grid-cols-2 gap-4 pt-4 mt-5 border-t border-[var(--color-border)]/40">
             <div>
                <p className="text-[10px] text-[var(--color-muted)] font-extrabold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                   <ArrowDownLeft className="w-3.5 h-3.5 text-[var(--color-success)]" /> Cash Inflow
                </p>
                <p className="text-[15px] font-black text-[var(--color-success)]">
                  {balanceVisible ? formatCurrency(totalIn) : '••••'}
                </p>
             </div>
             <div>
                <p className="text-[10px] text-[var(--color-muted)] font-extrabold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                   <ArrowUpRight className="w-3.5 h-3.5 text-[var(--color-danger)]" /> Cash Outflow
                </p>
                <p className="text-[15px] font-black text-[var(--color-danger)]">
                  {balanceVisible ? formatCurrency(totalOut) : '••••'}
                </p>
             </div>
          </div>
        </div>

        {/* View Segmented Control (iOS style) */}
        <div className="relative flex bg-[var(--color-card)] border border-[var(--color-border)]/40 p-1.5 rounded-2xl shadow-inner">
          {['month', 'week', 'day'].map((view) => (
            <button
              key={view}
              onClick={() => setTimeView(view)}
              className="relative flex-1 py-2 text-[12.5px] font-extrabold capitalize text-center transition-all haptic select-none z-10"
              style={{ color: timeView === view ? 'var(--color-text)' : 'var(--color-muted)' }}
            >
              {timeView === view && (
                <motion.div
                  layoutId="activeInsightsTab"
                  className="absolute inset-0 bg-[var(--color-surface)] border border-[var(--color-border)]/35 rounded-xl shadow-sm -z-10"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              {view}
            </button>
          ))}
        </div>

        {/* Chart Card */}
        {aggregatedData.length > 0 ? (
          <div className="bg-[var(--color-card)] border border-[var(--color-border)]/55 p-4 rounded-[28px] shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <BarChart2 className="w-4.5 h-4.5 text-[var(--color-primary)]" />
              <p className="text-[13.5px] font-extrabold text-[var(--color-text)] capitalize">
                Cash Flow Overview ({timeView})
              </p>
            </div>
            
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={aggregatedData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" opacity={0.15} />
                  <XAxis
                    dataKey="label"
                    fontSize={10}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'var(--color-muted)', fontWeight: 'bold' }}
                    dy={10}
                  />
                  <YAxis
                    fontSize={10}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'var(--color-muted)', fontWeight: 'bold' }}
                  />
                  <Tooltip
                    cursor={{ fill: 'var(--color-surface)', opacity: 0.4 }}
                    contentStyle={{
                      backgroundColor: 'var(--color-card)',
                      border: '1px solid var(--color-border)',
                      borderRadius: '16px',
                      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                      fontSize: '13px',
                      fontWeight: 'bold',
                    }}
                    formatter={(val, name) => [formatCurrency(val), name === 'income' ? 'Income' : 'Expense']}
                  />
                  <Bar dataKey="income" fill="#34c759" radius={[6, 6, 0, 0]} maxBarSize={16} />
                  <Bar dataKey="expense" fill="#ff3b30" radius={[6, 6, 0, 0]} maxBarSize={16} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="bg-[var(--color-card)] border border-[var(--color-border)]/55 p-10 rounded-[28px] text-center text-[var(--color-muted)] shadow-sm">
            <Zap className="w-9 h-9 mx-auto mb-3 opacity-20" />
            <p className="text-[14px] font-bold">No Records Yet</p>
            <p className="text-[12px] opacity-70 mt-1">
              Add transactions for this account to populate cash flow insights.
            </p>
          </div>
        )}

        {/* Top Expense Categories Breakdown */}
        {topCategories.categories.length > 0 ? (
          <div className="bg-[var(--color-card)] border border-[var(--color-border)]/55 p-5 rounded-[28px] shadow-sm">
             <div className="flex items-center gap-2 mb-5">
               <TrendingUp className="w-4.5 h-4.5 text-[var(--color-primary)]" />
               <p className="text-[13.5px] font-extrabold text-[var(--color-text)]">
                 Expense Categories Breakdown
               </p>
             </div>
             
             <div className="space-y-4">
               {topCategories.categories.map((cat) => {
                 const pct = Math.round((cat.total / topCategories.totalExpense) * 100) || 0;
                 return (
                   <div key={cat._id} className="flex items-center gap-3">
                     <div
                       className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border shadow-sm"
                       style={{ backgroundColor: `${cat.color}15`, borderColor: `${cat.color}25` }}
                     >
                       <LucideIcon name={cat.icon} className="w-5 h-5" style={{ color: cat.color }} />
                     </div>
                     <div className="flex-1 min-w-0">
                       <div className="flex justify-between items-end mb-1.5">
                         <p className="text-[14px] font-bold truncate pr-2 text-[var(--color-text)]">
                           {cat.name}
                         </p>
                         <div className="text-right">
                           <p className="text-[13.5px] font-black text-[var(--color-text)]">
                             {balanceVisible ? formatCurrency(cat.total) : '••••'}
                           </p>
                           <p className="text-[9.5px] font-extrabold text-[var(--color-muted)]">
                             {pct}% of spending
                           </p>
                         </div>
                       </div>
                       
                       {/* Curved glowing progress bar */}
                       <div className="w-full h-2 bg-[var(--color-surface)] border border-[var(--color-border)]/35 rounded-full overflow-hidden">
                         <motion.div
                           initial={{ width: 0 }}
                           animate={{ width: `${Math.min(pct, 100)}%` }}
                           transition={{ duration: 0.8, ease: "easeOut" }}
                           className="h-full rounded-full shadow-inner"
                           style={{ backgroundColor: cat.color }}
                         />
                       </div>
                     </div>
                   </div>
                 );
               })}
             </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
