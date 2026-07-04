import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../utils/helpers';
import { useAppStore } from '../store/appStore';
import { useTransactionStore } from '../store/transactionStore';
import { useCategoryStore } from '../store/categoryStore';
import { useWalletStore } from '../store/walletStore';
import { fetchBudgets, saveBudget } from '../services/apiServices';
import { calculateBurnRate, getMonthOverMonthComparison, getCategoryTrends, getWalletAnalysis } from '../services/insightsEngine';
import {
  ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Flame, Target,
  ArrowUpRight, ArrowDownLeft, BarChart3, PieChart, CreditCard,
  Calendar, DollarSign, X, Activity, Info
} from 'lucide-react';
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import LucideIcon from '../components/LucideIcon';
import MonthYearPicker from '../components/MonthYearPicker';

const CHART_COLORS = ['#007aff', '#34c759', '#ff9500', '#ff3b30', '#af52de', '#ff2d55', '#5ac8fa', '#ffcc00', '#4cd964', '#5856d6'];

export default function Analytics() {
  const navigate = useNavigate();
  const balanceVisible = useAppStore(s => s.balanceVisible);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [activeTab, setActiveTab] = useState('overview');
  
  // Custom modal states for budget creation/edit
  const [editBudgetCategory, setEditBudgetCategory] = useState(null);
  const [budgetInput, setBudgetInput] = useState('');
  
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [burnRate, setBurnRate] = useState(null);
  const [comparison, setComparison] = useState(null);
  const [trends, setTrends] = useState([]);
  const [walletAnalysis, setWalletAnalysis] = useState(null);
  const [budgets, setBudgets] = useState([]);

  const month = currentMonth.getMonth(), year = currentMonth.getFullYear();
  const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  const accounts = useWalletStore(s => s.wallets);
  const categories = useCategoryStore(s => s.categories);
  const allTransactions = useTransactionStore(s => s.transactions);

  const startDate = new Date(year, month, 1).toISOString();
  const endDate = new Date(year, month + 1, 0, 23, 59, 59).toISOString();
  
  const monthTransactions = useMemo(() => {
    return allTransactions.filter(t => t.date >= startDate && t.date <= endDate);
  }, [allTransactions, startDate, endDate]);

  useEffect(() => {
    calculateBurnRate(monthKey).then(setBurnRate);
    getMonthOverMonthComparison().then(setComparison);
    getCategoryTrends(6).then(setTrends);
    fetchBudgets(monthKey).then(b => setBudgets(b || [])).catch(() => {});
  }, [monthKey]);

  useEffect(() => {
    if (selectedWallet) {
      getWalletAnalysis(selectedWallet).then(setWalletAnalysis);
    }
  }, [selectedWallet]);

  const totalIncome = monthTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = monthTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const netFlow = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome * 100) : 0;

  const categoryBreakdown = useMemo(() => {
    const map = {};
    monthTransactions.filter(t => t.type === 'expense' && t.categoryId).forEach(t => {
      const cat = categories.find(c => c._id === t.categoryId);
      if (cat) {
        if (!map[cat._id]) map[cat._id] = { ...cat, total: 0, count: 0 };
        map[cat._id].total += t.amount;
        map[cat._id].count += 1;
      }
    });
    return Object.values(map).sort((a, b) => b.total - a.total);
  }, [monthTransactions, categories]);

  const dailySpending = useMemo(() => {
    const data = {};
    const dim = new Date(year, month + 1, 0).getDate();
    for (let d = 1; d <= dim; d++) data[d] = 0;
    monthTransactions.filter(t => t.type === 'expense').forEach(t => {
      const day = new Date(t.date).getDate();
      data[day] = (data[day] || 0) + t.amount;
    });
    return Object.entries(data).map(([day, amount]) => ({ day: parseInt(day), amount }));
  }, [monthTransactions, year, month]);

  const maxDailySpend = Math.max(...dailySpending.map(d => d.amount), 1);

  const budgetMap = {};
  budgets.forEach(b => { budgetMap[b.categoryId] = b; });
  const totalBudget = budgets.reduce((s, b) => s + b.limit, 0);
  const budgetUsed = totalBudget > 0 ? (totalExpense / totalBudget * 100) : 0;
  const pieData = categoryBreakdown.slice(0, 8).map((cat, i) => ({
    name: cat.name,
    value: cat.total,
    color: CHART_COLORS[i % CHART_COLORS.length]
  }));

  const handleSaveBudget = async (categoryId) => {
    const limit = parseFloat(budgetInput);
    if (isNaN(limit) || limit < 0) return;
    await saveBudget({ categoryId, monthKey, limit });
    const fresh = await fetchBudgets(monthKey);
    setBudgets(fresh || []);
    setEditBudgetCategory(null);
    setBudgetInput('');
  };

  const fmtVal = v => balanceVisible ? formatCurrency(v) : '••••';

  const TABS = [
    { key: 'overview', label: 'Overview', icon: BarChart3 },
    { key: 'budgets', label: 'Budgets', icon: Target },
    { key: 'categories', label: 'Categories', icon: PieChart },
    { key: 'wallets', label: 'Cards', icon: CreditCard },
    { key: 'trends', label: 'Trends', icon: Activity },
  ];

  return (
    <div className="px-4 pt-5 pb-28 max-w-lg mx-auto bg-[var(--color-bg)] min-h-[100dvh]">
      {/* Month Picker Header */}
      <div className="flex items-center justify-between mb-6 bg-[var(--color-card)] border border-[var(--color-border)]/45 px-3 py-2.5 rounded-2xl shadow-sm">
        <button
          onClick={prevMonth}
          className="w-9 h-9 rounded-xl bg-[var(--color-surface)] flex items-center justify-center haptic hover:bg-[var(--color-border)]/20 transition-colors"
        >
          <ChevronLeft className="w-4.5 h-4.5 text-[var(--color-text)]" />
        </button>
        <MonthYearPicker
          currentMonth={month}
          currentYear={year}
          onChange={(m, y) => setCurrentMonth(new Date(y, m, 1))}
        />
        <button
          onClick={nextMonth}
          className="w-9 h-9 rounded-xl bg-[var(--color-surface)] flex items-center justify-center haptic hover:bg-[var(--color-border)]/20 transition-colors"
        >
          <ChevronRight className="w-4.5 h-4.5 text-[var(--color-text)]" />
        </button>
      </div>

      {/* Summary KPI Cards Grid */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        <div className="bg-[var(--color-card)] border border-[var(--color-border)]/55 p-3 rounded-2xl text-center relative overflow-hidden shadow-sm">
          <div className="w-7 h-7 rounded-xl bg-green-500/10 flex items-center justify-center mx-auto mb-2 border border-green-500/10">
            <ArrowDownLeft className="w-4 h-4 text-green-500" strokeWidth={2.5} />
          </div>
          <p className="text-[10px] text-[var(--color-muted)] font-extrabold uppercase tracking-wide">Income</p>
          <p className="text-[13.5px] font-black text-[var(--color-success)] mt-0.5 tracking-tight truncate">
            {fmtVal(totalIncome)}
          </p>
        </div>
        
        <div className="bg-[var(--color-card)] border border-[var(--color-border)]/55 p-3 rounded-2xl text-center relative overflow-hidden shadow-sm">
          <div className="w-7 h-7 rounded-xl bg-red-500/10 flex items-center justify-center mx-auto mb-2 border border-red-500/10">
            <ArrowUpRight className="w-4 h-4 text-red-500" strokeWidth={2.5} />
          </div>
          <p className="text-[10px] text-[var(--color-muted)] font-extrabold uppercase tracking-wide">Spent</p>
          <p className="text-[13.5px] font-black text-[var(--color-danger)] mt-0.5 tracking-tight truncate">
            {fmtVal(totalExpense)}
          </p>
        </div>

        <div className="bg-[var(--color-card)] border border-[var(--color-border)]/55 p-3 rounded-2xl text-center relative overflow-hidden shadow-sm">
          <div
            className="w-7 h-7 rounded-xl flex items-center justify-center mx-auto mb-2 border"
            style={{
              backgroundColor: netFlow >= 0 ? '#34c75915' : '#ff3b3015',
              borderColor: netFlow >= 0 ? '#34c75920' : '#ff3b3020'
            }}
          >
            {netFlow >= 0 ? (
              <TrendingUp className="w-4 h-4 text-green-500" strokeWidth={2.5} />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500" strokeWidth={2.5} />
            )}
          </div>
          <p className="text-[10px] text-[var(--color-muted)] font-extrabold uppercase tracking-wide">Net Flow</p>
          <p className={`text-[13.5px] font-black mt-0.5 tracking-tight truncate ${netFlow >= 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'}`}>
            {fmtVal(netFlow)}
          </p>
        </div>
      </div>

      {/* Tabs segment controller (Sliding glass style) */}
      <div className="relative flex bg-[var(--color-card)] border border-[var(--color-border)]/45 p-1 rounded-2xl mb-6 overflow-x-auto select-none" style={{ scrollbarWidth: 'none' }}>
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="relative flex-1 flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-[12.5px] font-bold shrink-0 transition-all haptic z-10"
            style={{ color: activeTab === tab.key ? 'var(--color-text)' : 'var(--color-muted)' }}
          >
            {activeTab === tab.key && (
              <motion.div
                layoutId="activeAnalyticsTab"
                className="absolute inset-0 bg-[var(--color-surface)] border border-[var(--color-border)]/35 rounded-xl shadow-sm -z-10"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.18 }}
        >
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {burnRate && burnRate.dailyBurnRate > 0 && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[var(--color-card)] border border-[var(--color-border)]/55 p-4 rounded-[24px] shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-orange-500/[0.04] rounded-full blur-xl pointer-events-none" />
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 rounded-lg bg-orange-500/10 flex items-center justify-center">
                        <Flame className="w-4 h-4 text-orange-500" />
                      </div>
                      <p className="text-[11px] text-[var(--color-muted)] font-extrabold uppercase tracking-wider">Burn Rate</p>
                    </div>
                    <p className="text-[19px] font-black text-orange-500 tracking-tight">
                      {fmtVal(burnRate.dailyBurnRate)}<span className="text-[11px] font-medium text-[var(--color-muted)]">/day</span>
                    </p>
                    <p className="text-[10px] text-[var(--color-muted)] font-semibold mt-1">
                      Runway: {burnRate.daysRemaining} days remaining
                    </p>
                  </div>

                  <div className="bg-[var(--color-card)] border border-[var(--color-border)]/55 p-4 rounded-[24px] shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-violet-500/[0.04] rounded-full blur-xl pointer-events-none" />
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 rounded-lg bg-violet-500/10 flex items-center justify-center">
                        <Target className="w-4 h-4 text-violet-500" />
                      </div>
                      <p className="text-[11px] text-[var(--color-muted)] font-extrabold uppercase tracking-wider">Projected</p>
                    </div>
                    <p className="text-[19px] font-black text-violet-500 tracking-tight">
                      {fmtVal(burnRate.projectedMonthTotal)}
                    </p>
                    <p className="text-[10px] text-[var(--color-muted)] font-semibold mt-1">
                      Est. monthly spending
                    </p>
                  </div>

                  {comparison && comparison.lastMonth.totalExpense > 0 && (
                    <div className="bg-[var(--color-card)] border border-[var(--color-border)]/55 p-4 rounded-[24px] shadow-sm relative overflow-hidden">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${comparison.direction === 'up' ? 'bg-red-500/10' : 'bg-green-500/10'}`}>
                          {comparison.direction === 'up' ? (
                            <TrendingUp className="w-4 h-4 text-red-500" strokeWidth={2.5} />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-green-500" strokeWidth={2.5} />
                          )}
                        </div>
                        <p className="text-[11px] text-[var(--color-muted)] font-extrabold uppercase tracking-wider">vs Last Mo</p>
                      </div>
                      <p className={`text-[19px] font-black tracking-tight ${comparison.direction === 'up' ? 'text-red-500' : 'text-green-500'}`}>
                        {comparison.direction === 'up' ? '+' : '-'}{Math.abs(comparison.changePercent)}%
                      </p>
                      <p className="text-[10px] text-[var(--color-muted)] font-semibold mt-1">
                        {comparison.direction === 'up' ? 'Spending Increased' : 'Spending Decreased'}
                      </p>
                    </div>
                  )}

                  <div className="bg-[var(--color-card)] border border-[var(--color-border)]/55 p-4 rounded-[24px] shadow-sm relative overflow-hidden">
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: savingsRate >= 0 ? '#34c75915' : '#ff3b3015' }}
                      >
                        <DollarSign className="w-4 h-4" style={{ color: savingsRate >= 0 ? '#34c759' : '#ff3b30' }} strokeWidth={2.5} />
                      </div>
                      <p className="text-[11px] text-[var(--color-muted)] font-extrabold uppercase tracking-wider">Savings Rate</p>
                    </div>
                    <p className={`text-[19px] font-black tracking-tight ${savingsRate >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {savingsRate.toFixed(0)}%
                    </p>
                    <p className="text-[10px] text-[var(--color-muted)] font-semibold mt-1">
                      Of current income saved
                    </p>
                  </div>
                </div>
              )}

              {/* Heatmap Grid */}
              <div className="bg-[var(--color-card)] border border-[var(--color-border)]/55 p-4 rounded-[28px] shadow-sm">
                <h3 className="text-[14px] font-extrabold mb-4 flex items-center gap-2 text-[var(--color-text)]">
                  <Calendar className="w-4.5 h-4.5 text-[var(--color-primary)]" />
                  Daily Spending Calendar
                </h3>
                <div className="grid grid-cols-7 gap-1.5">
                  {['S','M','T','W','T','F','S'].map((d, i) => (
                    <div key={i} className="text-[9.5px] text-[var(--color-muted)] text-center font-extrabold pb-1">
                      {d}
                    </div>
                  ))}
                  {Array.from({ length: new Date(year, month, 1).getDay() }, (_, i) => (
                    <div key={`pad-${i}`} />
                  ))}
                  {dailySpending.map(({ day, amount }) => {
                    const int = amount > 0 ? Math.max(0.12, amount / maxDailySpend) : 0;
                    const today = new Date();
                    const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
                    
                    return (
                      <div
                        key={day}
                        className={`w-full aspect-square rounded-[8px] flex items-center justify-center text-[10px] font-bold transition-all relative group cursor-pointer ${
                          isToday ? 'ring-2 ring-[var(--color-primary)] ring-offset-1 ring-offset-[var(--color-card)]' : ''
                        }`}
                        style={{
                          backgroundColor: amount > 0 ? `rgba(255, 59, 48, ${int})` : 'var(--color-surface)',
                          color: int > 0.45 ? '#ffffff' : 'var(--color-text)',
                        }}
                      >
                        {day}
                        {/* Hover Tooltip tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-[var(--color-surface)] border border-[var(--color-border)]/65 text-[10.5px] font-extrabold px-2 py-1.5 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-30 shadow-lg whitespace-nowrap">
                          {day} {new Intl.DateTimeFormat('en-US', { month: 'short' }).format(currentMonth)}: {formatCurrency(amount)}
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-[var(--color-border)]/40 px-1">
                  <span className="text-[10px] text-[var(--color-muted)] font-bold">Less</span>
                  <div className="flex gap-1.5">
                    {[0, 0.2, 0.4, 0.6, 0.8, 1].map(v => (
                      <div
                        key={v}
                        className="w-3 h-3 rounded-[4px]"
                        style={{ backgroundColor: `rgba(255, 59, 48, ${v || 0.05})` }}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] text-[var(--color-muted)] font-bold">More</span>
                </div>
              </div>

              {/* Top spending categories */}
              <div className="bg-[var(--color-card)] border border-[var(--color-border)]/55 p-5 rounded-[28px] shadow-sm">
                <h3 className="text-[14px] font-extrabold mb-4 text-[var(--color-text)]">Top Spending Categories</h3>
                {categoryBreakdown.length === 0 ? (
                  <p className="text-[13px] text-[var(--color-muted)] font-bold text-center py-6">No expenses logged this month</p>
                ) : (
                  <div className="space-y-4">
                    {categoryBreakdown.slice(0, 5).map((cat, i) => {
                      const pct = totalExpense > 0 ? (cat.total / totalExpense * 100) : 0;
                      return (
                        <div key={cat._id} className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border"
                            style={{
                              backgroundColor: `${cat.color || CHART_COLORS[i % CHART_COLORS.length]}12`,
                              borderColor: `${cat.color || CHART_COLORS[i % CHART_COLORS.length]}20`
                            }}
                          >
                            <LucideIcon name={cat.icon} className="w-4.5 h-4.5" style={{ color: cat.color || CHART_COLORS[i % CHART_COLORS.length] }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[13.5px] font-bold truncate text-[var(--color-text)]">{cat.name}</span>
                              <span className="text-[13.5px] font-black text-[var(--color-danger)] ml-2">{fmtVal(cat.total)}</span>
                            </div>
                            <div className="w-full h-1.5 bg-[var(--color-surface)] border border-[var(--color-border)]/35 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{ duration: 0.8 }}
                                className="h-full rounded-full"
                                style={{ backgroundColor: cat.color || CHART_COLORS[i % CHART_COLORS.length] }}
                              />
                            </div>
                          </div>
                          <span className="text-[11px] text-[var(--color-muted)] font-extrabold w-8 text-right shrink-0">
                            {pct.toFixed(0)}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* BUDGETS TAB */}
          {activeTab === 'budgets' && (
            <div className="space-y-4">
              {totalBudget > 0 && (
                <div className="bg-[var(--color-card)] border border-[var(--color-border)]/55 p-5 rounded-[28px] shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-[11px] text-[var(--color-muted)] font-extrabold uppercase tracking-wider">Monthly Budget</p>
                      <p className="text-[24px] font-black text-[var(--color-text)] tracking-tight">{fmtVal(totalBudget)}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-[19px] font-black ${budgetUsed > 100 ? 'text-[var(--color-danger)]' : 'text-[var(--color-success)]'}`}>
                        {budgetUsed.toFixed(0)}%
                      </p>
                      <p className="text-[10px] text-[var(--color-muted)] font-bold">Limit consumed</p>
                    </div>
                  </div>
                  <div className="w-full h-2.5 bg-[var(--color-surface)] border border-[var(--color-border)]/35 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(budgetUsed, 100)}%` }}
                      transition={{ duration: 0.8 }}
                      className="h-full rounded-full"
                      style={{
                        backgroundColor: budgetUsed > 100 ? 'var(--color-danger)' : budgetUsed > 75 ? '#ff9500' : 'var(--color-success)'
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-[11.5px] font-bold mt-3">
                    <span className="text-[var(--color-muted)]">
                      Spent: <strong className="text-[var(--color-danger)] font-extrabold">{fmtVal(totalExpense)}</strong>
                    </span>
                    <span className="text-[var(--color-muted)]">
                      Remaining: <strong className="text-[var(--color-success)] font-extrabold">{fmtVal(Math.max(0, totalBudget - totalExpense))}</strong>
                    </span>
                  </div>
                </div>
              )}

              <div className="bg-[var(--color-card)] border border-[var(--color-border)]/55 p-5 rounded-[28px] shadow-sm">
                <h3 className="text-[14px] font-extrabold mb-4 text-[var(--color-text)]">Category Budgets</h3>
                {categories.length === 0 ? (
                  <p className="text-[13px] text-[var(--color-muted)] font-bold text-center py-6">No categories available</p>
                ) : (
                  <div className="space-y-1">
                    {categories.map(cat => {
                      const b = budgetMap[cat._id];
                      const isEditing = editBudgetCategory === cat._id;
                      const catSpent = categoryBreakdown.find(c => c._id === cat._id)?.total || 0;
                      const catPct = b ? Math.min((catSpent / b.limit) * 100, 100) : 0;
                      
                      return (
                        <div key={cat._id} className="py-3 border-b border-[var(--color-border)]/40 last:border-0">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-8.5 h-8.5 rounded-xl flex items-center justify-center border shadow-sm shrink-0"
                                style={{ backgroundColor: `${cat.color || '#888'}10`, borderColor: `${cat.color || '#888'}18` }}
                              >
                                <LucideIcon name={cat.icon} className="w-4 h-4" style={{ color: cat.color }} />
                              </div>
                              <div>
                                <span className="text-[13.5px] font-bold block text-[var(--color-text)]">{cat.name}</span>
                                {b && (
                                  <span className="text-[11px] text-[var(--color-muted)] font-medium">
                                    {fmtVal(catSpent)} of {fmtVal(b.limit)}
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            {isEditing ? (
                              <div className="flex items-center gap-1.5">
                                <input
                                  autoFocus
                                  type="number"
                                  value={budgetInput}
                                  onChange={e => setBudgetInput(e.target.value)}
                                  onKeyDown={e => e.key === 'Enter' && handleSaveBudget(cat._id)}
                                  className="w-20 bg-[var(--color-surface)] py-1.5 px-2.5 rounded-lg text-right text-[12px] font-bold outline-none border border-[var(--color-primary)]/50 focus:border-[var(--color-primary)] text-[var(--color-text)]"
                                  placeholder="0"
                                />
                                <button
                                  onClick={() => handleSaveBudget(cat._id)}
                                  className="text-[11px] font-bold text-white bg-[var(--color-primary)] px-2.5 py-1.5 rounded-lg haptic"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => setEditBudgetCategory(null)}
                                  className="p-1.5 rounded-lg hover:bg-[var(--color-surface)]"
                                >
                                  <X className="w-4 h-4 text-[var(--color-muted)]" />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => {
                                  setEditBudgetCategory(cat._id);
                                  setBudgetInput(b ? String(b.limit) : '');
                                }}
                                className={`text-[11.5px] font-bold px-3 py-1.5 rounded-full active:scale-95 transition-all haptic ${
                                  b
                                    ? 'text-[var(--color-text)] bg-[var(--color-surface)] border border-[var(--color-border)]/45'
                                    : 'text-[var(--color-primary)] bg-[var(--color-primary)]/10 border border-transparent'
                                }`}
                              >
                                {b ? fmtVal(b.limit) : 'Set Limit'}
                              </button>
                            )}
                          </div>
                          {b && (
                            <div className="w-full h-1.5 bg-[var(--color-surface)] border border-[var(--color-border)]/35 rounded-full overflow-hidden mt-2.5">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${catPct}%` }}
                                className="h-full rounded-full"
                                style={{
                                  backgroundColor: catPct > 90 ? 'var(--color-danger)' : catPct > 65 ? '#ff9500' : cat.color || 'var(--color-primary)'
                                }}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* CATEGORIES TAB */}
          {activeTab === 'categories' && (
            <div className="space-y-4">
              {pieData.length > 0 && (
                <div className="bg-[var(--color-card)] border border-[var(--color-border)]/55 p-5 rounded-[28px] shadow-sm">
                  <h3 className="text-[14px] font-extrabold mb-4 text-[var(--color-text)]">Expense Distribution</h3>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPie>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={62}
                          outerRadius={90}
                          paddingAngle={3.5}
                          dataKey="value"
                        >
                          {pieData.map((e, idx) => (
                            <Cell key={idx} fill={e.color} stroke="none" />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={v => formatCurrency(v)}
                          contentStyle={{
                            backgroundColor: 'var(--color-card)',
                            border: '1px solid var(--color-border)',
                            borderRadius: '16px',
                            fontSize: '12.5px',
                            fontWeight: 'bold',
                            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)'
                          }}
                        />
                      </RechartsPie>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="flex flex-wrap gap-2.5 mt-3 justify-center">
                    {pieData.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-[11px] font-bold">
                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="text-[var(--color-muted)]">{item.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {categoryBreakdown.map((cat, i) => {
                  const budget = budgetMap[cat._id];
                  const budgetPct = budget ? Math.min((cat.total / budget.limit) * 100, 100) : 0;
                  const isEditing = editBudgetCategory === cat._id;
                  
                  return (
                    <motion.div
                      key={cat._id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="bg-[var(--color-card)] border border-[var(--color-border)]/55 p-4 rounded-[24px] shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border"
                          style={{
                            backgroundColor: `${cat.color || CHART_COLORS[i % CHART_COLORS.length]}10`,
                            borderColor: `${cat.color || CHART_COLORS[i % CHART_COLORS.length]}18`
                          }}
                        >
                          <LucideIcon name={cat.icon} className="w-5 h-5" style={{ color: cat.color || CHART_COLORS[i % CHART_COLORS.length] }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[14px] font-bold text-[var(--color-text)]">{cat.name}</p>
                          <p className="text-[11.5px] text-[var(--color-muted)] font-medium">{cat.count} payments</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[14.5px] font-black text-[var(--color-danger)]">{fmtVal(cat.total)}</p>
                          {budget && (
                            <p className="text-[10px] text-[var(--color-muted)] font-semibold mt-0.5">
                              of {fmtVal(budget.limit)}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {budget && (
                        <div className="w-full h-1.5 bg-[var(--color-surface)] border border-[var(--color-border)]/35 rounded-full overflow-hidden mt-3 mb-2">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${budgetPct}%` }}
                            className="h-full rounded-full"
                            style={{
                              backgroundColor: budgetPct > 100 ? 'var(--color-danger)' : budgetPct > 70 ? '#ff9500' : 'var(--color-success)'
                            }}
                          />
                        </div>
                      )}
                      
                      {isEditing ? (
                        <div className="flex gap-2 mt-3 border-t border-[var(--color-border)]/30 pt-3">
                          <input
                            type="number"
                            value={budgetInput}
                            onChange={e => setBudgetInput(e.target.value)}
                            placeholder="Limit Amount"
                            autoFocus
                            className="flex-1 px-3 py-2 rounded-xl bg-[var(--color-surface)] text-[12px] font-bold focus:outline-none border border-[var(--color-border)]/55 focus:border-[var(--color-primary)] text-[var(--color-text)]"
                          />
                          <button
                            onClick={() => handleSaveBudget(cat._id)}
                            className="px-3 py-2 rounded-xl gradient-primary text-white text-[12px] font-bold haptic shadow-md"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditBudgetCategory(null)}
                            className="px-3 py-2 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]/45 text-[var(--color-text)] text-[12px] font-bold haptic"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setEditBudgetCategory(cat._id);
                            setBudgetInput(budget ? String(budget.limit) : '');
                          }}
                          className="text-[12px] text-[var(--color-primary)] font-bold mt-2.5 flex items-center gap-1 hover:underline haptic"
                        >
                          {budget ? 'Edit Budget' : '+ Configure Budget'}
                        </button>
                      )}
                    </motion.div>
                  );
                })}
              </div>
              
              {categoryBreakdown.length === 0 && (
                <div className="bg-[var(--color-card)] border border-[var(--color-border)]/55 text-center py-12 rounded-[28px]">
                  <PieChart className="w-12 h-12 text-[var(--color-muted)] mx-auto mb-3 opacity-30" />
                  <p className="text-[15px] font-bold mb-1">No Payments Tracked</p>
                  <p className="text-[13px] text-[var(--color-muted)] px-4">
                    Add transactions for this month to generate category breakdown metrics.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* WALLETS TAB */}
          {activeTab === 'wallets' && (
            <div className="space-y-4">
              <div className="flex gap-2 mb-2 overflow-x-auto pb-1.5 select-none" style={{ scrollbarWidth: 'none' }}>
                {accounts.map(acc => (
                  <button
                    key={acc._id}
                    onClick={() => setSelectedWallet(acc._id)}
                    className={`shrink-0 px-4 py-2.5 rounded-2xl text-[12.5px] font-bold transition-all border haptic ${
                      selectedWallet === acc._id
                        ? 'gradient-primary text-white border-transparent shadow-md shadow-blue-500/25'
                        : 'bg-[var(--color-card)] border-[var(--color-border)]/45 text-[var(--color-muted)]'
                    }`}
                  >
                    {acc.name}
                  </button>
                ))}
              </div>
              
              {!selectedWallet && (
                <div className="bg-[var(--color-card)] border border-[var(--color-border)]/55 text-center py-12 rounded-[28px] shadow-sm">
                  <CreditCard className="w-12 h-12 text-[var(--color-muted)] mx-auto mb-3 opacity-30" />
                  <p className="text-[15px] font-bold mb-1">Select an Account</p>
                  <p className="text-[13px] text-[var(--color-muted)] px-4">
                    Choose one of your cards or wallets from the list above to view analysis.
                  </p>
                </div>
              )}

              {walletAnalysis && selectedWallet && (
                <div className="space-y-4">
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[var(--color-card)] border border-[var(--color-border)]/55 p-5 rounded-[28px] shadow-sm"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border"
                        style={{
                          backgroundColor: `${walletAnalysis.account.color || '#007aff'}12`,
                          borderColor: `${walletAnalysis.account.color || '#007aff'}20`
                        }}
                      >
                        <LucideIcon name={walletAnalysis.account.icon || 'wallet'} className="w-6 h-6" style={{ color: walletAnalysis.account.color || '#007aff' }} />
                      </div>
                      <div>
                        <p className="text-[17px] font-black text-[var(--color-text)]">{walletAnalysis.account.name}</p>
                        <p className="text-[12px] text-[var(--color-muted)] font-bold">{walletAnalysis.transactionCount} payments mapped</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2.5">
                      <div className="bg-[var(--color-surface)] border border-[var(--color-border)]/35 rounded-2xl p-3 text-center">
                        <p className="text-[9.5px] text-[var(--color-muted)] font-extrabold uppercase">Income</p>
                        <p className="text-[13.5px] font-black text-[var(--color-success)] mt-0.5">{fmtVal(walletAnalysis.totalIncome)}</p>
                      </div>
                      <div className="bg-[var(--color-surface)] border border-[var(--color-border)]/35 rounded-2xl p-3 text-center">
                        <p className="text-[9.5px] text-[var(--color-muted)] font-extrabold uppercase">Expense</p>
                        <p className="text-[13.5px] font-black text-[var(--color-danger)] mt-0.5">{fmtVal(walletAnalysis.totalExpense)}</p>
                      </div>
                      <div className="bg-[var(--color-surface)] border border-[var(--color-border)]/35 rounded-2xl p-3 text-center">
                        <p className="text-[9.5px] text-[var(--color-muted)] font-extrabold uppercase">Avg Txn</p>
                        <p className="text-[13.5px] font-black text-[var(--color-text)] mt-0.5">{fmtVal(walletAnalysis.avgTransaction)}</p>
                      </div>
                    </div>
                  </motion.div>

                  {walletAnalysis.monthlyData.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 }}
                      className="bg-[var(--color-card)] border border-[var(--color-border)]/55 p-4 rounded-[28px] shadow-sm"
                    >
                      <h3 className="text-[14px] font-extrabold mb-4 text-[var(--color-text)]">Monthly Cash Flow Trend</h3>
                      <div className="h-44">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={walletAnalysis.monthlyData} barGap={4} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" opacity={0.15} />
                            <XAxis
                              dataKey="month"
                              tickLine={false}
                              axisLine={false}
                              tick={{ fontSize: 9, fill: 'var(--color-muted)', fontWeight: 'bold' }}
                            />
                            <YAxis
                              tickLine={false}
                              axisLine={false}
                              tick={{ fontSize: 9, fill: 'var(--color-muted)', fontWeight: 'bold' }}
                              width={40}
                            />
                            <Tooltip
                              formatter={v => formatCurrency(v)}
                              contentStyle={{
                                backgroundColor: 'var(--color-card)',
                                border: '1px solid var(--color-border)',
                                borderRadius: '14px',
                                fontSize: '12px',
                                fontWeight: 'bold',
                                boxShadow: '0 8px 20px -4px rgba(0,0,0,0.1)'
                              }}
                            />
                            <Bar dataKey="income" fill="#34c759" radius={[4, 4, 0, 0]} name="Income" maxBarSize={12} />
                            <Bar dataKey="expense" fill="#ff3b30" radius={[4, 4, 0, 0]} name="Expense" maxBarSize={12} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </motion.div>
                  )}

                  {walletAnalysis.topCategories.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="bg-[var(--color-card)] border border-[var(--color-border)]/55 p-5 rounded-[28px] shadow-sm animate-fade-in"
                    >
                      <h3 className="text-[14px] font-extrabold mb-4 text-[var(--color-text)]">Top Card Categories</h3>
                      <div className="space-y-4">
                        {walletAnalysis.topCategories.map((cat, i) => {
                          const pct = walletAnalysis.totalExpense > 0 ? (cat.total / walletAnalysis.totalExpense * 100) : 0;
                          return (
                            <div key={cat._id} className="flex items-center gap-3">
                              <div
                                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border"
                                style={{
                                  backgroundColor: `${cat.color || CHART_COLORS[i % CHART_COLORS.length]}10`,
                                  borderColor: `${cat.color || CHART_COLORS[i % CHART_COLORS.length]}18`
                                }}
                              >
                                <LucideIcon name={cat.icon} className="w-4.5 h-4.5" style={{ color: cat.color || CHART_COLORS[i % CHART_COLORS.length] }} />
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between text-[13.5px] mb-1">
                                  <span className="font-bold truncate text-[var(--color-text)] pr-2">{cat.name}</span>
                                  <span className="font-black text-[var(--color-text)] shrink-0 ml-2">{fmtVal(cat.total)}</span>
                                </div>
                                <div className="w-full h-1.5 bg-[var(--color-surface)] border border-[var(--color-border)]/35 rounded-full overflow-hidden">
                                  <div
                                    className="h-full rounded-full"
                                    style={{
                                      width: `${pct}%`,
                                      backgroundColor: cat.color || CHART_COLORS[i % CHART_COLORS.length]
                                    }}
                                  />
                                </div>
                                <p className="text-[9px] text-[var(--color-muted)] font-extrabold mt-1">
                                  {pct.toFixed(0)}% of wallet spending
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TRENDS TAB */}
          {activeTab === 'trends' && (
            <div className="space-y-4">
              {trends.length > 0 && (
                <>
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[var(--color-card)] border border-[var(--color-border)]/55 p-4 rounded-[28px] shadow-sm"
                  >
                    <h3 className="text-[14px] font-extrabold mb-4 text-[var(--color-text)]">6-Month Cash Trend</h3>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={trends} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
                          <defs>
                            <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#34c759" stopOpacity={0.25} />
                              <stop offset="95%" stopColor="#34c759" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#ff3b30" stopOpacity={0.25} />
                              <stop offset="95%" stopColor="#ff3b30" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" opacity={0.15} />
                          <XAxis
                            dataKey="monthLabel"
                            tickLine={false}
                            axisLine={false}
                            tick={{ fontSize: 9, fill: 'var(--color-muted)', fontWeight: 'bold' }}
                          />
                          <YAxis
                            tickLine={false}
                            axisLine={false}
                            tick={{ fontSize: 9, fill: 'var(--color-muted)', fontWeight: 'bold' }}
                            width={35}
                          />
                          <Tooltip
                            formatter={v => formatCurrency(v)}
                            contentStyle={{
                              backgroundColor: 'var(--color-card)',
                              border: '1px solid var(--color-border)',
                              borderRadius: '16px',
                              fontSize: '12px',
                              fontWeight: 'bold',
                              boxShadow: '0 8px 20px -4px rgba(0,0,0,0.1)'
                            }}
                          />
                          <Area type="monotone" dataKey="totalIncome" stroke="#34c759" fill="url(#incomeGrad)" strokeWidth={2.5} name="Income" />
                          <Area type="monotone" dataKey="totalExpense" stroke="#ff3b30" fill="url(#expenseGrad)" strokeWidth={2.5} name="Expense" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="bg-[var(--color-card)] border border-[var(--color-border)]/55 p-4 rounded-[28px] shadow-sm"
                  >
                    <h3 className="text-[14px] font-extrabold mb-4 text-[var(--color-text)]">Net Capital Flow History</h3>
                    <div className="h-44">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={trends} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" opacity={0.15} />
                          <XAxis
                            dataKey="monthLabel"
                            tickLine={false}
                            axisLine={false}
                            tick={{ fontSize: 9, fill: 'var(--color-muted)', fontWeight: 'bold' }}
                          />
                          <YAxis
                            tickLine={false}
                            axisLine={false}
                            tick={{ fontSize: 9, fill: 'var(--color-muted)', fontWeight: 'bold' }}
                            width={35}
                          />
                          <Tooltip
                            formatter={v => formatCurrency(v)}
                            contentStyle={{
                              backgroundColor: 'var(--color-card)',
                              border: '1px solid var(--color-border)',
                              borderRadius: '16px',
                              fontSize: '12px',
                              fontWeight: 'bold',
                              boxShadow: '0 8px 20px -4px rgba(0,0,0,0.1)'
                            }}
                          />
                          <Bar dataKey="netFlow" radius={[5, 5, 0, 0]} name="Net Flow" maxBarSize={16}>
                            {trends.map((entry, idx) => (
                              <Cell
                                key={idx}
                                fill={entry.netFlow >= 0 ? '#34c759' : '#ff3b30'}
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-[var(--color-card)] border border-[var(--color-border)]/55 p-5 rounded-[28px] shadow-sm overflow-hidden"
                  >
                    <h3 className="text-[14px] font-extrabold mb-4 text-[var(--color-text)]">Monthly Summary List</h3>
                    <div className="space-y-1">
                      {[...trends].reverse().map(m => (
                        <div
                          key={m.monthKey}
                          className="flex items-center justify-between py-3 border-b border-[var(--color-border)]/30 last:border-none text-[12.5px]"
                        >
                          <span className="font-bold w-12 text-[var(--color-text)]">{m.monthLabel}</span>
                          <span className="text-[var(--color-success)] font-extrabold">+{fmtVal(m.totalIncome)}</span>
                          <span className="text-[var(--color-danger)] font-extrabold">-{fmtVal(m.totalExpense)}</span>
                          <span className={`font-black ${m.netFlow >= 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'}`}>
                            {m.netFlow >= 0 ? '+' : ''}{fmtVal(m.netFlow)}
                          </span>
                          <span className="text-[10px] text-[var(--color-muted)] font-bold">{m.transactionCount} txns</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </>
              )}
              
              {trends.length === 0 && (
                <div className="bg-[var(--color-card)] border border-[var(--color-border)]/55 text-center py-12 rounded-[28px] shadow-sm">
                  <Activity className="w-12 h-12 text-[var(--color-muted)] mx-auto mb-3 opacity-30" />
                  <p className="text-[15px] font-bold mb-1">No Historical Records</p>
                  <p className="text-[13px] text-[var(--color-muted)] px-4">
                    Continue logging payments over multiple months to enable historical analytics and forecasting.
                  </p>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
