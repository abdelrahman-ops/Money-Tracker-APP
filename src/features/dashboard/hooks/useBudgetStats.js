import { useState, useEffect, useMemo } from 'react';
import { useTransactionStore } from '../../../store/transactionStore';
import { useCategoryStore } from '../../../store/categoryStore';
import { fetchBudgetsByMonth } from '../../../services/budgetService';

export function useBudgetStats(monthExpense) {
  const transactions = useTransactionStore((s) => s.transactions);
  const categories = useCategoryStore((s) => s.categories);
  const [budgets, setBudgets] = useState([]);

  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  useEffect(() => {
    fetchBudgetsByMonth(monthKey).then(setBudgets).catch(() => {});
  }, [monthKey]);

  const totalBudget = budgets.reduce((s, b) => s + b.limit, 0);
  const budgetPct = totalBudget > 0 ? Math.min((monthExpense / totalBudget) * 100, 100) : 0;
  const budgetRemaining = totalBudget - monthExpense;

  const catMap = useMemo(() => {
    const map = {};
    categories.forEach((c) => { map[c._id] = c; });
    return map;
  }, [categories]);

  const topCategories = useMemo(() => {
    const map = {};
    transactions
      .filter((t) => t.type === 'expense' && t.date >= new Date(now.getFullYear(), now.getMonth(), 1).toISOString())
      .forEach((t) => {
        const cat = catMap[t.categoryId];
        if (cat) {
          if (!map[cat._id]) map[cat._id] = { ...cat, total: 0 };
          map[cat._id].total += t.amount;
        }
      });
    return Object.values(map)
      .sort((a, b) => b.total - a.total)
      .slice(0, 4);
  }, [transactions, catMap, now.getFullYear(), now.getMonth()]);

  return {
    totalBudget,
    budgetPct,
    budgetRemaining,
    topCategories
  };
}
