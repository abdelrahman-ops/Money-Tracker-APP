import { useMemo, useEffect, useState } from 'react';
import { useWalletStore } from '../../../store/walletStore';
import { useTransactionStore } from '../../../store/transactionStore';
import { fetchMonthlyStats } from '../../../services/apiServices';
import { useAppStore } from '../../../store/appStore';
import { useFinancialStore } from '../../../store/financialStore';

export function useDashboardData() {
  const balanceVisible = useAppStore((s) => s.balanceVisible);
  const toggleBalanceVisible = useAppStore((s) => s.toggleBalanceVisible);

  const accounts = useWalletStore((s) => s.wallets);
  const isLoadingAccounts = useWalletStore((s) => s.isLoading);
  const transactions = useTransactionStore((s) => s.transactions);
  
  const insights = useFinancialStore((s) => s.insights);
  const dailyLimit = useFinancialStore((s) => s.dailyLimit);
  const healthScore = useFinancialStore((s) => s.healthScore);
  const projection = useFinancialStore((s) => s.projection);

  const [monthStats, setMonthStats] = useState({ income: 0, expense: 0, transactionCount: 0 });
  const now = new Date();

  useEffect(() => {
    fetchMonthlyStats(now.getFullYear(), now.getMonth())
      .then(setMonthStats)
      .catch(() => {});
  }, [now.getFullYear(), now.getMonth()]);

  const totalBalance = accounts.reduce((sum, a) => sum + (a.balance || 0), 0);

  const getStreakDays = () => {
    let streak = 0;
    const d = new Date(now);
    for (let i = 0; i < 30; i++) {
      const dayStr = d.toDateString();
      const dayTxns = transactions.filter((t) => new Date(t.date).toDateString() === dayStr);
      if (dayTxns.length > 0) {
        streak++;
        d.setDate(d.getDate() - 1);
      } else break;
    }
    return streak;
  };
  const streakDays = getStreakDays();

  const greeting = () => {
    const h = now.getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const monthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(now);

  return {
    balanceVisible,
    toggleBalanceVisible,
    accounts,
    isLoadingAccounts,
    monthIncome: monthStats.income,
    monthExpense: monthStats.expense,
    monthTransactionCount: monthStats.transactionCount || transactions.length,
    totalBalance,
    streakDays,
    greeting: greeting(),
    monthName,
    insights,
    dailyLimit,
    healthScore,
    projection,
  };
}
