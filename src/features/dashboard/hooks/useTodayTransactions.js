import { useMemo } from 'react';
import { useTransactionStore } from '../../../store/transactionStore';
import { useCategoryStore } from '../../../store/categoryStore';

export function useTodayTransactions() {
  const transactions = useTransactionStore((s) => s.transactions);
  const categories = useCategoryStore((s) => s.categories);
  
  const now = new Date();
  
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).toISOString();
  
  const todayTransactions = useMemo(() => {
    return transactions.filter((t) => t.date >= startOfDay && t.date <= endOfDay);
  }, [transactions, startOfDay, endOfDay]);

  const todaySpent = useMemo(() => {
    return todayTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [todayTransactions]);

  const catMap = useMemo(() => {
    const map = {};
    categories.forEach((c) => { map[c._id] = c; });
    return map;
  }, [categories]);

  return {
    todayTransactions,
    todaySpent,
    catMap
  };
}
